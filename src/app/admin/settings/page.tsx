'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAdmin } from '@/lib/admin';
import { Save, RefreshCw, Layout, Type, ShieldCheck } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isAdmin(user.email)) {
        router.push('/auth');
        return;
      }
      fetchSettings();
    }
    checkAuth();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    const { data } = await supabase.from('site_settings').select('*').order('group', { ascending: true });
    setSettings(data || []);
    setLoading(false);
  }

  async function handleUpdate(key: string, value: string) {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  }

  async function saveAll() {
    setSaving(true);
    try {
      for (const item of settings) {
        await supabase.from('site_settings').update({ value: item.value }).eq('key', item.key);
      }
      alert('Hệ thống đã được cập nhật thành công!');
    } catch (err) {
      alert('Lỗi cập nhật hệ thống.');
    } finally {
      setSaving(false);
    }
  }

  const groups = ['hero', 'branding', 'contact', 'general'];

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary font-black tracking-widest animate-pulse">BOOTING GOD MODE...</div>;

  return (
    <div className="min-h-screen bg-[#050507] text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-end mb-12">
          <div>
            <Link href="/admin" className="text-primary text-xs font-black uppercase tracking-widest mb-4 block opacity-60 hover:opacity-100 transition-all">← COMMAND CENTER</Link>
            <h1 className="text-5xl font-black tracking-tighter">SITE EDITOR</h1>
            <p className="text-text-muted mt-2 font-medium">Bạn có toàn quyền thay đổi mọi nội dung trên website.</p>
          </div>
          <button 
            onClick={saveAll}
            disabled={saving}
            className="px-8 py-4 rounded-2xl bg-white text-black font-black text-sm tracking-widest flex items-center gap-3 hover:bg-primary hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            PUBLISH CHANGES
          </button>
        </header>

        <div className="space-y-12">
          {groups.map(group => {
            const items = settings.filter(s => s.group === group);
            if (items.length === 0) return null;

            return (
              <section key={group} className="bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] p-8 md:p-12">
                <div className="flex items-center gap-4 mb-10">
                   <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary">
                      {group === 'hero' && <Layout size={24} />}
                      {group === 'branding' && <Type size={24} />}
                      {group === 'contact' && <MailIcon size={24} />}
                      {group === 'general' && <ShieldCheck size={24} />}
                   </div>
                   <h2 className="text-2xl font-black uppercase tracking-tight">{group} CONFIGURATION</h2>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  {items.map(item => (
                    <div key={item.key} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">{item.description || item.key}</label>
                        <code className="text-[10px] text-primary/40 font-mono">id: {item.key}</code>
                      </div>
                      {item.value.length > 100 ? (
                        <textarea 
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-sm font-medium focus:border-primary outline-none min-h-[120px] transition-all"
                          value={item.value}
                          onChange={(e) => handleUpdate(item.key, e.target.value)}
                        />
                      ) : (
                        <input 
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-sm font-bold focus:border-primary outline-none transition-all"
                          value={item.value}
                          onChange={(e) => handleUpdate(item.key, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
        
        <footer className="mt-20 pt-12 border-t border-white/5 text-center">
           <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Minh Tan Academy // Universal CMS v1.0</p>
        </footer>
      </div>
    </div>
  );
}

function MailIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
  );
}
