// Writes every email template to a folder as HTML so they can be previewed in a browser.
// Usage: npx tsx scripts/render-emails.ts <out-dir>
import { writeFileSync, mkdirSync } from 'fs';
import * as E from '../src/lib/emails';
import { CHECKLIST, CHECKLIST_TITLE } from '../src/lib/checklist';

const out = process.argv[2] || 'email-previews';
mkdirSync(out, { recursive: true });
const contact = { zaloHref: 'https://zalo.me/0922255861', zaloGroupHref: 'https://zalo.me/g/example' };
const course: E.FeaturedCourse = {
  id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', title: '21 Ngày Biến Video Thành Tài Sản', lessonCount: 44,
  freeLessons: ['Bài 1: Vì sao điện thoại có thể kiếm được tiền?', 'Bài 2: Ba con đường kiếm tiền sau khóa học', 'Bài 3: Sai lầm khiến 90% mãi không kiếm được tiền'],
  chapters: ['Bản Đồ Kiếm Tiền Bằng Điện Thoại', 'Bản Đồ Chinh Phục Video Chuyển Đổi Cao', 'Biến Điện Thoại Thành Máy Quay', 'Kiến Thức - Kỹ Thuật Quay Video', 'Quy Trình Edit 15 Phút với Capcut', 'Cỗ Máy Nội Dung Scale-up', 'Kiếm Tiền Từ Điện Thoại'],
};
const s = { name: 'Nguyễn Văn An', email: 'an@example.com', courseTitle: course.title, courseId: course.id, done: 12, total: 44, nextLessonId: 'l13', nextLessonTitle: 'Bài 13: Tên bài tiếp theo' };
const mails: Record<string, { subject: string; html: string }> = {
  '01-welcome': E.welcomeCourse({ name: s.name, email: s.email, courseTitle: s.courseTitle, courseId: s.courseId, contact }),
  '02-onboard-day2': E.onboardDay2({ ...s, done: 1 }),
  '03-onboard-day5': E.onboardDay5({ ...s, done: 4 }, contact),
  '04-onboard-day10': E.onboardDay10({ ...s, done: 21 }),
  '05-inactive': E.inactiveStudent(s),
  '06-completed': E.courseCompleted({ ...s, done: 44 }, contact),
  '07-expiring': E.accessExpiring({ ...s, expiryDate: '10/11/2026' }),
  '08-signup-nudge': E.signupNudge({ name: s.name, email: s.email }, course),
  '09-checklist': E.checklistEmail({ name: s.name, email: s.email, title: CHECKLIST_TITLE, groups: CHECKLIST, course }),
  '10-lead-day2': E.leadDay2({ name: s.name, email: s.email }, course),
  '11-lead-day6': E.leadDay6({ name: s.name, email: s.email }, course),
  '12-asset': E.assetPurchased({ name: s.name, title: 'Preset màu Cinematic', orderId: 'TV123456', link: 'https://www.minhtanacademy.com' }),
  '13-auth-confirm': E.authEmail('confirm'),
  '14-auth-recovery': E.authEmail('recovery'),
  '15-preorder-ai': E.preorderAiCourses({ name: s.name, email: s.email }, [{ id: 'a', title: 'Edit Video Bằng AI Với Claude', description: 'Học cách dùng Claude để edit video bằng AI. Khóa học đang được chuẩn bị.' }, { id: 'b', title: 'Edit Video Bằng AI Với ChatGPT Plus', description: 'Học cách dùng ChatGPT Plus để edit video bằng AI. Khóa học đang được chuẩn bị.' }]),
};
for (const [k, m] of Object.entries(mails)) writeFileSync(`${out}/${k}.html`, m.html.replace('<body', `<!-- ${m.subject} --><body`));
writeFileSync(`${out}/index.html`, `<meta charset="utf-8"><body style="font-family:Arial;padding:20px">` + Object.entries(mails).map(([k, m]) => `<p><a href="${k}.html">${k}</a> · ${m.subject}</p>`).join(''));
console.log(Object.keys(mails).length, 'emails →', out);
