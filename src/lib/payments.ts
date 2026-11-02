import type { SupabaseClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import { Resend } from 'resend';
import { calculateDiscount } from './promo';

// Shared checkout pieces for every payment method (VNPay, SePay bank transfer).

export type Buyer = { name: string; email: string; phone: string };
export type CheckoutInput = { courseId?: string; assetId?: string; promoCode?: string; buyer?: Buyer };

/** Looks up the price server-side and stores a pending payment. Throws a user-facing message on bad input. */
export async function createPendingPayment(
  supabase: SupabaseClient,
  userId: string | null,
  { courseId, assetId, promoCode, buyer }: CheckoutInput,
  method: 'vnpay' | 'bank_transfer',
  orderId: string
) {
  if (!courseId && !assetId) throw new CheckoutError('Thiếu sản phẩm cần thanh toán.', 400);

  // Price always comes from the database, never from the request body.
  const table = courseId ? 'courses' : 'digital_assets';
  const { data: product } = await supabase.from(table).select('id, title, price').eq('id', courseId || assetId).single();
  if (!product) throw new CheckoutError('Sản phẩm không tồn tại.', 404);

  const basePrice = Number(product.price) || 0;
  const amount = Math.max(0, basePrice - calculateDiscount(promoCode, basePrice));
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
    payment_method: method,
    status: 'pending',
  });
  if (error) throw error;

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
  const { data: user } = await supabase.from('users').select('email').eq('id', payment.user_id).single();
  const { data: course } = payment.course_id
    ? await supabase.from('courses').select('title').eq('id', payment.course_id).single()
    : await supabase.from('digital_assets').select('title').eq('id', payment.asset_id).single();

  if (user && course && process.env.RESEND_API_KEY) {
    await resend.emails.send({
      from: 'Minh Tan Academy <customer@minhtanacademy.com>',
      to: user.email,
      subject: '🚀 CHÀO MỪNG BẠN GIA NHẬP MINH TAN ACADEMY!',
      html: `
        <div style="background-color: #050507; color: #f5f5f5; font-family: 'Be Vietnam Pro', Arial, sans-serif; padding: 40px; border-radius: 20px; border: 1px solid rgba(245, 188, 27, 0.1);">
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="display: inline-block; padding: 10px 20px; background-color: rgba(245, 188, 27, 0.1); border-radius: 50px; font-size: 10px; font-weight: 900; color: #f5bc1b; letter-spacing: 0.3em;">
              OFFICIAL ENROLLMENT // 2026
            </div>
          </div>
          
          <h1 style="font-size: 28px; font-weight: 900; text-align: center; margin-bottom: 20px;">XÁC NHẬN KÍCH HOẠT THÀNH CÔNG</h1>
          <p style="text-align: center; color: #888888; font-size: 14px; margin-bottom: 40px;">Hệ thống đã ghi nhận thanh toán cho khóa học: <strong style="color: #f5f5f5;">${course.title}</strong></p>
          
          <div style="background-color: rgba(255, 255, 255, 0.02); padding: 30px; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.05); margin-bottom: 40px;">
            <h3 style="font-size: 14px; font-weight: 900; color: #e32636; letter-spacing: 0.1em; margin-bottom: 20px; text-transform: uppercase;">Thông tin truy cập:</h3>
            <p style="font-size: 14px; margin-bottom: 10px;">• <strong>Email:</strong> ${user.email}</p>
            <p style="font-size: 14px; margin-bottom: 25px;">• <strong>Mật khẩu:</strong> mật khẩu bạn đã đặt khi đăng ký</p>
            
            <div style="padding: 15px; background-color: rgba(227, 38, 54, 0.05); border-left: 3px solid #e32636; font-size: 12px; color: #888888;">
              <strong>Gợi ý bảo mật:</strong> Chúng tôi khuyên bạn nên truy cập vào mục "Security Hub" trong Dashboard để đổi mật khẩu hoặc kích hoạt xác thực 2 lớp (2FA) ngay lập tức.
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" style="background-color: #f5bc1b; color: #000000; padding: 18px 36px; text-decoration: none; border-radius: 50px; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; display: inline-block;">TRUY CẬP MISSION CONTROL</a>
          </div>
          
          <p style="text-align: center; font-size: 10px; color: #333333; margin-top: 50px; letter-spacing: 0.2em;">
            SECURED BY TANLAB // ENCRYPTED SESSION // © 2026
          </p>
        </div>
      `
    });
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

const esc = (v: string) => v.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

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
    from: 'Minh Tan Academy <customer@minhtanacademy.com>',
    to,
    subject: `Đã thanh toán: ${asset.title}`,
    html: `
      <div style="font-family: 'Be Vietnam Pro', Arial, sans-serif; color: #242321; max-width: 520px; margin: 0 auto; padding: 32px;">
        <h1 style="font-size: 24px; margin: 0 0 12px;">Cảm ơn ${esc(payment.buyer_name || 'bạn')}!</h1>
        <p style="font-size: 15px; line-height: 1.6;">Minh Tấn Academy đã nhận thanh toán cho <strong>${esc(asset.title)}</strong> (mã đơn ${payment.order_id}).</p>
        <p style="margin: 28px 0;"><a href="${link}" style="background: #A84E3C; color: #fff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700;">Tải về</a></p>
        <p style="font-size: 13px; color: #78716C;">Giữ email này để tải lại khi cần. Cần hỗ trợ, trả lời email này hoặc nhắn Zalo cho Minh Tấn.</p>
      </div>
    `,
  });
  if (error) console.error(`Resend: buyer email for ${payment.order_id} failed`, error);
}
