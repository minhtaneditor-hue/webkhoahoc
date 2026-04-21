'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Video, 
  Loader2, 
  ChevronLeft,
  Search,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminWorkPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    video_url: '',
    category: 'short-video',
    client_name: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    setProjects(data || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await supabase.from('projects').update(formData).eq('id', editingId);
    } else {
      await supabase.from('projects').insert([formData]);
    }
    setShowModal(false);
    setEditingId(null);
    setFormData({ title: '', description: '', thumbnail_url: '', video_url: '', category: 'short-video', client_name: '' });
    fetchProjects();
  }

  async function deleteProject(id: string) {
    if (!confirm('Confirm neutralization of this project record?')) return;
    await supabase.from('projects').delete().eq('id', id);
    fetchProjects();
  }

  const openEdit = (project: any) => {
    setEditingId(project.id);
    setFormData({
      title: project.title,
      description: project.description,
      thumbnail_url: project.thumbnail_url,
      video_url: project.video_url,
      category: project.category,
      client_name: project.client_name
    });
    setShowModal(true);
  };

  return (
    <main className="min-h-screen bg-[#050507] text-white p-12">
      <header className="max-w-7xl mx-auto flex justify-between items-end mb-16">
        <div>
           <Link href="/admin" className="text-[10px] font-black text-text-muted hover:text-accent-primary uppercase tracking-[0.3em] flex items-center gap-2 mb-4 transition-colors">
              <ChevronLeft size={14} /> Back to Command
           </Link>
           <h1 className="text-5xl font-black italic tracking-tighter">PORTFOLIO <span className="text-accent-primary">MASTER</span></h1>
           <p className="text-text-muted text-sm uppercase tracking-widest mt-2">Managing Production Showcases</p>
        </div>
        
        <button 
          onClick={() => { setShowModal(true); setEditingId(null); }}
          className="px-8 py-4 rounded-2xl bg-white text-black font-black text-xs tracking-widest hover:bg-accent-primary hover:text-white transition-all flex items-center gap-3 shadow-xl"
        >
          <Plus size={18} /> NEW PROJECT
        </button>
      </header>

      <div className="max-w-7xl mx-auto">
        {loading ? (
           <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-accent-primary" size={40} /></div>
        ) : (
           <div className="grid grid-cols-1 gap-4">
              {projects.map((p) => (
                <div key={p.id} className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                   <div className="flex items-center gap-6">
                      <div className="w-20 aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
                         <img src={p.thumbnail_url} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                      </div>
                      <div>
                         <h4 className="font-black text-lg group-hover:text-accent-primary transition-colors italic">{p.title}</h4>
                         <div className="flex items-center gap-4 mt-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{p.category}</span>
                            <span className="w-1 h-1 bg-white/10 rounded-full" />
                            <span className="text-[10px] font-bold text-white/30 italic">Target: {p.client_name || 'Personal'}</span>
                         </div>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text-muted hover:bg-accent-primary hover:text-white transition-all">
                         <Edit3 size={18} />
                      </button>
                      <button onClick={() => deleteProject(p.id)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text-muted hover:bg-red-500 hover:text-white transition-all">
                         <Trash2 size={18} />
                      </button>
                   </div>
                </div>
              ))}
              {projects.length === 0 && <p className="text-center py-20 text-text-muted uppercase tracking-widest text-xs font-black">Zero missions recorded.</p>}
           </div>
        )}
      </div>

      {/* Management Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowModal(false)} />
           <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-2xl bg-[#0a0a0c] border border-white/10 rounded-[3rem] p-12 shadow-3xl">
              <h2 className="text-3xl font-black mb-8 italic uppercase">{editingId ? 'Edit Project' : 'Deploy New Project'}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Project Title</label>
                       <input 
                         required 
                         className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-accent-primary text-sm font-medium" 
                         value={formData.title} 
                         onChange={e => setFormData({...formData, title: e.target.value})} 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Category</label>
                       <select 
                         className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-accent-primary text-sm font-medium"
                         value={formData.category}
                         onChange={e => setFormData({...formData, category: e.target.value})}
                       >
                          <option value="short-video" className="bg-black">Short Video</option>
                          <option value="cinematic" className="bg-black">Cinematic</option>
                          <option value="brand" className="bg-black">Brand TVC</option>
                       </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Description (Strategic Objective)</label>
                    <textarea 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-accent-primary text-sm font-medium h-24" 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Thumbnail URL</label>
                       <input 
                         className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-accent-primary text-sm font-medium" 
                         value={formData.thumbnail_url} 
                         onChange={e => setFormData({...formData, thumbnail_url: e.target.value})} 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Video URL (YT/Vimeo)</label>
                       <input 
                         required
                         className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-accent-primary text-sm font-medium" 
                         value={formData.video_url} 
                         onChange={e => setFormData({...formData, video_url: e.target.value})} 
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Client / Brand Partner</label>
                    <input 
                      placeholder="e.g. Sony, Honda, Personal"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-accent-primary text-sm font-medium" 
                      value={formData.client_name} 
                      onChange={e => setFormData({...formData, client_name: e.target.value})} 
                    />
                 </div>

                 <div className="flex gap-4 pt-6">
                    <button type="submit" className="flex-1 py-5 rounded-2xl bg-white text-black font-black text-xs tracking-widest hover:bg-accent-primary hover:text-white transition-all shadow-xl uppercase">
                       {editingId ? 'Push Update' : 'Initialize Project'}
                    </button>
                    <button type="button" onClick={() => setShowModal(false)} className="px-8 py-5 rounded-2xl bg-white/5 font-black text-xs tracking-widest uppercase">
                       Abort
                    </button>
                 </div>
              </form>
           </motion.div>
        </div>
      )}
    </main>
  );
}
