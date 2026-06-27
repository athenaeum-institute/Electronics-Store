import { createClient } from '@supabase/supabase-js';
try {
  createClient('https://placeholder.supabase.co', 'placeholder');
  console.log("Success");
} catch (e) {
  console.error("Error:", e);
}
