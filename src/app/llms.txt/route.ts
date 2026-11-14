import { getPublicSupabase } from '@/lib/supabase-public';
import { getPublishedPosts } from '@/lib/blog';
import { SITE_URL } from '@/lib/site-url';
import { BRAND_ALIASES } from '@/lib/brand-entity';

export const revalidate = 3600;

// A plain-text guide to the site for AI assistants (llmstxt.org): who TẤN VA is and where the
// public courses, tools and articles live. Rebuilt hourly from the same data as the sitemap.
const oneLine = (s: string | null | undefined, max = 220) => {
  const t = (s || '').replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
};
const item = (title: string, url: string, note?: string | null) => `- [${oneLine(title, 120)}](${url})${note ? `: ${oneLine(note)}` : ''}`;

export async function GET() {
  const supabase = getPublicSupabase();
  const [courses, products, posts] = await Promise.all([
    supabase?.from('courses').select('id, title, description, seo_description').eq('is_published', true).order('created_at', { ascending: true }).then((r) => r.data || []) ?? [],
    supabase?.from('digital_assets_public').select('id, title, description').order('created_at', { ascending: false }).then((r) => r.data || []) ?? [],
    getPublishedPosts(50),
  ]);

  const lines = [
    '# TẤN VA',
    '',
    `> TẤN VA (${BRAND_ALIASES.join(', ')}) là thương hiệu đào tạo video của Minh Tấn: dạy người kinh doanh và nhà sáng tạo tự quay, dựng và làm video bán hàng bằng điện thoại và bằng AI. Minh Tấn có hơn 10 năm dựng chương trình truyền hình trước khi đi dạy.`,
    '',
    'Website tiếng Việt. Có khóa học online, coaching 1:1, công cụ AI miễn phí, sản phẩm số (ebook, preset) và blog hướng dẫn.',
    '',
    '## Trang chính',
    item('Về Minh Tấn', `${SITE_URL}/about`, 'Câu chuyện nghề và sứ mệnh của TẤN VA'),
    item('Khóa học', `${SITE_URL}/courses`, 'Danh sách khóa học làm video'),
    item('Coaching 1:1', `${SITE_URL}/coaching`, 'Học riêng với Minh Tấn, online hoặc offline, có buổi Audit miễn phí 30 phút'),
    item('Dự án', `${SITE_URL}/work`, 'Chương trình truyền hình, phim và video thương hiệu đã thực hiện'),
    item('Học viên', `${SITE_URL}/students`, 'Kết quả và câu chuyện của học viên'),
    '',
    '## Công cụ AI miễn phí',
    item('Chấm video bằng AI', `${SITE_URL}/cham-video`, 'Chấm video ngắn theo công thức 3S: hook 3 giây đầu, thông điệp, lời kêu gọi, hình ảnh, chữ và lời nói'),
    item('Viết kịch bản video bằng AI', `${SITE_URL}/viet-kich-ban`, 'Viết kịch bản hoàn chỉnh từ nội dung bạn dán vào: hook, lời nói, chữ trên màn hình, cảnh quay'),
  ];
  if (courses.length) lines.push('', '## Khóa học', ...courses.map((c) => item(c.title, `${SITE_URL}/courses/${c.id}`, c.seo_description || c.description)));
  if (products.length) lines.push('', '## Sản phẩm số', ...products.map((p) => item(p.title, `${SITE_URL}/shop/${p.id}`, p.description)));
  if (posts.length) lines.push('', '## Blog', ...posts.map((p) => item(p.title, `${SITE_URL}/blog/${p.slug}`, p.excerpt)));
  lines.push('', '## Chính sách', item('Chính sách bảo mật', `${SITE_URL}/privacy`), item('Điều khoản dịch vụ', `${SITE_URL}/terms`), item('Chính sách hoàn tiền', `${SITE_URL}/refund`), '');

  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
