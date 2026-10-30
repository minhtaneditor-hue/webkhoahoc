// Promo codes shared by the checkout UI (preview) and /api/payment/vnpay (source of truth).
// TODO: move to a `promo_codes` table so admins can manage them from the CMS.
export function calculateDiscount(code: string | undefined | null, price: number): number {
  if (!code) return 0;
  const normalized = code.trim().toUpperCase();
  let discount = 0;
  if (normalized === 'TANLAB') discount = 500000;
  else if (normalized === 'GIAM10') discount = Math.round(price * 0.1);
  else if (normalized === 'CHALLENGE') discount = 1000000;
  return Math.min(discount, price);
}
