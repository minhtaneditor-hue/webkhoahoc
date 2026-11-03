import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, Check, Compass, Crown } from 'lucide-react';
import { getPublicSupabase, formatVND } from '@/lib/supabase-public';
import SectionHeading from '@/components/SectionHeading';
import { Reveal } from '@/components/motion/Motion';
import LeadMagnet from '@/components/LeadMagnet';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Khóa học',
  description: 'Các khóa học làm video, sáng tạo nội dung và sản xuất truyền hình của TẤN VA.',
};

const FALLBACK_THUMBS = ['/asset/hoc_vien/tan.jpg', '/asset/du_an_tieu_bieu/project_2n1d.webp', '/asset/du_an_tieu_bieu/project_nhth.jpg'];

const coachingPackages = [
  {
    name: 'Audit miễn phí 30 phút',
    tagline: 'Minh Tấn xem kênh và video hiện tại của bạn',
    icon: Compass,
    features: ['Bắt lỗi hình ảnh, âm thanh, cách nói và cách dựng', 'Định hướng nội dung phù hợp với bạn', 'Gợi ý các bước làm tiếp theo', 'Tư vấn online qua Google Meet hoặc Zalo'],
    cta: 'Đặt lịch Audit miễn phí',
  },
  {
    name: 'Coaching 1:1',
    tagline: 'Gói 6 hoặc 10 buổi, học online hoặc offline',
    icon: Crown,
    features: ['Chụp ảnh, quay và dựng video bằng điện thoại hoặc AI', 'Chương trình riêng theo nhu cầu của bạn', 'Giao bài tập và sửa bài trực tiếp', 'Hỗ trợ sửa bài sau khóa học'],
    cta: 'Xem các gói Coaching',
  },
];

async function getCourses() {
  const supabase = getPublicSupabase();
  if (!supabase) return [];
  const base = 'id, title, description, price, old_price, thumbnail_url';
  const withCount = await supabase
    .from('courses')
    .select(`${base}, lesson_outline(count)`)
    .eq('is_published', true)
    .order('created_at', { ascending: true });
  if (!withCount.error) return withCount.data || [];
  // The lesson count embed needs a PostgREST relationship; fall back to plain rows if unavailable
  const { data } = await supabase.from('courses').select(base).eq('is_published', true).order('created_at', { ascending: true });
  return data || [];
}

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <main>
      <section className="container-lux pt-12 pb-12 md:pt-20">
        <SectionHeading
          as="h1"

          title="Tất cả khóa học"
          description="Từ nền tảng kỹ thuật tới tư duy kinh doanh. Mỗi khóa đều có bài học thử miễn phí, truy cập trọn đời và hỗ trợ trực tiếp từ Minh Tấn."
        />
      </section>

      <section className="container-lux pb-20" aria-label="Danh sách khóa học">
        {courses.length === 0 ? (
          <div className="card p-10 text-center">
            <BookOpen size={32} className="mx-auto text-gold" aria-hidden="true" />
            <p className="mt-4 font-display text-2xl">Khóa học mới đang được chuẩn bị</p>
            <p className="mt-2 text-muted-foreground">Bấm nút Hỗ trợ để nhận thông báo khi mở đăng ký.</p>
          </div>
        ) : (
          <Reveal as="ul" className="grid gap-8 md:grid-cols-2">
            {courses.map((course: any, i: number) => {
              const lessonCount = course.lesson_outline?.[0]?.count ?? 0;
              const hasDiscount = course.old_price && Number(course.old_price) > Number(course.price);
              return (
                <li key={course.id}>
                  <Link href={`/courses/${course.id}`} className="card card-hover group flex flex-col h-full overflow-hidden">
                    <div className="relative aspect-[16/9] bg-muted">
                      <Image
                        src={course.thumbnail_url || FALLBACK_THUMBS[i % FALLBACK_THUMBS.length]}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                        unoptimized={!!course.thumbnail_url?.startsWith('http')}
                      />
                      {i === 0 && <span className="badge absolute top-4 left-4 !bg-onyx !text-gold-light">Nổi bật</span>}
                    </div>
                    <div className="p-6 md:p-8 flex flex-col flex-1">
                      <p className="text-sm text-muted-foreground">{lessonCount > 0 ? `${lessonCount} bài học` : 'Sắp ra mắt'} · Truy cập trọn đời</p>
                      <h2 className="mt-2 text-3xl group-hover:text-gold transition-colors">{course.title}</h2>
                      {course.description && <p className="mt-3 text-muted-foreground leading-relaxed line-clamp-3">{course.description}</p>}
                      <div className="mt-auto pt-6 flex items-end justify-between gap-4">
                        <div>
                          {hasDiscount && <p className="text-sm text-muted-foreground line-through">{formatVND(course.old_price)}</p>}
                          <p className="font-display text-3xl font-bold">{Number(course.price) > 0 ? formatVND(course.price) : 'Miễn phí'}</p>
                        </div>
                        <span className="btn btn-dark !min-h-[44px] text-sm">Xem chi tiết <ArrowRight size={16} aria-hidden="true" /></span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </Reveal>
        )}
      </section>

      <LeadMagnet source="courses" />

      <section className="section surface-dark">
        <div className="container-lux">
          <SectionHeading
            light

            title="Coaching 1:1 cùng Minh Tấn Video Advisor"
            description="Khi bạn cần một người nhìn thẳng vào kênh của mình và chỉ ra bước tiếp theo."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {coachingPackages.map(({ name, tagline, icon: Icon, features, cta }) => (
              <div key={name} className="rounded-[var(--radius-card)] border border-white/10 bg-white/[0.03] p-8 flex flex-col">
                <span className="w-11 h-11 rounded-md bg-gold-light text-onyx flex items-center justify-center"><Icon size={20} aria-hidden="true" /></span>
                <h3 className="mt-5 text-3xl text-white">{name}</h3>
                <p className="mt-1 text-stone-400">{tagline}</p>
                <ul className="mt-6 space-y-3 text-stone-300 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex gap-3"><Check size={18} className="text-gold-light shrink-0 mt-0.5" aria-hidden="true" /> {f}</li>
                  ))}
                </ul>
                <Link href="/coaching" className="btn btn-gold mt-8 self-start">{cta} <ArrowRight size={16} aria-hidden="true" /></Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
