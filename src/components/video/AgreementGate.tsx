'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import { AGREEMENT_SECTIONS, AGREEMENT_TITLE, AGREEMENT_VERSION } from '@/lib/content-agreement';

// Blocks the lessons until the student has ticked the confidentiality commitment once
// (per wording version). Acceptance is stored in content_agreements (migration 012).
export default function AgreementGate({ userId, code, email, children }: { userId: string; code: string; email: string; children: React.ReactNode }) {
  const [state, setState] = useState<'loading' | 'needed' | 'ok'>('loading');
  const [ticked, setTicked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('content_agreements').select('id').eq('user_id', userId).eq('version', AGREEMENT_VERSION).maybeSingle()
      .then(({ data, error }) => setState(data ? 'ok' : error && error.code === '42P01' ? 'ok' : 'needed'));
  }, [userId]);

  async function accept() {
    setBusy(true);
    setError('');
    const { error } = await supabase.from('content_agreements').insert({ user_id: userId, version: AGREEMENT_VERSION, user_agent: navigator.userAgent.slice(0, 300) });
    setBusy(false);
    if (error && error.code !== '23505') return setError('Chưa lưu được xác nhận. Vui lòng thử lại.');
    setState('ok');
  }

  if (state === 'ok') return <>{children}</>;
  // The lesson page stays mounted underneath; the overlay keeps it out of reach until accepted

  return (
    <>
    {children}
    <div className="fixed inset-0 z-[300] bg-onyx/95 backdrop-blur-sm flex items-center justify-center p-3 md:p-6">
      {state === 'loading' ? (
        <Loader2 className="animate-spin text-white/60" size={32} aria-hidden="true" />
      ) : (
        <div role="dialog" aria-modal="true" aria-labelledby="agreement-title" className="w-full max-w-2xl max-h-full flex flex-col rounded-[var(--radius-card)] bg-card text-ink shadow-[var(--shadow-lift)]">
          <div className="p-5 md:p-6 border-b border-line flex items-start gap-3">
            <ShieldAlert className="text-gold shrink-0 mt-1" size={26} aria-hidden="true" />
            <div>
              <h2 id="agreement-title" className="text-2xl md:text-3xl leading-tight">{AGREEMENT_TITLE}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Mã học viên của bạn: <strong className="text-ink">{code}</strong> · {email}. Mã này hiển thị liên tục trên video khi học.
              </p>
            </div>
          </div>
          <div className="p-5 md:p-6 overflow-y-auto text-sm leading-relaxed space-y-4">
            <p className="p-3 rounded-md bg-gold-soft font-semibold">
              Nội dung khóa học được bảo hộ quyền tác giả. Mọi hành vi tải, quay màn hình, chia sẻ hoặc phát tán đều có thể bị truy ra qua mã học viên, và người vi phạm phải chịu trách nhiệm trước pháp luật.
            </p>
            {AGREEMENT_SECTIONS.map((s) => (
              <section key={s.heading}>
                <h3 className="font-sans text-base font-bold">{s.heading}</h3>
                <ul className="mt-1.5 list-disc pl-5 space-y-1 text-muted-foreground">
                  {s.items.map((t) => <li key={t}>{t}</li>)}
                </ul>
              </section>
            ))}
            <p className="text-xs text-muted-foreground">Phiên bản {AGREEMENT_VERSION}. Xem lại bất cứ lúc nào tại <Link href="/cam-ket-bao-mat" target="_blank" className="underline">trang Cam kết bảo mật</Link>.</p>
          </div>
          <div className="p-5 md:p-6 border-t border-line space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1 w-5 h-5 shrink-0 accent-[#A84E3C]" checked={ticked} onChange={(e) => setTicked(e.target.checked)} />
              <span className="text-sm font-semibold">Tôi đã đọc, hiểu và đồng ý với toàn bộ cam kết trên. Tôi chịu hoàn toàn trách nhiệm trước pháp luật nếu để lộ hoặc phát tán nội dung khóa học.</span>
            </label>
            {error && <p role="alert" className="text-sm text-danger">{error}</p>}
            <button type="button" onClick={accept} disabled={!ticked || busy} className="btn btn-gold w-full disabled:opacity-50 disabled:cursor-not-allowed">
              {busy && <Loader2 size={18} className="animate-spin" aria-hidden="true" />} Đồng ý và vào học
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
