import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Quote, ArrowRight } from 'lucide-react';
import { getPublicSupabase } from '@/lib/supabase-public';
import SectionHeading from '@/components/SectionHeading';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Học viên tiêu biểu',
  description: 'Câu chuyện và kết quả thật của học viên Minh Tấn Academy.',
};

const FEATURED_STUDENTS = [
  { id: 's1', name: 'Trần Thành Tân', title: 'Cinematographer / Visual Artist', avatar_url: '/asset/hoc_vien/tan.jpg', results: 'Top 1 Trending', quote: 'Tôi làm chủ được ngôn ngữ hình ảnh và có video đầu tiên lên top trending.' },
  { id: 's2', name: 'Nguyễn Đăng Hạnh', title: 'Founder Chú Lùn Bakery', avatar_url: '/asset/hoc_vien/hanh.jpg', results: '+300% doanh thu tự nhiên', quote: 'Tiệm bánh nhỏ của tôi giờ có một cỗ máy nội dung chạy đều mỗi tuần.' },
  { id: 's3', name: 'Nguyễn Tiến Dương', title: 'Founder Bảo Vệ Thành Đô', avatar_url: '/asset/hoc_vien/duong.jpg', results: 'Nâng tầm uy tín', quote: 'Video chỉn chu giúp khách hàng tin dịch vụ của chúng tôi ngay từ lần xem đầu.' },
  { id: 's4', name: 'Trương Thị Như Hằng', title: 'Founder Thực phẩm Đồng Tâm', avatar_url: '/asset/hoc_vien/hang.jpg', results: 'Làm mới thương hiệu', quote: 'Sản phẩm truyền thống của gia đình giờ đã chạm tới khách hàng trẻ.' },
];

const FEEDBACK_IMAGES = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg'];

async function getStudents() {
  const supabase = getPublicSupabase();
  if (!supabase) return FEATURED_STUDENTS;
  const { data } = await supabase.from('students').select('*').order('created_at', { ascending: false });
  return [...FEATURED_STUDENTS, ...(data || [])];
}

export default async function StudentsPage() {
  const students = await getStudents();

  return (
    <main>
      <section className="container-lux pt-12 pb-10 md:pt-20">
        <SectionHeading as="h1" title="Học viên tiêu biểu" description="Kết quả thật từ những người đã học. Họ bắt đầu giống bạn, với một chiếc điện thoại và mong muốn làm video tốt hơn." />
      </section>

      <section className="container-lux pb-20">
        <ul className="grid gap-6 md:grid-cols-2">
          {students.map((s: any, i: number) => (
            <li key={`${s.id}-${i}`} className="card overflow-hidden grid sm:grid-cols-[200px_1fr]">
              <div className="relative aspect-square sm:aspect-auto bg-muted">
                <Image src={s.avatar_url || '/asset/hoc_vien/tan.jpg'} alt={s.name} fill sizes="(min-width: 640px) 200px, 100vw" className="object-cover" unoptimized={!!s.avatar_url?.startsWith('http')} />
              </div>
              <figure className="p-6 md:p-7 flex flex-col">
                {s.results && <span className="badge self-start">{s.results}</span>}
                <Quote size={24} className="mt-4 text-gold" aria-hidden="true" />
                <blockquote className="mt-2 font-display text-2xl leading-snug flex-1">“{s.quote || s.story}”</blockquote>
                <figcaption className="mt-6">
                  <span className="block font-semibold">{s.name}</span>
                  <span className="block text-sm text-muted-foreground">{s.title}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </section>

      <section className="section surface-dark">
        <div className="container-lux">
          <SectionHeading light title="Phản hồi từ học viên" description="Ảnh chụp tin nhắn học viên gửi cho Minh Tấn sau khóa học." />
          <ul className="mt-12 columns-2 md:columns-3 lg:columns-4 gap-4 [&>li]:mb-4">
            {FEEDBACK_IMAGES.map((img, i) => (
              <li key={img} className="break-inside-avoid rounded-md overflow-hidden border border-white/10 bg-white">
                <Image src={`/asset/feedback/${img}`} alt={`Phản hồi học viên ${i + 1}`} width={600} height={900} sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" className="w-full h-auto" />
              </li>
            ))}
          </ul>
          <div className="mt-12 text-center">
            <Link href="/courses" className="btn btn-gold">Trở thành học viên tiếp theo <ArrowRight size={18} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
