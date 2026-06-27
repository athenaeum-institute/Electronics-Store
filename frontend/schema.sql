-- Supabase Schema for Haier Electronics E-commerce Store

-- 1. Create a public 'profiles' table to manage user roles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (new.id, new.email, FALSE);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Create 'products' table
CREATE TABLE public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER DEFAULT 0 NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create 'orders' table
CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for guest checkouts
  shipping_details JSONB NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Create 'order_items' table
CREATE TABLE public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);

-- 5. Create 'site_settings' table (For Admin to change Hero Banner)
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert initial dummy setting for hero image
INSERT INTO public.site_settings (key, value) VALUES ('hero_image_url', 'https://lh3.googleusercontent.com/aida-public/AB6AXuArAnYFnRG9AuBnIfZ5aMZTkaYXMC2y6vzgGcNplXeW_GuKhewTBKpun_jl7juaZug9dYMTAzU2BY82sCKDcrZm03e4looBPySqERlALS1FITinGr6Jtz3u1Ywn8fmULcOjxyJhvJKj2YyAbDamf8TgW_2qM6tIlhfIsbQdtA6q0jGF9PionEvfITkFD2NFbJ5sXZwWjPt15KIb9tl-zmLUeFQ00-HMC39-YajtvDkMJfHPcsLsln6CBfPSqO7oAnqVaTHot7NCWMR8');

-- 6. Setup Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Function to check if current user is admin (bypasses RLS to prevent infinite recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT is_admin FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: Users can read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
-- Admins can read all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin());

-- Products: Anyone can read products
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (TRUE);
-- Only Admins can insert/update/delete products
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (public.is_admin());

-- Orders: Users can read their own orders.
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
-- Anyone can insert an order (Guest checkout allowed).
CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (TRUE);
-- Admins can read/update all orders
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all orders" ON public.orders FOR UPDATE USING (public.is_admin());

-- Order Items: Users can read their own order items
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Anyone can insert order items" ON public.order_items FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING (public.is_admin());

-- Site Settings: Anyone can view, only admins can update
CREATE POLICY "Anyone can view site settings" ON public.site_settings FOR SELECT USING (TRUE);
CREATE POLICY "Admins can update site settings" ON public.site_settings FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can insert site settings" ON public.site_settings FOR INSERT WITH CHECK (public.is_admin());

-- Storage Bucket (You'll need to create a bucket named 'public_assets' in your Supabase Dashboard first)
-- Run this after creating the bucket manually or using this snippet if the storage schema exists:
INSERT INTO storage.buckets (id, name, public) VALUES ('public_assets', 'public_assets', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'public_assets' );
CREATE POLICY "Admin Uploads" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'public_assets' AND public.is_admin());
CREATE POLICY "Admin Deletes" ON storage.objects FOR DELETE USING ( bucket_id = 'public_assets' AND public.is_admin());
