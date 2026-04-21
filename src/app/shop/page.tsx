'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { 
  ShoppingBag, 
  Download, 
  Sparkles, 
  Zap, 
  Loader2,
  ChevronRight,
  Monitor,
  Image as ImageIcon
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ShopPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    async function fetchAssets() {
      const { data } = await supabase.from('digital_assets').select('*').order('created_at', { ascending: false });
      setAssets(data || []);
      setLoading(false);
    }
    fetchAssets();
  }, []);

  async function handlePurchase(asset: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = `/auth?redirect=/shop`;
      return;
    }

    try {
      const response = await fetch('/api/payment/vnpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: asset.id, // Reusing courseId field for asset ID in simple logic
          amount: asset.price,
          courseTitle: `[ASSET] ${asset.title}`,
          userId: user.id
        })
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
      else alert('Lỗi: ' + data.error);
    } catch (err) {
      alert('Lỗi kết nối thanh toán');
    }
  }

  const filteredAssets = activeCategory === 'all' 
    ? assets 
    : assets.filter(a => a.category === activeCategory);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary font-black animate-pulse uppercase tracking-[0.3em]">Opening the Digital Forge...</div>;

  return (
    <main className="min-h-screen bg-[#050507] text-white pt-40 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20 text-center relative">
          <div className="absolute inset-0 bg-accent-secondary/5 blur-[120px] -z-10" />
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 mb-8">
            <Sparkles size={12} className="text-accent-secondary" />
            Digital Enhancements // Shop v1.0
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter italic">PRESETS & <span className="text-accent-secondary underline-secondary">LUTs</span></h1>
          <p className="max-w-2xl mx-auto text-text-muted text-xl font-medium leading-relaxed">
            Công cụ chỉnh màu chuyên nghiệp giúp bạn đạt được giao diện điện ảnh trong nháy mắt. Sáng tạo nhanh hơn, đẹp hơn.
          </p>

          <div className="flex justify-center gap-6 mt-12 flex-wrap">
             {['all', 'wedding', 'travel', 'vlog', 'cinematic'].map((cat) => (
               <button 
                 key={cat}
                 onClick={() => setActiveCategory(cat)}
                 className={`px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                   activeCategory === cat ? 'bg-accent-secondary text-white border-accent-secondary' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                 }`}
               >
                 {cat}
               </button>
             ))}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredAssets.map((asset, i) => (
            <motion.div 
              key={asset.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden group hover:border-accent-secondary/40 transition-all duration-700 flex flex-col"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img 
                  src={asset.thumbnail_url || "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800"} 
                  alt={asset.title} 
                  className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                
                {/* Tutorial Indicator */}
                <div className="absolute top-6 left-6 px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-2">
                   <Zap size={10} className="text-accent-secondary" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-white/80">Tutorial Included</span>
                </div>

                <div className="absolute bottom-6 left-6 flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center text-accent-secondary border border-white/10">
                      {asset.category === 'lut' ? <Monitor size={14} /> : <ImageIcon size={14} />}
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Professional Assets</span>
                </div>
              </div>
              
              <div className="p-10 flex flex-col flex-1">
                <h3 className="text-3xl font-black mb-4 tracking-tight group-hover:text-accent-secondary transition-colors italic uppercase italic-glow">{asset.title}</h3>
                <p className="text-sm text-text-muted mb-10 font-medium leading-relaxed flex-1">
                  {asset.description || "Elite color grading toolkit designed for professional creators and cinematic results."}
                </p>
                
                <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Investment</span>
                      <span className="text-2xl font-black tracking-tighter">
                         {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(asset.price)}
                      </span>
                   </div>
                   
                   <button 
                     onClick={() => handlePurchase(asset)}
                     className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center hover:bg-accent-secondary hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_40px_rgba(255,165,0,0.2)]"
                   >
                     <ShoppingBag size={22} />
                   </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {assets.length === 0 && !loading && (
          <div className="py-20 text-center">
             <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-white/20">
                <ShoppingBag size={40} />
             </div>
             <p className="text-text-muted uppercase tracking-widest font-black text-sm">Forge currently cold. Come back later.</p>
          </div>
        )}

      </div>
    </main>
  );
}
