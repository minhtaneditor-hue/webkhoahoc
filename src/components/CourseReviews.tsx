'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Star, Loader2, CheckCircle2, MessageSquare } from 'lucide-react';
import { supabase } from '@/utils/supabase';

type Review = { id: number; author_name: string; rating: number; comment: string | null; created_at: string; updated_at: string };

const LABELS = ['', 'Chưa hài lòng', 'Tạm được', 'Ổn', 'Tốt', 'Tuyệt vời'];
const PAGE = 6;

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} trên 5 sao`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} aria-hidden="true" className={i <= Math.round(value) ? 'fill-gold text-gold' : 'text-line-strong'} />
      ))}
    </span>
  );
}

/**
 * Ratings and comments under a course (migration 019). Everyone sees the visible reviews;
 * enrolled students rate 1–5 stars and comment, once per course (posting again edits it).
 */
export default function CourseReviews({ courseId, user, enrolled }: { courseId: string; user: any; enrolled: boolean }) {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [shown, setShown] = useState(PAGE);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [mine, setMine] = useState<{ rating: number; comment: string | null; is_hidden: boolean } | null>(null);
  const [state, setState] = useState<'idle' | 'sending' | 'saved'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('course_reviews').select('id, author_name, rating, comment, created_at, updated_at')
      .eq('course_id', courseId).order('created_at', { ascending: false })
      .then(({ data }) => setReviews((data as Review[]) || []));
  }, [courseId]);

  useEffect(() => {
    if (!user || !enrolled) return;
    fetch(`/api/reviews?courseId=${courseId}`).then((r) => r.json()).then(({ review }) => {
      if (!review) return;
      setMine(review);
      setRating(review.rating);
      setComment(review.comment || '');
    }).catch(() => {});
  }, [user, enrolled, courseId]);

  const stats = useMemo(() => {
    const list = reviews || [];
    const count = list.length;
    const avg = count ? list.reduce((n, r) => n + r.rating, 0) / count : 0;
    const bars = [5, 4, 3, 2, 1].map((s) => ({ s, n: list.filter((r) => r.rating === s).length }));
    return { count, avg, bars };
  }, [reviews]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return setError('Bấm chọn số sao trước nhé.');
    setError('');
    setState('sending');
    const res = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseId, rating, comment }) })
      .then(async (r) => ({ ok: r.ok, data: await r.json().catch(() => ({})) })).catch(() => ({ ok: false, data: {} as any }));
    if (!res.ok) { setState('idle'); setError(res.data.error || 'Chưa gửi được, vui lòng thử lại.'); return; }
    const saved: Review & { is_hidden: boolean } = res.data.review;
    setMine({ rating: saved.rating, comment: saved.comment, is_hidden: saved.is_hidden });
    if (!saved.is_hidden) setReviews((list) => [saved, ...(list || []).filter((r) => r.id !== saved.id)]);
    setState('saved');
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <section aria-labelledby="reviews-title" id="danh-gia" className="scroll-mt-24">
      <h2 id="reviews-title" className="text-4xl">Đánh giá của học viên</h2>

      {/* Summary */}
      <div className="mt-8 card p-6 md:p-8 grid gap-6 sm:grid-cols-[auto_1fr] items-center">
        <div className="text-center sm:pr-8 sm:border-r border-line">
          <p className="font-display text-6xl font-extrabold text-ink tabular-nums">{stats.count ? stats.avg.toFixed(1) : '—'}</p>
          <div className="mt-2"><Stars value={stats.avg} size={20} /></div>
          <p className="mt-1 text-sm text-muted-foreground">{stats.count ? `${stats.count} đánh giá` : 'Chưa có đánh giá'}</p>
        </div>
        <ul className="space-y-2" aria-label="Phân bố số sao">
          {stats.bars.map(({ s, n }) => (
            <li key={s} className="flex items-center gap-3 text-sm">
              <span className="w-10 shrink-0 inline-flex items-center gap-1 text-ink font-semibold">{s} <Star size={13} className="fill-gold text-gold" aria-hidden="true" /></span>
              <span className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden"><span className="block h-full bg-gold rounded-full" style={{ width: `${stats.count ? (n / stats.count) * 100 : 0}%` }} /></span>
              <span className="w-8 text-right text-muted-foreground tabular-nums">{n}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Write / edit */}
      <div className="mt-6">
        {!user ? (
          <p className="card p-5 text-muted-foreground"><Link href={`/auth?redirect=/courses/${courseId}%23danh-gia`} className="font-semibold text-gold underline underline-offset-4">Đăng nhập</Link> bằng tài khoản đã đăng ký khóa học để viết đánh giá.</p>
        ) : !enrolled ? (
          <p className="card p-5 text-muted-foreground">Chỉ học viên đã đăng ký khóa học mới viết được đánh giá, để mọi đánh giá ở đây đều là thật.</p>
        ) : (
          <form onSubmit={submit} className="card p-6 md:p-8 space-y-4" noValidate>
            <p className="font-bold text-ink text-lg">{mine ? 'Đánh giá của bạn' : 'Bạn thấy khóa học thế nào?'}</p>
            <fieldset>
              <legend className="sr-only">Số sao</legend>
              <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <label key={i} className="cursor-pointer p-1 -m-1" onMouseEnter={() => setHover(i)}>
                    <input type="radio" name="rating" value={i} checked={rating === i} onChange={() => { setRating(i); setState('idle'); }} className="sr-only peer" />
                    <Star size={34} aria-hidden="true" className={`transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-gold rounded ${(hover || rating) >= i ? 'fill-gold text-gold' : 'text-line-strong'}`} />
                    <span className="sr-only">{i} sao: {LABELS[i]}</span>
                  </label>
                ))}
                <span className="ml-3 text-sm font-semibold text-ink min-w-[6rem]">{LABELS[hover || rating]}</span>
              </div>
            </fieldset>
            <div>
              <label htmlFor="review-comment" className="field-label">Cảm nhận của bạn (không bắt buộc)</label>
              <textarea id="review-comment" rows={4} maxLength={1500} className="input" value={comment} onChange={(e) => { setComment(e.target.value); setState('idle'); }}
                        placeholder="Điều bạn thích nhất, điều bạn đã làm được sau khóa học…" />
            </div>
            {error && <p role="alert" className="text-sm text-danger">{error}</p>}
            {state === 'saved' && (
              <p role="status" className="flex items-center gap-2 text-sm font-semibold text-success"><CheckCircle2 size={18} aria-hidden="true" /> {mine?.is_hidden ? 'Đã lưu. Đánh giá này đang được ẩn khỏi trang.' : 'Cảm ơn bạn! Đánh giá đã được đăng.'}</p>
            )}
            <button type="submit" disabled={state === 'sending'} className="btn btn-gold disabled:opacity-60">
              {state === 'sending' && <Loader2 size={18} className="animate-spin" aria-hidden="true" />} {mine ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
            </button>
          </form>
        )}
      </div>

      {/* List */}
      {reviews === null ? (
        <p className="mt-6 text-muted-foreground inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" aria-hidden="true" /> Đang tải đánh giá…</p>
      ) : reviews.length === 0 ? (
        <p className="mt-6 text-muted-foreground inline-flex items-center gap-2"><MessageSquare size={16} aria-hidden="true" /> Chưa có đánh giá nào. Học viên đầu tiên đánh giá sẽ hiện ở đây.</p>
      ) : (
        <>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {reviews.slice(0, shown).map((r) => (
              <li key={r.id} className="card p-5 flex flex-col">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 shrink-0 rounded-full bg-onyx text-gold-light flex items-center justify-center font-bold" aria-hidden="true">{r.author_name.trim().split(/\s+/).pop()?.charAt(0).toUpperCase()}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink truncate">{r.author_name}</p>
                    <p className="text-xs text-muted-foreground">{fmt(r.created_at)}{r.updated_at && new Date(r.updated_at).getTime() - new Date(r.created_at).getTime() > 60_000 ? ' · đã chỉnh sửa' : ''}</p>
                  </div>
                  <span className="ml-auto shrink-0"><Stars value={r.rating} /></span>
                </div>
                {r.comment && <p className="mt-3 text-stone leading-relaxed whitespace-pre-line">{r.comment}</p>}
              </li>
            ))}
          </ul>
          {reviews.length > shown && (
            <button type="button" onClick={() => setShown((n) => n + PAGE)} className="btn btn-outline mt-6">Xem thêm đánh giá ({reviews.length - shown})</button>
          )}
        </>
      )}
    </section>
  );
}
