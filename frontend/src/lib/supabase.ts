import { createClient } from '@supabase/supabase-js'

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  price: number;
  original_price: number | null;
  category_id: string | null;
  images: string[] | null;
  thumbnail_url: string | null;
  model_number: string | null;
  specifications: Record<string, any> | null;
  stock_quantity: number;
  is_featured: boolean;
  is_active: boolean;
  warranty: string | null;
  created_at: string | null;
}

export interface Order {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  delivery_address: string;
  city: string;
  order_status: string;
  payment_method: string | null;
  payment_status: string;
  subtotal: number | null;
  delivery_fee: number;
  total_amount: number | null;
  notes: string | null;
  created_at: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string | null;
  product_image: string | null;
  quantity: number | null;
  unit_price: number | null;
  total_price: number | null;
}

export interface SiteSettings {
  key: string;
  value: string | null;
  updated_at: string | null;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
      };
      categories: {
        Row: Category;
        Insert: Partial<Category>;
        Update: Partial<Category>;
      };
      products: {
        Row: Product;
        Insert: Partial<Product>;
        Update: Partial<Product>;
      };
      orders: {
        Row: Order;
        Insert: Partial<Order>;
        Update: Partial<Order>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Partial<OrderItem>;
        Update: Partial<OrderItem>;
      };
      site_settings: {
        Row: SiteSettings;
        Insert: Partial<SiteSettings>;
        Update: Partial<SiteSettings>;
      };
    };
  };
}

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'

// Validate URL to prevent fatal React crash if user hasn't configured .env properly
try {
  new URL(supabaseUrl);
} catch (e) {
  console.warn('Invalid Supabase URL in .env, falling back to placeholder.');
  supabaseUrl = 'https://placeholder.supabase.co';
}

if (!import.meta.env.VITE_SUPABASE_URL || supabaseUrl === 'https://placeholder.supabase.co') {
  console.warn('Supabase URL or Anon Key is missing. Check your .env file.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function getFeaturedProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`*, category:categories(name)`)
      .eq('is_featured', true)
      .eq('is_active', true);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`*, category:categories(name)`)
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    return null;
  }
}

export async function getProductsByCategory(categorySlug: string) {
  try {
    // First find category
    const { data: catData, error: catError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();
      
    if (catError) throw catError;
    if (!catData) return [];

    const { data, error } = await supabase
      .from('products')
      .select(`*, category:categories(name)`)
      .eq('category_id', (catData as any).id)
      .eq('is_active', true);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}

export async function getSiteSetting(key: string) {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();
    if (error) throw error;
    return data ? (data as any).value : null;
  } catch (error) {
    console.error('Error fetching site setting:', error);
    return null;
  }
}

export async function getSearchResults(query: string) {
  if (!query || query.trim().length < 2) return [];
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, slug, price, thumbnail_url, model_number')
      .or(`name.ilike.%${query}%,model_number.ilike.%${query}%`)
      .eq('is_active', true)
      .limit(8);
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching search results:', error);
    return [];
  }
}
