import { createHmac } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

// Every email the site sends: one shared layout (logo, white card, button, signature, footer)
// and the copy for each message. Table layout + inline styles because email clients ignore <style>.

export const SITE = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.minhtanacademy.com';
export const FROM = 'TẤN VA <tanva@minhtanacademy.com>';
const LOGO = 'https://www.minhtanacademy.com/brand/tan-va-mark.png';

const C = { gold: '#A84E3C', ivory: '#F5F0E9', ink: '#242321', text: '#3F3A36', muted: '#78716C', line: '#E7E0D6' };
const FONT = "'Be Vietnam Pro', Arial, Helvetica, sans-serif";

export const esc = (v: string) => v.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** "Nguyễn Văn An" → "An"; Vietnamese people are greeted by the given name, which comes last. */
export const firstName = (full?: string | null) => (full || '').trim().split(/\s+/).pop() || 'bạn';

// ---------------------------------------------------------------- building blocks

const p = (html: string) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:${C.text};">${html}</p>`;

const h1 = (text: string) => `<h1 style="margin:0 0 16px;font-family:${FONT};font-size:26px;line-height:1.3;font-weight:800;color:${C.ink};">${text}</h1>`;

const eyebrow = (text: string) => `<p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${C.gold};">${text}</p>`;

const button = (href: string, label: string) => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;">
    <tr><td style="border-radius:12px;background:${C.gold};">
      <a href="${href}" style="display:inline-block;padding:15px 30px;font-family:${FONT};font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;">${label} &rarr;</a>
    </td></tr>
  </table>`;

/** Numbered steps: [title, text] pairs. */
const steps = (items: [string, string][]) => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:4px 0 20px;">
    ${items.map(([title, text], i) => `
    <tr>
      <td width="40" valign="top" style="padding:0 0 16px;">
        <div style="width:30px;height:30px;line-height:30px;border-radius:15px;background:${C.ivory};color:${C.gold};font-weight:800;font-size:14px;text-align:center;">${i + 1}</div>
      </td>
      <td valign="top" style="padding:3px 0 16px;font-size:15px;line-height:1.6;color:${C.text};">
        <strong style="color:${C.ink};">${title}</strong>${text ? `<br>${text}` : ''}
      </td>
    </tr>`).join('')}
  </table>`;

/** Highlighted box (ivory) for perks, tips, a code. */
const box = (html: string) => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:4px 0 24px;">
    <tr><td style="background:${C.ivory};border-radius:14px;padding:18px 20px;font-size:15px;line-height:1.65;color:${C.text};">${html}</td></tr>
  </table>`;

/** Progress bar for "x/y bài". */
const progress = (done: number, total: number) => {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 8px;">
    <tr><td style="background:${C.line};border-radius:6px;height:10px;font-size:0;line-height:0;">
      <div style="width:${Math.max(pct, 3)}%;background:${C.gold};height:10px;border-radius:6px;"></div>
    </td></tr>
  </table>
  <p style="margin:0 0 20px;font-size:14px;color:${C.muted};"><strong style="color:${C.ink};">${done}/${total} bài</strong> · ${pct}% khóa học</p>`;
};

const signature = `
  <p style="margin:28px 0 0;font-size:16px;line-height:1.6;color:${C.text};">Hẹn gặp bạn trong bài học,<br>
  <strong style="color:${C.ink};">Minh Tấn</strong><br>
  <span style="font-size:13px;color:${C.muted};">Người sáng lập TẤN VA</span></p>`;

/** Signed one-click unsubscribe link (reminders and marketing only). */
export function unsubscribeUrl(email: string) {
  const t = createHmac('sha256', process.env.CRON_SECRET || 'tanva').update(email.toLowerCase()).digest('hex').slice(0, 24);
  return `${SITE}/api/unsubscribe?e=${encodeURIComponent(email.toLowerCase())}&t=${t}`;
}

/** Headers that make Gmail/Outlook show their own "Unsubscribe" button. */
export const unsubscribeHeaders = (email: string) => ({
  'List-Unsubscribe': `<${unsubscribeUrl(email)}>`,
  'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
});

function layout(o: { preheader: string; body: string; unsubscribeFor?: string }) {
  const footerWhy = o.unsubscribeFor
    ? `Bạn nhận email này vì đã đăng ký tại minhtanacademy.com. <a href="${unsubscribeUrl(o.unsubscribeFor)}" style="color:${C.muted};text-decoration:underline;">Ngừng nhận email nhắc học</a>.`
    : 'Email này gửi tự động khi bạn đăng ký hoặc thanh toán tại minhtanacademy.com.';
  return `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>TẤN VA</title></head>
<body style="margin:0;padding:0;background:${C.ivory};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.ivory};">${o.preheader}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${C.ivory};">
    <tr><td align="center" style="padding:28px 12px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;font-family:${FONT};">
        <tr><td style="padding:0 8px 20px;">
          <a href="${SITE}" style="text-decoration:none;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="vertical-align:middle;padding-right:12px;"><img src="${LOGO}" alt="TẤN VA" width="44" height="40" style="display:block;border:0;"></td>
            <td style="vertical-align:middle;">
              <div style="font-size:22px;font-weight:800;line-height:1.1;"><span style="color:${C.ink};">TẤN</span> <span style="color:${C.gold};">VA</span></div>
            </td>
          </tr></table>
          </a>
        </td></tr>
        <tr><td style="background:#ffffff;border-radius:20px;padding:36px 32px;border:1px solid ${C.line};">
          ${o.body}
        </td></tr>
        <tr><td style="padding:24px 16px 8px;text-align:center;font-size:12px;line-height:1.7;color:${C.muted};">
          Cần hỗ trợ? Trả lời email này hoặc nhắn Zalo cho Minh Tấn.<br>
          ${footerWhy}<br>
          © ${new Date().getFullYear()} TẤN VA · <a href="${SITE}" style="color:${C.muted};">minhtanacademy.com</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

type Mail = { subject: string; html: string };

/** The course promoted to people who have not bought yet: title, free lessons and parts come from the database. */
export type FeaturedCourse = { id: string; title: string; freeLessons: string[]; chapters: string[]; lessonCount: number };

export async function getFeaturedCourse(db: SupabaseClient): Promise<FeaturedCourse | null> {
  const { data: lessons } = await db.from('lesson_outline').select('course_id, title, is_free, order_index').order('order_index');
  const counts = new Map<string, number>();
  for (const l of lessons || []) counts.set(l.course_id, (counts.get(l.course_id) || 0) + 1);
  const id = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  if (!id) return null;
  const [{ data: course }, { data: chapters }] = await Promise.all([
    db.from('courses').select('title').eq('id', id).single(),
    db.from('chapters').select('title, order_index').eq('course_id', id).order('order_index'),
  ]);
  if (!course) return null;
  return {
    id, title: course.title, lessonCount: counts.get(id) || 0,
    freeLessons: (lessons || []).filter((l) => l.course_id === id && l.is_free).map((l) => l.title),
    chapters: (chapters || []).map((c) => c.title.replace(/^Phần\s*\d+\s*:\s*/i, '')),
  };
}

const courseUrl = (c: FeaturedCourse) => `${SITE}/courses/${c.id}`;
/** The free lessons as a short list. */
const freeList = (c: FeaturedCourse) => c.freeLessons
  .map((t) => `<p style="margin:0 0 6px;font-size:15px;line-height:1.6;color:${C.text};">▶&nbsp; ${esc(t)}</p>`).join('');
type Contact = { zaloHref: string; zaloGroupHref: string };
const lessonLink = (courseId: string, lessonId?: string | null) => `${SITE}/learn/${courseId}${lessonId ? `/${lessonId}` : ''}`;

// ---------------------------------------------------------------- transactional

/** Day 0 of the onboarding sequence: sent the moment a course is unlocked. */
/** setPasswordUrl: the account was created by an admin (Admin > Học viên > Cấp quyền), so the student sets a password first. */
export function welcomeCourse(d: { name?: string | null; email: string; courseTitle: string; courseId: string; contact: Contact; setPasswordUrl?: string }): Mail {
  const course = esc(d.courseTitle);
  return {
    subject: `Chào mừng ${firstName(d.name)}! Khóa ${d.courseTitle} đã mở`,
    html: layout({
      preheader: '3 bước để bắt đầu ngay hôm nay, và quà tặng dành cho học viên website.',
      body: `
        ${eyebrow('Kích hoạt thành công')}
        ${h1(`Chào mừng ${esc(firstName(d.name))} vào lớp!`)}
        ${p(`Khóa <strong>${course}</strong> đã mở cho tài khoản <strong>${esc(d.email)}</strong>. Bạn học được trên cả điện thoại lẫn máy tính.`)}
        ${d.setPasswordUrl ? `${box(`<strong style="color:${C.ink};">Tài khoản đã được tạo sẵn cho bạn</strong><br>Bấm nút bên dưới để đặt mật khẩu, sau đó đăng nhập bằng email <strong>${esc(d.email)}</strong>. Link dùng được một lần; nếu hết hạn, bấm “Quên mật khẩu” ở <a href="${SITE}/auth" style="color:${C.gold};">trang đăng nhập</a> để nhận link mới.`)}
        ${button(d.setPasswordUrl, 'Đặt mật khẩu')}` : ''}
        ${p('Để không bị “mua rồi để đó”, bạn làm 3 việc nhỏ này ngay hôm nay:')}
        ${steps([
          ['Xem bài đầu tiên ngay bây giờ', 'Mỗi bài chỉ vài phút. Chỉ cần bắt đầu, phần khó nhất là bài đầu tiên.'],
          ['Vào nhóm Zalo học viên', `Nơi bạn nộp bài, hỏi bài và được sửa. <a href="${d.contact.zaloGroupHref}" style="color:${C.gold};font-weight:700;">Vào nhóm tại đây</a>.`],
          ['Mỗi ngày 1 bài, cùng một khung giờ', 'Học đều mỗi ngày hiệu quả hơn học dồn. Xem xong bấm “Hoàn thành” để theo dõi tiến độ.'],
        ])}
        ${button(lessonLink(d.courseId), 'Vào học bài đầu tiên')}
        ${box(`<strong style="color:${C.ink};">Quà dành cho học viên đăng ký trên website</strong><br>
          • 1 buổi Audit 1 tiếng 1-1 với Minh Tấn khi bạn học xong khóa: xem lại toàn bộ video bạn làm và định hướng tiếp theo.<br>
          • Bài học mới cập nhật sau này: học miễn phí.<br>
          • Chứng chỉ hoàn thành khi bạn học xong toàn bộ bài.`)}
        ${p(`Quên mật khẩu? Bấm “Quên mật khẩu” ở <a href="${SITE}/auth" style="color:${C.gold};">trang đăng nhập</a> để đặt lại.`)}
        ${signature}`,
    }),
  };
}

export function assetPurchased(d: { name?: string | null; title: string; orderId: string; link: string }): Mail {
  return {
    subject: `Đã thanh toán: ${d.title}`,
    html: layout({
      preheader: 'Link tải của bạn ở bên trong. Giữ email này để tải lại khi cần.',
      body: `
        ${eyebrow('Thanh toán thành công')}
        ${h1(`Cảm ơn ${esc(firstName(d.name))}!`)}
        ${p(`TẤN VA đã nhận thanh toán cho <strong>${esc(d.title)}</strong> (mã đơn <strong>${esc(d.orderId)}</strong>).`)}
        ${button(d.link, 'Tải về ngay')}
        ${box('Giữ email này: bấm lại nút ở trên bất cứ lúc nào để tải lại.')}
        ${signature}`,
    }),
  };
}

export function checklistEmail(d: { name?: string | null; title: string; groups: { group: string; items: string[] }[]; email: string; course: FeaturedCourse | null }): Mail {
  const list = d.groups.map((g) => `
    <p style="margin:20px 0 8px;font-size:15px;font-weight:800;color:${C.gold};">${esc(g.group)}</p>
    ${g.items.map((i) => `<p style="margin:0 0 6px;font-size:15px;line-height:1.6;color:${C.text};">☐&nbsp; ${esc(i)}</p>`).join('')}`).join('');
  return {
    subject: `Quà của bạn: ${d.title}`,
    html: layout({
      preheader: 'Checklist Minh Tấn dùng trước mỗi lần bấm quay. Lưu lại để dùng mỗi ngày.',
      unsubscribeFor: d.email,
      body: `
        ${eyebrow('Quà tặng miễn phí')}
        ${h1(esc(d.title))}
        ${p(`Chào ${esc(firstName(d.name))}, đây là checklist Minh Tấn kiểm tra trước mỗi lần quay. Lưu email này, mở ra trước khi bấm quay và đánh dấu từng mục nhé.`)}
        ${list}
        <div style="height:24px;"></div>
        ${d.course ? `${box(`<strong style="color:${C.ink};">Muốn học bài bản từ đầu?</strong><br>Khóa <strong>${esc(d.course.title)}</strong> có ${d.course.freeLessons.length} bài học thử miễn phí, xem ngay không cần thanh toán.`)}
        ${button(courseUrl(d.course), 'Học thử miễn phí')}` : ''}
        ${signature}`,
    }),
  };
}

// ---------------------------------------------------------------- student sequence (cron)

type Student = { name?: string | null; email: string; courseTitle: string; courseId: string; done: number; total: number; nextLessonId?: string | null; nextLessonTitle?: string | null };

const nextUp = (s: Student) => s.nextLessonTitle ? box(`<span style="font-size:13px;color:${C.muted};">Bài tiếp theo của bạn</span><br><strong style="color:${C.ink};font-size:16px;">${esc(s.nextLessonTitle)}</strong>`) : '';

/** Day 2: build the habit. */
export function onboardDay2(s: Student): Mail {
  return {
    subject: `${firstName(s.name)} ơi, hôm nay học bài tiếp theo nhé`,
    html: layout({
      preheader: 'Cách học để thật sự xong khóa, không bỏ ngang giữa chừng.',
      unsubscribeFor: s.email,
      body: `
        ${eyebrow('Ngày 2 · Tạo thói quen')}
        ${h1('Bí quyết để học xong khóa: mỗi ngày 1 bài')}
        ${p(`Chào ${esc(firstName(s.name))}, phần lớn người bỏ ngang khóa học không phải vì khó, mà vì đợi “có thời gian rảnh” mới học. Cách Minh Tấn khuyên học viên:`)}
        ${steps([
          ['Mỗi ngày một bài', 'Mỗi bài chỉ vài phút. Xem xong bấm “Hoàn thành” để thấy mình tiến lên từng ngày.'],
          ['Quay ngay bằng điện thoại', 'Học xong thử liền 1 clip ngắn. Làm rồi mới nhớ lâu.'],
          ['Chưa đẹp cũng nộp', 'Clip đầu tiên ai cũng vụng. Nộp vào nhóm Zalo để được góp ý sớm.'],
        ])}
        ${progress(s.done, s.total)}
        ${nextUp(s)}
        ${button(lessonLink(s.courseId, s.nextLessonId), s.done ? 'Học bài tiếp theo' : 'Bắt đầu bài đầu tiên')}
        ${signature}`,
    }),
  };
}

/** Day 5: first homework + the free audit. */
export function onboardDay5(s: Student, contact: Contact): Mail {
  return {
    subject: 'Nộp clip đầu tiên và nhận góp ý từ Minh Tấn',
    html: layout({
      preheader: 'Nộp clip đầu tiên vào nhóm Zalo để được góp ý sớm.',
      unsubscribeFor: s.email,
      body: `
        ${eyebrow('Ngày 5 · Thực hành')}
        ${h1('Đến lúc quay clip đầu tiên rồi')}
        ${p(`Chào ${esc(firstName(s.name))}, học video thì phải quay. Clip đầu tiên không cần đẹp, chỉ cần có để Minh Tấn chỉ ra chỗ cần sửa.`)}
        ${steps([
          ['Quay 1 clip 30–60 giây', 'Áp dụng điều bạn vừa học: ánh sáng, khung hình hoặc cách nói.'],
          ['Đăng vào nhóm Zalo học viên', `Ghi rõ bài số mấy để được góp ý đúng chỗ. <a href="${contact.zaloGroupHref}" style="color:${C.gold};font-weight:700;">Mở nhóm Zalo</a>.`],
          ['Học xong khóa, nhận buổi Audit 1 tiếng', 'Quà của học viên website: khi hoàn thành toàn bộ bài, Minh Tấn xem lại video của bạn trong 1 tiếng 1-1.'],
        ])}
        ${progress(s.done, s.total)}
        ${button(lessonLink(s.courseId, s.nextLessonId), 'Tiếp tục học')}
        ${signature}`,
    }),
  };
}

/** Day 10: progress report. */
export function onboardDay10(s: Student): Mail {
  const half = s.total && s.done / s.total >= 0.5;
  return {
    subject: s.done ? `Bạn đã học ${s.done}/${s.total} bài khóa ${s.courseTitle}` : `${firstName(s.name)} ơi, khóa ${s.courseTitle} vẫn chờ bạn bắt đầu`,
    html: layout({
      preheader: half ? 'Đã qua nửa chặng đường, giữ nhịp này nhé.' : 'Xem bạn đang ở đâu và bài tiếp theo là gì.',
      unsubscribeFor: s.email,
      body: `
        ${eyebrow('Ngày 10 · Tiến độ của bạn')}
        ${h1(half ? 'Bạn đã đi được hơn nửa chặng đường!' : 'Nhìn lại 10 ngày đầu')}
        ${p(half
          ? `Chào ${esc(firstName(s.name))}, bạn học đều hơn phần lớn học viên. Giữ nhịp này, vài tuần nữa là nhận chứng chỉ.`
          : `Chào ${esc(firstName(s.name))}, chưa nhanh cũng không sao. Quan trọng là quay lại. Hôm nay chỉ cần thêm 1 bài.`)}
        ${progress(s.done, s.total)}
        ${nextUp(s)}
        ${button(lessonLink(s.courseId, s.nextLessonId), 'Học bài tiếp theo')}
        ${signature}`,
    }),
  };
}

/** No activity for a while (repeats at most every 14 days, max 3 times). */
export function inactiveStudent(s: Student): Mail {
  return {
    subject: `${firstName(s.name)} ơi, bài học vẫn đang đợi bạn`,
    html: layout({
      preheader: s.nextLessonTitle ? `Bài tiếp theo: ${s.nextLessonTitle}` : 'Quay lại học 1 bài thôi là đủ.',
      unsubscribeFor: s.email,
      body: `
        ${eyebrow('Nhắc học')}
        ${h1('Mình quay lại học tiếp nhé?')}
        ${p(`Chào ${esc(firstName(s.name))}, mấy hôm nay bạn chưa vào học khóa <strong>${esc(s.courseTitle)}</strong>. Bận là chuyện bình thường. Bạn không cần học bù, chỉ cần học tiếp 1 bài hôm nay, mỗi bài chỉ vài phút.`)}
        ${progress(s.done, s.total)}
        ${nextUp(s)}
        ${button(lessonLink(s.courseId, s.nextLessonId), 'Học tiếp bài của tôi')}
        ${p(`<span style="font-size:14px;color:${C.muted};">Đang vướng chỗ nào? Trả lời email này, Minh Tấn sẽ hỗ trợ.</span>`)}
        ${signature}`,
    }),
  };
}

export function courseCompleted(s: Student, contact: Contact): Mail {
  return {
    subject: `Chúc mừng ${firstName(s.name)}! Bạn đã học xong ${s.courseTitle}`,
    html: layout({
      preheader: 'Chứng chỉ hoàn thành của bạn đã sẵn sàng.',
      unsubscribeFor: s.email,
      body: `
        ${eyebrow('Hoàn thành khóa học')}
        ${h1('Bạn làm được rồi! 🎉')}
        ${p(`Chào ${esc(firstName(s.name))}, bạn đã hoàn thành toàn bộ ${s.total} bài của khóa <strong>${esc(s.courseTitle)}</strong>. Không phải ai mua khóa học cũng đi được đến cuối.`)}
        ${button(`${SITE}/certificate/${s.courseId}`, 'Nhận chứng chỉ')}
        ${box(`<strong style="color:${C.ink};">Quà hoàn thành: 1 buổi Audit 1 tiếng 1-1</strong><br>Minh Tấn sẽ xem lại các video bạn làm trong khóa và định hướng bước tiếp theo. <a href="${contact.zaloHref}" style="color:${C.gold};font-weight:700;">Nhắn Zalo để hẹn lịch</a>.`)}
        ${box(`<strong style="color:${C.ink};">Một việc nhỏ giúp Minh Tấn</strong><br>Gửi 1–2 câu cảm nhận, hoặc video bạn quay sau khóa học, qua <a href="${contact.zaloHref}" style="color:${C.gold};font-weight:700;">Zalo</a>. Câu chuyện của bạn giúp người sau tự tin bắt đầu.`)}
        ${p('Kỹ năng sẽ chắc hơn nếu bạn quay đều. Thử mỗi tuần 1 video và tiếp tục đăng vào nhóm học viên nhé.')}
        ${signature}`,
    }),
  };
}

export function accessExpiring(s: Student & { expiryDate: string }): Mail {
  return {
    subject: `Khóa ${s.courseTitle} sẽ hết hạn ngày ${s.expiryDate}`,
    html: layout({
      preheader: 'Còn 7 ngày, tranh thủ học nốt những bài còn lại.',
      unsubscribeFor: s.email,
      body: `
        ${eyebrow('Còn 7 ngày')}
        ${h1('Quyền học sắp hết hạn')}
        ${p(`Chào ${esc(firstName(s.name))}, quyền học khóa <strong>${esc(s.courseTitle)}</strong> của bạn hết hạn vào ngày <strong>${esc(s.expiryDate)}</strong>.`)}
        ${progress(s.done, s.total)}
        ${button(lessonLink(s.courseId, s.nextLessonId), 'Học nốt các bài còn lại')}
        ${p(`<span style="font-size:14px;color:${C.muted};">Muốn gia hạn? Trả lời email này để Minh Tấn hỗ trợ.</span>`)}
        ${signature}`,
    }),
  };
}

// ---------------------------------------------------------------- not yet a student (cron)


/** Signed up 1 day ago but no course yet. */
export function signupNudge(d: { name?: string | null; email: string }, c: FeaturedCourse): Mail {
  return {
    subject: `${c.freeLessons.length} bài học thử miễn phí đang chờ bạn`,
    html: layout({
      preheader: `Khóa ${c.title}: xem thử trước, thấy hợp rồi mới quyết định.`,
      unsubscribeFor: d.email,
      body: `
        ${eyebrow('Học thử miễn phí')}
        ${h1(`Chào ${esc(firstName(d.name))}, bạn đã xem bài học thử chưa?`)}
        ${p(`Cảm ơn bạn đã tạo tài khoản TẤN VA. Khóa <strong>${esc(c.title)}</strong> có ${c.freeLessons.length} bài học thử miễn phí để bạn xem cách Minh Tấn dạy trước khi quyết định:`)}
        ${freeList(c)}
        <div style="height:16px;"></div>
        ${button(courseUrl(c), 'Xem bài học thử')}
        ${signature}`,
    }),
  };
}

/** Checklist lead, day 2: value first. */
export function leadDay2(d: { name?: string | null; email: string }, c: FeaturedCourse): Mail {
  return {
    subject: '3 lỗi khiến video quay bằng điện thoại trông “nghiệp dư”',
    html: layout({
      preheader: 'Sửa được ngay hôm nay, không cần mua thêm thiết bị.',
      unsubscribeFor: d.email,
      body: `
        ${eyebrow('Mẹo quay video')}
        ${h1('3 lỗi nhỏ làm video trông nghiệp dư')}
        ${p(`Chào ${esc(firstName(d.name))}, hôm trước bạn đã nhận checklist. Đây là 3 lỗi Minh Tấn gặp nhiều nhất khi sửa video cho học viên:`)}
        ${steps([
          ['Đứng quay lưng về cửa sổ', 'Mặt bị tối. Hãy quay mặt về phía nguồn sáng.'],
          ['Đặt điện thoại thấp hơn mắt', 'Góc từ dưới lên làm mặt to và mất thiện cảm. Để camera ngang tầm mắt.'],
          ['Đứng xa điện thoại để nói', 'Tiếng bị vang, xa. Lại gần hơn hoặc dùng mic cài áo.'],
        ])}
        ${p(`Sửa 3 điều này thôi là video đã khác hẳn. Muốn học bài bản từ đầu, bạn xem thử miễn phí ${c.freeLessons.length} bài đầu của khóa <strong>${esc(c.title)}</strong>:`)}
        ${button(courseUrl(c), 'Học thử miễn phí')}
        ${signature}`,
    }),
  };
}

/** Checklist lead, day 6: the course itself. */
export function leadDay6(d: { name?: string | null; email: string }, c: FeaturedCourse): Mail {
  return {
    subject: `${firstName(d.name)} ơi, sẵn sàng biến video thành tài sản chưa?`,
    html: layout({
      preheader: `${c.title}: ${c.lessonCount} bài, nhóm Zalo sửa bài và Audit 1 tiếng sau khóa.`,
      unsubscribeFor: d.email,
      body: `
        ${eyebrow('Khóa học của Minh Tấn')}
        ${h1(esc(c.title))}
        ${p(`Chào ${esc(firstName(d.name))}, nếu bạn đã thử checklist và muốn đi xa hơn, khóa này dẫn bạn đi từng bước qua ${c.lessonCount} bài ngắn, mỗi ngày 1 bài:`)}
        ${c.chapters.length ? steps(c.chapters.map((t) => [esc(t), ''] as [string, string])) : ''}
        ${box(`<strong style="color:${C.ink};">Đăng ký trên website, bạn nhận thêm</strong><br>
          • Nhóm Zalo học viên: nộp bài và được sửa bài.<br>
          • 1 buổi Audit 1 tiếng 1-1 với Minh Tấn khi bạn học xong khóa.<br>
          • Bài học mới cập nhật sau này: miễn phí.<br>
          • Chứng chỉ hoàn thành khóa học.`)}
        ${button(courseUrl(c), `Học thử ${c.freeLessons.length} bài miễn phí`)}
        ${signature}`,
    }),
  };
}

// ---------------------------------------------------------------- consult / free Audit booking (/api/consult)

export type ConsultRequest = { kind: 'audit' | 'coaching' | 'course'; product?: string | null; format?: string | null; name: string; email: string; phone: string; message?: string | null };

const consultWhat = (r: ConsultRequest) =>
  r.kind === 'audit' ? (r.product?.startsWith('Audit 1 tiếng') ? 'buổi Audit 1 tiếng' : 'buổi Audit miễn phí 30 phút') : r.product ? esc(r.product) : 'tư vấn';

/** To the customer: we got it, Minh Tấn will reach out on Zalo. */
export function consultReceived(r: ConsultRequest, contact: Contact): Mail {
  const audit = r.kind === 'audit';
  return {
    subject: audit ? 'Đã nhận yêu cầu đặt lịch Audit của bạn' : 'TẤN VA đã nhận yêu cầu tư vấn của bạn',
    html: layout({
      preheader: 'Minh Tấn sẽ liên hệ qua Zalo trong vòng 24 giờ.',
      body: `
        ${eyebrow(audit ? 'Đặt lịch thành công' : 'Đã nhận yêu cầu')}
        ${h1(`Cảm ơn ${esc(firstName(r.name))}!`)}
        ${p(`TẤN VA đã nhận yêu cầu <strong>${consultWhat(r)}</strong> của bạn${r.format ? ` (hình thức <strong>${esc(r.format)}</strong>)` : ''}. Minh Tấn sẽ nhắn Zalo số <strong>${esc(r.phone)}</strong> trong vòng 24 giờ để ${audit ? 'chốt lịch' : 'tư vấn'}.`)}
        ${audit ? box(`<strong style="color:${C.ink};">Chuẩn bị trước buổi Audit</strong><br>
          • Link kênh (TikTok, Facebook, YouTube…) hoặc 2–3 video bạn muốn được xem.<br>
          • Mục tiêu của bạn: bán hàng, xây thương hiệu cá nhân hay làm nghề video.<br>
          • Điều bạn đang vướng nhất khi quay hoặc dựng.`) : ''}
        ${p('Muốn trao đổi ngay? Bấm nút bên dưới để nhắn Zalo cho Minh Tấn.')}
        ${button(contact.zaloHref, 'Nhắn Zalo ngay')}
        ${signature}`,
    }),
  };
}

/** To Minh Tấn: a new lead to call back. */
export function consultNotify(r: ConsultRequest): Mail {
  const rows: [string, string][] = [
    ['Loại', r.kind === 'audit' ? 'Đặt lịch Audit miễn phí' : r.kind === 'coaching' ? 'Tư vấn Coaching' : 'Tư vấn khóa học'],
    ['Gói / khóa', r.product || '—'], ['Hình thức', r.format || '—'],
    ['Tên', r.name], ['Zalo / SĐT', r.phone], ['Email', r.email], ['Lời nhắn', r.message || '—'],
  ];
  return {
    subject: `[${r.kind === 'audit' ? 'Audit' : 'Tư vấn'}] ${r.name} · ${r.phone}`,
    html: layout({
      preheader: `${r.name} vừa ${r.kind === 'audit' ? 'đặt lịch Audit' : 'gửi yêu cầu tư vấn'}.`,
      body: `
        ${eyebrow('Khách mới')}
        ${h1(r.kind === 'audit' ? 'Có người đặt lịch Audit' : 'Có người cần tư vấn')}
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;font-size:15px;">
          ${rows.map(([k, v]) => `<tr><td style="padding:8px 0;color:${C.muted};width:110px;vertical-align:top;">${k}</td><td style="padding:8px 0;color:${C.ink};font-weight:600;">${esc(v)}</td></tr>`).join('')}
        </table>
        ${button(`https://zalo.me/${r.phone.replace(/\D/g, '')}`, 'Nhắn Zalo cho khách')}
        ${p(`<a href="${SITE}/admin/consults" style="color:${C.gold};">Xem tất cả yêu cầu trong Admin</a>`)}`,
    }),
  };
}

// ---------------------------------------------------------------- auth (pasted into Supabase > Authentication > Emails)

export function authEmail(kind: 'confirm' | 'recovery'): Mail {
  const confirm = kind === 'confirm';
  const link = confirm
    ? '{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard'
    : '{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/update-password';
  return {
    subject: confirm ? 'Xác nhận đăng ký tài khoản TẤN VA' : 'Đặt lại mật khẩu TẤN VA',
    html: layout({
      preheader: confirm ? 'Bấm xác nhận để bắt đầu học thử miễn phí.' : 'Link đặt mật khẩu mới, chỉ dùng được một lần.',
      body: confirm ? `
        ${eyebrow('Chỉ còn 1 bước')}
        ${h1('Xác nhận email của bạn')}
        ${p('Cảm ơn bạn đã tạo tài khoản TẤN VA. Bấm nút bên dưới để xác nhận email và bắt đầu học thử miễn phí.')}
        ${button(link, 'Xác nhận email')}
        ${p(`<span style="font-size:14px;color:${C.muted};">Nếu bạn không đăng ký, hãy bỏ qua email này.</span>`)}
        ${signature}` : `
        ${eyebrow('Bảo mật tài khoản')}
        ${h1('Đặt lại mật khẩu')}
        ${p('Bạn (hoặc ai đó) vừa yêu cầu đặt lại mật khẩu tài khoản TẤN VA. Bấm nút bên dưới để đặt mật khẩu mới.')}
        ${button(link, 'Đặt mật khẩu mới')}
        ${p(`<span style="font-size:14px;color:${C.muted};">Link mở được trên mọi thiết bị và chỉ dùng được một lần. Nếu bạn không yêu cầu, hãy bỏ qua email này, mật khẩu cũ vẫn giữ nguyên.</span>`)}
        ${signature}`,
    }),
  };
}
