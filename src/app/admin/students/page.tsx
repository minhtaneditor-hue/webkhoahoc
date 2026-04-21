'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { 
  Users, 
  Plus, 
  Trash2, 
  Save, 
  Image as ImageIcon,
  ExternalLink,
  Loader2,
  Award,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    story: '',
    avatar_url: '',
    project_link: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    setLoading(true);
    const { data } = await supabase.from('students').select('*').order('created_at', { ascending: false });
    setStudents(data || []);
    setLoading(false);
  }

  async function handleSave() {
    if (!formData.name) return alert('Vui lòng nhập tên học viên');
    
    setLoading(true);
    if (editingId) {
      await supabase.from('students').update(formData).eq('id', editingId);
    } else {
      await supabase.from('students').insert([formData]);
    }
    
    setFormData({ name: '', story: '', avatar_url: '', project_link: '' });
    setIsAdding(false);
    setEditingId(null);
    fetchStudents();
  }

  async function handleDelete(id: string) {
    if (!confirm('Bạn có chắc muốn xóa học viên này khỏi Hall of Fame?')) return;
    setLoading(true);
    await supabase.from('students').delete().eq('id', id);
    fetchStudents();
  }

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto pb-40">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 text-accent-primary text-[10px] font-black uppercase tracking-widest mb-4 border border-accent-primary/20">
            <Award size={12} /> Student Excellence Management
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Học Viên <span className="text-accent-primary">Tiêu Biểu</span></h1>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ name: '', story: '', avatar_url: '', project_link: '' }); }}
          className="px-8 py-4 rounded-2xl bg-accent-primary text-white font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:shadow-[0_0_30px_rgba(227,38,54,0.3)] transition-all"
        >
          <Plus size={18} /> Thêm Học Viên
        </button>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
         <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
            <input 
              type="text"
              placeholder="Tìm kiếm học viên..."
              className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm focus:border-accent-primary transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-around">
            <div className="text-center">
               <p className="text-2xl font-black italic">{students.length}</p>
               <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Học viên</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
               <p className="text-2xl font-black italic text-accent-primary">{students.filter(s => s.project_link).length}</p>
               <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Dự án</p>
            </div>
         </div>
      </div>

      {/* Entry Form */}
      <AnimatePresence>
        {(isAdding || editingId) && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-12 p-8 rounded-3xl bg-white/[0.03] border border-white/10"
          >
            <h3 className="text-xl font-black uppercase italic mb-8 flex items-center gap-3">
               {editingId ? 'Chỉnh sửa Profile' : 'Đăng ký Hall of Fame'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase text-white/40 tracking-widest block mb-2">Tên học viên</label>
                    <input 
                      className="w-full px-6 py-4 bg-black border border-white/10 rounded-xl text-sm focus:border-accent-primary outline-none"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-white/40 tracking-widest block mb-2">Link ảnh đại diện (URL)</label>
                    <input 
                      className="w-full px-6 py-4 bg-black border border-white/10 rounded-xl text-sm focus:border-accent-primary outline-none placeholder:text-white/5"
                      placeholder="https://..."
                      value={formData.avatar_url}
                      onChange={e => setFormData({...formData, avatar_url: e.target.value})}
                    />
                  </div>
               </div>
               <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase text-white/40 tracking-widest block mb-2">Câu chuyện thành công (Story)</label>
                    <textarea 
                      className="w-full px-6 py-4 bg-black border border-white/10 rounded-xl text-sm focus:border-accent-primary outline-none h-32"
                      value={formData.story}
                      onChange={e => setFormData({...formData, story: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-white/40 tracking-widest block mb-2">Link dự án tiêu biểu (URL)</label>
                    <input 
                      className="w-full px-6 py-4 bg-black border border-white/10 rounded-xl text-sm focus:border-accent-primary outline-none placeholder:text-white/5"
                      placeholder="https://youtube.com/..."
                      value={formData.project_link}
                      onChange={e => setFormData({...formData, project_link: e.target.value})}
                    />
                  </div>
               </div>
            </div>
            <div className="flex justify-end gap-4 mt-10 pt-8 border-t border-white/5">
               <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-6 py-3 text-[10px] font-black uppercase text-white/40 hover:text-white">Hủy</button>
               <button onClick={handleSave} className="px-10 py-4 rounded-xl bg-white text-black font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                  <Save size={16} /> Lưu Thông Tin
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredStudents.map(student => (
          <div key={student.id} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
             <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white/5 overflow-hidden flex items-center justify-center text-white/10">
                   {student.avatar_url ? <img src={student.avatar_url} className="w-full h-full object-cover" /> : <Users size={24} />}
                </div>
                <div>
                   <h4 className="font-black italic uppercase text-lg group-hover:text-accent-primary transition-colors">{student.name}</h4>
                   <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{student.project_link ? 'Has Project' : 'No Project'}</p>
                </div>
             </div>
             <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => { setEditingId(student.id); setFormData({ name: student.name, story: student.story, avatar_url: student.avatar_url, project_link: student.project_link }); setIsAdding(false); }}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
                >
                   <Save size={16} className="text-white/40" />
                </button>
                <button 
                  onClick={() => handleDelete(student.id)}
                  className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center hover:bg-accent-primary/20 transition-all"
                >
                   <Trash2 size={16} className="text-accent-primary" />
                </button>
             </div>
          </div>
        ))}
      </div>

      {students.length === 0 && !loading && (
        <div className="py-40 text-center text-white/10">
           <Award size={64} className="mx-auto mb-6 opacity-5" />
           <p className="text-[10px] font-black uppercase tracking-[0.4em]">Hall of Fame currently empty</p>
        </div>
      )}
    </div>
  );
}
