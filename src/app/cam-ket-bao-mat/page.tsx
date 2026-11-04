import type { Metadata } from 'next';
import { AGREEMENT_SECTIONS, AGREEMENT_TITLE, AGREEMENT_VERSION } from '@/lib/content-agreement';

export const metadata: Metadata = {
  title: 'Cam kết bảo mật nội dung',
  description: 'Cam kết bảo mật và sử dụng nội dung khóa học mà học viên đồng ý trước khi học.',
  alternates: { canonical: '/cam-ket-bao-mat' },
};

export default function AgreementPage() {
  return (
    <main className="container-lux py-12 md:py-20">
      <article className="max-w-3xl">
        <h1>{AGREEMENT_TITLE}</h1>
        <p className="mt-3 text-muted-foreground">Phiên bản {AGREEMENT_VERSION}. Học viên đồng ý cam kết này trước khi xem bài học.</p>
        <div className="mt-10 space-y-8">
          {AGREEMENT_SECTIONS.map((s) => (
            <section key={s.heading}>
              <h2 className="text-2xl">{s.heading}</h2>
              <ul className="mt-3 list-disc pl-5 space-y-2 leading-relaxed text-muted-foreground">
                {s.items.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
