import { getPublicSupabase, formatVND } from '@/lib/supabase-public';
import { getFaqs, getSiteSettings } from '@/lib/content';
import { contactFrom } from '@/lib/site-settings';
import { MEMBERSHIP_PLANS, MEMBER_DISCOUNT_PERCENT } from '@/lib/membership';

// What the AI advisors know about the business: the website chat (/api/chat) and the
// Facebook Messenger bot (src/lib/fb/agent.ts) both answer from this text.

// Site knowledge, rebuilt at most every 10 minutes so admin edits show up.
let knowledge: { text: string; at: number } | null = null;
export async function siteKnowledge() {
  if (knowledge && Date.now() - knowledge.at < 10 * 60_000) return knowledge.text;
  const db = getPublicSupabase();
  const [settings, faqs, courses, assets] = await Promise.all([
    getSiteSettings(),
    getFaqs(),
    db ? db.from('courses').select('id, title, description, price, old_price').eq('is_published', true).order('created_at').then((r) => r.data || []) : [],
    db ? db.from('digital_assets_public').select('id, title, price, category').order('created_at', { ascending: false }).limit(40).then((r) => r.data || []) : [],
  ]);
  const contact = contactFrom(settings);
  const price = (p: unknown) => (Number(p) > 0 ? formatVND(p as number) : 'sắp mở bán, nhận đặt trước');
  const cut = (s: unknown, n: number) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n);

  const text = [
    '# KHÓA HỌC',
    ...courses.map((c) => `- ${c.title} — ${price(c.price)}${Number(c.old_price) > Number(c.price) ? ` (giá gốc ${formatVND(c.old_price)})` : ''}. Link: /courses/${c.id}\n  ${cut(c.description, 400)}`),
    '',
    '# COACHING 1:1',
    '- Gói 6 hoặc 10 buổi, online hoặc offline. Chụp ảnh, quay và dựng video bằng điện thoại hoặc AI; chương trình riêng, giao và sửa bài trực tiếp, hỗ trợ sau khóa. Link: /coaching',
    '',
    '# CÔNG CỤ MIỄN PHÍ',
    '- Chấm video miễn phí bằng AI: chọn video trong máy (lời thoại tự lấy, không cần dán), nhận điểm 6 tiêu chí theo công thức 3S, việc nên sửa trước và 2 câu hook viết lại. Video không tải lên, chỉ gửi phần tiếng để lấy lời thoại, 3 lượt mỗi ngày. Gợi ý khi khách muốn biết video của mình sai ở đâu. Link: /cham-video',
    '',
    '# HỘI VIÊN',
    ...Object.values(MEMBERSHIP_PLANS).map((p) => `- ${p.title}: ${formatVND(p.price)}`),
    `- Hội viên được giảm ${MEMBER_DISCOUNT_PERCENT.course}% khóa học và ${MEMBER_DISCOUNT_PERCENT.asset}% sản phẩm trong cửa hàng. Link: /hoi-vien`,
    '',
    '# CỬA HÀNG (preset, ebook, tài nguyên)',
    ...assets.map((a) => `- ${a.title} — ${price(a.price)}. Link: /shop/${a.id}`),
    '',
    '# CÂU HỎI THƯỜNG GẶP',
    ...faqs.map((f) => `- H: ${f.q}\n  Đ: ${cut(f.a, 400)}`),
    '',
    '# LIÊN HỆ',
    `- Zalo/hotline: ${contact.phone} (${contact.zaloHref}) · Email: ${contact.email}`,
  ].join('\n');
  knowledge = { text, at: Date.now() };
  return text;
}
