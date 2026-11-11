import { getSupabaseAdmin } from '@/lib/supabase-server';
import { learnFromConversations } from '@/lib/fb/agent';
import { notifyAdmin } from '@/lib/fb/notify';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Weekly (vercel.json): the Messenger bot reads the last 7 days of replies Minh Tấn wrote himself
 * and suggests new knowledge. Nothing is used until he approves it in Admin > Facebook Messenger > Kiến thức.
 */
export async function GET(req: Request) {
  if (!process.env.CRON_SECRET || req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  const db = getSupabaseAdmin();
  if (!db || !process.env.ANTHROPIC_API_KEY || !process.env.FB_PAGE_ACCESS_TOKEN) return Response.json({ skipped: true });
  const result = await learnFromConversations(db, 7);
  if (result.added) {
    await notifyAdmin({ title: `Bot học được ${result.added} điều mới, chờ bạn duyệt`, lines: [['Từ', `${result.read} hội thoại có bạn trả lời trong 7 ngày`]] });
  }
  return Response.json(result);
}
