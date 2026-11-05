import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/admin';
import { getSessionUser, getSupabaseAdmin } from '@/lib/supabase-server';
import { FROM, preorderAiCourses, unsubscribeHeaders } from '@/lib/emails';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// The campaign on offer. It goes out once per person: (email, 'campaign', ref) is unique in email_log.
const CAMPAIGN = {
  ref: 'preorder-ai-2026-11',
  label: 'Đặt trước 2 khóa Edit Video bằng AI',
  slugs: ['edit-video-ai-claude', 'edit-video-ai-chatgpt-plus'],
};

const KIND_LABELS: Record<string, string> = {
  'onboard-0': 'Chào mừng vào khóa',
  'onboard-2': 'Ngày 2: tạo thói quen học',
  'onboard-5': 'Ngày 5: bài tập đầu tiên',
  'onboard-10': 'Ngày 10: tiến độ',
  inactive: 'Nhắc học lại',
  completed: 'Hoàn thành khóa',
  expiring: 'Sắp hết hạn truy cập',
  'signup-1': 'Mời học thử',
  'lead-2': 'Khách tiềm năng: ngày 2',
  'lead-6': 'Khách tiềm năng: ngày 6',
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function requireAdmin() {
  const db = getSupabaseAdmin();
  if (!db) return { error: NextResponse.json({ error: 'Thiếu SUPABASE_SERVICE_ROLE_KEY.' }, { status: 500 }) };
  const user = await getSessionUser();
  if (!user?.email || !isAdmin(user.email)) return { error: NextResponse.json({ error: 'Chỉ admin mới xem được.' }, { status: 403 }) };
  return { db, adminEmail: user.email };
}

async function campaignCourses(db: SupabaseClient) {
  const { data } = await db.from('courses').select('id, slug, title, description').in('slug', CAMPAIGN.slugs);
  return CAMPAIGN.slugs.map((slug) => (data || []).find((c) => c.slug === slug)).filter((c) => !!c);
}

/** Everyone with an active course, once each. Admins are left out, as in the daily reminders. */
async function campaignAudience(db: SupabaseClient) {
  const { data } = await db.from('enrollments').select('users (email, full_name)').eq('status', 'active');
  const people = new Map<string, string | null>();
  for (const row of data || []) {
    const user = row.users as unknown as { email?: string | null; full_name?: string | null } | null;
    const email = user?.email?.toLowerCase();
    if (email && !isAdmin(email)) people.set(email, user?.full_name || null);
  }
  return people;
}

/** GET: who has been sent what, plus the campaign with each student's status. */
export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { db } = auth;

  const [{ data: log, count, error }, { data: optouts }, { data: users }, { data: leads }, { data: allCourses }, courses, audience] = await Promise.all([
    db.from('email_log').select('email, kind, ref, sent_at', { count: 'exact' }).order('sent_at', { ascending: false }).limit(1000),
    db.from('email_optouts').select('email'),
    db.from('users').select('email, full_name'),
    db.from('leads').select('email, name'),
    db.from('courses').select('id, title'),
    campaignCourses(db),
    campaignAudience(db),
  ]);
  if (error) return NextResponse.json({ error: `email_log: ${error.message}` }, { status: 500 });

  const names = new Map<string, string>();
  for (const l of leads || []) if (l.name) names.set(l.email?.toLowerCase(), l.name);
  for (const u of users || []) if (u.full_name) names.set(u.email?.toLowerCase(), u.full_name);
  const titles = new Map((allCourses || []).map((c) => [c.id, c.title]));

  const rows = (log || []).map((l) => ({
    email: l.email,
    name: names.get(l.email) || null,
    kind: l.kind,
    label: l.kind === 'campaign' ? (l.ref === CAMPAIGN.ref ? CAMPAIGN.label : l.ref) : KIND_LABELS[l.kind] || l.kind,
    course: titles.get(l.ref.split(':')[0]) || null,
    sentAt: l.sent_at,
  }));

  const blocked = new Set((optouts || []).map((o) => o.email));
  const sentAt = new Map((log || []).filter((l) => l.kind === 'campaign' && l.ref === CAMPAIGN.ref).map((l) => [l.email, l.sent_at]));
  const sample = preorderAiCourses({ name: 'Nguyễn Văn An', email: 'hocvien@example.com' }, courses);

  return NextResponse.json({
    rows,
    total: count ?? rows.length,
    optouts: blocked.size,
    campaign: {
      label: CAMPAIGN.label,
      subject: sample.subject,
      html: sample.html,
      recipients: [...audience].map(([email, name]) => ({
        email, name,
        sentAt: sentAt.get(email) || null,
        optedOut: blocked.has(email),
      })),
    },
  });
}

/** POST { action: 'test' } sends one copy to the admin, unlogged. POST { action: 'send' } sends to students who have not had it. */
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { db, adminEmail } = auth;
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: 'Thiếu RESEND_API_KEY.' }, { status: 500 });
  const resend = new Resend(process.env.RESEND_API_KEY);

  const courses = await campaignCourses(db);
  if (courses.length !== CAMPAIGN.slugs.length) return NextResponse.json({ error: 'Không tìm thấy đủ khóa học của chiến dịch.' }, { status: 500 });

  const { action } = await req.json().catch(() => ({}));
  if (action === 'test') {
    const mail = preorderAiCourses({ name: null, email: adminEmail }, courses);
    const { error } = await resend.emails.send({ from: FROM, to: adminEmail, subject: `[Gửi thử] ${mail.subject}`, html: mail.html });
    if (error) return NextResponse.json({ error: error.message }, { status: 502 });
    return NextResponse.json({ ok: true, to: adminEmail });
  }
  if (action !== 'send') return NextResponse.json({ error: 'Thao tác không hợp lệ.' }, { status: 400 });

  const { data: optouts } = await db.from('email_optouts').select('email');
  const blocked = new Set((optouts || []).map((o) => o.email));
  const audience = [...await campaignAudience(db)].filter(([email]) => !blocked.has(email));

  const started = Date.now();
  let sent = 0, skipped = 0, failed = 0, remaining = 0;
  for (const [email, name] of audience) {
    if (Date.now() - started > 50_000) { remaining++; continue; } // stop before the 60s limit; pressing send again continues
    // Claim the row first: the unique index makes a double click or a second admin tab harmless
    const { error: claim } = await db.from('email_log').insert({ email, kind: 'campaign', ref: CAMPAIGN.ref });
    if (claim) { if (claim.code === '23505') skipped++; else failed++; continue; }
    const { error } = await resend.emails.send({ from: FROM, to: email, headers: unsubscribeHeaders(email), ...preorderAiCourses({ name, email }, courses) });
    if (error) {
      console.error(`Campaign ${CAMPAIGN.ref} to ${email} failed`, error);
      await db.from('email_log').delete().match({ email, kind: 'campaign', ref: CAMPAIGN.ref });
      failed++;
      continue;
    }
    sent++;
    await sleep(600); // Resend allows ~2 requests/second
  }
  return NextResponse.json({ ok: true, sent, skipped, failed, remaining });
}
