import type { SupabaseClient } from '@supabase/supabase-js';

// Promo codes live in the promo_codes table (migration 017, Admin > Mã giảm giá).
// Checked on the server only: /api/promo for the price preview, createPendingPayment for the real order.

export type PromoCheck = { ok: true; code: string; discount: number } | { ok: false; error: string };

export const normalizeCode = (code?: string | null) => (code || '').trim().toUpperCase().replace(/\s+/g, '');

/** db must be the service-role client: buyers cannot read promo_codes. */
export async function checkPromo(
  db: SupabaseClient,
  rawCode: string | undefined | null,
  { courseId, price }: { courseId?: string | null; price: number }
): Promise<PromoCheck> {
  const code = normalizeCode(rawCode);
  if (!code) return { ok: false, error: 'Nhập mã giảm giá.' };
  const { data: promo } = await db.from('promo_codes').select('*').eq('code', code).maybeSingle();
  const invalid = { ok: false as const, error: 'Mã không hợp lệ hoặc đã hết hạn.' };
  if (!promo || !promo.is_active) return invalid;

  const now = Date.now();
  if (promo.starts_at && Date.parse(promo.starts_at) > now) return invalid;
  if (promo.expires_at && Date.parse(promo.expires_at) < now) return invalid;
  if (promo.course_id && promo.course_id !== courseId) return { ok: false, error: 'Mã này không áp dụng cho sản phẩm này.' };
  if (promo.max_uses) {
    const { count } = await db.from('payments').select('id', { count: 'exact', head: true }).eq('promo_code', code).eq('status', 'success');
    if ((count || 0) >= promo.max_uses) return { ok: false, error: 'Mã đã hết lượt sử dụng.' };
  }

  const discount = promo.kind === 'percent' ? Math.round((price * promo.value) / 100) : promo.value;
  return { ok: true, code, discount: Math.min(Math.max(discount, 0), price) };
}
