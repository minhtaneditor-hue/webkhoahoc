import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { getSessionUser, getSupabaseAdmin } from '@/lib/supabase-server';
import { fbConfigured, sendText } from '@/lib/fb/graph';
import { learnFromConversations, replyTo } from '@/lib/fb/agent';
import { importHistory } from '@/lib/fb/voice';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * POST /api/admin/messenger  { action, psid?, text?, hours? }
 * Admin > Facebook Messenger:
 *   send    reply to the customer as the Page (the bot then pauses for this customer)
 *   pause   stop the bot for this customer for `hours` (default 24)
 *   resume  let the bot answer again; it replies at once if the customer is waiting
 *   done    mark the case handled
 *   import  copy one page of the Page's past Messenger conversations (pass `after` to continue)
 *   learn   turn recent replies by Minh Tấn into knowledge suggestions (`days`, default 14)
 * The caller is checked from the session cookie.
 */
export async function POST(req: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Thiếu SUPABASE_SERVICE_ROLE_KEY.' }, { status: 500 });
  const user = await getSessionUser();
  if (!user || !isAdmin(user.email)) return NextResponse.json({ error: 'Chỉ admin.' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const psid = String(body.psid || '');
  const now = Date.now();
  const pauseFor = (h: number) => new Date(now + h * 3600_000).toISOString();

  switch (body.action) {
    case 'send': {
      const text = String(body.text || '').trim().slice(0, 4000);
      if (!psid || !text) return NextResponse.json({ error: 'Chưa có nội dung.' }, { status: 400 });
      const { data: c } = await db.from('fb_conversations').select('last_customer_at').eq('psid', psid).maybeSingle();
      if (!c) return NextResponse.json({ error: 'Không tìm thấy hội thoại.' }, { status: 404 });
      const outside24h = !c.last_customer_at || now - new Date(c.last_customer_at).getTime() > 24 * 3600_000;
      try {
        const mids = await sendText(psid, text, { humanAgent: outside24h });
        await db.from('fb_messages').insert({ psid, role: 'admin', text, mid: mids[0] || null });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'lỗi không rõ';
        return NextResponse.json({ error: outside24h ? `Facebook từ chối (quá 24 giờ từ tin cuối của khách, cần quyền Human Agent): ${msg}` : `Facebook từ chối: ${msg}` }, { status: 502 });
      }
      const hours = Number(process.env.FB_HUMAN_PAUSE_HOURS) || 12;
      await db.from('fb_conversations').update({ last_message_at: new Date().toISOString(), needs_human: false, handoff_reason: null, bot_paused_until: pauseFor(hours) }).eq('psid', psid);
      return NextResponse.json({ ok: true });
    }
    case 'pause': {
      const hours = Math.min(Math.max(Number(body.hours) || 24, 1), 24 * 365);
      await db.from('fb_conversations').update({ bot_paused_until: pauseFor(hours) }).eq('psid', psid);
      return NextResponse.json({ ok: true });
    }
    case 'resume': {
      await db.from('fb_conversations').update({ bot_paused_until: null, needs_human: false, handoff_reason: null }).eq('psid', psid);
      await replyTo(db, psid); // answers only if the last message is the customer's
      return NextResponse.json({ ok: true });
    }
    case 'done': {
      await db.from('fb_conversations').update({ status: 'done', needs_human: false, handoff_reason: null }).eq('psid', psid);
      return NextResponse.json({ ok: true });
    }
    case 'import': {
      if (!fbConfigured()) return NextResponse.json({ error: 'Thiếu FB_PAGE_ACCESS_TOKEN.' }, { status: 500 });
      try {
        return NextResponse.json({ ok: true, ...(await importHistory(db, body.after ? String(body.after) : undefined)) });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'lỗi không rõ';
        console.error('fb import failed', msg);
        return NextResponse.json({ error: `Facebook chưa cho đọc tin nhắn cũ: ${msg}` }, { status: 502 });
      }
    }
    case 'learn': {
      if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'Thiếu ANTHROPIC_API_KEY.' }, { status: 500 });
      try {
        return NextResponse.json({ ok: true, ...(await learnFromConversations(db, Number(body.days) || 14)) });
      } catch (err) {
        console.error('fb learn failed', err);
        return NextResponse.json({ error: 'AI chưa học được, thử lại sau.' }, { status: 502 });
      }
    }
    default:
      return NextResponse.json({ error: 'Thao tác không hợp lệ.' }, { status: 400 });
  }
}
