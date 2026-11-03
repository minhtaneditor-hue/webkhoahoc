'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, Loader2, CheckCircle2, X, Send } from 'lucide-react';
import { contactFrom, DEFAULT_SETTINGS } from '@/lib/site-settings';

const DEFAULT_ZALO = contactFrom(DEFAULT_SETTINGS).zaloHref;
// Literal class names so Tailwind picks them up
const VARIANTS = { gold: 'btn-gold', dark: 'btn-dark', outline: 'btn-outline', 'outline-light': 'btn-outline-light' } as const;

type Kind = 'audit' | 'coaching' | 'course';

/**
 * "Nhận tư vấn" under a price: a button that opens a short form (name, email, Zalo,
 * online/offline for coaching) plus a "Nhắn Zalo ngay" link. Requests land in
 * Admin > Đặt lịch & tư vấn via /api/consult.
 */
export default function ConsultBox({
  kind, product, zaloHref, label, variant, dark = false, block = true,
}: { kind: Kind; product?: string; zaloHref?: string; label?: string; variant?: 'gold' | 'dark' | 'outline' | 'outline-light'; dark?: boolean; block?: boolean }) {
  const [open, setOpen] = useState(false);
  const text = label || (kind === 'audit' ? 'Đặt lịch Audit miễn phí' : 'Nhận tư vấn');
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className={`btn ${VARIANTS[variant || (dark ? 'outline-light' : 'outline')]} ${block ? 'w-full' : ''}`}>
        <MessageCircle size={18} aria-hidden="true" /> {text}
      </button>
      {/* Portal: animated parents (Reveal) use transforms, which would trap a fixed overlay */}
      {open && createPortal(<ConsultModal kind={kind} product={product} zaloHref={zaloHref || DEFAULT_ZALO} title={text} onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}

function ConsultModal({ kind, product, zaloHref, title, onClose }: { kind: Kind; product?: string; zaloHref: string; title: string; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', format: kind === 'course' ? '' : 'Online', message: '', website: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');
  const id = (k: string) => `consult-${k}`;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setState('sending');
    const res = await fetch('/api/consult', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, kind, product }) })
      .then(async (r) => ({ ok: r.ok, data: await r.json().catch(() => ({})) })).catch(() => ({ ok: false, data: {} as any }));
    if (!res.ok) { setState('idle'); setError(res.data.error || 'Chưa gửi được, vui lòng thử lại.'); return; }
    (window as any).fbq?.('track', kind === 'audit' ? 'Schedule' : 'Lead', { content_name: product || kind });
    setState('done');
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-start justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby={id('title')}>
      <div className="fixed inset-0 bg-onyx/60" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md card shadow-[var(--shadow-lift)] my-auto text-ink">
        <div className="flex items-start justify-between gap-4 px-6 pt-5">
          <div>
            <h2 id={id('title')} className="text-2xl">{title}</h2>
            {product && <p className="mt-1 text-sm text-muted-foreground">{product}</p>}
          </div>
          <button onClick={onClose} className="w-11 h-11 -mr-2 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-ink" aria-label="Đóng">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 pt-4">
          {state === 'done' ? (
            <div role="status" className="text-center py-4">
              <CheckCircle2 size={40} className="mx-auto text-success" aria-hidden="true" />
              <p className="mt-3 text-lg font-bold">Đã gửi thành công!</p>
              <p className="mt-2 text-muted-foreground">Minh Tấn sẽ nhắn Zalo cho bạn trong vòng 24 giờ. Email xác nhận đã được gửi tới {form.email}.</p>
              <button onClick={onClose} className="btn btn-outline mt-6">Đóng</button>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-4" noValidate>
              <p className="text-sm text-muted-foreground">
                {kind === 'audit'
                  ? 'Để lại thông tin, Minh Tấn sẽ nhắn Zalo để chốt lịch Audit với bạn.'
                  : 'Để lại thông tin, Minh Tấn sẽ nhắn Zalo tư vấn cho bạn trong vòng 24 giờ.'}
              </p>
              <div>
                <label htmlFor={id('name')} className="field-label">Tên của bạn *</label>
                <input id={id('name')} className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
              </div>
              <div>
                <label htmlFor={id('phone')} className="field-label">Số Zalo *</label>
                <input id={id('phone')} type="tel" inputMode="tel" required className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" placeholder="0912 345 678" />
              </div>
              <div>
                <label htmlFor={id('email')} className="field-label">Email *</label>
                <input id={id('email')} type="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" placeholder="ban@email.com" />
              </div>
              {kind !== 'course' && (
                <fieldset>
                  <legend className="field-label">Hình thức</legend>
                  <div className={`grid gap-2 ${kind === 'audit' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {(kind === 'audit' ? ['Online'] : ['Online', 'Offline']).map((f) => (
                      <label key={f} className={`flex items-center justify-center gap-2 min-h-[44px] px-2 text-center rounded-md border cursor-pointer text-sm font-semibold ${form.format === f ? 'border-gold bg-gold/10 text-gold' : 'border-line'}`}>
                        <input type="radio" name={id('format')} value={f} checked={form.format === f} onChange={() => setForm({ ...form, format: f })} className="sr-only" />
                        {f === 'Online' ? 'Online (Google Meet / Zalo)' : 'Offline tại TP.HCM'}
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}
              <div>
                <label htmlFor={id('message')} className="field-label">{kind === 'audit' ? 'Link kênh hoặc điều bạn muốn được xem' : 'Bạn cần tư vấn điều gì?'} (không bắt buộc)</label>
                <textarea id={id('message')} rows={3} className="input" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>
              {/* Honeypot: hidden from people, filled by bots */}
              <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              {error && <p role="alert" className="text-sm text-danger">{error}</p>}
              <button type="submit" disabled={state === 'sending' || !form.name || !form.email || !form.phone} className="btn btn-gold w-full disabled:opacity-60">
                {state === 'sending' ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
                {kind === 'audit' ? 'Đặt lịch miễn phí' : 'Gửi yêu cầu tư vấn'}
              </button>
              <a href={zaloHref} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full">
                <MessageCircle size={18} aria-hidden="true" /> Hoặc nhắn Zalo ngay
              </a>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
