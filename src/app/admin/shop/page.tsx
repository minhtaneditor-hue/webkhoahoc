'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ShoppingBag, 
  Loader2, 
  ChevronLeft,
  Search,
  Tag,
  Download,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminShopPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    thumbnail_url: '',
    download_url: '',
    category: 'preset'
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  async function fetchAssets() {
    setLoading(true);
    const { data } = await supabase.from('digital_assets').select('*').order('created_at', { ascending: false });
    setAssets(data || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await supabase.from('digital_assets').update(formData).eq('id', editingId);
    } else {
      await supabase.from('digital_assets').insert([formData]);
    }
    setShowModal(false);
    setEditingId(null);
    setFormData({ title: '', description: '', price: 0, thumbnail_url: '', download_url: '', category: 'preset' });
    fetchAssets();
  }

  async function deleteAsset(id: string) {
    if (!confirm('Abort this digital asset from the forge?')) return;
    await supabase.from('digital_assets').delete().eq('id', id);
    fetchAssets();
  }

  const openEdit = (asset: any) => {
    setEditingId(asset.id);
    setFormData({
      title: asset.title,
      description: asset.description,
      price: asset.price,
      thumbnail_url: asset.thumbnail_url,
      download_url: asset.download_url,
      category: asset.category
    });
    setShowModal(true);
  };

  return (
    <main className="min-h-screen bg-[#050507] text-white p-12">
      <header className="max-w-7xl mx-auto flex justify-between items-end mb-16">
        <div>
           <Link href="/admin" className="text-[10px] font-black text-text-muted hover:text-accent-secondary uppercase tracking-[0.3em] flex items-center gap-2 mb-4 transition-colors">
              <ChevronLeft size={14} /> Back to Command
           </Link>
           <h1 className="text-5xl font-black italic tracking-tighter">ASSET <span className="text-accent-secondary">FORGE</span></h1>
           <p className="text-text-muted text-sm uppercase tracking-widest mt-2">Digital Marketplace Inventory</p>
        </div>
        
        <button 
          onClick={() => { setShowModal(true); setEditingId(null); }}
          className="px-8 py-4 rounded-2xl bg-white text-black font-black text-xs tracking-widest hover:bg-accent-secondary hover:text-white transition-all flex items-center gap-3 shadow-xl uppercase shadow-glow-secondary"
        >
          <Plus size={18} /> Deploy Asset
        </button>
      </header>

      <div className="max-w-7xl mx-auto">
        {loading ? (
           <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-accent-secondary" size={40} /></div>
        ) : (
           <div className="grid grid-cols-1 gap-4">
              {assets.map((a) => (
                <div key={a.id} className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 border border-white/10 shrink-0 flex items-center justify-center text-accent-secondary">
                         {a.thumbnail_url ? (
                            <img src={a.thumbnail_url} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all text-xs" alt="p" />
                         ) : (
                            <Sparkles size={24} />
                         )}
                      </div>
                      <div>
                         <h4 className="font-black text-lg group-hover:text-accent-secondary transition-colors italic uppercase">{a.title}</h4>
                         <div className="flex items-center gap-4 mt-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{a.category} Pack</span>
                            <span className="w-1 h-1 bg-white/10 rounded-full" />
                            <span className="text-[10px] font-bold text-accent-secondary">
                               {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(a.price)}
                            </span>
                         </div>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(a)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text-muted hover:bg-accent-secondary hover:text-white transition-all">
                         <Edit3 size={18} />
                      </button>
                      <button onClick={() => deleteAsset(a.id)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text-muted hover:bg-red-500 hover:text-white transition-all">
                         <Trash2 size={18} />
                      </button>
                   </div>
                </div>
              ))}
              {assets.length === 0 && <p className="text-center py-20 text-text-muted uppercase tracking-widest text-xs font-black">Forges are cold. No assets deployed.</p>}
           </div>
        )}
      </div>

      {/* Asset Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowModal(false)} />
           <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-2xl bg-[#0a0a0c] border border-white/10 rounded-[3rem] p-12 shadow-3xl">
              <h2 className="text-3xl font-black mb-8 italic uppercase text-accent-secondary">{editingId ? 'Reforge Asset' : 'New Asset Deployment'}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Asset Title</label>
                       <input 
                         required 
                         className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-accent-secondary text-sm font-medium" 
                         value={formData.title} 
                         onChange={e => setFormData({...formData, title: e.target.value})} 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Category</label>
                       <select 
                         className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-accent-secondary text-sm font-medium"
                         value={formData.category}
                         onChange={e => setFormData({...formData, category: e.target.value})}
                       >
                          <option value="preset" className="bg-black">Lightroom Preset</option>
                          <option value="lut" className="bg-black">Video LUT Pack</option>
                          <option value="template" className="bg-black">VFX Template</option>
                       </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Strategic Description</label>
                    <textarea 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-accent-secondary text-sm font-medium h-24" 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Investment (Price VND)</label>
                       <input 
                         type="number"
                         required
                         className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-accent-secondary text-sm font-medium" 
                         value={formData.price} 
                         onChange={e => setFormData({...formData, price: parseInt(e.target.value)})} 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Thumbnail Image URL</label>
                       <input 
                         className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-accent-secondary text-sm font-medium" 
                         value={formData.thumbnail_url} 
                         onChange={e => setFormData({...formData, thumbnail_url: e.target.value})} 
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Download URL (Secure Link)</label>
                    <div className="relative">
                       <Download className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                       <input 
                         required
                         placeholder="Google Drive / Dropbox link"
                         className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-accent-secondary text-sm font-medium text-accent-secondary" 
                         value={formData.download_url} 
                         onChange={e => setFormData({...formData, download_url: e.target.value})} 
                       />
                    </div>
                 </div>

                 <div className="flex gap-4 pt-6">
                    <button type="submit" className="flex-1 py-5 rounded-2xl bg-white text-black font-black text-xs tracking-widest hover:bg-accent-secondary hover:text-white transition-all shadow-xl uppercase shadow-glow-secondary">
                       {editingId ? 'Reforge Complete' : 'Deploy Asset'}
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
