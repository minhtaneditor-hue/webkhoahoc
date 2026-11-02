'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { groupByChapter, lessonsInOrder, type Chapter } from '@/lib/curriculum';
import { CheckCircle2, Circle, ChevronLeft, Loader2, Menu, X, ArrowRight, Lock, Play, PartyPopper } from 'lucide-react';
import DrmPlayer from '@/components/video/DrmPlayer';
import GuardedYouTube, { youTubeId } from '@/components/video/GuardedYouTube';
import AgreementGate from '@/components/video/AgreementGate';
import { studentCode } from '@/lib/content-agreement';
import LessonText from '@/components/LessonText';
import { isAdmin } from '@/lib/admin';

export default function LearningPortal() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [progress, setProgress] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('STUDENT');
  const [userId, setUserId] = useState('');
  const [hasAccess, setHasAccess] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    async function init() {
      if (!courseId) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/auth?redirect=/learn/${courseId}/${lessonId}`);
        return;
      }
      setUserEmail(user.email || 'STUDENT');
      setUserId(user.id);

      // Outline (all titles) is public; full lesson rows are filtered by RLS to free/enrolled lessons
      const [{ data: courseData }, { data: outline }, { data: enrollment }, { data: chapterData }] = await Promise.all([
        supabase.from('courses').select('id, title').eq('id', courseId).maybeSingle(),
        supabase.from('lesson_outline').select('id, title, order_index, is_free, chapter_id').eq('course_id', courseId).order('order_index', { ascending: true }),
        supabase.from('enrollments').select('status').eq('user_id', user.id).eq('course_id', courseId).eq('status', 'active').maybeSingle(),
        supabase.from('chapters').select('id, title, order_index').eq('course_id', courseId).order('order_index'),
      ]);
      // Study order: chapter by chapter
      const list = lessonsInOrder(chapterData || [], outline || []);
      setChapters(chapterData || []);
      setCourse(courseData);
      setLessons(list);
      setHasAccess(!!enrollment || isAdmin(user.email));

      const targetId = lessonId && list.some((l) => l.id === lessonId) ? lessonId : list[0]?.id;
      if (targetId) {
        const { data: full } = await supabase.from('lessons').select('*').eq('id', targetId).maybeSingle();
        const lesson = full || list.find((l) => l.id === targetId);
        setCurrentLesson(lesson);

      }

      const ids = list.map((l) => l.id);
      if (ids.length) {
        const { data: progressData } = await supabase.from('student_progress').select('lesson_id').eq('user_id', user.id).eq('is_completed', true).in('lesson_id', ids);
        setProgress(progressData?.map((p) => p.lesson_id) || []);
      }

      setLoading(false);
    }
    init();
  }, [courseId, lessonId, router]);

  async function toggleComplete(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const isCompleted = !progress.includes(id);
    const { error } = await supabase
      .from('student_progress')
      .upsert({ user_id: user.id, lesson_id: id, is_completed: isCompleted, last_watched_at: new Date().toISOString() }, { onConflict: 'user_id,lesson_id' });
    if (error) return;
    setProgress((prev) => (isCompleted ? [...prev, id] : prev.filter((p) => p !== id)));
  }

  async function handleNext() {
    const currentIndex = lessons.findIndex((l) => l.id === currentLesson.id);
    if (!progress.includes(currentLesson.id)) await toggleComplete(currentLesson.id);
    if (currentIndex < lessons.length - 1) router.push(`/learn/${courseId}/${lessons[currentIndex + 1].id}`);
    else setFinished(true);
  }

  if (loading) {
    return (
      <main className="min-h-screen surface-dark flex items-center justify-center gap-3 text-stone-400" aria-busy="true">
        <Loader2 className="animate-spin" size={20} aria-hidden="true" /> Đang tải bài học…
      </main>
    );
  }

  const percent = lessons.length ? Math.round((progress.length / lessons.length) * 100) : 0;
  const canWatch = currentLesson && (hasAccess || currentLesson.is_free);
  const currentIndex = lessons.findIndex((l) => l.id === currentLesson?.id);

  const Curriculum = (
    <nav aria-label="Danh sách bài học" className="flex flex-col h-full">
      <div className="p-5 border-b border-white/10">
        <p className="font-semibold text-gold-light">Lộ trình</p>
        <p className="mt-1 font-display text-xl text-white leading-snug">{course?.title}</p>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-stone-400 mb-2"><span>Tiến độ</span><span className="text-gold-light font-semibold">{percent}%</span></div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Tiến độ khóa học">
            <div className="h-full bg-gold-light transition-[width] duration-500" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
      {groupByChapter(chapters, lessons).map((g) => (
      <div key={g.chapter?.id || 'loose'}>
        {chapters.length > 0 && <p className="px-3 pb-1 text-xs font-bold uppercase tracking-wide text-gold-light">{g.chapter ? g.chapter.title : 'Bài học thêm'}</p>}
      <ol className="space-y-1">
        {g.lessons.map((lesson) => {
          const idx = lessons.indexOf(lesson);
          const active = currentLesson?.id === lesson.id;
          const done = progress.includes(lesson.id);
          const locked = !hasAccess && !lesson.is_free;
          return (
            <li key={lesson.id}>
              <Link
                href={`/learn/${courseId}/${lesson.id}`}
                aria-current={active ? 'page' : undefined}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-start gap-3 p-3 rounded-md transition-colors ${active ? 'bg-white/10 text-white' : 'text-stone-300 hover:bg-white/5 hover:text-white'}`}
              >
                <span className="mt-0.5 shrink-0" aria-hidden="true">
                  {done ? <CheckCircle2 size={18} className="text-gold-light" /> : locked ? <Lock size={16} className="text-stone-500" /> : <Circle size={18} className="text-stone-500" />}
                </span>
                <span className="text-sm leading-snug"><span className="text-stone-500 mr-1">{idx + 1}.</span>{lesson.title}</span>
              </Link>
            </li>
          );
        })}
      </ol>
      </div>
      ))}
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen surface-dark flex">
      {/* Confidentiality commitment: must be ticked once before any lesson plays */}
      {userId && <AgreementGate userId={userId} code={studentCode(userId)} email={userEmail}>{null}</AgreementGate>}
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-80 shrink-0 border-r border-white/10 h-screen sticky top-0 flex-col bg-[#141210]">{Curriculum}</aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Danh sách bài học">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
          <aside className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-[#141210] flex flex-col animate-fade-up">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center text-stone-300" aria-label="Đóng danh sách">
              <X size={20} aria-hidden="true" />
            </button>
            {Curriculum}
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 px-4 md:px-8 flex items-center justify-between gap-4 border-b border-white/10 sticky top-0 z-40 bg-onyx/95 backdrop-blur">
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-11 h-11 -ml-2 flex items-center justify-center rounded-md text-stone-300 hover:bg-white/10" aria-label="Mở danh sách bài học">
              <Menu size={20} aria-hidden="true" />
            </button>
            <Link href={`/courses/${courseId}`} className="flex items-center gap-1 text-sm text-stone-300 hover:text-white min-h-[44px] truncate">
              <ChevronLeft size={16} aria-hidden="true" /> <span className="truncate">{course?.title || 'Khóa học'}</span>
            </Link>
          </div>
          <Link href="/dashboard" className="text-sm text-gold-light hover:underline underline-offset-4 shrink-0 min-h-[44px] flex items-center">Khu học tập</Link>
        </header>

        <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10 flex-1">
          {!currentLesson ? (
            <p className="text-stone-400">Khóa học chưa có bài học.</p>
          ) : (
            <>
              {/* Text lessons (no video, has content) skip the player box and read like an article */}
              {(!canWatch || currentLesson.video_url || !currentLesson.content) && (
              <div className="relative aspect-video rounded-[var(--radius-card)] overflow-hidden bg-black border border-white/10">
                {!canWatch ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-center px-6">
                    <Lock size={32} className="text-gold-light" aria-hidden="true" />
                    <p className="text-lg text-white">Bài học này dành cho học viên đã đăng ký</p>
                    <Link href={`/courses/${courseId}#dang-ky`} className="btn btn-gold">Đăng ký khóa học</Link>
                  </div>
                ) : currentLesson.video_url?.includes('drm:') ? (
                  <DrmPlayer key={currentLesson.id} videoId={currentLesson.video_url.split('drm:')[1].trim()} title={currentLesson.title} watermark={`${studentCode(userId)} · ${userEmail}`} />
                ) : currentLesson.video_url ? (
                  youTubeId(currentLesson.video_url)
                    ? <GuardedYouTube videoId={youTubeId(currentLesson.video_url)!} title={currentLesson.title} watermark={`${studentCode(userId)} · ${userEmail}`} />
                    : <iframe src={toEmbedUrl(currentLesson.video_url)} title={currentLesson.title} className="w-full h-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-stone-400">
                    <Play size={36} className="text-gold-light/60" aria-hidden="true" />
                    <p>Video bài học đang được cập nhật</p>
                  </div>
                )}
              </div>
              )}

              {finished && (
                <div role="status" className="mt-6 p-5 rounded-md bg-gold-light/10 border border-gold-light/30 flex items-center gap-3 text-white">
                  <PartyPopper size={22} className="text-gold-light shrink-0" aria-hidden="true" />
                  Chúc mừng! Bạn đã hoàn thành tất cả bài học của khóa này.
                </div>
              )}

              <div className="mt-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="min-w-0">
                  <p className="text-sm text-gold-light font-semibold">Bài {currentIndex + 1} / {lessons.length}</p>
                  <h1 className="mt-2 text-3xl md:text-4xl text-white">{currentLesson.title}</h1>
                  {currentLesson.content
                    ? <LessonText text={currentLesson.content} className={`mt-6 max-w-3xl ${currentLesson.video_url ? '' : 'text-base md:text-lg'}`} />
                    : <p className="mt-4 text-stone-300 leading-relaxed max-w-2xl">Hãy tập trung xem hết bài và áp dụng ngay vào dự án của bạn.</p>}
                </div>
                {canWatch && (
                  <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
                    <button onClick={() => toggleComplete(currentLesson.id)} aria-pressed={progress.includes(currentLesson.id)}
                            className={`btn ${progress.includes(currentLesson.id) ? 'bg-gold-light/15 text-gold-light border border-gold-light/40' : 'btn-outline-light'}`}>
                      <CheckCircle2 size={18} aria-hidden="true" /> {progress.includes(currentLesson.id) ? 'Đã hoàn thành' : 'Đánh dấu đã xong'}
                    </button>
                    <button onClick={handleNext} className="btn btn-gold">
                      {currentIndex < lessons.length - 1 ? 'Bài tiếp theo' : 'Hoàn thành khóa'} <ArrowRight size={18} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// Converts YouTube watch/short links into embeddable URLs
function toEmbedUrl(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}
