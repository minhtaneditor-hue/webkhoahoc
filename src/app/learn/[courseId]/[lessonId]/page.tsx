'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useParams, useRouter } from 'next/navigation';
import { 
  Play, 
  CheckCircle2, 
  Circle, 
  ChevronLeft, 
  Loader2, 
  Menu,
  X,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function LearningPortal() {
  const { courseId, lessonId } = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [progress, setProgress] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    async function init() {
      if (!courseId) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/auth?redirect=/learn/${courseId}/${lessonId}`);
        return;
      }

      // Fetch course & lessons
      const { data: courseData } = await supabase.from('courses').select('*').eq('id', courseId).single();
      const { data: lessonsData } = await supabase.from('lessons').select('*').eq('course_id', courseId).order('order', { ascending: true });
      
      // Fetch progress
      const { data: progressData } = await supabase.from('lesson_progress').select('lesson_id').eq('user_id', user.id).eq('course_id', courseId);
      
      setCourse(courseData);
      setLessons(lessonsData || []);
      setProgress(progressData?.map(p => p.lesson_id) || []);

      if (lessonId && lessonsData) {
        setCurrentLesson(lessonsData.find(l => l.id === lessonId));
      } else if (lessonsData && lessonsData.length > 0) {
        setCurrentLesson(lessonsData[0]);
      }
      
      setLoading(false);
    }
    init();
  }, [courseId, lessonId]);

  async function toggleComplete(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (progress.includes(id)) {
      await supabase.from('lesson_progress').delete().eq('user_id', user.id).eq('lesson_id', id);
      setProgress(prev => prev.filter(p => p !== id));
    } else {
      await supabase.from('lesson_progress').insert({ user_id: user.id, course_id: courseId, lesson_id: id });
      setProgress(prev => [...prev, id]);
    }
  }

  async function handleNext() {
    const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
    if (!progress.includes(currentLesson.id)) {
      await toggleComplete(currentLesson.id);
    }
    
    if (currentIndex < lessons.length - 1) {
      const nextLesson = lessons[currentIndex + 1];
      router.push(`/learn/${courseId}/${nextLesson.id}`);
    } else {
      alert('Chúc mừng! Bạn đã hoàn thành tất cả bài học trong khóa học này.');
    }
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary font-black animate-pulse">ESTABLISHING CONNECTION...</div>;

  return (
    <div className="min-h-screen bg-[#050507] text-white flex overflow-hidden">
      {/* Sidebar: Curriculum Control */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside 
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            className="w-80 h-screen border-r border-white/5 bg-[#08080a] flex flex-col shrink-0 z-50 fixed lg:relative"
          >
            <div className="p-8 border-bottom border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-1">Curriculum</h2>
                <p className="text-[10px] text-text-muted font-bold truncate max-w-[180px]">{course?.title}</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-text-muted"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
              <div className="space-y-2">
                {lessons.map((lesson, idx) => {
                  const isActive = currentLesson?.id === lesson.id;
                  const isCompleted = progress.includes(lesson.id);
                  
                  return (
                    <button 
                      key={lesson.id}
                      onClick={() => router.push(`/learn/${courseId}/${lesson.id}`)}
                      className={`w-full flex items-start gap-4 p-5 rounded-[2rem] text-left transition-all group ${
                        isActive ? 'bg-primary/10 border border-primary/20 text-primary' : 'hover:bg-white/5 text-text-muted'
                      }`}
                    >
                      <div className="mt-1">
                        {isCompleted ? <CheckCircle2 size={18} className="text-green-500" /> : <Circle size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[11px] font-black uppercase tracking-widest leading-tight ${isActive ? 'text-primary' : 'group-hover:text-white'}`}>
                          {idx + 1}. {lesson.title}
                        </p>
                        <p className="text-[9px] mt-1 opacity-40 font-bold">VIDEO LESSON</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="p-6 border-t border-white/5">
               <div className="bg-white/5 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Progress</span>
                     <span className="text-[10px] font-black text-primary">{Math.round((progress.length / lessons.length) * 100) || 0}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-primary transition-all duration-1000" 
                        style={{ width: `${(progress.length / lessons.length) * 100}%` }}
                     />
                  </div>
               </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Learning Hub */}
      <main className="flex-1 h-screen overflow-y-auto relative custom-scrollbar flex flex-col">
        {/* Top Navbar */}
        <header className="p-6 flex items-center justify-between border-b border-white/5 bg-[#050507]/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-3 bg-white/5 border border-white/10 rounded-xl text-primary hover:bg-primary hover:text-white transition-all shadow-lg"
              >
                <Menu size={20} />
              </button>
            )}
            <Link href={`/courses/${courseId}`} className="text-text-muted hover:text-white transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-widest">
              <ChevronLeft size={16} /> Course Details
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
             <div className="text-right">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Mentoring</p>
                <p className="text-xs font-bold text-accent-secondary">Minh Tân Academy</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-accent-secondary/20 flex items-center justify-center text-accent-secondary">M</div>
          </div>
        </header>

        {/* Cinematic Content Section */}
        <div className="p-6 lg:p-12 max-w-6xl mx-auto w-full flex-1">
          {currentLesson ? (
            <div className="space-y-10">
              {/* Video Player */}
              <div className="relative group/player rounded-[3rem] overflow-hidden border border-white/10 bg-black aspect-video shadow-2xl">
                 {currentLesson.video_url ? (
                    <iframe 
                      src={currentLesson.video_url.includes('youtube') ? currentLesson.video_url.replace('watch?v=', 'embed/') : currentLesson.video_url}
                      className="w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                 ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-zinc-950">
                       <Play size={60} className="text-primary/20 animate-pulse" />
                       <p className="text-xs font-black uppercase tracking-widest text-text-muted">Preparing Tactical Feed...</p>
                    </div>
                 )}
              </div>

              {/* Lesson Headers */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/5">
                 <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-6 border border-primary/20">
                       <Play size={10} /> Active Feed
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 italic">{currentLesson.title}</h1>
                    <p className="text-text-muted font-medium max-w-2xl leading-relaxed">
                       {currentLesson.content || "Chào mừng bạn đến với mô-đun thực chiến này. Hãy tập trung và áp dụng ngay kiến thức vào dự án của mình."}
                    </p>
                 </div>
                 
                 <div className="flex flex-row md:flex-col gap-4">
                    <button 
                      onClick={() => toggleComplete(currentLesson.id)}
                      className={`px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border ${
                        progress.includes(currentLesson.id) 
                        ? 'bg-green-500/10 border-green-500/40 text-green-500' 
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                      }`}
                    >
                      {progress.includes(currentLesson.id) ? 'ĐÃ HOÀN THÀNH' : 'ĐÁNH DẤU XONG'}
                    </button>

                    <button 
                      onClick={handleNext}
                      className="px-8 py-4 rounded-2xl bg-primary text-white font-black text-[11px] uppercase tracking-widest flex items-center gap-3 hover:translate-x-1 transition-all shadow-[0_0_20px_rgba(227,38,54,0.3)]"
                    >
                      BÀI TIẾP THEO <ArrowRight size={16} />
                    </button>
                 </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p className="font-black uppercase tracking-widest text-sm">Synchronizing Stream...</p>
            </div>
          )}
        </div>

        {/* Global Action Footer */}
        <footer className="p-8 border-t border-white/5 bg-[#050507]/40 flex justify-between items-center">
           <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-text-muted">
              © 2026 AI-LMS PORTAL // TERMINAL SECURED
           </div>
           <div className="flex items-center gap-8">
              <button onClick={() => router.back()} className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors flex items-center gap-2">
                 <ArrowLeft size={14} /> Back
              </button>
              <div className="h-4 w-px bg-white/5" />
              <div className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">System Live</div>
           </div>
        </footer>
      </main>
    </div>
  );
}
