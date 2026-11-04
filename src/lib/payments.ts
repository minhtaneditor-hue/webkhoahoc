import type { SupabaseClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import { Resend } from 'resend';
import { checkPromo } from './promo';
import { getSiteSettings } from './content';
import { contactFrom } from './site-settings';
import { FROM, welcomeCourse, assetPurchased } from './emails';
import { metaContext, metaEnabled, sendMetaEvent, siteUrl } from './meta-capi';

// Shared checkout pieces for every payment method (VNPay, SePay bank transfer).

export type Buyer = { name: string; email: string; phone: string };
export type CheckoutInput = { courseId?: string; assetId?: string; promoCode?: string; buyer?: Buyer };

/** Looks up the price server-side and stores a pending payment. Throws a user-facing message on bad input. */
export async function createPendingPayment(
  supabase: SupabaseClient,
  userId: string | null,
  { courseId, assetId, promoCode, buyer }: CheckoutInput,
  method: 'vnpay' | 'bank_transfer',
  orderId: string,
  req: Request
) {
  if (!courseId && !assetId) throw new CheckoutError('Thiếu sản phẩm cần thanh toán.', 400);

  // Price always comes from the database, never from the request body.
  const table = courseId ? 'courses' : 'digital_assets';
  const { data: product } = await supabase.from(table).select('id, title, price').eq('id', courseId || assetId).single();
  if (!product) throw new CheckoutError('Sản phẩm không tồn tại.', 404);

  const basePrice = Number(product.price) || 0;
  let discount = 0;
  let usedCode: string | null = null;
  if (promoCode?.trim()) {
    const promo = await checkPromo(supabase, promoCode, { courseId, price: basePrice });
    if (!promo.ok) throw new CheckoutError(promo.error, 400);
    discount = promo.discount;
    usedCode = promo.code;
  }
  const amount = Math.max(0, basePrice - discount);
  if (amount <= 0) throw new CheckoutError('Sản phẩm miễn phí không cần thanh toán.', 400);

  // Lets a buyer without an account open the order page and download the file.
  const accessToken = randomBytes(16).toString('hex');
  const { error } = await supabase.from('payments').insert({
    order_id: orderId,
    user_id: userId,
    buyer_name: buyer?.name || null,
    buyer_email: buyer?.email || null,
    buyer_phone: buyer?.phone || null,
    access_token: accessToken,
    course_id: courseId || null,
    asset_id: assetId || null,
    amount,
    promo_code: usedCode,
    payment_method: method,
    status: 'pending',
  });
  if (error) throw error;

  if (metaEnabled()) {
    const context = metaContext(req);
    // A separate write, so a database without migration 024 still takes orders.
    await supabase.from('payments').update({ meta_context: context }).eq('order_id', orderId);
    sendMetaEvent({
      name: 'InitiateCheckout',
      eventId: `checkout_${orderId}`, // same id as the order page's Pixel event
      url: siteUrl('/'),
      context,
      customer: { email: buyer?.email, phone: buyer?.phone, name: buyer?.name, userId },
      data: { value: amount, contentName: product.title, contentId: product.id, orderId },
    });
  }

  return { orderId, amount, title: product.title as string, accessToken };
}

export class CheckoutError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

// ---- SePay bank transfer --------------------------------------------------

export const ORDER_PREFIX = 'MTA';

/** Short, letters-and-digits-only code: banks strip punctuation from transfer notes. */
export function newBankOrderCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return ORDER_PREFIX + code;
}

/** Finds our order code inside a bank transfer note, whatever the bank added around it. */
export function findOrderCode(...texts: (string | null | undefined)[]) {
  for (const t of texts) {
    const m = t?.toUpperCase().match(new RegExp(`${ORDER_PREFIX}[A-Z0-9]{8}`));
    if (m) return m[0];
  }
  return null;
}

/** Receiving account, from env. `bank` is SePay's short bank name, e.g. MBBank, Vietcombank. */
export function bankConfig() {
  const account = process.env.SEPAY_BANK_ACCOUNT;
  const bank = process.env.SEPAY_BANK_NAME;
  if (!account || !bank) return null;
  return { account, bank, accountName: process.env.SEPAY_ACCOUNT_NAME || '' };
}

export function vietQrUrl(cfg: { account: string; bank: string }, amount: number, content: string) {
  const q = new URLSearchParams({ acc: cfg.account, bank: cfg.bank, amount: String(amount), des: content });
  return `https://qr.sepay.vn/img?${q}`;
}

// ---- After a successful payment ------------------------------------------

/** Enrols the buyer and emails them. Call once, right after the payment row turns 'success'. */
export async function fulfillPayment(supabase: SupabaseClient, payment: any) {
  await trackPurchase(supabase, payment);

  // Resend's constructor throws without a key; the email is skipped when RESEND_API_KEY is unset
  const resend = new Resend(process.env.RESEND_API_KEY || 're_missing_key');

  // Auto-enrolment (courses only — digital assets are unlocked via the successful payment row)
  if (payment.course_id) {
    await supabase.from('enrollments').upsert({
      user_id: payment.user_id,
      course_id: payment.course_id,
      status: 'active'
    });
  }

  // Ebooks, presets, skills: email the download page (works for guests too)
  if (payment.asset_id) {
    await emailAssetBuyer(supabase, resend, payment);
    return;
  }

  // Confirmation email
  const { data: user } = await supabase.from('users').select('email, full_name').eq('id', payment.user_id).single();
  const { data: course } = payment.course_id
    ? await supabase.from('courses').select('title').eq('id', payment.course_id).single()
    : await supabase.from('digital_assets').select('title').eq('id', payment.asset_id).single();

  if (user && course && process.env.RESEND_API_KEY) {
    const contact = contactFrom(await getSiteSettings());
    const mail = welcomeCourse({ name: user.full_name || payment.buyer_name, email: user.email, courseTitle: course.title, courseId: payment.course_id, contact });
    const { error } = await resend.emails.send({ from: FROM, to: user.email, ...mail });
    if (error) console.error(`Resend: welcome email for ${payment.order_id} failed`, error);
    else await supabase.from('email_log').upsert({ email: user.email.toLowerCase(), kind: 'onboard-0', ref: payment.course_id }, { onConflict: 'email,kind,ref', ignoreDuplicates: true });
  }
}

/** Tells Meta about the sale from the server, whether or not the buyer's page is still open. */
async function trackPurchase(supabase: SupabaseClient, payment: any) {
  if (!metaEnabled()) return;
  try {
    const { data: user } = payment.user_id
      ? await supabase.from('users').select('email, full_name').eq('id', payment.user_id).single()
      : { data: null };
    const { data: product } = payment.course_id
      ? await supabase.from('courses').select('title').eq('id', payment.course_id).single()
      : await supabase.from('digital_assets').select('title').eq('id', payment.asset_id).single();

    sendMetaEvent({
      name: 'Purchase',
      eventId: `purchase_${payment.order_id}`, // same id as the order page's Pixel event
      url: siteUrl('/'),
      context: payment.meta_context,
      customer: {
        email: payment.buyer_email || user?.email,
        phone: payment.buyer_phone,
        name: payment.buyer_name || user?.full_name,
        userId: payment.user_id,
      },
      data: {
        value: Number(payment.amount),
        contentName: product?.title,
        contentId: payment.course_id || payment.asset_id,
        orderId: payment.order_id,
      },
    });
    // The event carries these now; no reason to keep the buyer's IP on the order.
    if (payment.meta_context) await supabase.from('payments').update({ meta_context: null }).eq('id', payment.id);
  } catch (error) {
    console.error(`Meta CAPI: Purchase for ${payment.order_id} skipped`, error);
  }
}

/** Checks the guest checkout form; returns cleaned values or throws a user-facing message. */
export function readBuyer(raw: any): Buyer {
  const name = String(raw?.name || '').trim().slice(0, 120);
  const email = String(raw?.email || '').trim().toLowerCase().slice(0, 200);
  const phone = String(raw?.phone || '').replace(/[^\d+]/g, '').slice(0, 20);
  if (!name) throw new CheckoutError('Vui lòng nhập họ tên.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new CheckoutError('Email chưa đúng.');
  if (phone.replace(/\D/g, '').length < 9) throw new CheckoutError('Số điện thoại chưa đúng.');
  return { name, email, phone };
}


async function emailAssetBuyer(supabase: SupabaseClient, resend: Resend, payment: any) {
  let to = payment.buyer_email as string | null;
  if (!to && payment.user_id) {
    const { data: user } = await supabase.from('users').select('email').eq('id', payment.user_id).single();
    to = user?.email || null;
  }
  const { data: asset } = await supabase.from('digital_assets').select('title').eq('id', payment.asset_id).single();
  if (!to || !asset || !process.env.RESEND_API_KEY) {
    console.warn(`Buyer email skipped for ${payment.order_id}: to=${!!to} asset=${!!asset} key=${!!process.env.RESEND_API_KEY}`);
    return;
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.minhtanacademy.com';
  const link = `${base}/payment/bank/${payment.order_id}?t=${payment.access_token}`;
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    ...assetPurchased({ name: payment.buyer_name, title: asset.title, orderId: payment.order_id, link }),
  });
  if (error) console.error(`Resend: buyer email for ${payment.order_id} failed`, error);
}
