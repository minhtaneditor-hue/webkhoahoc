import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { getSiteSettings } from '@/lib/content';
import { contactFrom } from '@/lib/site-settings';
import { isAdmin } from '@/lib/admin';
import {
  FROM, unsubscribeHeaders, onboardDay2, onboardDay5, onboardDay10, inactiveStudent,
  courseCompleted, accessExpiring, signupNudge, leadDay2, leadDay6, getFeaturedCourse,
} from '@/lib/emails';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const DAY = 86_400_000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Daily email sequences (vercel.json cron). Each email goes out once (email_log, migration 016),
 * at most one email per person per run, never to people in email_optouts.
 * Onboarding emails only fire inside a short window after enrolment, so older students are not
 * flooded with the sequence when it is first switched on.
 *
 *   Students:  day 2 habit · day 5 first homework + audit · day 10 progress
 *              inactive 5+ days (every 14 days, max 3) · course completed · access expiring in 7 days
 *   Signed up, no course:  day 1 free-trial nudge
 *   Checklist leads:       day 2 tips · day 6 course offer
 */
export async function GET(req: Request) {
  if (!process.env.CRON_SECRET || req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const db = getSupabaseAdmin();
  if (!db || !process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY or RESEND_API_KEY is missing.' }, { status: 500 });
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const now = Date.now();
  const age = (iso?: string | null) => (iso ? (now - Date.parse(iso)) / DAY : Infinity);
  const [contact, featured] = await Promise.all([getSiteSettings().then(contactFrom), getFeaturedCourse(db)]);

  const [{ data: optouts }, { data: log, error: logError }] = await Promise.all([
    db.from('email_optouts').select('email'),
    db.from('email_log').select('email, kind, ref').gte('sent_at', new Date(now - 120 * DAY).toISOString()),
  ]);
  if (logError) return NextResponse.json({ error: `email_log: ${logError.message} (run migration 016)` }, { status: 500 });
  const blocked = new Set((optouts || []).map((o) => o.email));
  const sent = new Set((log || []).map((l) => `${l.email}|${l.kind}|${l.ref}`));
  const touched = new Set<string>(); // one email per person per run
  const counts: Record<string, number> = {};

  const send = async (to: string, kind: string, ref: string, mail: { subject: string; html: string }) => {
    const email = to.toLowerCase();
    if (blocked.has(email) || touched.has(email) || sent.has(`${email}|${kind}|${ref}`) || isAdmin(email)) return;
    touched.add(email);
    const { error } = await resend.emails.send({ from: FROM, to: email, headers: unsubscribeHeaders(email), ...mail });
    if (error) { console.error(`Cron email ${kind} to ${email} failed`, error); return; }
    await db.from('email_log').insert({ email, kind, ref });
    counts[kind] = (counts[kind] || 0) + 1;
    await sleep(600); // Resend allows ~2 requests/second
  };

  // ------------------------------------------------------------ students
  const { data: enrollments } = await db
    .from('enrollments')
    .select('user_id, course_id, enrolled_at, expires_at, courses (title), users (email, full_name, last_active_at)')
    .eq('status', 'active');
  const userIds = [...new Set((enrollments || []).map((e) => e.user_id))];
  const [{ data: outline }, { data: progress }] = await Promise.all([
    db.from('lesson_outline').select('id, course_id, title, order_index').order('order_index'),
    userIds.length
      ? db.from('student_progress').select('user_id, lesson_id, is_completed, last_watched_at').in('user_id', userIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  for (const e of enrollments || []) {
    const user = (e as any).users;
    const courseTitle = (e as any).courses?.title;
    if (!user?.email || !courseTitle) continue;
    const lessons = (outline || []).filter((l) => l.course_id === e.course_id);
    const mine = (progress || []).filter((p) => p.user_id === e.user_id);
    const doneIds = new Set(mine.filter((p) => p.is_completed).map((p) => p.lesson_id));
    const next = lessons.find((l) => !doneIds.has(l.id));
    const s = {
      name: user.full_name, email: user.email, courseTitle, courseId: e.course_id,
      done: lessons.filter((l) => doneIds.has(l.id)).length, total: lessons.length,
      nextLessonId: next?.id, nextLessonTitle: next?.title,
    };
    const enrolled = age(e.enrolled_at);
    const lastActive = Math.min(age(user.last_active_at), age(e.enrolled_at), ...mine.map((p) => age(p.last_watched_at)));

    if (s.total && s.done >= s.total) { await send(s.email, 'completed', e.course_id, courseCompleted(s, contact)); continue; }

    const expires = age(e.expires_at) * -1; // days until expiry
    if (expires > 6 && expires <= 8) {
      const expiryDate = new Date(e.expires_at!).toLocaleDateString('vi-VN');
      await send(s.email, 'expiring', `${e.course_id}:${e.expires_at!.slice(0, 10)}`, accessExpiring({ ...s, expiryDate }));
      continue;
    }

    if (enrolled >= 2 && enrolled < 4) { await send(s.email, 'onboard-2', e.course_id, onboardDay2(s)); continue; }
    if (enrolled >= 5 && enrolled < 7) { await send(s.email, 'onboard-5', e.course_id, onboardDay5(s, contact)); continue; }
    if (enrolled >= 10 && enrolled < 13) { await send(s.email, 'onboard-10', e.course_id, onboardDay10(s)); continue; }

    if (enrolled >= 7 && lastActive >= 5) {
      const earlier = (log || []).filter((l) => l.email === s.email.toLowerCase() && l.kind === 'inactive' && l.ref.startsWith(e.course_id));
      if (earlier.length < 3) await send(s.email, 'inactive', `${e.course_id}:${Math.floor(enrolled / 14)}`, inactiveStudent(s));
    }
  }

  // ------------------------------------------------------------ signed up, no course yet
  const enrolledUsers = new Set(userIds);
  const { data: signups } = await db.from('users').select('id, email, full_name, created_at')
    .gte('created_at', new Date(now - 3 * DAY).toISOString()).lt('created_at', new Date(now - DAY).toISOString());
  for (const u of signups || []) {
    if (featured && u.email && !enrolledUsers.has(u.id)) await send(u.email, 'signup-1', '', signupNudge({ name: u.full_name, email: u.email }, featured));
  }

  // ------------------------------------------------------------ checklist leads
  const studentEmails = new Set((enrollments || []).map((e) => (e as any).users?.email?.toLowerCase()).filter(Boolean));
  const { data: leads } = await db.from('leads').select('email, name, created_at')
    .gte('created_at', new Date(now - 8 * DAY).toISOString());
  for (const l of leads || []) {
    if (!featured || studentEmails.has(l.email)) continue;
    const a = age(l.created_at);
    if (a >= 2 && a < 4) await send(l.email, 'lead-2', '', leadDay2(l, featured));
    else if (a >= 6 && a < 8) await send(l.email, 'lead-6', '', leadDay6(l, featured));
  }

  return NextResponse.json({ success: true, sent: counts });
}
