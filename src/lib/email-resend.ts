// Which sent emails Admin > Email đã gửi can rebuild and send again, told apart by subject.
// Used by the page (to show the button) and the API (to rebuild the email), so both agree.

export type ResendKind = 'free' | 'student' | 'remarketing' | 'repo-sale' | 'order';

const FREE = /^Link tải (.+) của bạn$/;
const ORDER = /^Đã thanh toán: (.+)$/;

export function resendKind(subject?: string | null): ResendKind | null {
  const s = (subject || '').trim();
  if (FREE.test(s)) return 'free';
  if (ORDER.test(s)) return 'order';
  if (/^Chào mừng .+! Khóa .+ đã mở$/.test(s)) return 'student';
  if (/mã giảm 10% cho khóa/.test(s)) return 'remarketing';
  if (s.startsWith('Tháng sinh nhật mình:')) return 'repo-sale';
  return null;
}

/** The product title inside a free-product or paid-product subject. */
export function resendTitle(subject?: string | null) {
  const s = (subject || '').trim();
  return s.match(FREE)?.[1] || s.match(ORDER)?.[1] || null;
}
