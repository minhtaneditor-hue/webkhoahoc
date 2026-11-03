'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { isAdmin } from '@/lib/admin';
import { studentCode } from '@/lib/content-agreement';
import { Award, Loader2, Printer, ArrowLeft } from 'lucide-react';
import BrandMark from '@/components/BrandMark';
import ConsultBox from '@/components/ConsultBox';

// Completion certificate: available once every lesson of the course is marked done.
// "Tải PDF" uses the browser's print dialog (Save as PDF); print CSS keeps only the certificate.
export default function CertificatePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const [data, setData] = useState<{ name: string; course: string; done: number; total: number; date: string; code: string } | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push(`/auth?redirect=/certificate/${courseId}`);
      const [{ data: course }, { data: outline }, { data: profile }] = await Promise.all([
        supabase.from('courses').select('title').eq('id', courseId).maybeSingle(),
        supabase.from('lesson_outline').select('id').eq('course_id', courseId),
        supabase.from('users').select('full_name').eq('id', user.id).maybeSingle(),
      ]);
      const ids = (outline || []).map((l) => l.id);
      const { data: progress } = ids.length
        ? await supabase.from('student_progress').select('lesson_id, last_watched_at').eq('user_id', user.id).eq('is_completed', true).in('lesson_id', ids)
        : { data: [] };
      const last = (progress || []).map((p) => p.last_watched_at).sort().pop();
      setData({
        name: profile?.full_name || user.email?.split('@')[0] || 'Học viên',
        course: course?.title || '',
        done: isAdmin(user.email) ? ids.length : (progress || []).length,
        total: ids.length,
        date: new Date(last || Date.now()).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        code: `${studentCode(user.id)}-${courseId.slice(0, 4).toUpperCase()}`,
      });
    })();
  }, [courseId, router]);

  if (!data) return <main className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-gold" aria-hidden="true" /></main>;

  if (data.done < data.total || data.total === 0) {
    return (
      <main className="container-lux py-16 max-w-xl text-center">
        <Award size={40} className="mx-auto text-gold" aria-hidden="true" />
        <h1 className="mt-4 text-3xl">Chưa đủ điều kiện nhận chứng chỉ</h1>
        <p className="mt-3 text-muted-foreground">Bạn đã hoàn thành {data.done}/{data.total} bài của khóa “{data.course}”. Đánh dấu xong tất cả bài học để nhận chứng chỉ.</p>
        <Link href={`/learn/${courseId}`} className="btn btn-gold mt-6">Học tiếp</Link>
      </main>
    );
  }

  return (
    <main className="container-lux py-10 md:py-16">
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-ink min-h-[44px]"><ArrowLeft size={16} aria-hidden="true" /> Khu học tập</Link>
        <div className="flex flex-wrap gap-2">
          <ConsultBox kind="audit" product={`Audit 1 tiếng sau khóa: ${data.course}`} label="Đặt lịch Audit 1 tiếng (quà học xong)" variant="outline" block={false} />
          <button type="button" onClick={() => window.print()} className="btn btn-gold"><Printer size={18} aria-hidden="true" /> Tải PDF / In chứng chỉ</button>
        </div>
      </div>

      <article className="certificate mx-auto max-w-4xl aspect-[1.414/1] rounded-[var(--radius-card)] bg-card border-[10px] border-double border-gold/60 p-8 md:p-14 flex flex-col items-center justify-between text-center">
        <div className="flex items-center gap-3">
          <BrandMark size={44} />
          <span className="text-2xl font-extrabold tracking-tight"><span className="text-ink">TẤN</span> <span className="text-gold">VA</span></span>
        </div>
        <div>
          <p className="text-sm md:text-base font-bold uppercase tracking-[0.3em] text-gold">Chứng nhận hoàn thành</p>
          <p className="mt-4 text-muted-foreground">Trao cho</p>
          <p className="mt-2 text-3xl md:text-5xl font-extrabold text-ink">{data.name}</p>
          <p className="mt-5 text-muted-foreground">đã hoàn thành toàn bộ khóa học</p>
          <p className="mt-2 text-xl md:text-3xl font-bold text-ink">{data.course}</p>
        </div>
        <div className="w-full flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 text-sm">
          <div className="text-left">
            <p className="text-muted-foreground">Ngày hoàn thành</p>
            <p className="font-semibold text-ink">{data.date}</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-ink text-lg">Minh Tấn</p>
            <p className="text-muted-foreground">Minh Tấn Video Advisor</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">Mã chứng chỉ</p>
            <p className="font-mono font-semibold text-ink">{data.code}</p>
          </div>
        </div>
      </article>
    </main>
  );
}
