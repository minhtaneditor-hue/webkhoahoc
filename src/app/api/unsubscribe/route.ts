import { getSupabaseAdmin } from '@/lib/supabase-server';
import { unsubscribeUrl, SITE } from '@/lib/emails';

export const dynamic = 'force-dynamic';

/**
 * GET  /api/unsubscribe?e=&t=  link in the email footer → page with a confirm button (link scanners
 *                              open GET links, so a GET never unsubscribes by itself)
 * POST /api/unsubscribe?e=&t=  the confirm button, or Gmail/Outlook one-click (List-Unsubscribe-Post)
 * The token is an HMAC of the email, so nobody can unsubscribe someone else.
 * Only reminder/marketing emails stop; payment and account emails still arrive.
 */
async function optOut(req: Request) {
  const url = new URL(req.url);
  const email = (url.searchParams.get('e') || '').toLowerCase();
  const valid = email && unsubscribeUrl(email) === `${SITE}/api/unsubscribe?e=${encodeURIComponent(email)}&t=${url.searchParams.get('t')}`;
  if (!valid) return false;
  const { error } = await getSupabaseAdmin()?.from('email_optouts').upsert({ email }, { onConflict: 'email' }) ?? { error: true };
  return !error;
}

const page = (ok: boolean, confirmAction?: string) => new Response(`<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TẤN VA</title></head>
<body style="margin:0;background:#F5F0E9;font-family:Arial,sans-serif;color:#242321;">
<div style="max-width:480px;margin:80px auto;padding:32px;background:#fff;border-radius:20px;text-align:center;">
${confirmAction ? `<h1 style="font-size:22px;">Ngừng nhận email nhắc học?</h1>
<p style="color:#78716C;line-height:1.6;">Bạn sẽ không nhận email nhắc học và ưu đãi nữa. Email thanh toán và tài khoản vẫn gửi bình thường.</p>
<form method="post" action="${confirmAction}"><button style="background:#A84E3C;color:#fff;border:0;border-radius:12px;padding:14px 28px;font-size:16px;font-weight:700;cursor:pointer;">Ngừng nhận</button></form>` : `<h1 style="font-size:22px;">${ok ? 'Đã ngừng gửi email nhắc học' : 'Link không hợp lệ'}</h1>
<p style="color:#78716C;line-height:1.6;">${ok ? 'Bạn sẽ không nhận email nhắc học và ưu đãi nữa. Email thanh toán và tài khoản vẫn gửi bình thường.' : 'Hãy trả lời email bất kỳ của TẤN VA để được hỗ trợ.'}</p>`}
<p><a href="${SITE}" style="color:#A84E3C;font-weight:700;">Về trang chủ</a></p></div></body></html>`,
  { status: ok ? 200 : 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } });

export async function GET(req: Request) {
  const url = new URL(req.url);
  return page(true, `/api/unsubscribe${url.search.replace(/"/g, '')}`);
}
export async function POST(req: Request) { return page(await optOut(req)); }
