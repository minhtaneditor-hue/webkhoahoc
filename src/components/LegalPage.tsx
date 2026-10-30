import type { ReactNode } from 'react';
import Link from 'next/link';
import { CONTACT } from './Footer';

export type LegalSection = { title: string; body: ReactNode };

export default function LegalPage({
  title,
  intro,
  updated,
  sections,
}: {
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <main className="container-lux py-12 md:py-20">
      <article className="max-w-3xl mx-auto">
        <header className="pb-10">
          <h1>{title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{intro}</p>
          <p className="mt-4 text-sm text-muted-foreground">Cập nhật lần cuối: {updated}</p>
        </header>

        <nav aria-label="Mục lục" className="py-8 px-6 bg-card">
          <ol className="space-y-2">
            {sections.map((s, i) => (
              <li key={s.title}><a href={`#muc-${i + 1}`} className="text-gold font-semibold hover:underline underline-offset-4">{i + 1}. {s.title}</a></li>
            ))}
          </ol>
        </nav>

        <div className="mt-4">
          {sections.map((s, i) => (
            <section key={s.title} id={`muc-${i + 1}`} className="pt-10 scroll-mt-24">
              <h2 className="text-3xl">{i + 1}. {s.title}</h2>
              <div className="mt-4 space-y-4 text-stone leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_strong]:text-ink">{s.body}</div>
            </section>
          ))}
        </div>

        <aside className="mt-14 card p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-display text-2xl font-semibold">Cần hỗ trợ thêm?</p>
            <p className="text-muted-foreground">Gửi email cho chúng tôi, phản hồi trong 1 ngày làm việc.</p>
          </div>
          <a href={`mailto:${CONTACT.email}`} className="btn btn-dark shrink-0">Gửi email hỗ trợ</a>
        </aside>
        <p className="mt-8 text-sm text-muted-foreground">
          Xem thêm: <Link href="/terms" className="underline">Điều khoản dịch vụ</Link> · <Link href="/refund" className="underline">Chính sách hoàn tiền</Link> · <Link href="/privacy" className="underline">Chính sách bảo mật</Link>
        </p>
      </article>
    </main>
  );
}
