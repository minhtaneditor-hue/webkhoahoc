'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { 
  Play, 
  ChevronRight, 
  Loader2, 
  ExternalLink,
  Video,
  Layers,
  X,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function WorkPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function fetchProjects() {
      const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      setProjects(data || []);
      setLoading(false);
    }
    fetchProjects();
  }, []);

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.category === filter);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary font-black animate-pulse">SYNCHRONIZING PORTFOLIO...</div>;

  return (
    <main className="min-h-screen bg-[#050507] text-white pt-40 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 mb-8">
            <Target size={12} className="text-accent-primary" />
            Production Quality // Master of Content
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
             <div className="max-w-2xl">
                <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter italic">DỰ ÁN <span className="text-accent-primary underline-accent">TIÊU BIỂU</span></h1>
                <p className="text-text-muted text-xl font-medium leading-relaxed">
                  Tổng hợp những tác phẩm được đầu tư về Storytelling và hình ảnh sắc nét, sản xuất cùng các nhãn hàng hàng đầu.
                </p>
             </div>
             
             {/* Filter Tabs */}
             <div className="flex gap-4 scroll-hide overflow-x-auto pb-4">
                {['all', 'short-video', 'cinematic', 'brand'].map((f) => (
                  <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                       filter === f ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, i) => (
            <motion.div 
              key={project.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="group relative bg-[#0a0a0c] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-accent-primary/40 transition-all duration-700 cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              <div className="aspect-[16/10] overflow-hidden relative">
                <img 
                  src={project.thumbnail_url || "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800"} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110 grayscale-50 group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                   <div className="w-16 h-16 rounded-full bg-accent-primary/20 backdrop-blur-xl border border-accent-primary/30 flex items-center justify-center text-accent-primary transform scale-50 group-hover:scale-100 transition-transform duration-500">
                      <Play size={30} fill="currentColor" />
                   </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-[10px] font-black text-accent-primary uppercase tracking-widest">{project.category}</span>
                   <span className="text-[10px] font-bold text-text-muted">{project.client_name || 'Personal Project'}</span>
                </div>
                <h3 className="text-2xl font-black tracking-tight group-hover:text-accent-primary transition-colors">
                  {project.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>

        {projects.length === 0 && !loading && (
          <div className="py-20 text-center">
             <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-white/20">
                <Layers size={40} />
             </div>
             <p className="text-text-muted uppercase tracking-widest font-black text-sm">Portfolio currently under maintenance</p>
          </div>
        )}
      </div>

      {/* Cinematic Modal Player */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/95 backdrop-blur-3xl" 
               onClick={() => setSelectedProject(null)} 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-6xl bg-[#0a0a0c] rounded-[3rem] overflow-hidden border border-white/10 shadow-3xl"
            >
              <button 
                onClick={() => setSelectedProject(null)} 
                className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-accent-primary transition-all shadow-xl"
              >
                <X size={24} />
              </button>
              
              <div className="grid grid-cols-1 lg:grid-cols-4">
                 <div className="lg:col-span-3 aspect-video bg-black">
                    {selectedProject.video_url ? (
                        <iframe 
                          src={selectedProject.video_url.includes('youtube') ? selectedProject.video_url.replace('watch?v=', 'embed/') : selectedProject.video_url}
                          className="w-full h-full"
                          allowFullScreen
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center text-text-muted font-black uppercase text-xs tracking-widest animate-pulse">Initializing Stream...</div>
                    )}
                 </div>
                 <div className="p-10 flex flex-col justify-between">
                    <div>
                       <span className="text-[10px] font-black text-accent-primary uppercase tracking-[0.2em] mb-4 inline-block">Project Insight</span>
                       <h2 className="text-4xl font-black tracking-tighter mb-6 italic">{selectedProject.title}</h2>
                       <p className="text-sm text-text-muted leading-relaxed font-medium">
                          {selectedProject.description || "Một tác phẩm tập trung vào tính thẩm mỹ và thông điệp cốt lõi của nhãn hàng."}
                       </p>
                    </div>
                    
                    <div className="pt-10 border-t border-white/5 space-y-6">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-primary">
                             <ExternalLink size={14} />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Client: {selectedProject.client_name || 'Internal'}</p>
                       </div>
                       <Link href="/courses" onClick={() => setSelectedProject(null)} className="w-full py-4 rounded-2xl bg-white text-black text-center font-black text-[10px] uppercase tracking-widest hover:bg-accent-primary hover:text-white transition-all block shadow-lg">
                          Learn the Tech &rarr;
                       </Link>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
