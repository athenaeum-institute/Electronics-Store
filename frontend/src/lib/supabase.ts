import { createClient } from '@supabase/supabase-js'

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

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
