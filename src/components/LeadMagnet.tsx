'use client';

import { useState } from 'react';
import { Gift, Loader2, CheckCircle2, Mail } from 'lucide-react';
import { CHECKLIST, CHECKLIST_TITLE } from '@/lib/checklist';

// Free checklist in exchange for an email (and optional Zalo number). The checklist shows
// right away and a copy is emailed (/api/leads); the lead appears in Admin > Khách tiềm năng.
export default function LeadMagnet({ source = 'home' }: { source?: string }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', website: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setState('sending');
    const res = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, source }) })
      .then(async (r) => ({ ok: r.ok, data: await r.json().catch(() => ({})) })).catch(() => ({ ok: false, data: {} as any }));
    if (!res.ok) { setState('idle'); setError(res.data.error || 'Chưa gửi được, vui lòng thử lại.'); return; }
    (window as any).fbq?.('track', 'Lead');
    setState('done');
  };

  return (
    <section className="section" aria-labelledby="lead-title">
      <div className="container-lux">
        <div className="card p-6 md:p-10 grid gap-8 lg:grid-cols-[1fr_1.1fr] items-start">
          <div>
            <span className="badge"><Gift size={14} aria-hidden="true" /> Quà tặng miễn phí</span>
            <h2 id="lead-title" className="mt-4 text-3xl md:text-4xl">{CHECKLIST_TITLE}</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {CHECKLIST.reduce((n, g) => n + g.items.length, 0)} việc Minh Tấn kiểm tra trước mỗi lần bấm quay: ánh sáng, khung hình, âm thanh và cách nói. In ra hoặc lưu trong điện thoại, quay video nào cũng dùng được.
            </p>
          </div>

          {state === 'done' ? (
            <div role="status">
              <p className="flex items-center gap-2 font-semibold text-success"><CheckCircle2 size={20} aria-hidden="true" /> Đã gửi! Kiểm tra email (cả mục Spam). Checklist của bạn đây:</p>
              <div className="mt-4 space-y-4 text-sm">
                {CHECKLIST.map((g) => (
                  <div key={g.group}>
                    <p className="font-bold text-ink">{g.group}</p>
                    <ul className="mt-1.5 space-y-1 text-stone">{g.items.map((i) => <li key={i} className="flex gap-2"><span aria-hidden="true">☐</span>{i}</li>)}</ul>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-4" noValidate>
              <div>
                <label htmlFor={`lead-name-${source}`} className="field-label">Tên của bạn</label>
                <input id={`lead-name-${source}`} className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
              </div>
              <div>
                <label htmlFor={`lead-email-${source}`} className="field-label">Email nhận checklist *</label>
                <input id={`lead-email-${source}`} type="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" placeholder="ban@email.com" />
              </div>
              <div>
                <label htmlFor={`lead-phone-${source}`} className="field-label">Số Zalo (không bắt buộc)</label>
                <input id={`lead-phone-${source}`} type="tel" inputMode="tel" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" placeholder="0912 345 678" />
              </div>
              {/* Honeypot: hidden from people, filled by bots */}
              <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              {error && <p role="alert" className="text-sm text-danger">{error}</p>}
              <button type="submit" disabled={state === 'sending' || !form.email} className="btn btn-gold w-full disabled:opacity-60">
                {state === 'sending' ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Mail size={18} aria-hidden="true" />} Gửi checklist cho tôi
              </button>
              <p className="text-xs text-muted-foreground">Không spam. Bạn có thể huỷ nhận email bất cứ lúc nào.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
