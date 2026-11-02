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
  country?: string | null;
  city?: string | null;
  facebook_url?: string | null;
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

export type StudentWork = {
  id: string;
  student_name: string;
  student_title: string | null;
  avatar_url: string | null;
  title: string;
  description: string | null;
  result: string | null;
  category: string | null;
  orientation: 'vertical' | 'horizontal';
  before_url: string | null;
  before_thumbnail_url: string | null;
  after_url: string | null;
  after_thumbnail_url: string | null;
  is_featured: boolean;
  country: string | null;
  city: string | null;
  facebook_url?: string | null;
  tiktok_url?: string | null;
  instagram_url?: string | null;
  youtube_url?: string | null;
  website_url?: string | null;
};

/** Former students' work (before / after). Empty until the admin adds some. */
export async function getStudentWorks(): Promise<StudentWork[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.from('student_works').select('*').order('sort_order').order('created_at', { ascending: false });
  if (error || !data) return [];
  return data;
}

export type StudentPlace = { code: string; count: number; cities: string[] };

/** Countries students live in, most students first. People listed in both tables count once. */
export function studentPlaces(students: Student[], works: StudentWork[]): StudentPlace[] {
  const seen = new Map<string, { code: string; city?: string | null }>();
  for (const s of students) if (s.country) seen.set(s.name.trim().toLowerCase(), { code: s.country, city: s.city });
  for (const w of works) if (w.country) {
    const key = w.student_name.trim().toLowerCase();
    if (!seen.has(key)) seen.set(key, { code: w.country, city: w.city });
  }
  const byCode = new Map<string, StudentPlace>();
  for (const { code, city } of seen.values()) {
    const place = byCode.get(code) ?? { code, count: 0, cities: [] };
    place.count++;
    if (city && !place.cities.includes(city.trim())) place.cities.push(city.trim());
    byCode.set(code, place);
  }
  return [...byCode.values()].sort((a, b) => b.count - a.count);
}

export type FeedbackVideo = {
  id: string;
  student_name: string;
  student_title: string | null;
  country: string | null;
  quote: string | null;
  video_url: string;
  thumbnail_url: string | null;
  orientation: 'vertical' | 'horizontal';
};

/** Students' video testimonials. Empty until the admin adds some. */
export async function getFeedbackVideos(): Promise<FeedbackVideo[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.from('feedback_videos').select('*').order('sort_order').order('created_at', { ascending: false });
  if (error || !data) return [];
  return data;
}
