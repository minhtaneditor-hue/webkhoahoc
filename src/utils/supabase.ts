import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// SITE RESCUE LOGIC: Prevent DNS crashes if keys are missing or placeholders
const isPlaceholder = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder');

export const supabase = isPlaceholder
  ? (new Proxy({}, {
      get: () => {
        // Return a dummy function that returns a promise resolving to an empty object
        // This prevents the app from crashing when calling supabase.from().select() etc.
        return () => ({
          select: () => ({
            from: () => ({
              select: () => Promise.resolve({ data: [], error: null }),
              single: () => Promise.resolve({ data: null, error: null }),
            }),
          }),
          auth: {
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            getUser: () => Promise.resolve({ data: { user: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          },
          from: () => ({
            select: () => ({
              order: () => Promise.resolve({ data: [], error: null }),
              limit: () => Promise.resolve({ data: [], error: null }),
            }),
          }),
        });
      }
    }) as any)
  : createClient(supabaseUrl, supabaseAnonKey);

if (isPlaceholder) {
  console.warn("⚠️ [RESCUE MODE] Supabase keys missing. Site is running with MOCK DATA to prevent 500 error.");
}
