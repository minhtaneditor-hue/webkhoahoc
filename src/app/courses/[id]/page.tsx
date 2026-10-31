'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/utils/supabase';
import { calculateDiscount } from '@/lib/promo';
import { formatVND } from '@/lib/supabase-public';
import { Play, Lock, ArrowRight, Check, Loader2, ShieldCheck, Infinity as InfinityIcon, MessageCircle, RotateCcw, X, ChevronLeft } from 'lucide-react';

type Status = { type: 'success' | 'error'; text: string } | null;

const outcomes = [
  { t: 'Hình ảnh chuẩn điện ảnh', d: 'Quy trình quay dựng chuẩn truyền hình, chỉ với điện thoại.' },
  { t: 'Chiến lược lan tỏa', d: 'Hiểu thuật toán để tiếp cận khách hàng tự nhiên.' },
  { t: 'Phễu bán hàng tự động', d: 'Chăm sóc và chốt đơn từ người xem thành khách hàng.' },
  { t: 'Thương hiệu cá nhân', d: 'Định vị bạn là chuyên gia trong lĩnh vực của mình.' },
];

const guarantees = [
  { icon: InfinityIcon, text: 'Truy cập trọn đời' },
  { icon: MessageCircle, text: 'Hỗ trợ 1:1 qua Zalo' },
  { icon: RotateCcw, text: 'Hoàn tiền trong 7 ngày' },
  { icon: ShieldCheck, text: 'Thanh toán an toàn qua VNPay' },
];

export default function CourseDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoStatus, setPromoStatus] = useState<Status>(null);
  const [payError, setPayError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      const { data: courseData } = await supabase.from('courses').select('*').eq('id', id).maybeSingle();
      // lesson_outline is a public view: titles for everyone, video_url only for free preview lessons
      const { data: lessonsData } = await supabase.from('lesson_outline').select('*').eq('course_id', id).order('order_index', { ascending: true });

      setCourse(courseData);
      setLessons(lessonsData || []);

      if (currentUser) {
        const { data: enrollmentData } = await supabase.from('enrollments').select('*').eq('user_id', currentUser.id).eq('course_id', id).eq('status', 'active').maybeSingle();
        setEnrolled(!!enrollmentData);
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!selectedLesson) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelectedLesson(null);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selectedLesson]);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    const discount = calculateDiscount(promoCode, Number(course.price) || 0);
    setAppliedDiscount(discount);
    setPromoStatus(discount > 0
      ? { type: 'success', text: `Đã áp dụng mã — giảm ${formatVND(discount)}.` }
      : { type: 'error', text: 'Mã không hợp lệ hoặc đã hết hạn.' });
  };

  const handlePayment = async () => {
    if (!course) return;
    if (!user) {
      router.push(`/auth?redirect=/courses/${course.id}`);
      return;
    }
    setPaymentLoading(true);
    setPayError('');
    try {
      const response = await fetch('/api/payment/vnpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id, promoCode: appliedDiscount > 0 ? promoCode : undefined }),
      });
      const data = await response.json();
      if (data.url) window.location.assign(data.url);
      else setPayError(data.error || 'Không tạo được đơn thanh toán. Vui lòng thử lại.');
    } catch {
      setPayError('Không kết nối được máy chủ. Kiểm tra mạng và thử lại.');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="container-lux py-24 flex items-center justify-center gap-3 text-muted-foreground" aria-busy="true">
        <Loader2 className="animate-spin" size={20} aria-hidden="true" /> Đang tải khóa học…
      </main>
    );
  }

  if (!course) {
    return (
      <main className="container-lux py-24 text-center">
        <h1 className="text-4xl">Không tìm thấy khóa học</h1>
        <p className="mt-3 text-muted-foreground">Khóa học có thể đã bị gỡ hoặc đường dẫn chưa đúng.</p>
        <Link href="/courses" className="btn btn-dark mt-8">Xem tất cả khóa học</Link>
      </main>
    );
  }

  const price = Number(course.price) || 0;
  const finalPrice = Math.max(0, price - appliedDiscount);
  const firstLessonHref = `/learn/${course.id}/${lessons[0]?.id || ''}`;
  const freeLesson = lessons.find((l) => l.is_free);

  const openLesson = (lesson: any) => {
    if (lesson.video_url?.startsWith('drm:') || !lesson.video_url) router.push(`/learn/${course.id}/${lesson.id}`);
    else setSelectedLesson(lesson);
  };

  return (
    <main>
      {/* Hero */}
      <section className="surface-dark">
        <div className="container-lux py-12 md:py-20 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] items-center">
          <div>
            <Link href="/courses" className="flex w-fit items-center gap-1 text-sm text-stone-400 hover:text-white min-h-[44px]">
              <ChevronLeft size={16} aria-hidden="true" /> Tất cả khóa học
            </Link>
            <h1 className="mt-4 text-white">{course.title}</h1>
            <p className="mt-3 text-gold-light font-semibold">Khóa học online · {lessons.length} bài học · truy cập trọn đời</p>
            <p className="mt-5 text-lg text-stone-300 leading-relaxed max-w-xl">
              {course.description || 'Hành trình thực chiến biến chiếc smartphone của bạn thành công cụ tạo ra thu nhập.'}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {enrolled ? (
                <Link href={firstLessonHref} className="btn btn-gold">Tiếp tục học <ArrowRight size={18} aria-hidden="true" /></Link>
              ) : (
                <>
                  <a href="#dang-ky" className="btn btn-gold">Đăng ký khóa học <ArrowRight size={18} aria-hidden="true" /></a>
                  {freeLesson && (
                    <button onClick={() => openLesson(freeLesson)} className="btn btn-outline-light"><Play size={16} aria-hidden="true" /> Học thử miễn phí</button>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="relative aspect-video rounded-[var(--radius-card)] overflow-hidden bg-stone shadow-[var(--shadow-lift)]">
            <Image
              src={course.thumbnail_url || '/asset/hoc_vien/tan.jpg'}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
              unoptimized={!!course.thumbnail_url?.startsWith('http')}
            />
            {freeLesson && !enrolled && (
              <button onClick={() => openLesson(freeLesson)} aria-label="Xem bài học thử" className="absolute inset-0 flex items-center justify-center bg-onyx/30 hover:bg-onyx/40 transition-colors">
                <span className="w-16 h-16 rounded-full bg-gold-light text-onyx flex items-center justify-center shadow-[var(--shadow-lift)]"><Play size={26} fill="currentColor" aria-hidden="true" /></span>
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="container-lux section grid gap-12 lg:grid-cols-[1fr_380px] items-start">
        <div className="space-y-16 min-w-0">
          {/* Outcomes */}
          <section aria-labelledby="outcomes">
            <h2 id="outcomes" className="text-4xl">Bạn sẽ nhận được gì</h2>
            <dl className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {outcomes.map((o) => (
                <div key={o.t}>
                  <dt className="font-display text-2xl font-bold text-ink flex gap-3"><Check size={22} className="text-gold shrink-0 mt-1" aria-hidden="true" />{o.t}</dt>
                  <dd className="mt-1 pl-[34px] text-muted-foreground">{o.d}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Curriculum */}
          <section aria-labelledby="curriculum-title" id="curriculum">
            <h2 id="curriculum-title" className="text-4xl">Lộ trình khóa học</h2>
            <p className="mt-2 text-muted-foreground">{lessons.length} bài học · bài có biểu tượng ▶ xem thử được miễn phí</p>
            <ol className="mt-8 space-y-2">
              {lessons.map((lesson, idx) => {
                const canWatch = lesson.is_free || enrolled;
                return (
                  <li key={lesson.id} className="card flex items-center gap-4 p-4 md:p-5">
                    <span className="font-display text-2xl text-muted-foreground w-8 shrink-0 text-center">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink">{lesson.title}</p>
                      {lesson.is_free && <span className="badge mt-1">Học thử miễn phí</span>}
                    </div>
                    {canWatch ? (
                      <button onClick={() => openLesson(lesson)} aria-label={`Xem bài ${idx + 1}: ${lesson.title}`} className="w-11 h-11 rounded-full bg-onyx text-gold-light flex items-center justify-center hover:bg-ink transition-colors shrink-0">
                        <Play size={16} fill="currentColor" aria-hidden="true" />
                      </button>
                    ) : (
                      <span className="w-11 h-11 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0" aria-label="Bài học bị khóa">
                        <Lock size={16} aria-hidden="true" />
                      </span>
                    )}
                  </li>
                );
              })}
              {lessons.length === 0 && <li className="card p-6 text-muted-foreground">Nội dung đang được cập nhật.</li>}
            </ol>
          </section>
        </div>

        {/* Pricing card */}
        <aside id="dang-ky" className="lg:sticky lg:top-24 scroll-mt-24">
          <div className="card p-6 md:p-8 shadow-[var(--shadow-lift)]">
            {enrolled ? (
              <>
                <p className="eyebrow">Bạn đã sở hữu khóa học</p>
                <p className="mt-3 text-muted-foreground">Tiếp tục từ bài học đầu tiên hoặc chọn bài trong lộ trình.</p>
                <Link href={firstLessonHref} className="btn btn-gold w-full mt-6">Vào học <ArrowRight size={18} aria-hidden="true" /></Link>
              </>
            ) : (
              <>
                <p className="eyebrow">Học phí trọn gói</p>
                <div className="mt-3 flex items-baseline gap-3 flex-wrap">
                  <p className="font-display text-5xl font-bold">{formatVND(finalPrice)}</p>
                  {(appliedDiscount > 0 || Number(course.old_price) > price) && (
                    <p className="text-muted-foreground line-through">{formatVND(appliedDiscount > 0 ? price : course.old_price)}</p>
                  )}
                </div>

                <form onSubmit={handleApplyPromo} className="mt-6" noValidate>
                  <label htmlFor="promo" className="field-label">Mã giảm giá</label>
                  <div className="flex gap-2">
                    <input
                      id="promo"
                      className="input uppercase"
                      value={promoCode}
                      onChange={(e) => { setPromoCode(e.target.value); setPromoStatus(null); }}
                      placeholder="Nhập mã"
                      autoComplete="off"
                      aria-describedby="promo-status"
                    />
                    <button type="submit" className="btn btn-outline shrink-0" disabled={!promoCode.trim()}>Áp dụng</button>
                  </div>
                  <p id="promo-status" role="status" className={`mt-2 text-sm min-h-[1.25rem] ${promoStatus?.type === 'error' ? 'text-danger' : 'text-success'}`}>
                    {promoStatus?.text}
                  </p>
                </form>

                <button onClick={handlePayment} disabled={paymentLoading} className="btn btn-gold w-full mt-2">
                  {paymentLoading ? <><Loader2 className="animate-spin" size={18} aria-hidden="true" /> Đang chuyển tới VNPay…</> : <>{user ? 'Thanh toán qua VNPay' : 'Đăng nhập để đăng ký'} <ArrowRight size={18} aria-hidden="true" /></>}
                </button>
                {payError && <p role="alert" className="mt-3 text-sm text-danger">{payError}</p>}

                <ul className="mt-8 space-y-3">
                  {guarantees.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-3 text-sm text-stone"><Icon size={18} className="text-gold shrink-0" aria-hidden="true" /> {text}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </aside>
      </div>

      {/* Free preview modal */}
      {selectedLesson && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={selectedLesson.title}>
          <div className="absolute inset-0 bg-onyx/90" onClick={() => setSelectedLesson(null)} aria-hidden="true" />
          <div className="relative w-full max-w-4xl animate-fade-up">
            <div className="flex items-center justify-between gap-4 mb-3">
              <p className="text-white font-semibold truncate">{selectedLesson.title}</p>
              <button onClick={() => setSelectedLesson(null)} autoFocus className="w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 shrink-0" aria-label="Đóng video">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="aspect-video rounded-[var(--radius-card)] overflow-hidden bg-black">
              <iframe src={toEmbedUrl(selectedLesson.video_url)} title={selectedLesson.title} className="w-full h-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// Converts YouTube watch/short links into embeddable URLs
function toEmbedUrl(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}
