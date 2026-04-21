'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAdmin } from '@/lib/admin';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isAdmin(user.email)) {
        router.push('/auth');
        return;
      }
      fetchData();
    }
    checkAuth();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: coursesData } = await supabase.from('courses').select('*');
    setCourses(coursesData || []);
    if (coursesData && coursesData.length > 0 && !selectedCourse) {
      setSelectedCourse(coursesData[0]);
      fetchLessons(coursesData[0].id);
    }
    setLoading(false);
  }

  async function fetchLessons(courseId: string) {
    const { data } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order', { ascending: true });
    setLessons(data || []);
  }

  async function handleUpdateCourse(updates: any) {
    if (!selectedCourse) return;
    await supabase.from('courses').update(updates).eq('id', selectedCourse.id);
    fetchData();
  }

  async function handleUpdateLesson(lessonId: string, updates: any) {
    await supabase.from('lessons').update(updates).eq('id', lessonId);
    fetchLessons(selectedCourse.id);
  }

  async function handleDeleteLesson(lessonId: string) {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    await supabase.from('lessons').delete().eq('id', lessonId);
    fetchLessons(selectedCourse.id);
  }

  async function handleAddLesson() {
    const title = prompt('Enter lesson title:');
    if (!title) return;
    const { data } = await supabase.from('lessons').insert({
      course_id: selectedCourse.id,
      title,
      content: 'New lesson content...',
      order: lessons.length + 1,
      is_free: false
    }).select().single();
    if (data) fetchLessons(selectedCourse.id);
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary font-black animate-pulse">BOOTING COURSE CONSOLE...</div>;

  return (
    <div className="min-h-screen bg-[#050507] text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <Link href="/admin" className="text-primary text-xs font-black uppercase tracking-widest mb-2 block opacity-60 hover:opacity-100 transition-opacity">← Back to CRM</Link>
            <h1 className="text-5xl font-black tracking-tighter">CONTENT MASTER</h1>
          </div>
          <div className="flex gap-4">
             <button onClick={fetchData} className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all">REFRESH</button>
             <button onClick={() => alert('Feature coming soon: Multi-course management')} className="px-6 py-3 rounded-2xl bg-primary text-white text-sm font-bold hover:shadow-[0_0_20px_rgba(227,38,54,0.4)] transition-all">NEW COURSE</button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Side Nav: Courses */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-4">Target Course</h3>
            <div className="space-y-3">
              {courses.map(course => (
                <button 
                  key={course.id}
                  onClick={() => { setSelectedCourse(course); fetchLessons(course.id); }}
                  className={`w-full p-6 rounded-3xl text-left border transition-all ${
                    selectedCourse?.id === course.id 
                    ? 'bg-primary border-primary shadow-[0_0_30px_rgba(227,38,54,0.3)]' 
                    : 'bg-white/[0.02] border-white/10 hover:border-white/30'
                  }`}
                >
                  <h4 className="font-bold truncate text-sm">{course.title}</h4>
                  <p className="text-[10px] opacity-40 mt-1 uppercase tracking-widest">ID: {course.id.substring(0, 8)}</p>
                </button>
              ))}
            </div>

            {selectedCourse && (
              <div className="pt-8 space-y-6 border-t border-white/5">
                 <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Course Metadata</h3>
                 <div className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-[9px] font-black text-text-muted uppercase">Price (VNĐ)</label>
                       <input 
                         type="number" 
                         className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold focus:border-primary outline-none"
                         defaultValue={selectedCourse.price}
                         onBlur={(e) => handleUpdateCourse({ price: parseInt(e.target.value) })}
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-black text-text-muted uppercase">Thumbnail URL</label>
                       <input 
                         type="text" 
                         className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono outline-none focus:border-primary"
                         defaultValue={selectedCourse.thumbnail_url || ''}
                         placeholder="Image URL..."
                         onBlur={(e) => handleUpdateCourse({ thumbnail_url: e.target.value })}
                       />
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer group">
                       <input 
                         type="checkbox" 
                         className="accent-primary"
                         checked={selectedCourse.is_published}
                         onChange={(e) => handleUpdateCourse({ is_published: e.target.checked })}
                       />
                       <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-primary transition-colors">Visible to Public</span>
                    </label>
                 </div>
              </div>
            )}
          </div>

          {/* Main Console: Lessons */}
          <div className="lg:col-span-3">
             {selectedCourse ? (
               <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 backdrop-blur-xl">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedCourse.title}</h2>
                      <p className="text-text-muted text-sm mt-1">{lessons.length} lessons in curriculum</p>
                    </div>
                    <button onClick={handleAddLesson} className="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-black uppercase tracking-wider hover:bg-primary hover:text-white transition-all">Add Lesson</button>
                  </div>

                  <div className="space-y-4">
                    {lessons.map((lesson, idx) => (
                      <div key={lesson.id} className="p-6 rounded-2xl border border-white/[0.05] bg-black/40 group hover:border-white/20 transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-text-muted">{idx + 1}</span>
                              <input 
                                className="bg-transparent border-b border-transparent focus:border-primary text-lg font-bold outline-none transition-all w-full"
                                defaultValue={lesson.title}
                                onBlur={(e) => handleUpdateLesson(lesson.id, { title: e.target.value })}
                              />
                            </div>
                            <div className="flex items-center gap-6 mt-4">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">Video URL:</span>
                                <input 
                                  className="bg-zinc-900 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono outline-none focus:border-primary w-48 md:w-64"
                                  defaultValue={lesson.video_url || ''}
                                  placeholder="Embed URL..."
                                  onBlur={(e) => handleUpdateLesson(lesson.id, { video_url: e.target.value })}
                                />
                              </div>
                              <label className="flex items-center gap-2 cursor-pointer group/label">
                                <input 
                                  type="checkbox" 
                                  className="accent-primary"
                                  checked={lesson.is_free}
                                  onChange={(e) => handleUpdateLesson(lesson.id, { is_free: e.target.checked })}
                                />
                                <span className="text-[10px] font-black uppercase tracking-wider group-hover/label:text-primary transition-colors">Free Lesson</span>
                              </label>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                             <button onClick={() => handleDeleteLesson(lesson.id)} className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                             </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {lessons.length === 0 && (
                      <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
                        <p className="text-text-muted">Curriculum is empty. Click "Add Lesson" to start building.</p>
                      </div>
                    )}
                  </div>
               </div>
             ) : (
               <div className="h-full flex items-center justify-center p-20 border border-white/5 rounded-3xl bg-white/[0.01]">
                 <p className="text-text-muted">Select a course to manage its curriculum.</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
