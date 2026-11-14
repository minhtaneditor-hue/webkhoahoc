import { getSupabaseAdmin } from '@/lib/supabase-server';
import { sendText } from '@/lib/fb/graph';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const HOUR = 3_600_000;
// Facebook only lets the Page message freely within 24h of the customer's last message.
// Aim for ~22h of silence, but never late at night: reminders go out only 8:00–21:59 Vietnam time.
// If the 22h mark lands at night, the reminder goes out at the last daytime run before the
// 23.5h deadline instead (e.g. 21:00 the evening before), never sooner than MIN_H of silence.
const MIN_H = 8;
const FROM_H = 22;
const TO_H = 23.5;
const DAY_START = 8;  // first allowed hour (VN)
const DAY_END = 21;   // last allowed hour (VN), so nothing after ~22:00

const vnHour = (t: number) => (new Date(t).getUTCHours() + 7) % 24;
const daytime = (t: number) => { const h = vnHour(t); return h >= DAY_START && h <= DAY_END; };

/** Send now if it's daytime and either the 22h mark is reached or no later daytime run fits before the deadline. */
function dueNow(now: number, lastCustomer: number) {
  if (!daytime(now)) return false;
  const silent = (now - lastCustomer) / HOUR;
  if (silent < MIN_H || silent > TO_H) return false;
  if (silent >= FROM_H) return true;
  for (let t = now + HOUR; t - lastCustomer <= TO_H * HOUR; t += HOUR) {
    if (daytime(t)) return false; // a later daytime run still makes it: wait for it
  }
  return true; // tonight is the last chance before the window closes
}

const FOLLOWUP_TEXT =
  'Dạ mình ơi, những thông tin em tư vấn cho mình đã rõ chưa ạ? Mình còn băn khoăn hay thắc mắc gì không, ' +
  'hay mình còn cần suy nghĩ thêm về vấn đề nào không ạ? Mình cứ nhắn để em tư vấn thêm cho mình nha 😊';

/**
 * Hourly (vercel.json): Mina reminds customers who went quiet after the Page's last reply.
 * One reminder per silence, never while a person has the conversation (needs_human / bot paused).
 */
export async function GET(req: Request) {
  if (!process.env.CRON_SECRET || req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  const db = getSupabaseAdmin();
  if (!db || !process.env.FB_PAGE_ACCESS_TOKEN) return Response.json({ skipped: true });
  if (process.env.FB_BOT_ENABLED === 'false' || process.env.FB_FOLLOWUP_ENABLED === 'false') return Response.json({ skipped: 'disabled' });

  const now = Date.now();
  if (!daytime(now)) return Response.json({ skipped: 'night' });
  const { data: convos, error } = await db
    .from('fb_conversations')
    .select('psid, last_customer_at, last_message_at, followup_at, bot_paused_until')
    .eq('status', 'open')
    .eq('needs_human', false)
    .gte('last_customer_at', new Date(now - TO_H * HOUR).toISOString())
    .lte('last_customer_at', new Date(now - MIN_H * HOUR).toISOString())
    .limit(200);
  if (error) return Response.json({ error: `${error.message} (run migration 035)` }, { status: 500 });

  let sent = 0;
  for (const c of convos || []) {
    if (!dueNow(now, Date.parse(c.last_customer_at!))) continue;
    if (c.bot_paused_until && Date.parse(c.bot_paused_until) > now) continue;
    if (c.followup_at && Date.parse(c.followup_at) >= Date.parse(c.last_customer_at!)) continue; // already reminded

    // Only when the Page spoke last (the customer is the one who went quiet)
    const { data: last } = await db.from('fb_messages').select('role').eq('psid', c.psid)
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (!last || last.role === 'customer') continue;

    try {
      const mids = await sendText(c.psid, FOLLOWUP_TEXT);
      const at = new Date().toISOString();
      await db.from('fb_messages').insert({ psid: c.psid, role: 'bot', text: FOLLOWUP_TEXT, mid: mids[0] || null });
      await db.from('fb_conversations').update({ followup_at: at, last_message_at: at }).eq('psid', c.psid);
      sent++;
    } catch (err) {
      console.error('fb follow-up failed', c.psid, err);
    }
  }
  return Response.json({ checked: convos?.length || 0, sent });
}
