'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Download, Loader2, X } from 'lucide-react';
import CheckInboxNote from '@/components/shop/CheckInboxNote';

type Asset = { id: string; title: string };

// Free products: name, email and Zalo first, then the file opens and a copy of the link goes by email.
export default function FreeDownloadDialog({ asset, defaultEmail, onClose }: { asset: Asset | null; defaultEmail?: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState({ name: '', email: defaultEmail || '', phone: '', website: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState<{ text: string; suggestion?: string } | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const [fileUrl, setFileUrl] = useState('');

  useEffect(() => {
    if (asset) {
      setError('');
      setFileUrl('');
      setEmailError(null);
      setForm((f) => ({ ...f, email: f.email || defaultEmail || '' }));
      ref.current?.showModal();
    } else ref.current?.close();
  }, [asset, defaultEmail]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!asset) return;
    setBusy(true);
    setEmailError(null);
    setError('');
    // The same id goes to the Pixel and to the server's Conversions API copy, so Meta counts one event.
    const eventId = `free_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    try {
      const res = await fetch('/api/shop/free', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, assetId: asset.id, eventId }) });
      const data = await res.json().catch(() => ({}));
      if (data.field === 'email') {
        setEmailError({ text: data.error, suggestion: data.suggestion });
        emailRef.current?.focus();
        return;
      }
      if (!res.ok || !data.url) return setError(data.error || 'Chưa gửi được, vui lòng thử lại.');
      (window as any).fbq?.('track', 'Lead', { content_name: asset.title }, { eventID: eventId });
      setFileUrl(data.url);
    } catch {
      setError('Không kết nối được máy chủ. Kiểm tra mạng và thử lại.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}
      className="m-auto w-[min(440px,calc(100vw-32px))] rounded-[var(--radius-card)] bg-card text-ink p-0 backdrop:bg-black/60"
      aria-labelledby="free-title"
    >
      {asset && (
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 id="free-title" className="text-2xl">{fileUrl ? 'File của bạn đã sẵn sàng' : 'Nhận bản tải miễn phí'}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{asset.title}</p>
            </div>
            <button type="button" onClick={() => ref.current?.close()} className="w-11 h-11 -mr-2 shrink-0 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-ink" aria-label="Đóng">
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          {fileUrl ? (
            <div role="status" className="mt-5 text-center">
              <CheckCircle2 size={40} className="mx-auto text-success" aria-hidden="true" />
              <p className="mt-3 text-muted-foreground">Bấm nút bên dưới để tải ngay.</p>
              <CheckInboxNote email={form.email} />
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-gold w-full mt-5"><Download size={18} aria-hidden="true" /> Tải về ngay</a>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-5 grid gap-4">
              <div>
                <label htmlFor="free-name" className="field-label">Tên của bạn *</label>
                <input id="free-name" className="input" required maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
              </div>
              <div>
                <label htmlFor="free-email" className="field-label">Email *</label>
                <input id="free-email" ref={emailRef} type="email" required className="input" value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); setEmailError(null); }} autoComplete="email" placeholder="ban@email.com" aria-invalid={!!emailError} aria-describedby={emailError ? 'free-email-error' : undefined} />
                {emailError && (
                  <p id="free-email-error" role="alert" className="mt-1.5 text-sm text-danger">
                    {emailError.text}
                    {emailError.suggestion && (
                      <button type="button" onClick={() => { setForm({ ...form, email: emailError.suggestion! }); setEmailError(null); }} className="block mt-1 min-h-11 font-semibold underline underline-offset-2">
                        Dùng {emailError.suggestion}
                      </button>
                    )}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="free-phone" className="field-label">Số Zalo *</label>
                <input id="free-phone" type="tel" inputMode="tel" required className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" placeholder="09xx xxx xxx" />
              </div>
              {/* Honeypot: hidden from people, filled by bots */}
              <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              {error && <p role="alert" className="text-sm text-danger">{error}</p>}
              <button type="submit" disabled={busy} className="btn btn-gold w-full disabled:opacity-60">
                {busy ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Download size={18} aria-hidden="true" />} Nhận link tải
              </button>
              <p className="text-xs text-muted-foreground text-center">Bằng việc nhận link, bạn đồng ý để TẤN VA gửi email và liên hệ qua Zalo về video. Bạn có thể hủy nhận email bất cứ lúc nào. Xem <Link href="/privacy" className="underline underline-offset-2">chính sách bảo mật</Link>.</p>
            </form>
          )}
        </div>
      )}
    </dialog>
  );
}
