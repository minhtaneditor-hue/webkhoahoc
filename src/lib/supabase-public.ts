import { createClient } from '@supabase/supabase-js';

/**
 * Cookie-less anon client for PUBLIC data in Server Components (courses, projects,
 * student stories). Keeps those pages statically renderable / cacheable. Respects RLS.
 */
export function getPublicSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

export const formatVND = (value: number | string | null | undefined) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value) || 0);

/** Percent saved against the crossed-out price, rounded; null when there is nothing to show. */
export const savingPercent = (price: number | string | null | undefined, oldPrice: number | string | null | undefined) => {
  const now = Number(price), before = Number(oldPrice);
  return before > now && now >= 0 && before > 0 ? Math.round(((before - now) / before) * 100) : null;
};
