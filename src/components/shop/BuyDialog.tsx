'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Loader2, ShieldCheck } from 'lucide-react';
import { formatVND } from '@/lib/supabase-public';

type Asset = { id: string; title: string; price: number | string };

// Guest checkout: name, email, phone, then straight to the QR payment page. No account needed.
export default function BuyDialog({ asset, defaultEmail, onClose }: { asset: Asset | null; defaultEmail?: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState({ name: '', email: defaultEmail || '', phone: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (asset) {
      setError('');
      setForm((f) => ({ ...f, email: f.email || defaultEmail || '' }));
      ref.current?.showModal();
    } else ref.current?.close();
  }, [asset, defaultEmail]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!asset) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: asset.id, buyer: form }),
      });
      const data = await res.json();
      if (data.url) return window.location.assign(data.url);
      setError(data.error || 'Không tạo được đơn thanh toán.');
    } catch {
      setError('Không kết nối được máy chủ. Kiểm tra mạng và thử lại.');
    }
    setBusy(false);
  }

  const field = (key: 'name' | 'email' | 'phone', label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <label className="block">
      <span className="block text-sm font-semibold">{label}</span>
      <input className="input mt-1.5" required value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} {...props} />
    </label>
  );

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}
      className="m-auto w-[min(440px,calc(100vw-32px))] rounded-[var(--radius-card)] bg-card p-0 backdrop:bg-black/60"
      aria-labelledby="buy-title"
    >
      {asset && (
        <form onSubmit={submit} className="p-6 md:p-7 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="buy-title" className="text-2xl leading-tight">{asset.title}</h2>
              <p className="mt-1 font-display text-2xl font-bold text-gold">{formatVND(asset.price)}</p>
            </div>
            <button type="button" onClick={() => ref.current?.close()} className="w-10 h-10 shrink-0 rounded-full hover:bg-muted flex items-center justify-center" aria-label="Đóng"><X size={18} aria-hidden="true" /></button>
          </div>
          <p className="text-sm text-muted-foreground">Không cần tạo tài khoản. Link tải được gửi về email sau khi thanh toán.</p>
          {field('name', 'Họ tên', { autoComplete: 'name', placeholder: 'Nguyễn Văn A' })}
          {field('email', 'Email nhận file', { type: 'email', autoComplete: 'email', placeholder: 'ban@gmail.com' })}
          {field('phone', 'Số điện thoại / Zalo', { type: 'tel', autoComplete: 'tel', inputMode: 'tel', placeholder: '0912 345 678' })}
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <button type="submit" disabled={busy} className="btn btn-gold w-full">
            {busy ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : null} Thanh toán {formatVND(asset.price)}
          </button>
          <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground"><ShieldCheck size={14} aria-hidden="true" /> Quét QR ngân hàng, xác nhận tự động</p>
        </form>
      )}
    </dialog>
  );
}
