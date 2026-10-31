import { getPublicSupabase } from './supabase-public';
import { DEFAULT_SETTINGS, type SiteSettings } from './site-settings';
import { FEATURED_STUDENTS, FEEDBACK_IMAGES } from './students';

// Server-side readers for admin-editable content. Each falls back to the built-in
// content when the table is empty or the migration has not been run yet.

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = getPublicSupabase();
  if (!supabase) return DEFAULT_SETTINGS;
  const { data, error } = await supabase.from('site_settings').select('key, value');
  if (error || !data) return DEFAULT_SETTINGS;
  const saved = Object.fromEntries(data.filter((r) => r.value != null && r.value !== '').map((r) => [r.key, r.value as string]));
  return { ...DEFAULT_SETTINGS, ...saved };
}

export type Student = {
  id: string;
  name: string;
  title: string | null;
  quote: string | null;
  story?: string | null;
  results: string | null;
  avatar_url: string | null;
};

export async function getStudents(): Promise<Student[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return FEATURED_STUDENTS;
  const { data, error } = await supabase.from('students').select('*').order('sort_order').order('created_at');
  if (error || !data?.length) return FEATURED_STUDENTS;
  return data;
}

export type FeedbackImage = { src: string; width: number; height: number; caption?: string | null };

export async function getFeedbackImages(): Promise<FeedbackImage[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return FEEDBACK_IMAGES;
  const { data, error } = await supabase.from('feedback_images').select('image_url, width, height, caption').order('sort_order').order('created_at');
  if (error || !data?.length) return FEEDBACK_IMAGES;
  return data.map((r) => ({ src: r.image_url, width: r.width, height: r.height, caption: r.caption }));
}

export const DEFAULT_FAQS = [
  { q: 'Điện thoại cũ có học được không?', a: 'Được. Khóa học dạy bạn làm chủ ánh sáng và góc máy để bù lại giới hạn của thiết bị; điện thoại vài năm tuổi vẫn cho ra hình đẹp.' },
  { q: 'Tôi ngại lên hình thì sao?', a: 'Bạn có thể làm video voice-over, quay tay, quay sản phẩm hoặc bối cảnh. Khóa học có riêng chiến lược cho người không muốn lộ mặt.' },
  { q: 'Học xong chưa ra kết quả thì sao?', a: 'Bạn được hỗ trợ 1:1 cho tới khi dựng xong phễu bán hàng đầu tiên. Ngoài ra có chính sách hoàn tiền trong 7 ngày.' },
  { q: 'Tôi học được bao lâu?', a: 'Truy cập trọn đời, bao gồm mọi bài học cập nhật sau này.' },
];

export async function getFaqs(): Promise<{ q: string; a: string }[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return DEFAULT_FAQS;
  const { data, error } = await supabase.from('faqs').select('question, answer').order('sort_order').order('created_at');
  if (error || !data?.length) return DEFAULT_FAQS;
  return data.map((r) => ({ q: r.question, a: r.answer }));
}
