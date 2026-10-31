"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { revalidateSite } from '@/lib/revalidate';
import { SETTING_FIELDS, SETTING_GROUPS, DEFAULT_SETTINGS, toYoutubeId, type SiteSettings } from '@/lib/site-settings';
import { Save, Loader2, RotateCcw, ExternalLink } from 'lucide-react';
import { PageHeader, LoadingRow, Field } from '@/components/admin/AdminUI';
import ImageUpload from '@/components/admin/ImageUpload';

export default function SettingsPage() {
  const [values, setValues] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    supabase.from('site_settings').select('key, value').then(({ data }) => {
      const fromDb = Object.fromEntries((data || []).filter((r) => r.value).map((r) => [r.key, r.value as string]));
      const merged = { ...DEFAULT_SETTINGS, ...fromDb };
      setValues(merged);
      setSaved(merged);
      setLoading(false);
    });
  }, []);

  const dirtyKeys = SETTING_FIELDS.filter((f) => values[f.key] !== saved[f.key]).map((f) => f.key);
  const set = (key: string, value: string) => { setValues((v) => ({ ...v, [key]: value })); setNotice(null); };

  async function saveAll() {
    setSaving(true);
    const rows = SETTING_FIELDS.filter((f) => dirtyKeys.includes(f.key)).map((f) => ({
      key: f.key,
      // store a clean YouTube id even when a full link was pasted
      value: f.key === 'showreel_youtube_id' ? toYoutubeId(values[f.key]) || values[f.key] : values[f.key],
      description: f.label,
      group: f.group,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from('site_settings').upsert(rows, { onConflict: 'key' });
    setSaving(false);
    if (error) return setNotice({ type: 'error', text: `Lỗi khi lưu: ${error.message}` });
    setSaved(values);
    await revalidateSite();
    setNotice({ type: 'success', text: `Đã lưu ${rows.length} thay đổi. Website đã được cập nhật.` });
  }

  const groups = Object.keys(SETTING_GROUPS) as (keyof typeof SETTING_GROUPS)[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nội dung trang chủ"
        description="Chữ, video và thông tin liên hệ hiển thị trên website."
        actions={
          <>
            <a href="/" target="_blank" className="btn btn-outline"><ExternalLink size={16} aria-hidden="true" /> Xem website</a>
            <button onClick={saveAll} disabled={saving || dirtyKeys.length === 0} className="btn btn-gold">
              {saving ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}
              Lưu thay đổi{dirtyKeys.length ? ` (${dirtyKeys.length})` : ''}
            </button>
          </>
        }
      />

      {notice && <p role={notice.type === 'error' ? 'alert' : 'status'} className={`p-4 rounded-md text-sm ${notice.type === 'error' ? 'bg-red-50 text-danger' : 'bg-gold-soft text-ink'}`}>{notice.text}</p>}

      {loading ? <LoadingRow /> : groups.map((group) => (
        <section key={group} className="card p-6" aria-labelledby={`g-${group}`}>
          <h2 id={`g-${group}`} className="text-2xl">{SETTING_GROUPS[group]}</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {SETTING_FIELDS.filter((f) => f.group === group).map((f) => (
              <div key={f.key} className={f.type === 'textarea' || f.type === 'image' ? 'md:col-span-2' : ''}>
                <Field id={`s-${f.key}`} label={f.label} hint={f.hint}>
                  {f.type === 'image' ? (
                    <ImageUpload id={`s-${f.key}`} folder="site" value={values[f.key] || ''} onChange={(url) => set(f.key, url)} />
                  ) : f.type === 'textarea' ? (
                    <textarea id={`s-${f.key}`} className="input min-h-[110px]" value={values[f.key] || ''} onChange={(e) => set(f.key, e.target.value)} />
                  ) : (
                    <input id={`s-${f.key}`} className="input" value={values[f.key] || ''} onChange={(e) => set(f.key, e.target.value)} />
                  )}
                </Field>
                {values[f.key] !== f.default && (
                  <button type="button" onClick={() => set(f.key, f.default)} className="mt-1.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-ink">
                    <RotateCcw size={12} aria-hidden="true" /> Về nội dung mặc định
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
