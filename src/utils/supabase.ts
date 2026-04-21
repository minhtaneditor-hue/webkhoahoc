import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Production client initialization (Resilient but straightforward)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Warning: Supabase environment variables are missing.");
}
