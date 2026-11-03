import { createHmac } from 'crypto';

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
        <strong style="color:${C.ink};">${title}</strong><br>${text}
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
  <span style="font-size:13px;color:${C.muted};">Minh Tấn Video Advisor · TẤN VA</span></p>`;

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
              <div style="font-size:20px;font-weight:800;line-height:1.1;"><span style="color:${C.ink};">TẤN</span> <span style="color:${C.gold};">VA</span></div>
              <div style="font-size:10px;font-weight:700;color:${C.muted};letter-spacing:0.12em;">MINH TẤN VIDEO ADVISOR</div>
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
type Contact = { zaloHref: string; zaloGroupHref: string };
const lessonLink = (courseId: string, lessonId?: string | null) => `${SITE}/learn/${courseId}${lessonId ? `/${lessonId}` : ''}`;

// ---------------------------------------------------------------- transactional

/** Day 0 of the onboarding sequence: sent the moment a course is unlocked. */
export function welcomeCourse(d: { name?: string | null; email: string; courseTitle: string; courseId: string; contact: Contact }): Mail {
  const course = esc(d.courseTitle);
  return {
    subject: `Chào mừng ${firstName(d.name)}! Khóa ${d.courseTitle} đã mở`,
    html: layout({
      preheader: '3 bước để bắt đầu ngay hôm nay, và quà tặng dành cho học viên website.',
      body: `
        ${eyebrow('Kích hoạt thành công')}
        ${h1(`Chào mừng ${esc(firstName(d.name))} vào lớp!`)}
        ${p(`Khóa <strong>${course}</strong> đã mở cho tài khoản <strong>${esc(d.email)}</strong>. Bạn học được trên điện thoại lẫn máy tính, không giới hạn số lần xem.`)}
        ${p('Để không bị “mua rồi để đó”, bạn làm 3 việc nhỏ này ngay hôm nay:')}
        ${steps([
          ['Xem bài đầu tiên (chưa tới 15 phút)', 'Chỉ cần bắt đầu. Bài 1 giúp bạn biết mình sẽ đi qua những gì trong khóa.'],
          ['Vào nhóm Zalo học viên', `Nơi bạn nộp bài, hỏi bài và được sửa. <a href="${d.contact.zaloGroupHref}" style="color:${C.gold};font-weight:700;">Vào nhóm tại đây</a>.`],
          ['Chọn giờ học cố định', 'Mỗi ngày 15–20 phút cùng một khung giờ. Đều đặn quan trọng hơn học nhiều một lúc.'],
        ])}
        ${button(lessonLink(d.courseId), 'Vào học bài đầu tiên')}
        ${box(`<strong style="color:${C.ink};">Quà dành cho học viên đăng ký trên website</strong><br>
          • 1 buổi Audit 15 phút 1-1 với Minh Tấn: <a href="${d.contact.zaloHref}" style="color:${C.gold};font-weight:700;">nhắn Zalo</a> để hẹn lịch.<br>
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

export function checklistEmail(d: { name?: string | null; title: string; groups: { group: string; items: string[] }[]; email: string }): Mail {
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
        ${box(`<strong style="color:${C.ink};">Muốn học bài bản từ đầu?</strong><br>Khóa 21 Ngày có bài học thử miễn phí, xem ngay không cần thanh toán.`)}
        ${button(`${SITE}/courses`, 'Học thử miễn phí')}
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
    subject: `${firstName(s.name)} ơi, 15 phút hôm nay cho khóa học nhé`,
    html: layout({
      preheader: 'Cách học để thật sự xong khóa, không bỏ ngang giữa chừng.',
      unsubscribeFor: s.email,
      body: `
        ${eyebrow('Ngày 2 · Tạo thói quen')}
        ${h1('Bí quyết để học xong khóa: nhỏ mà đều')}
        ${p(`Chào ${esc(firstName(s.name))}, phần lớn người bỏ ngang khóa học không phải vì khó, mà vì đợi “có thời gian rảnh” mới học. Cách Minh Tấn khuyên học viên:`)}
        ${steps([
          ['Mỗi ngày một bài', 'Bài nào cũng ngắn. Xem xong là đánh dấu “Hoàn thành” để thấy mình tiến lên.'],
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
      preheader: 'Bạn có 1 buổi Audit 15 phút 1-1 miễn phí, đừng để quên.',
      unsubscribeFor: s.email,
      body: `
        ${eyebrow('Ngày 5 · Thực hành')}
        ${h1('Đến lúc quay clip đầu tiên rồi')}
        ${p(`Chào ${esc(firstName(s.name))}, học video thì phải quay. Clip đầu tiên không cần đẹp, chỉ cần có để Minh Tấn chỉ ra chỗ cần sửa.`)}
        ${steps([
          ['Quay 1 clip 30–60 giây', 'Áp dụng điều bạn vừa học: ánh sáng, khung hình hoặc cách nói.'],
          ['Đăng vào nhóm Zalo học viên', `Ghi rõ bài số mấy để được góp ý đúng chỗ. <a href="${contact.zaloGroupHref}" style="color:${C.gold};font-weight:700;">Mở nhóm Zalo</a>.`],
          ['Hẹn buổi Audit 15 phút', `Quà của học viên website: Minh Tấn xem trực tiếp video của bạn. <a href="${contact.zaloHref}" style="color:${C.gold};font-weight:700;">Nhắn Zalo hẹn lịch</a>.`],
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
    subject: `Bạn đã học ${s.done}/${s.total} bài khóa ${s.courseTitle}`,
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
      preheader: s.nextLessonTitle ? `Bài tiếp theo: ${s.nextLessonTitle}` : 'Quay lại 15 phút thôi là đủ.',
      unsubscribeFor: s.email,
      body: `
        ${eyebrow('Nhắc học')}
        ${h1('Mình quay lại học tiếp nhé?')}
        ${p(`Chào ${esc(firstName(s.name))}, mấy hôm nay bạn chưa vào học khóa <strong>${esc(s.courseTitle)}</strong>. Bận là chuyện bình thường. Bạn không cần bù lại, chỉ cần học tiếp 1 bài hôm nay.`)}
        ${progress(s.done, s.total)}
        ${nextUp(s)}
        ${button(lessonLink(s.courseId, s.nextLessonId), 'Học tiếp 15 phút')}
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

const promoBox = box(`<strong style="color:${C.ink};">Ưu đãi cho bạn</strong><br>Nhập mã <strong style="color:${C.gold};font-size:17px;letter-spacing:0.05em;">TANLAB</strong> khi thanh toán để giảm <strong>500.000đ</strong>.`);

/** Signed up 1 day ago but no course yet. */
export function signupNudge(d: { name?: string | null; email: string }): Mail {
  return {
    subject: 'Bài học thử miễn phí đang chờ bạn',
    html: layout({
      preheader: 'Xem thử trước, thấy hợp rồi mới quyết định.',
      unsubscribeFor: d.email,
      body: `
        ${eyebrow('Học thử miễn phí')}
        ${h1(`Chào ${esc(firstName(d.name))}, bạn đã xem bài học thử chưa?`)}
        ${p('Cảm ơn bạn đã tạo tài khoản TẤN VA. Khóa 21 Ngày có các bài học thử miễn phí để bạn xem cách Minh Tấn dạy trước khi quyết định.')}
        ${steps([
          ['Tự tin trước ống kính', 'Đứng trước camera mà không gượng, không đơ.'],
          ['Quay đẹp bằng điện thoại', 'Ánh sáng, khung hình, âm thanh, không cần máy xịn.'],
          ['Dựng video gọn gàng', 'Từ clip thô thành video đăng được.'],
        ])}
        ${button(`${SITE}/courses`, 'Xem bài học thử')}
        ${promoBox}
        ${signature}`,
    }),
  };
}

/** Checklist lead, day 2: value first. */
export function leadDay2(d: { name?: string | null; email: string }): Mail {
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
        ${p('Sửa 3 điều này thôi là video đã khác hẳn. Muốn học bài bản từ đầu, bạn xem thử khóa 21 Ngày miễn phí:')}
        ${button(`${SITE}/courses`, 'Học thử miễn phí')}
        ${signature}`,
    }),
  };
}

/** Checklist lead, day 6: the offer. */
export function leadDay6(d: { name?: string | null; email: string }): Mail {
  return {
    subject: `${firstName(d.name)} ơi, sẵn sàng tự tin làm video chưa?`,
    html: layout({
      preheader: 'Khóa 21 Ngày + nhóm Zalo sửa bài + 1 buổi Audit 1-1.',
      unsubscribeFor: d.email,
      body: `
        ${eyebrow('Khóa 21 Ngày')}
        ${h1('21 ngày để tự tin trước ống kính')}
        ${p(`Chào ${esc(firstName(d.name))}, nếu bạn đã thử checklist và muốn đi xa hơn, khóa 21 Ngày dẫn bạn từng bước: từ đứng trước camera, quay bằng điện thoại đến dựng video hoàn chỉnh.`)}
        ${box(`<strong style="color:${C.ink};">Đăng ký trên website, bạn nhận thêm</strong><br>
          • Nhóm Zalo học viên: nộp bài và được sửa bài.<br>
          • 1 buổi Audit 15 phút 1-1 với Minh Tấn.<br>
          • Bài học mới cập nhật sau này: miễn phí.`)}
        ${promoBox}
        ${button(`${SITE}/courses`, 'Xem khóa học')}
        ${signature}`,
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
