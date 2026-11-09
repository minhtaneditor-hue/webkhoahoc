import { createBrowserClient } from '@supabase/ssr';
import { navigatorLock, processLock } from '@supabase/supabase-js';

const LOCK_WAIT_MS = 15_000;
const hasWebLocks = typeof globalThis.navigator !== 'undefined' && !!globalThis.navigator.locks;

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
  supabaseAnonKey || 'placeholder-anon-key',
  // The navbar and the page both check the session at load. The default 5s wait was short
  // enough that a slow network (or a dev compile) made the second check steal the lock,
  // and the first then threw "…was released because another request stole it".
  // Same lock Supabase uses by default, only with a longer wait (the timeout option itself is
  // not passed through createBrowserClient, the lock function is).
  { auth: { lock: (name, _timeout, fn) => (hasWebLocks ? navigatorLock : processLock)(name, LOCK_WAIT_MS, fn) } }
);

/**
 * The signed-in user, or null. Retries once when the auth lock was taken over by another
 * check on the same page instead of throwing, so a page never hangs on its loading state.
 */
export async function getCurrentUser() {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { data } = await supabase.auth.getUser();
      return data.user;
    } catch (error) {
      const lockLost = error instanceof Error && /lock/i.test(error.message);
      if (!lockLost || attempt === 1) {
        console.error('Supabase getUser failed', error);
        return null;
      }
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  return null;
}
