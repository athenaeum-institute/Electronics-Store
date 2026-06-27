# PROJECT BRAIN: Haier Store (Ali Electronics)

This is the single source of truth for the entire project. Always read this file before starting any task.

---

## 1. PROJECT OVERVIEW

**Store name:** Ali Electronics — Haier Official Store  
**Location:** 493 Lahore Rd, Saddar Cantt, Lahore, 54000, Pakistan  
**WhatsApp:** +92 328 6715408  
**Hours:** Mon–Sun 9AM–9PM  
**Stack:** React + TypeScript + Vite + Tailwind CSS + Supabase + Zustand  

---

## 2. SUPABASE

### Tables and Columns
- **`profiles`**: `id` (PK, UUID), `email` (TEXT), `is_admin` (BOOLEAN), `created_at` (TIMESTAMP)
- **`products`**: `id` (PK, UUID), `title` (TEXT), `description` (TEXT), `price` (DECIMAL), `category` (TEXT), `stock` (INTEGER), `image_url` (TEXT), `created_at` (TIMESTAMP)
- **`orders`**: `id` (PK, UUID), `user_id` (FK, UUID), `shipping_details` (JSONB), `total_amount` (DECIMAL), `payment_method` (TEXT), `status` (TEXT), `created_at` (TIMESTAMP)
- **`order_items`**: `id` (PK, UUID), `order_id` (FK, UUID), `product_id` (FK, UUID), `quantity` (INTEGER), `price` (DECIMAL)
- **`site_settings`**: `key` (PK, TEXT), `value` (TEXT), `updated_at` (TIMESTAMP)

### RLS Policies Summary
- **`profiles`**: Users can view their own profile. Admins can view all profiles.
- **`products`**: Anyone can view products. Only Admins can insert, update, or delete products.
- **`orders`**: Users can view their own orders. Anyone can insert orders (Guest checkout allowed). Admins can view and update all orders.
- **`order_items`**: Users can view their own order items. Anyone can insert order items. Admins can view all order items.
- **`site_settings`**: Anyone can view site settings. Only Admins can insert or update site settings.

### Storage Bucket
- **`product-images`** (Note: schema references `public_assets` for general assets, but product images should utilize `product-images` as per project structure).

### Auth Trigger Details
- **Trigger**: `handle_new_user()`
- **Event**: `AFTER INSERT` on `auth.users`
- **Action**: Automatically inserts a corresponding row into `public.profiles` mapping `id` and `email`, with `is_admin` set to `FALSE` by default.

---

## 3. COLOR SCHEME

From `tailwind.config.js`:
- `tertiary-fixed-dim`: #aac7ff
- `on-secondary-container`: #636264
- `secondary-container`: #e2dfe1
- `tertiary-fixed`: #d7e3ff
- `error`: #ba1a1a
- `surface`: #f9f9fb
- `inverse-primary`: #c6c6c6
- `on-surface`: #1a1c1d
- `surface-container`: #eeeef0
- `tertiary-container`: #001b3e
- `on-tertiary-fixed`: #001b3e
- `on-error-container`: #93000a
- `inverse-surface`: #2f3132
- `surface-bright`: #f9f9fb
- `surface-container-low`: #f3f3f5
- `primary-container`: #1b1b1b
- `tertiary`: #000000
- `on-tertiary`: #ffffff
- `surface-dim`: #d9dadc
- `on-primary-container`: #848484
- `background`: #f9f9fb
- `on-primary-fixed-variant`: #474747
- `surface-container-highest`: #e2e2e4
- `inverse-on-surface`: #f0f0f2
- `secondary`: #5f5e60
- `error-container`: #ffdad6
- `outline-variant`: #cfc4c5
- `surface-container-high`: #e8e8ea
- `secondary-fixed-dim`: #c8c6c8
- `on-secondary-fixed-variant`: #474649
- `on-error`: #ffffff
- `surface-container-lowest`: #ffffff
- `on-background`: #1a1c1d
- `on-surface-variant`: #4c4546
- `on-primary-fixed`: #1b1b1b
- `primary-fixed`: #e2e2e2
- `on-primary`: #ffffff
- `outline`: #7e7576
- `primary`: #000000
- `on-tertiary-fixed-variant`: #00458e
- `on-tertiary-container`: #3a83ea
- `primary-fixed-dim`: #c6c6c6
- `surface-variant`: #e2e2e4
- `secondary-fixed`: #e4e2e4
- `on-secondary`: #ffffff
- `on-secondary-fixed`: #1b1b1d
- `surface-tint`: #5e5e5e

---

## 4. PAGES & ROUTES

- **`/`** -> `<Home />`
- **`/checkout`** -> `<Checkout />`
- **`/admin`** -> `<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>`
- **`/privacy-policy`** -> `<PrivacyPolicy />`
- **`/terms-of-service`** -> `<TermsOfService />`
- **`/refund-policy`** -> `<RefundPolicy />`

---

## 5. COMPONENTS

- **`AuthModal.tsx`**: Manages user authentication (Login/Signup).
- **`CuratedCollections.tsx`**: Displays curated collections of products on the home page.
- **`FeaturedProducts.tsx`**: Showcases featured items in the catalog.
- **`Footer.tsx`**: The global site footer containing links and information.
- **`Header.tsx`**: The global site header/navbar including branding and navigation.
- **`Hero.tsx`**: Main hero banner component for the landing page.
- **`Preloader.tsx`**: Provides a loading animation when the application first mounts.
- **`ProtectedRoute.tsx`**: Higher-order component to restrict access to certain routes (e.g., admin only).
- **`RotaryShowcase.tsx`**: Interactive component for displaying products (e.g., rotating carousel or 360 view).

---

## 6. FEATURES COMPLETED

- Auth (login/signup)
- Cart (Zustand + localStorage)
- Categories page
- Category products page
- Product details page (colors, specs, tabs, WhatsApp)
- Search panel (right slide-in)
- Contact page with map
- Scroll to top on route change
- Horizontal carousel on home
- Admin protected route

---

## 7. FEATURES REMAINING

- Checkout + order placement
- My Orders page
- Admin Dashboard (products CRUD, image upload, orders manage, stats)
- Payment (COD + JazzCash/EasyPaisa)
- Product search filters
- Email notifications
- Footer complete (subscribe to Supabase)
- SEO optimization
- PWA

---

## 8. PRODUCT CATEGORIES

- Air Conditioners
- Refrigerators
- Washing Machines
- LED TVs
- Freezers
- Water Dispensers
- Microwave Ovens
- Kitchen Appliances
- Small Appliances
- Laptops

---

## 9. IMPORTANT RULES — NEVER BREAK THESE

1. **Never change existing design, colors, animations.**
2. **Never touch `Header.tsx` or `Footer.tsx` unless specifically asked.**
3. **Always maintain same glassmorphism and card styles.**
4. **`ScrollToTop` component must stay in `App.tsx`.**
5. **Supabase RLS must stay enabled on all tables.**

---

## 10. PROMPTING GUIDE

- **Always read `BRAIN.md` before starting any task.**
- **Always mention "DO NOT change existing design" in every prompt.**
- **Test on both mobile and desktop after every change.**
