import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/admin';
import { getSessionUser, getSupabaseAdmin } from '@/lib/supabase-server';
import { checkPromo } from '@/lib/promo';
import { FROM, getFeaturedCourse, preorderAiCourses, remarketingDiscount, unsubscribeHeaders } from '@/lib/emails';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// The campaign on offer. It goes out once per person: (email, 'campaign', ref) is unique in email_log.
const CAMPAIGN = {
  ref: 'preorder-ai-2026-11',
  label: 'Đặt trước 2 khóa Edit Video bằng AI',
  slugs: ['edit-video-ai-claude', 'edit-video-ai-chatgpt-plus'],
};

// People with an account who never bought, offered an existing promo code on the featured course.
const REMARKETING = { ref: 'remarketing-giam10-2026-11', label: 'Giảm 10% cho người chưa mua', code: 'GIAM10' };

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

/** Accounts with no course and no paid order, once each. Admins are left out. */
async function remarketingAudience(db: SupabaseClient) {
  const [{ data: users }, { data: enrollments }, { data: paid }] = await Promise.all([
    db.from('users').select('id, email, full_name'),
    db.from('enrollments').select('user_id'),
    db.from('payments').select('user_id, buyer_email').eq('status', 'success'),
  ]);
  const buyers = new Set<string>();
  for (const e of enrollments || []) if (e.user_id) buyers.add(e.user_id);
  for (const b of paid || []) {
    if (b.user_id) buyers.add(b.user_id);
    if (b.buyer_email) buyers.add(b.buyer_email.toLowerCase());
  }
  const people = new Map<string, string | null>();
  for (const u of users || []) {
    const email = u.email?.toLowerCase();
    if (email && !isAdmin(email) && !buyers.has(u.id) && !buyers.has(email)) people.set(email, u.full_name || null);
  }
  return people;
}

/** The mail builder for the remarketing campaign, or an error if the code would not work at checkout. */
async function remarketingMail(db: SupabaseClient) {
  const course = await getFeaturedCourse(db);
  if (!course) return { error: 'Không tìm thấy khóa học chính.' };
  const { data } = await db.from('courses').select('price').eq('id', course.id).maybeSingle();
  const price = Number(data?.price) || 0;
  const promo = await checkPromo(db, REMARKETING.code, { courseId: course.id, price });
  if (!promo.ok || !price) return { error: `Mã ${REMARKETING.code} chưa dùng được cho khóa này.` };
  const offer = { code: promo.code, price, discount: promo.discount };
  return { build: (d: { name?: string | null; email: string }) => remarketingDiscount(d, course, offer) };
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
  const [remarketing, remarketingPeople] = await Promise.all([remarketingMail(db), remarketingAudience(db)]);
  if (error) return NextResponse.json({ error: `email_log: ${error.message}` }, { status: 500 });

  const names = new Map<string, string>();
  for (const l of leads || []) if (l.name) names.set(l.email?.toLowerCase(), l.name);
  for (const u of users || []) if (u.full_name) names.set(u.email?.toLowerCase(), u.full_name);
  const titles = new Map((allCourses || []).map((c) => [c.id, c.title]));

  const rows = (log || []).map((l) => ({
    email: l.email,
    name: names.get(l.email) || null,
    kind: l.kind,
    label: l.kind === 'campaign' ? (l.ref === CAMPAIGN.ref ? CAMPAIGN.label : l.ref === REMARKETING.ref ? REMARKETING.label : l.ref) : KIND_LABELS[l.kind] || l.kind,
    course: titles.get(l.ref.split(':')[0]) || null,
    sentAt: l.sent_at,
  }));

  const blocked = new Set((optouts || []).map((o) => o.email));
  const sentAt = new Map((log || []).filter((l) => l.kind === 'campaign' && l.ref === CAMPAIGN.ref).map((l) => [l.email, l.sent_at]));
  const sample = preorderAiCourses({ name: 'Nguyễn Văn An', email: 'hocvien@example.com' }, courses);
  const remarketingSentAt = new Map((log || []).filter((l) => l.kind === 'campaign' && l.ref === REMARKETING.ref).map((l) => [l.email, l.sent_at]));
  const remarketingSample = remarketing.build?.({ name: 'Nguyễn Văn An', email: 'khach@example.com' });

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
    remarketing: {
      label: REMARKETING.label,
      subject: remarketingSample?.subject || remarketing.error,
      html: remarketingSample?.html || '',
      recipients: [...remarketingPeople].map(([email, name]) => ({
        email, name,
        sentAt: remarketingSentAt.get(email) || null,
        optedOut: blocked.has(email),
      })),
    },
  });
}

/** POST { action: 'test' } sends one copy to the admin, unlogged. POST { action: 'send' } sends to people who have not had it. { campaign: 'remarketing' } picks the discount email. */
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { db, adminEmail } = auth;
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: 'Thiếu RESEND_API_KEY.' }, { status: 500 });
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { action, campaign } = await req.json().catch(() => ({}));
  const isRemarketing = campaign === 'remarketing';
  let build: (d: { name?: string | null; email: string }) => ReturnType<typeof preorderAiCourses>;
  if (isRemarketing) {
    const made = await remarketingMail(db);
    if (!made.build) return NextResponse.json({ error: made.error }, { status: 500 });
    build = made.build;
  } else {
    const courses = await campaignCourses(db);
    if (courses.length !== CAMPAIGN.slugs.length) return NextResponse.json({ error: 'Không tìm thấy đủ khóa học của chiến dịch.' }, { status: 500 });
    build = (d) => preorderAiCourses(d, courses);
  }
  const ref = isRemarketing ? REMARKETING.ref : CAMPAIGN.ref;

  if (action === 'test') {
    const mail = build({ name: null, email: adminEmail });
    const { error } = await resend.emails.send({ from: FROM, to: adminEmail, subject: `[Gửi thử] ${mail.subject}`, html: mail.html });
    if (error) return NextResponse.json({ error: error.message }, { status: 502 });
    return NextResponse.json({ ok: true, to: adminEmail });
  }
  if (action !== 'send') return NextResponse.json({ error: 'Thao tác không hợp lệ.' }, { status: 400 });

  const { data: optouts } = await db.from('email_optouts').select('email');
  const blocked = new Set((optouts || []).map((o) => o.email));
  const audience = [...await (isRemarketing ? remarketingAudience(db) : campaignAudience(db))].filter(([email]) => !blocked.has(email));

  const started = Date.now();
  let sent = 0, skipped = 0, failed = 0, remaining = 0;
  for (const [email, name] of audience) {
    if (Date.now() - started > 50_000) { remaining++; continue; } // stop before the 60s limit; pressing send again continues
    // Claim the row first: the unique index makes a double click or a second admin tab harmless
    const { error: claim } = await db.from('email_log').insert({ email, kind: 'campaign', ref });
    if (claim) { if (claim.code === '23505') skipped++; else failed++; continue; }
    const { error } = await resend.emails.send({ from: FROM, to: email, headers: unsubscribeHeaders(email), ...build({ name, email }) });
    if (error) {
      console.error(`Campaign ${ref} to ${email} failed`, error);
      await db.from('email_log').delete().match({ email, kind: 'campaign', ref });
      failed++;
      continue;
    }
    sent++;
    await sleep(600); // Resend allows ~2 requests/second
  }
  return NextResponse.json({ ok: true, sent, skipped, failed, remaining });
}
