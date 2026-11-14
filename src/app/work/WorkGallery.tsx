'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, X, Layers, Lock } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import HoverPreview from '@/components/HoverPreview';
import { skipOptimizer } from '@/lib/image';

const CATEGORY_LABELS: Record<string, string> = {
  'game-show': 'Game show',
  TV: 'Truyền hình',
  tvc: 'TVC & Viral',
  'real-estate': 'Bất động sản & Vlog',
  talent: 'Vũ đạo',
  'short-video': 'Video ngắn',
  cinematic: 'Điện ảnh',
  brand: 'Thương hiệu',
};

// Shown until the admin adds projects in /admin/work
export const SHOWCASE = [
  { id: 'p1', title: '2 Ngày 1 Đêm', category: 'TV', thumbnail_url: '/asset/du_an_tieu_bieu/project_2n1d.webp' },
  { id: 'p2', title: 'Anh Trai Say Hi — Movie', category: 'cinematic', thumbnail_url: '/asset/du_an_tieu_bieu/project_atsh_movie.jpg' },
  { id: 'p3', title: 'Anh Trai Say Hi — Las Vegas', category: 'cinematic', thumbnail_url: '/asset/du_an_tieu_bieu/project_atsh_vegas.webp' },
  { id: 'p4', title: 'Người Hùng Tí Hon', category: 'TV', thumbnail_url: '/asset/du_an_tieu_bieu/project_nhth.jpg' },
  { id: 'p5', title: 'Mái Ấm Tình Thương', category: 'TV', thumbnail_url: '/asset/du_an_tieu_bieu/project_matn.webp' },
  { id: 'p6', title: 'Ký Ức Vui Vẻ', category: 'TV', thumbnail_url: '/asset/du_an_tieu_bieu/project_kuvv.png' },
];

// Projects arrive from the server page, so the list is in the HTML for search engines and AI crawlers.
export default function WorkGallery({ projects }: { projects: any[] }) {
  const [selected, setSelected] = useState<any>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelected(null);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selected]);

  const categories = useMemo(() => ['all', ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))], [projects]);
  const filtered = filter === 'all' ? projects : projects.filter((p) => p.category === filter);

  return (
    <main>
      <section className="container-lux pt-12 pb-10 md:pt-20">
        <SectionHeading as="h1" title="Dự án tiêu biểu" description="Những tác phẩm đầu tư về câu chuyện và hình ảnh, sản xuất cùng các đài truyền hình và nhãn hàng hàng đầu." />
        {categories.length > 2 && (
          <div className="mt-8 flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5" role="tablist" aria-label="Lọc dự án">
            {categories.map((c) => (
              <button key={c} role="tab" aria-selected={filter === c} onClick={() => setFilter(c)}
                      className={`shrink-0 min-h-[44px] px-5 rounded-full text-sm font-semibold border transition-colors ${filter === c ? 'bg-onyx text-white border-onyx' : 'bg-card text-stone border-line-strong hover:border-ink'}`}>
                {c === 'all' ? 'Tất cả' : CATEGORY_LABELS[c] || c}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="container-lux pb-24">
        {filtered.length === 0 ? (
          <div className="card p-12 text-center"><Layers size={32} className="mx-auto text-gold" aria-hidden="true" /><p className="mt-4 text-muted-foreground">Chưa có dự án trong mục này.</p></div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <li key={p.id}>
                <button onClick={() => setSelected(p)} className="group block w-full text-left">
                  <span className="relative block aspect-[4/3] rounded-[var(--radius-card)] overflow-hidden bg-muted">
                    <Image src={p.thumbnail_url || '/asset/du_an_tieu_bieu/bgd0.jpg'} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" unoptimized={skipOptimizer(p.thumbnail_url)} />
                    {p.video_url && (
                      <span className="absolute inset-0 flex items-center justify-center bg-onyx/0 group-hover:bg-onyx/30 transition-colors">
                        <span className="w-14 h-14 rounded-full bg-gold-light text-onyx flex items-center justify-center opacity-90"><Play size={22} fill="currentColor" aria-hidden="true" /></span>
                      </span>
                    )}
                    <HoverPreview url={p.video_url} />
                  </span>
                  {p.client_name && <span className="mt-4 block text-sm text-gold font-semibold">{p.client_name}</span>}
                  <span className="mt-1 block font-display text-2xl font-bold group-hover:text-gold transition-colors">{p.title}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {filter === 'all' && (
          <div className="mt-12 flex justify-center">
            <div className="more-note rounded-2xl sm:rounded-full px-6 py-4 md:px-8 text-center text-white">
              <p className="flex items-center justify-center gap-3 text-base md:text-xl font-bold">
                <span className="more-note-dot" aria-hidden="true" />
                <span>Và còn nhiều sản phẩm của <span className="text-gold-light">doanh nghiệp và cá nhân</span> khác nữa</span>
              </p>
              <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-stone-300"><Lock size={14} aria-hidden="true" /> Vì lý do bảo mật nên không được đăng tải.</p>
            </div>
          </div>
        )}
      </section>

      {selected && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={selected.title}>
          <div className="absolute inset-0 bg-onyx/90" onClick={() => setSelected(null)} aria-hidden="true" />
          <div className="relative w-full max-w-4xl card overflow-hidden animate-fade-up">
            <button onClick={() => setSelected(null)} autoFocus aria-label="Đóng" className="absolute top-3 right-3 z-10 w-11 h-11 rounded-full bg-onyx/70 text-white flex items-center justify-center hover:bg-onyx">
              <X size={20} aria-hidden="true" />
            </button>
            <div className="relative aspect-video bg-onyx">
              {selected.video_url ? (
                <iframe src={toEmbedUrl(selected.video_url)} title={selected.title} className="w-full h-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
              ) : (
                <Image src={selected.thumbnail_url || '/asset/du_an_tieu_bieu/bgd0.jpg'} alt={selected.title} fill sizes="900px" className="object-cover" unoptimized={skipOptimizer(selected.thumbnail_url)} />
              )}
            </div>
            <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-3xl">{selected.title}</h2>
                <p className="mt-2 text-muted-foreground max-w-xl">{selected.description || 'Tác phẩm tập trung vào tính thẩm mỹ và thông điệp cốt lõi của nhãn hàng.'}</p>
                {selected.client_name && <p className="mt-3 text-sm"><span className="text-muted-foreground">Khách hàng:</span> <strong>{selected.client_name}</strong></p>}
              </div>
              <Link href="/courses" className="btn btn-gold shrink-0">Học kỹ thuật này</Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// Converts YouTube and Vimeo links into embeddable URLs (Vimeo unlisted links carry a hash)
function toEmbedUrl(url: string) {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/(\w+))?/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1${vm[2] ? `&h=${vm[2]}` : ''}`;
  return url;
}
