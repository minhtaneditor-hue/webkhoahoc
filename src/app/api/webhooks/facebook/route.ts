import { after } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { getProfile, validSignature } from '@/lib/fb/graph';
import { replyTo } from '@/lib/fb/agent';
import { handleComment, type FeedChange } from '@/lib/fb/comments';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Facebook Messenger webhook (Meta app > Messenger > Webhook):
 *   Callback URL  https://www.minhtanacademy.com/api/webhooks/facebook
 *   Verify token  the value of FB_VERIFY_TOKEN
 *   Fields        messages, messaging_postbacks, message_echoes
 * Facebook needs a 200 within seconds, so the AI answers in after() once the response is sent.
 * A reply typed by a person in the Page inbox (an echo not sent by this app) pauses the bot for that customer.
 * Meta's own automations (AI agent hand-off, instant replies, comment-to-DM flows) also arrive as echoes
 * from other apps: those are stored as automated and never pause the bot (see isAutomatedEcho).
 */

const DEBOUNCE_MS = 4000; // people send several short messages in a row: answer them together

// Apps whose echoes are Meta automations, not a person typing (comma-separated app ids, from the "[fb echo]" log)
const AUTOMATED_APPS = new Set((process.env.FB_AUTOMATED_APP_IDS || '').split(',').map((s) => s.trim()).filter(Boolean));
// A person can't read and answer that fast: an echo this soon after the customer's message is an automation
const AUTO_ECHO_MS = (Number(process.env.FB_AUTO_ECHO_SECONDS) || 20) * 1000;

function isAutomatedEcho(appId: number | undefined, echoAt: number, lastCustomerAt: number | null) {
  if (appId && AUTOMATED_APPS.has(String(appId))) return true;
  return lastCustomerAt !== null && echoAt >= lastCustomerAt && echoAt - lastCustomerAt < AUTO_ECHO_MS;
}

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

      const ts = ev.timestamp || Date.now();
      const at = new Date(ts).toISOString();
      const { data: existing } = await db.from('fb_conversations').select('psid, last_customer_at').eq('psid', psid).maybeSingle();
      if (!existing) {
        const profile = await getProfile(psid);
        await db.from('fb_conversations').upsert({ psid, name: profile.name, profile_pic: profile.pic }, { onConflict: 'psid', ignoreDuplicates: true });
      }

      const lastCustomerAt = existing?.last_customer_at ? Date.parse(existing.last_customer_at) : null;
      const automated = echo && isAutomatedEcho(ev.message?.app_id, ts, lastCustomerAt);
      if (echo) console.log('[fb echo]', JSON.stringify({ app_id: ev.message?.app_id ?? null, automated, text: text.slice(0, 60) }));

      // Automated echoes are kept as context ('bot' role) but are not Minh Tấn's words: no pause, nothing to learn from
      const role = automated ? 'bot' : echo ? 'admin' : 'customer';
      const stored = automated ? `[Tin tự động của Meta] ${text}` : text;
      const { data: saved, error } = await db.from('fb_messages').insert({ psid, role, text: stored, mid, created_at: at }).select('id').single();
      if (error) continue; // duplicate delivery (same mid)

      if (automated) {
        await db.from('fb_conversations').update({ last_message_at: at }).eq('psid', psid);
      } else if (echo) {
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

  // Comments on the Page's posts and ads (field "feed"): answered after the response is sent
  for (const e of (body.entry || []) as { id: string; changes?: { field: string; value: FeedChange & { item?: string } }[] }[]) {
    for (const ch of e.changes || []) {
      console.log('[fb change]', JSON.stringify({ field: ch.field, item: ch.value?.item, verb: ch.value?.verb, fromPage: ch.value?.from?.id === e.id, reply: !!ch.value?.parent_id && ch.value?.parent_id !== ch.value?.post_id }));
    }
  }
  const comments = (body.entry || []).flatMap((e: { id: string; changes?: { field: string; value: FeedChange }[] }) =>
    (e.changes || []).filter((ch) => ch.field === 'feed' && ch.value?.item === 'comment').map((ch) => ({ pageId: e.id, value: ch.value })));
  if (comments.length && process.env.FB_BOT_ENABLED !== 'false') {
    after(() => Promise.allSettled(comments.map((c: { pageId: string; value: FeedChange }) => handleComment(db, c.pageId, c.value))));
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
