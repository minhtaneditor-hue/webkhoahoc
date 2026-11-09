// Hội viên TẤN VA plans. Prices live here (server and page read the same numbers),
// never in the request body.

export type MembershipPlan = 'thang' | 'nam';

export const MEMBERSHIP_PLANS: Record<MembershipPlan, { title: string; price: number; months: number }> = {
  thang: { title: 'Hội viên TẤN VA — 1 tháng', price: 299_000, months: 1 },
  nam: { title: 'Hội viên TẤN VA — 12 tháng', price: 2_390_000, months: 12 },
};

/** Members' discount, in percent, on what they buy while their membership is active. */
export const MEMBER_DISCOUNT_PERCENT = { course: 15, asset: 20 } as const;

/**
 * Amount a member saves on one item, chosen so the member price is a round thousand đồng
 * (599.000đ − 15% → 509.000đ). Members get this or a promo code, whichever is larger, never both.
 */
export function memberDiscount(price: number, kind: keyof typeof MEMBER_DISCOUNT_PERCENT) {
  const base = Math.max(price, 0);
  const memberPrice = Math.round((base * (100 - MEMBER_DISCOUNT_PERCENT[kind])) / 100 / 1000) * 1000;
  return Math.max(0, base - memberPrice);
}

export function isMembershipPlan(v: unknown): v is MembershipPlan {
  return v === 'thang' || v === 'nam';
}

/** The plan an order row buys, or null for course and shop orders. */
export function planOf(v: unknown) {
  return v === 'thang' || v === 'nam' ? MEMBERSHIP_PLANS[v] : null;
}
