import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/admin';
import { getSessionUser, getSupabaseAdmin } from '@/lib/supabase-server';
import { checkPromo } from '@/lib/promo';
import { checkEmail } from '@/lib/email-check';
import { freeEmailUrl } from '@/lib/free-link';
import { getSiteSettings } from '@/lib/content';
import { contactFrom } from '@/lib/site-settings';
import { resendKind, resendTitle } from '@/lib/email-resend';
import { assetPricing } from '@/lib/shop';
import { DEFAULT_STUDENT_PASSWORD, FROM, SITE, assetPurchased, freeDownloadEmail, getFeaturedCourse, preorderAiCourses, remarketingDiscount, repoBirthdaySale, tokenSkillOffer, unsubscribeHeaders, welcomeCourse } from '@/lib/emails';

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

// Birthday-month offer to people who took the free 75-repo list, sent in small test batches.
// The Tiết Kiệm Token skill to the same 75-repo list: first people who opened or clicked, then everyone.
const TOKEN_SALE = { ref: 'token-skill-2026-11', productId: '192e5a88-0af3-4cac-8ba4-76f0bc98c006' };

const REPO_SALE = { ref: 'repo-birthday-50-2026-11', code: 'TANVAO8IH', until: '30/11/2026', asset: '%75 repo%' };

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
  retry: 'Gửi lại thư thất bại',
  'pay-reminder': 'Nhắc thanh toán',
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

type RetryType = 'student' | 'free' | 'remarketing';
type Mail = ReturnType<typeof preorderAiCourses>;

/** Rebuilds a failed email from current data, so its links are fresh. Returns why not when it should not go out. */
async function retryMail(db: SupabaseClient, type: RetryType, email: string): Promise<{ mail: Mail; headers?: Record<string, string> } | { skip: string }> {
  const { data: user } = await db.from('users').select('id, full_name').eq('email', email).maybeSingle();
  if (type === 'student') {
    if (!user) return { skip: 'không có tài khoản' };
    const { data: enrolled } = await db.from('enrollments').select('course_id, courses (id, title)').eq('user_id', user.id).eq('status', 'active').limit(1).maybeSingle();
    const course = enrolled?.courses as unknown as { id: string; title: string } | null;
    if (!course) return { skip: 'chưa được mở khóa' };
    // Never signed in means they have no working password, and a set-password link expires too fast to rely on
    const { data: auth } = await db.auth.admin.getUserById(user.id);
    let defaultPassword: string | undefined;
    if (!auth?.user?.last_sign_in_at) {
      const { error } = await db.auth.admin.updateUserById(user.id, { password: DEFAULT_STUDENT_PASSWORD });
      if (error) return { skip: `không đặt được mật khẩu: ${error.message}` };
      defaultPassword = DEFAULT_STUDENT_PASSWORD;
    }
    const contact = contactFrom(await getSiteSettings());
    return { mail: welcomeCourse({ name: user.full_name, email, courseTitle: course.title, courseId: course.id, contact, defaultPassword }) };
  }

  const checked = await checkEmail(email);
  if (!checked.ok) return { skip: 'địa chỉ sai' };
  const headers = unsubscribeHeaders(email);
  if (type === 'remarketing') {
    const made = await remarketingMail(db);
    if (!made.build) return { skip: made.error || 'mã giảm giá không dùng được' };
    return { mail: made.build({ name: user?.full_name, email }), headers };
  }
  const [{ data: lead }, { data: download }] = await Promise.all([
    db.from('leads').select('name').eq('email', email).maybeSingle(),
    db.from('asset_downloads').select('asset_id, digital_assets (title, price)').eq('email', email).eq('kind', 'free').order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ]);
  const asset = download?.digital_assets as unknown as { title: string; price: number } | null;
  if (!download || !asset || Number(asset.price) > 0) return { skip: 'không tìm thấy sản phẩm đã nhận' };
  return { mail: freeDownloadEmail({ name: lead?.name, email, title: asset.title, url: freeEmailUrl(download.asset_id, email) }), headers };
}

const low = (e?: string | null) => (e || '').trim().toLowerCase();

/** The latest name we have for someone: account first, then lead form. */
async function nameOf(db: SupabaseClient, email: string) {
  const [{ data: user }, { data: lead }] = await Promise.all([
    db.from('users').select('full_name').eq('email', email).maybeSingle(),
    db.from('leads').select('name').eq('email', email).maybeSingle(),
  ]);
  return (user?.full_name as string | null) || (lead?.name as string | null) || null;
}

/** Rebuilds one tracked email from current data, so links are fresh. Returns why not when it cannot. */
async function rebuildTracked(db: SupabaseClient, email: string, subject: string | null): Promise<{ mail: Mail; headers?: Record<string, string> } | { skip: string }> {
  const kind = resendKind(subject);
  if (!kind) return { skip: 'Loại thư này chưa gửi lại được.' };
  if (kind === 'student' || kind === 'remarketing') {
    const built = await retryMail(db, kind, email);
    return 'skip' in built ? { skip: `Không gửi lại được: ${built.skip}.` } : built;
  }
  if (kind !== 'order') {
    const { data: optout } = await db.from('email_optouts').select('email').eq('email', email).maybeSingle();
    if (optout) return { skip: 'Người này đã ngừng nhận email.' };
    if (!(await checkEmail(email)).ok) return { skip: 'Địa chỉ email này không nhận được thư.' };
  }
  const headers = unsubscribeHeaders(email);
  if (kind === 'repo-sale') {
    const made = await repoSaleOffer(db);
    if ('error' in made) return { skip: made.error || 'Mã giảm giá không dùng được.' };
    return { mail: repoBirthdaySale({ name: await nameOf(db, email), email }, made.course, made.offer), headers };
  }
  const title = resendTitle(subject);
  const { data: asset } = await db.from('digital_assets').select('id, title, price').eq('title', title || '').maybeSingle();
  if (!asset) return { skip: 'Không tìm thấy sản phẩm trong thư này.' };
  if (kind === 'free') {
    if (Number(asset.price) > 0) return { skip: 'Sản phẩm này không còn miễn phí.' };
    return { mail: freeDownloadEmail({ name: await nameOf(db, email), email, title: asset.title, url: freeEmailUrl(asset.id, email) }), headers };
  }
  // Paid product: the buyer's own successful order, so the link opens their download page
  const { data: user } = await db.from('users').select('id').eq('email', email).maybeSingle();
  const { data: orders } = await db.from('payments').select('order_id, access_token, buyer_name, buyer_email, user_id, created_at')
    .eq('asset_id', asset.id).eq('status', 'success').order('created_at', { ascending: false }).limit(50);
  const order = (orders || []).find((o) => low(o.buyer_email) === email || (user && o.user_id === user.id));
  if (!order) return { skip: 'Không tìm thấy đơn đã thanh toán của người này.' };
  const link = `${SITE}/payment/bank/${order.order_id}?t=${order.access_token}`;
  return { mail: assetPurchased({ name: order.buyer_name, title: asset.title, orderId: order.order_id, link }) };
}

/** POST { action: 'resend', emailId }: sends one tracked email again. Each original goes out again at most once. */
async function resendTracked(db: SupabaseClient, resend: Resend, emailId: string) {
  const { data: row } = await db.from('email_status').select('email_id, to_email, subject').eq('email_id', emailId).maybeSingle();
  if (!row) return { error: 'Không tìm thấy thư này.' };
  const email = low(row.to_email);
  const built = await rebuildTracked(db, email, row.subject);
  if ('skip' in built) return { error: built.skip };
  const ref = `resend:${emailId}`;
  const { error: claim } = await db.from('email_log').insert({ email, kind: 'retry', ref });
  if (claim) return { error: claim.code === '23505' ? 'Thư này đã được gửi lại rồi.' : claim.message };
  const { data, error } = await resend.emails.send({ from: FROM, to: email, ...(built.headers ? { headers: built.headers } : {}), ...built.mail });
  if (error) {
    await db.from('email_log').delete().match({ email, kind: 'retry', ref });
    return { error: `Resend báo lỗi: ${error.message}` };
  }
  return { ok: true, to: email, id: data?.id };
}

const TRACKED_COLUMNS = 'email_id, to_email, subject, status, reason, sent_at, delivered_at, opened_at, clicked_at';

/** Ids of tracked emails already sent again from this page. */
async function resentIds(db: SupabaseClient) {
  const { data } = await db.from('email_log').select('ref').eq('kind', 'retry').like('ref', 'resend:%').limit(5000);
  return (data || []).map((r) => r.ref.slice('resend:'.length));
}

/** GET ?q=: every email and order matching an address, part of one, a subject or an order code, across all history. */
async function searchEmails(db: SupabaseClient, raw: string) {
  const term = raw.trim().toLowerCase().replace(/[,()"%*\\]/g, '').slice(0, 80);
  if (term.length < 2) return NextResponse.json({ error: 'Nhập ít nhất 2 ký tự.' }, { status: 400 });
  const like = `"%${term}%"`;
  const { data: users } = await db.from('users').select('id, email').ilike('email', `%${term}%`).limit(50);
  const userIds = (users || []).map((u) => u.id);
  const [byText, byUser] = await Promise.all([
    db.from('payments').select('order_id, status, amount, buyer_email, buyer_name, user_id, course_id, asset_id, membership_plan, created_at')
      .or(`order_id.ilike.${like},buyer_email.ilike.${like}`).order('created_at', { ascending: false }).limit(50),
    userIds.length
      ? db.from('payments').select('order_id, status, amount, buyer_email, buyer_name, user_id, course_id, asset_id, membership_plan, created_at').in('user_id', userIds).order('created_at', { ascending: false }).limit(50)
      : Promise.resolve({ data: [] as never[] }),
  ]);
  const orderRows = new Map<string, NonNullable<typeof byText.data>[number]>();
  for (const o of [...(byText.data || []), ...(byUser.data || [])]) orderRows.set(o.order_id, o);

  const { data: owners } = await db.from('users').select('id, email').in('id', [...new Set([...orderRows.values()].map((o) => o.user_id).filter(Boolean))]);
  const ownerEmail = new Map((owners || []).map((u) => [u.id, low(u.email)]));
  const [{ data: courses }, { data: assets }] = await Promise.all([
    db.from('courses').select('id, title'),
    db.from('digital_assets').select('id, title'),
  ]);
  const titles = new Map([...(courses || []), ...(assets || [])].map((c) => [c.id, c.title as string]));
  const orders = [...orderRows.values()].sort((a, b) => b.created_at.localeCompare(a.created_at)).map((o) => ({
    orderId: o.order_id, status: o.status, amount: Number(o.amount), createdAt: o.created_at,
    email: low(o.buyer_email) || ownerEmail.get(o.user_id) || null, name: o.buyer_name,
    product: titles.get(o.course_id || o.asset_id) || (o.membership_plan ? `Hội viên ${o.membership_plan}` : '—'),
  }));

  // Emails of the matched orders count too, so searching an order code shows what its buyer was sent
  const orderEmails = [...new Set(orders.map((o) => o.email).filter((e): e is string => !!e))];
  const [byAddress, byOrderEmail, log] = await Promise.all([
    db.from('email_status').select(TRACKED_COLUMNS).or(`to_email.ilike.${like},subject.ilike.${like}`).order('sent_at', { ascending: false }).limit(300),
    orderEmails.length ? db.from('email_status').select(TRACKED_COLUMNS).in('to_email', orderEmails).order('sent_at', { ascending: false }).limit(300) : Promise.resolve({ data: [] as never[] }),
    db.from('email_log').select('email, kind, ref, sent_at').or(`email.ilike.${like}${orderEmails.length ? `,email.in.(${orderEmails.map((e) => `"${e}"`).join(',')})` : ''}`).order('sent_at', { ascending: false }).limit(300),
  ]);
  const tracked = new Map<string, NonNullable<typeof byAddress.data>[number]>();
  for (const t of [...(byAddress.data || []), ...(byOrderEmail.data || [])]) tracked.set(t.email_id, t);

  return NextResponse.json({
    search: {
      term,
      orders,
      tracked: [...tracked.values()].sort((a, b) => b.sent_at.localeCompare(a.sent_at)),
      log: (log.data || []).map((l) => ({
        email: l.email, kind: l.kind, sentAt: l.sent_at,
        label: l.kind === 'campaign' ? (l.ref === CAMPAIGN.ref ? CAMPAIGN.label : l.ref === REMARKETING.ref ? REMARKETING.label : l.ref) : l.kind === 'retry' && l.ref.startsWith('resend:') ? 'Gửi lại từ trang này' : KIND_LABELS[l.kind] || l.kind,
      })),
      resent: await resentIds(db),
    },
  });
}

/** GET: who has been sent what, plus the campaign with each student's status. With ?q= it searches instead. */
export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { db } = auth;
  const q = new URL(req.url).searchParams.get('q');
  if (q !== null) return searchEmails(db, q);

  const [{ data: log, count, error }, { data: optouts }, { data: users }, { data: leads }, { data: allCourses }, courses, audience] = await Promise.all([
    db.from('email_log').select('email, kind, ref, sent_at', { count: 'exact' }).order('sent_at', { ascending: false }).limit(1000),
    db.from('email_optouts').select('email'),
    db.from('users').select('email, full_name'),
    db.from('leads').select('email, name'),
    db.from('courses').select('id, title'),
    campaignCourses(db),
    campaignAudience(db),
  ]);
  const [remarketing, remarketingPeople, tracked] = await Promise.all([
    remarketingMail(db),
    remarketingAudience(db),
    db.from('email_status').select(TRACKED_COLUMNS).order('sent_at', { ascending: false }).limit(1000),
  ]);
  const resent = await resentIds(db);
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
    tracking: { ready: !tracked.error, webhook: !!process.env.RESEND_WEBHOOK_SECRET, rows: tracked.data || [], resent },
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

/** POST { action: 'retry', batch, items: [{ email, type }] } rebuilds and resends failed emails. Each (email, batch) goes out once, so a repeat is harmless. */
async function retryFailed(db: SupabaseClient, resend: Resend, batch: string, items: { email: string; type: RetryType }[]) {
  const { data: optouts } = await db.from('email_optouts').select('email');
  const blocked = new Set((optouts || []).map((o) => o.email));
  const started = Date.now();
  const results: { email: string; type: RetryType; status: string; id?: string }[] = [];
  for (const { email: raw, type } of items) {
    const email = String(raw || '').trim().toLowerCase();
    const note = (status: string, id?: string) => results.push({ email, type, status, id });
    if (Date.now() - started > 50_000) { note('chưa chạy tới'); continue; }
    if (!['student', 'free', 'remarketing'].includes(type)) { note('sai loại'); continue; }
    if (type !== 'student' && blocked.has(email)) { note('bỏ qua: đã ngừng nhận'); continue; }
    const built = await retryMail(db, type, email);
    if ('skip' in built) { note(`bỏ qua: ${built.skip}`); continue; }
    const ref = `${batch}:${type}`;
    const { error: claim } = await db.from('email_log').insert({ email, kind: 'retry', ref });
    if (claim) { note(claim.code === '23505' ? 'bỏ qua: đã gửi lại trước đó' : `lỗi: ${claim.message}`); continue; }
    const { data, error } = await resend.emails.send({ from: FROM, to: email, ...(built.headers ? { headers: built.headers } : {}), ...built.mail });
    if (error) {
      await db.from('email_log').delete().match({ email, kind: 'retry', ref });
      note(`lỗi: ${error.message}`);
    } else {
      note('đã gửi', data?.id);
    }
    await sleep(600);
  }
  return results;
}

/**
 * POST { action: 'repo-sale', total, exclude?, dryRun?, onlyOpened? }: sends until `total` people have had the offer, picked at random.
 * onlyOpened limits it to people who opened a tracked email, onlyClicked to people who clicked the file link in the
 * 75-repo email. With both, either signal counts.
 * Skips anyone opted out, already a customer, previously undeliverable, or failing checkEmail. A repeat call only tops up to `total`.
 */
/** The featured course and the birthday code's real price, or why the code would not work at checkout. */
async function repoSaleOffer(db: SupabaseClient) {
  const course = await getFeaturedCourse(db);
  if (!course) return { error: 'Không tìm thấy khóa học chính.' };
  const { data: row } = await db.from('courses').select('price').eq('id', course.id).maybeSingle();
  const price = Number(row?.price) || 0;
  const promo = await checkPromo(db, REPO_SALE.code, { courseId: course.id, price });
  if (!promo.ok || !price) return { error: `Mã ${REPO_SALE.code} chưa dùng được cho khóa này.` };
  return { course, offer: { code: promo.code, price, discount: promo.discount, until: REPO_SALE.until } };
}

async function repoSale(db: SupabaseClient, resend: Resend, total: number, exclude: string[], dryRun: boolean, onlyOpened: boolean, onlyClicked: boolean) {
  const made = await repoSaleOffer(db);
  if ('error' in made) return { error: made.error };
  const { course, offer } = made;

  const { data: asset } = await db.from('digital_assets').select('id').ilike('title', REPO_SALE.asset).maybeSingle();
  if (!asset) return { error: 'Không tìm thấy sản phẩm 75 repo.' };
  const [{ data: downloads }, { data: optouts }, { data: bad }, { data: users }, { data: enrollments }, { data: paid }, { data: leads }, { count: already }] = await Promise.all([
    db.from('asset_downloads').select('email').eq('asset_id', asset.id).eq('kind', 'free').limit(5000),
    db.from('email_optouts').select('email'),
    db.from('email_status').select('to_email').in('status', ['bounced', 'failed', 'complained', 'suppressed']),
    db.from('users').select('id, email'),
    db.from('enrollments').select('user_id'),
    db.from('payments').select('user_id, buyer_email').eq('status', 'success'),
    db.from('leads').select('email, name'),
    db.from('email_log').select('email', { count: 'exact', head: true }).eq('kind', 'campaign').eq('ref', REPO_SALE.ref),
  ]);
  const low = (e?: string | null) => (e || '').trim().toLowerCase();
  const blocked = new Set([...exclude.map(low), ...(optouts || []).map((o) => low(o.email)), ...(bad || []).map((b) => low(b.to_email))]);
  const buyerIds = new Set([...(enrollments || []).map((e) => e.user_id), ...(paid || []).map((b) => b.user_id)]);
  for (const b of paid || []) blocked.add(low(b.buyer_email));
  for (const u of users || []) if (buyerIds.has(u.id)) blocked.add(low(u.email));
  const names = new Map((leads || []).map((l) => [low(l.email), l.name as string | null]));
  const pool = [...new Set((downloads || []).map((d) => low(d.email)))].filter((e) => e && !blocked.has(e) && !isAdmin(e)).sort(() => Math.random() - 0.5);

  let targets = pool;
  if (onlyOpened || onlyClicked) {
    const keep = new Set<string>();
    if (onlyOpened) {
      const { data: opens } = await db.from('email_status').select('to_email').not('opened_at', 'is', null).limit(5000);
      for (const o of opens || []) keep.add(low(o.to_email));
    }
    if (onlyClicked) {
      const { data: clicks } = await db.from('asset_downloads').select('email').eq('asset_id', asset.id).eq('kind', 'free-email').limit(5000);
      for (const c of clicks || []) keep.add(low(c.email));
    }
    targets = pool.filter((e) => keep.has(e));
  }

  const started = Date.now();
  let need = Math.max(total - (already || 0), 0);
  const result = { pool: targets.length, already: already || 0, sent: 0, wouldSend: 0, rejected: 0, duplicates: 0, failed: 0, timedOut: false };
  for (const email of targets) {
    if (need <= 0) break;
    if (Date.now() - started > 50_000) { result.timedOut = true; break; }
    if (!(await checkEmail(email)).ok) { result.rejected++; continue; }
    if (dryRun) { result.wouldSend++; need--; continue; }
    const { error: claim } = await db.from('email_log').insert({ email, kind: 'campaign', ref: REPO_SALE.ref });
    if (claim) { if (claim.code === '23505') result.duplicates++; else result.failed++; continue; }
    const { error } = await resend.emails.send({ from: FROM, to: email, headers: unsubscribeHeaders(email), ...repoBirthdaySale({ name: names.get(email), email }, course, offer) });
    if (error) {
      console.error(`Campaign ${REPO_SALE.ref} to ${email} failed`, error);
      await db.from('email_log').delete().match({ email, kind: 'campaign', ref: REPO_SALE.ref });
      result.failed++;
      continue;
    }
    result.sent++;
    need--;
    await sleep(600); // Resend allows ~2 requests/second
  }
  return result;
}

/** The skill's live price, so the email never says something the product page does not. */
async function tokenOffer(db: SupabaseClient) {
  const { data: asset } = await db.from('digital_assets').select('id, price, old_price, sale_ends_on').eq('id', TOKEN_SALE.productId).maybeSingle();
  if (!asset) return { error: 'Không tìm thấy skill Tiết Kiệm Token.' };
  const priced = assetPricing(asset);
  if (!priced.oldPrice || !priced.endsOn) return { error: 'Skill Tiết Kiệm Token không còn trong đợt giảm giá.' };
  const until = `${priced.endsOn.slice(8, 10)}/${priced.endsOn.slice(5, 7)}/${priced.endsOn.slice(0, 4)}`;
  return { offer: { price: priced.price, after: priced.oldPrice, until, url: `${SITE}/shop/${asset.id}` } };
}

/**
 * POST { action: 'token-sale', group: 'opened' | 'all', test?, dryRun? }
 * Sends the skill offer to people who took the 75-repo list and have not had it. 'opened' keeps those who opened
 * a tracked email or clicked the file link. Skips opt-outs, undeliverable addresses and people who bought the skill.
 * Stops before the 60s limit; calling again continues.
 */
async function tokenSale(db: SupabaseClient, resend: Resend, adminEmail: string, group: string, test: boolean, dryRun: boolean) {
  const made = await tokenOffer(db);
  if ('error' in made) return { error: made.error };
  const { offer } = made;
  if (test) {
    const mail = tokenSkillOffer({ name: null, email: adminEmail }, offer);
    const { error } = await resend.emails.send({ from: FROM, to: adminEmail, subject: `[Gửi thử] ${mail.subject}`, html: mail.html });
    return error ? { error: error.message } : { test: adminEmail };
  }
  const { data: asset } = await db.from('digital_assets').select('id').ilike('title', REPO_SALE.asset).maybeSingle();
  if (!asset) return { error: 'Không tìm thấy sản phẩm 75 repo.' };
  // Supabase returns at most 1000 rows per request, so read every page
  const many = async <T,>(page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>) => {
    const out: T[] = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await page(from, from + 999);
      if (error) throw new Error(error.message);
      out.push(...(data || []));
      if (!data || data.length < 1000) return out;
    }
  };
  const [downloads, optouts, bad, buyers, users, leads, sent, opens] = await Promise.all([
    many((f, t) => db.from('asset_downloads').select('email, kind').eq('asset_id', asset.id).order('id').range(f, t)),
    many((f, t) => db.from('email_optouts').select('email').range(f, t)),
    many((f, t) => db.from('email_status').select('to_email').in('status', ['bounced', 'failed', 'complained', 'suppressed']).order('email_id').range(f, t)),
    many((f, t) => db.from('payments').select('buyer_email, user_id').eq('asset_id', TOKEN_SALE.productId).eq('status', 'success').range(f, t)),
    many((f, t) => db.from('users').select('id, email, full_name').order('id').range(f, t)),
    many((f, t) => db.from('leads').select('email, name').order('email').range(f, t)),
    many((f, t) => db.from('email_log').select('email').eq('kind', 'campaign').eq('ref', TOKEN_SALE.ref).order('email').range(f, t)),
    group === 'opened' ? many((f, t) => db.from('email_status').select('to_email').not('opened_at', 'is', null).order('email_id').range(f, t)) : Promise.resolve([] as { to_email: string }[]),
  ]);
  const buyerIds = new Set(buyers.map((b) => b.user_id));
  const blocked = new Set([
    ...optouts.map((o) => low(o.email)), ...bad.map((b) => low(b.to_email)), ...buyers.map((b) => low(b.buyer_email)),
    ...users.filter((u) => buyerIds.has(u.id)).map((u) => low(u.email)), ...sent.map((s) => low(s.email)),
  ]);
  const names = new Map<string, string | null>(leads.map((l) => [low(l.email), l.name]));
  for (const u of users) if (u.full_name) names.set(low(u.email), u.full_name);
  const engaged = new Set([...opens.map((o) => low(o.to_email)), ...downloads.filter((d) => d.kind === 'free-email').map((d) => low(d.email))]);
  const pool = [...new Set(downloads.filter((d) => d.kind === 'free').map((d) => low(d.email)))]
    .filter((e) => e && !blocked.has(e) && !isAdmin(e) && (group !== 'opened' || engaged.has(e)));

  const result = { pool: pool.length, alreadySent: sent.length, sent: 0, rejected: 0, duplicates: 0, failed: 0, remaining: 0 };
  if (dryRun) return result;
  const started = Date.now();
  for (const email of pool) {
    if (Date.now() - started > 50_000) { result.remaining++; continue; }
    if (!(await checkEmail(email)).ok) { result.rejected++; continue; }
    const { error: claim } = await db.from('email_log').insert({ email, kind: 'campaign', ref: TOKEN_SALE.ref });
    if (claim) { if (claim.code === '23505') result.duplicates++; else result.failed++; continue; }
    const { error } = await resend.emails.send({ from: FROM, to: email, headers: unsubscribeHeaders(email), ...tokenSkillOffer({ name: names.get(email), email }, offer) });
    if (error) {
      console.error(`Campaign ${TOKEN_SALE.ref} to ${email} failed`, error);
      await db.from('email_log').delete().match({ email, kind: 'campaign', ref: TOKEN_SALE.ref });
      result.failed++;
      continue;
    }
    result.sent++;
    await sleep(550); // Resend allows ~2 requests/second
  }
  return result;
}

/** POST { action: 'test' } sends one copy to the admin, unlogged. POST { action: 'send' } sends to people who have not had it. { campaign: 'remarketing' } picks the discount email. */
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { db, adminEmail } = auth;
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: 'Thiếu RESEND_API_KEY.' }, { status: 500 });
  const resend = new Resend(process.env.RESEND_API_KEY);

  const body = await req.json().catch(() => ({}));
  const { action, campaign, batch, items, total, exclude, dryRun, onlyOpened, onlyClicked, emailId } = body;
  if (action === 'token-sale') {
    const { group, test } = body;
    if (group !== 'opened' && group !== 'all' && test !== true) return NextResponse.json({ error: 'Chọn nhóm opened hoặc all.' }, { status: 400 });
    const result = await tokenSale(db, resend, adminEmail, group, test === true, dryRun === true);
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({ ok: true, ...result });
  }
  if (action === 'resend') {
    if (typeof emailId !== 'string' || !emailId || emailId.length > 80) return NextResponse.json({ error: 'Thiếu mã thư.' }, { status: 400 });
    const result = await resendTracked(db, resend, emailId);
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json(result);
  }
  if (action === 'repo-sale') {
    if (!Number.isInteger(total) || total < 1 || total > 373) return NextResponse.json({ error: 'Số người gửi chưa đúng.' }, { status: 400 });
    const result = await repoSale(db, resend, total, Array.isArray(exclude) ? exclude.map(String) : [], dryRun === true, onlyOpened === true, onlyClicked === true);
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({ ok: true, ...result });
  }
  if (action === 'retry') {
    if (!/^[a-z0-9-]{1,40}$/.test(String(batch)) || !Array.isArray(items) || !items.length || items.length > 60) return NextResponse.json({ error: 'Thiếu batch hoặc danh sách gửi lại.' }, { status: 400 });
    return NextResponse.json({ ok: true, results: await retryFailed(db, resend, batch, items) });
  }
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
