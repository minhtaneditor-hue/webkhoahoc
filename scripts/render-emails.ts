// Writes every email template to a folder as HTML so they can be previewed in a browser.
// Usage: npx tsx scripts/render-emails.ts <out-dir>
import { writeFileSync, mkdirSync } from 'fs';
import * as E from '../src/lib/emails';
import { CHECKLIST, CHECKLIST_TITLE } from '../src/lib/checklist';

const out = process.argv[2] || 'email-previews';
mkdirSync(out, { recursive: true });
const contact = { zaloHref: 'https://zalo.me/0922255861', zaloGroupHref: 'https://zalo.me/g/example' };
const s = { name: 'Nguyễn Văn An', email: 'an@example.com', courseTitle: '21 Ngày Tự Tin Trước Ống Kính', courseId: 'course-id', done: 12, total: 39, nextLessonId: 'l13', nextLessonTitle: 'Bài 13: Ánh sáng tự nhiên trong nhà' };
const mails: Record<string, { subject: string; html: string }> = {
  '01-welcome': E.welcomeCourse({ name: s.name, email: s.email, courseTitle: s.courseTitle, courseId: s.courseId, contact }),
  '02-onboard-day2': E.onboardDay2({ ...s, done: 1 }),
  '03-onboard-day5': E.onboardDay5({ ...s, done: 4 }, contact),
  '04-onboard-day10': E.onboardDay10({ ...s, done: 21 }),
  '05-inactive': E.inactiveStudent(s),
  '06-completed': E.courseCompleted({ ...s, done: 39 }, contact),
  '07-expiring': E.accessExpiring({ ...s, expiryDate: '10/11/2026' }),
  '08-signup-nudge': E.signupNudge({ name: s.name, email: s.email }),
  '09-checklist': E.checklistEmail({ name: s.name, email: s.email, title: CHECKLIST_TITLE, groups: CHECKLIST }),
  '10-lead-day2': E.leadDay2({ name: s.name, email: s.email }),
  '11-lead-day6': E.leadDay6({ name: s.name, email: s.email }),
  '12-asset': E.assetPurchased({ name: s.name, title: 'Preset màu Cinematic', orderId: 'TV123456', link: 'https://www.minhtanacademy.com' }),
  '13-auth-confirm': E.authEmail('confirm'),
  '14-auth-recovery': E.authEmail('recovery'),
};
for (const [k, m] of Object.entries(mails)) writeFileSync(`${out}/${k}.html`, m.html.replace('<body', `<!-- ${m.subject} --><body`));
writeFileSync(`${out}/index.html`, `<meta charset="utf-8"><body style="font-family:Arial;padding:20px">` + Object.entries(mails).map(([k, m]) => `<p><a href="${k}.html">${k}</a> · ${m.subject}</p>`).join(''));
console.log(Object.keys(mails).length, 'emails →', out);
