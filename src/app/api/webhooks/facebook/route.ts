import { after } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { getProfile, validSignature } from '@/lib/fb/graph';
import { replyTo } from '@/lib/fb/agent';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Facebook Messenger webhook (Meta app > Messenger > Webhook):
 *   Callback URL  https://www.minhtanacademy.com/api/webhooks/facebook
 *   Verify token  the value of FB_VERIFY_TOKEN
 *   Fields        messages, messaging_postbacks, message_echoes
 * Facebook needs a 200 within seconds, so the AI answers in after() once the response is sent.
 * A reply typed by a person in the Page inbox (an echo not sent by this app) pauses the bot for that customer.
 */

const DEBOUNCE_MS = 4000; // people send several short messages in a row: answer them together

export async function GET(req: Request) {
  const url = new URL(req.url);
  const ok = url.searchParams.get('hub.mode') === 'subscribe'
    && !!process.env.FB_VERIFY_TOKEN
    && url.searchParams.get('hub.verify_token') === process.env.FB_VERIFY_TOKEN;
  return ok ? new Response(url.searchParams.get('hub.challenge') || '', { status: 200 }) : new Response('Forbidden', { status: 403 });
}

type FbEvent = {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: { mid: string; text?: string; is_echo?: boolean; app_id?: number; sticker_id?: number; attachments?: { type: string }[] };
  postback?: { title?: string; payload?: string; mid?: string };
};

function describe(m: NonNullable<FbEvent['message']>) {
  if (m.text) return m.text.slice(0, 2000);
  if (m.sticker_id) return '[Khách gửi một sticker]';
  const kinds: Record<string, string> = { image: 'ảnh', video: 'video', audio: 'tin nhắn thoại', file: 'tệp' };
  const what = (m.attachments || []).map((a) => kinds[a.type] || a.type).join(', ');
  return what ? `[Khách gửi ${what}. Bạn chưa xem được nội dung này, hãy nhờ khách nhắn bằng chữ]` : '';
}

export async function POST(req: Request) {
  const raw = await req.text();
  if (!validSignature(raw, req.headers.get('x-hub-signature-256'))) return new Response('Bad signature', { status: 401 });
  const body = JSON.parse(raw || '{}');
  if (body.object !== 'page') return new Response('ok');

  const db = getSupabaseAdmin();
  if (!db) return new Response('ok');

  const ourApp = Number(process.env.FB_APP_ID) || null;
  const toAnswer = new Map<string, number>(); // psid -> id of the customer message that triggered a reply

  for (const entry of body.entry || []) {
    for (const ev of (entry.messaging || []) as FbEvent[]) {
      const echo = !!ev.message?.is_echo;
      const psid = echo ? ev.recipient.id : ev.sender.id;
      if (!psid || psid === entry.id) continue;

      // Echo of a message this app sent (bot or Admin page): already stored
      if (echo && ourApp && ev.message?.app_id === ourApp) continue;

      const text = ev.message ? describe(ev.message) : (ev.postback?.title || ev.postback?.payload || '').slice(0, 500);
      const mid = ev.message?.mid || ev.postback?.mid || null;
      if (!text) continue;

      const at = new Date(ev.timestamp || Date.now()).toISOString();
      const { data: existing } = await db.from('fb_conversations').select('psid').eq('psid', psid).maybeSingle();
      if (!existing) {
        const profile = await getProfile(psid);
        await db.from('fb_conversations').upsert({ psid, name: profile.name, profile_pic: profile.pic }, { onConflict: 'psid', ignoreDuplicates: true });
      }

      const role = echo ? 'admin' : 'customer';
      const { data: saved, error } = await db.from('fb_messages').insert({ psid, role, text, mid, created_at: at }).select('id').single();
      if (error) continue; // duplicate delivery (same mid)

      if (echo) {
        // Minh Tấn answered from the Page inbox: he has this one, the bot steps back
        const hours = Number(process.env.FB_HUMAN_PAUSE_HOURS) || 12;
        await db.from('fb_conversations').update({
          last_message_at: at, needs_human: false, handoff_reason: null,
          bot_paused_until: new Date(Date.now() + hours * 3600_000).toISOString(),
        }).eq('psid', psid);
        toAnswer.delete(psid);
      } else {
        await db.from('fb_conversations').update({ last_message_at: at, last_customer_at: at, status: 'open' }).eq('psid', psid);
        toAnswer.set(psid, saved.id);
      }
    }
  }

  if (toAnswer.size && process.env.FB_BOT_ENABLED !== 'false') {
    after(async () => {
      await new Promise((r) => setTimeout(r, DEBOUNCE_MS));
      await Promise.allSettled([...toAnswer].map(async ([psid, id]) => {
        // A newer message from the same person arrived: its own webhook call answers everything
        const { data: latest } = await db.from('fb_messages').select('id').eq('psid', psid).eq('role', 'customer').order('id', { ascending: false }).limit(1).maybeSingle();
        if (latest && latest.id !== id) return;
        await replyTo(db, psid);
      }));
    });
  }

  return new Response('ok');
}
