-- ============================================================
-- ALI ELECTRONICS — HAIER OFFICIAL STORE
-- Supabase SQL Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- 1. PROFILES TABLE
-- Auto-populated via trigger on auth.users insert
-- ============================================================
CREATE TABLE public.profiles (
  id            UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email         TEXT        NOT NULL,
  full_name     TEXT,
  phone         TEXT,
  address       TEXT,
  city          TEXT,
  is_admin      BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger function: auto-create a profile row on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ============================================================
-- 2. CATEGORIES TABLE
-- ============================================================
CREATE TABLE public.categories (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT        NOT NULL,
  slug          TEXT        UNIQUE,
  description   TEXT,
  image_url     TEXT,
  display_order INT         NOT NULL DEFAULT 0,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pre-populate with official Haier Pakistan categories
INSERT INTO public.categories (name, slug, display_order) VALUES
  ('Air Conditioners',   'air-conditioners',   1),
  ('Refrigerators',      'refrigerators',       2),
  ('Washing Machines',   'washing-machines',    3),
  ('LED TVs',            'led-tvs',             4),
  ('Freezers',           'freezers',            5),
  ('Water Dispensers',   'water-dispensers',    6),
  ('Microwave Ovens',    'microwave-ovens',     7),
  ('Kitchen Appliances', 'kitchen-appliances',  8),
  ('Small Appliances',   'small-appliances',    9),
  ('Laptops',            'laptops',            10);


-- ============================================================
-- 3. PRODUCTS TABLE
-- ============================================================
CREATE TABLE public.products (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT        NOT NULL,
  slug            TEXT        UNIQUE,
  description     TEXT,
  price           NUMERIC(10, 2) NOT NULL,
  original_price  NUMERIC(10, 2),
  category_id     UUID        REFERENCES public.categories(id) ON DELETE SET NULL,
  images          TEXT[]      DEFAULT '{}',
  thumbnail_url   TEXT,
  model_number    TEXT,
  specifications  JSONB       DEFAULT '{}',
  stock_quantity  INT         NOT NULL DEFAULT 0,
  is_featured     BOOLEAN     NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  warranty        TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 4. ORDERS TABLE
-- ============================================================
CREATE TABLE public.orders (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name    TEXT        NOT NULL,
  customer_email   TEXT,
  customer_phone   TEXT        NOT NULL,
  delivery_address TEXT        NOT NULL,
  city             TEXT        NOT NULL,
  order_status     TEXT        NOT NULL DEFAULT 'pending'
                   CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_method   TEXT        CHECK (payment_method IN ('cod', 'online')),
  payment_status   TEXT        NOT NULL DEFAULT 'unpaid'
                   CHECK (payment_status IN ('unpaid', 'paid')),
  subtotal         NUMERIC(10, 2),
  delivery_fee     NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_amount     NUMERIC(10, 2),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 5. ORDER ITEMS TABLE
-- ============================================================
CREATE TABLE public.order_items (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id       UUID        NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id     UUID        REFERENCES public.products(id) ON DELETE SET NULL,
  product_name   TEXT        NOT NULL,
  product_image  TEXT,
  quantity       INT         NOT NULL,
  unit_price     NUMERIC(10, 2) NOT NULL,
  total_price    NUMERIC(10, 2) NOT NULL
);


-- ============================================================
-- 6. SITE SETTINGS TABLE
-- ============================================================
CREATE TABLE public.site_settings (
  key        TEXT        PRIMARY KEY,
  value      TEXT        NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pre-populate with default store settings
INSERT INTO public.site_settings (key, value) VALUES
  ('store_name',      'Ali Electronics'),
  ('store_tagline',   'Haier Official Store — Saddar Cantt, Lahore'),
  ('whatsapp_number', '923094454065'),
  ('delivery_fee',    '0'),
  ('hero_title',      'Pakistan''s Premium Haier Official Store'),
  ('hero_subtitle',   'Genuine Products. Official Warranty. Saddar Cantt, Lahore.');


-- ============================================================
-- HELPER FUNCTION: Admin check (used in RLS policies)
-- Uses SECURITY DEFINER to avoid infinite recursion on profiles
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;


-- ---- PROFILES ----
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());


-- ---- CATEGORIES ----
CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE
  USING (public.is_admin());


-- ---- PRODUCTS ----
CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  USING (public.is_admin());


-- ---- ORDERS ----
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all orders"
  ON public.orders FOR UPDATE
  USING (public.is_admin());


-- ---- ORDER ITEMS ----
CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert order items"
  ON public.order_items FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admins can view all order items"
  ON public.order_items FOR SELECT
  USING (public.is_admin());


-- ---- SITE SETTINGS ----
CREATE POLICY "Anyone can view site settings"
  ON public.site_settings FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can insert site settings"
  ON public.site_settings FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR UPDATE
  USING (public.is_admin());


-- ============================================================
-- STORAGE BUCKET: product-images (public)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
  VALUES ('product-images', 'product-images', TRUE)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access on product-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND public.is_admin());
