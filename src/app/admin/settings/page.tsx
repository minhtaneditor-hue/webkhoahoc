"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Settings, Save, Loader2 } from 'lucide-react';
import { PageHeader, LoadingRow, EmptyState, Field } from '@/components/admin/AdminUI';

const GROUP_LABELS: Record<string, string> = {
  hero: 'Trang chủ',
  branding: 'Thương hiệu',
  contact: 'Liên hệ',
  general: 'Chung',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    supabase.from('site_settings').select('*').order('group', { ascending: true }).then(({ data }) => {
      setSettings(data || []);
      setLoading(false);
    });
  }, []);

  function handleUpdate(key: string, value: string) {
    setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)));
    setDirty((d) => new Set(d).add(key));
    setNotice(null);
  }

  async function saveAll() {
    setSaving(true);
    const changed = settings.filter((s) => dirty.has(s.key));
    const results = await Promise.all(changed.map((item) => supabase.from('site_settings').update({ value: item.value, updated_at: new Date().toISOString() }).eq('key', item.key)));
    setSaving(false);
    const failed = results.find((r) => r.error);
    if (failed) return setNotice({ type: 'error', text: `Lỗi khi lưu: ${failed.error!.message}` });
    setDirty(new Set());
    setNotice({ type: 'success', text: `Đã lưu ${changed.length} thay đổi.` });
  }

  const groups = Array.from(new Set(settings.map((s) => s.group || 'general')));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cấu hình website"
        description="Các thông tin dùng chung trên website."
        actions={
          <button onClick={saveAll} disabled={saving || dirty.size === 0} className="btn btn-gold">
            {saving ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}
            Lưu thay đổi{dirty.size ? ` (${dirty.size})` : ''}
          </button>
        }
      />

      {notice && <p role={notice.type === 'error' ? 'alert' : 'status'} className={`p-4 rounded-md text-sm ${notice.type === 'error' ? 'bg-red-50 text-danger' : 'bg-gold-soft text-ink'}`}>{notice.text}</p>}

      {loading ? <LoadingRow /> : settings.length === 0 ? (
        <EmptyState icon={Settings} title="Chưa có mục cấu hình" text="Thêm dòng vào bảng site_settings (key, value, description, group) trong Supabase để chỉnh sửa tại đây." />
      ) : (
        groups.map((group) => (
          <section key={group} className="card p-6" aria-labelledby={`g-${group}`}>
            <h2 id={`g-${group}`} className="text-2xl">{GROUP_LABELS[group] || group}</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {settings.filter((s) => (s.group || 'general') === group).map((item) => (
                <div key={item.key} className={(item.value || '').length > 100 ? 'md:col-span-2' : ''}>
                  <Field id={`s-${item.key}`} label={item.description || item.key} hint={`Mã: ${item.key}`}>
                    {(item.value || '').length > 100 ? (
                      <textarea id={`s-${item.key}`} className="input min-h-[120px]" value={item.value || ''} onChange={(e) => handleUpdate(item.key, e.target.value)} />
                    ) : (
                      <input id={`s-${item.key}`} className="input" value={item.value || ''} onChange={(e) => handleUpdate(item.key, e.target.value)} />
                    )}
                  </Field>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
