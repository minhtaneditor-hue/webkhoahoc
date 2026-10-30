import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Warning: Supabase environment variables are missing.");
}

// Browser client stores the session in cookies (not localStorage), so API routes
// (/api/payment, /api/drm/token, /api/admin) can read the logged-in user on the server.
// Placeholder values keep `next build` from crashing when env vars are absent.
export const supabase = createBrowserClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
