'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

/** Guests opening a protected free lesson see this first; only the button leads to the sign-up form. */
export default function SignInPrompt({ next, lessonTitle, onClose }: { next: string; lessonTitle?: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="sign-in-title">
      <div className="absolute inset-0 bg-onyx/70" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md card p-6 shadow-[var(--shadow-lift)] animate-fade-up text-ink">
        <div className="flex items-start justify-between gap-4">
          <h2 id="sign-in-title" className="text-2xl leading-snug">Đăng nhập để xem thêm nhiều video miễn phí khác nữa</h2>
          <button onClick={onClose} autoFocus className="w-11 h-11 -mr-2 -mt-2 shrink-0 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-ink" aria-label="Đóng">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {lessonTitle && <p className="mt-2 text-muted-foreground">{lessonTitle}</p>}
        <Link href={`/auth?mode=signup&redirect=${encodeURIComponent(next)}`} className="btn btn-gold w-full mt-6">Đăng nhập</Link>
      </div>
    </div>
  );
}
