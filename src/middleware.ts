import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// INDEPENDENT ADMIN CHECK (Self-contained for Edge consistency)
const ADMIN_EMAILS = [
  'minhtaneditor@gmail.com',
  'tan@tanlab.vn',
].filter(Boolean);

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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

    // ADMIN PROTECTION: Lockdown /admin for verified emails
    if (path.startsWith('/admin')) {
      if (!session || !session.user.email || !ADMIN_EMAILS.includes(session.user.email)) {
        return NextResponse.redirect(new URL('/auth', req.url));
      }
    }

    // AUTH REDIRECT: Logged in users bypass login page
    if (session && path.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // PROTECTED ROUTES: Lockdown Dashboard & Lessons
    if (!session && (path.startsWith('/dashboard') || path.startsWith('/courses/lesson'))) {
      return NextResponse.redirect(new URL('/auth', req.url));
    }

  } catch (error) {
    console.error("Critical Middleware Error:", error);
    return res;
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/auth/:path*', '/courses/lesson/:path*'],
};
