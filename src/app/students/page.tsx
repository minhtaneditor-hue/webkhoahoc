import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Quote, ArrowRight } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import { Reveal } from '@/components/motion/Motion';
import { getStudents, getFeedbackImages, getStudentWorks, studentPlaces } from '@/lib/content';
import StudentWorks from '@/components/students/StudentWorks';
import WorldStudents from '@/components/students/WorldStudents';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Học viên & sản phẩm',
  description: 'Sản phẩm thật của học viên Minh Tấn Video Advisor, trước và sau khóa học, cùng câu chuyện từ học viên ở Việt Nam và khắp thế giới.',
};



export default async function StudentsPage() {
  const [students, feedback, works] = await Promise.all([getStudents(), getFeedbackImages(), getStudentWorks()]);
  const places = studentPlaces(students, works);

  return (
    <main>
      <section className="container-lux pt-12 pb-10 md:pt-20">
        <SectionHeading as="h1" title="Học viên & sản phẩm" description="Kết quả thật từ những người đã học. Họ bắt đầu giống bạn, với một chiếc điện thoại và mong muốn làm video tốt hơn." />
      </section>

      {works.length > 0 && (
        <section id="san-pham" aria-labelledby="works-title" className="container-lux pb-20 scroll-mt-24">
          <h2 id="works-title">Sản phẩm của học viên</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">Bấm vào từng sản phẩm để xem lớn. Nhãn Trước / Sau cho thấy học viên làm video thế nào trước và sau khóa học.</p>
          <div className="mt-8"><StudentWorks works={works} /></div>
        </section>
      )}

      <WorldStudents places={places} />

      <section className="container-lux pt-20 pb-6">
        <h2>Câu chuyện học viên</h2>
      </section>

      <section className="container-lux pb-20">
        <Reveal as="ul" className="grid gap-6 md:grid-cols-2" from="mask">
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
        </Reveal>
      </section>

      <section className="section surface-dark">
        <div className="container-lux">
          <SectionHeading light title="Phản hồi từ học viên" description="Ảnh chụp tin nhắn học viên gửi cho Minh Tấn sau khóa học." />
          <ul className="mt-12 columns-1 md:columns-2 gap-4 [&>li]:mb-4">
            {feedback.map((img, i) => (
              <li key={img.src} className="break-inside-avoid overflow-hidden rounded-[var(--radius-img)] bg-white">
                <Image src={img.src} alt={`Phản hồi học viên ${i + 1}`} width={img.width} height={img.height} unoptimized={img.src.startsWith('http')} sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" className="w-full h-auto" />
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
