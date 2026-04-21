import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// INDEPENDENT ADMIN CHECK (No external imports to prevent Edge Runtime crashes)
const ADMIN_EMAILS = [
  'minhtaneditor@gmail.com',
  // You can add more emails here or via environment variables
].filter(Boolean);

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // RESILIENCE CHECK: If keys are missing or placeholders, skip auth logic entirely
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
    return res;
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            req.cookies.set({ name, value, ...options });
            res = NextResponse.next({
              request: {
                headers: req.headers,
              },
            });
            res.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            req.cookies.set({ name, value: '', ...options });
            res = NextResponse.next({
              request: {
                headers: req.headers,
              },
            });
            res.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const path = req.nextUrl.pathname;

    // ADMIN PROTECTION
    if (path.startsWith('/admin')) {
      if (!session || !session.user.email || !ADMIN_EMAILS.includes(session.user.email)) {
        return NextResponse.redirect(new URL('/auth', req.url));
      }
    }

    // AUTH REDIRECT (If logged in, don't go to /auth)
    if (session && path.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // PROTECTED ROUTES
    if (!session && (path.startsWith('/dashboard') || path.startsWith('/courses/lesson'))) {
      return NextResponse.redirect(new URL('/auth', req.url));
    }

  } catch (error) {
    console.error("Middleware Edge Error:", error);
    return res; // Fallback to public access on failure
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/auth/:path*', '/courses/lesson/:path*'],
};
