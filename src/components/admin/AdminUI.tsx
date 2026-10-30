'use client';

import { useEffect, type ReactNode } from 'react';
import { X, Loader2, type LucideIcon } from 'lucide-react';

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-line">
      <div>
        <h1 className="text-4xl">{title}</h1>
        {description && <p className="mt-2 text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function StatCard({ label, value, icon: Icon, hint }: { label: string; value: ReactNode; icon: LucideIcon; hint?: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className="w-9 h-9 rounded-md bg-gold-soft text-gold flex items-center justify-center"><Icon size={18} aria-hidden="true" /></span>
      </div>
      <p className="mt-3 font-display text-4xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="card p-10 text-center">
      <Icon size={28} className="mx-auto text-gold" aria-hidden="true" />
      <p className="mt-4 font-display text-2xl">{title}</p>
      {text && <p className="mt-1 text-muted-foreground">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function LoadingRow({ text = 'Đang tải dữ liệu…' }: { text?: string }) {
  return (
    <div className="py-16 flex items-center justify-center gap-3 text-muted-foreground" aria-busy="true">
      <Loader2 size={18} className="animate-spin" aria-hidden="true" /> {text}
    </div>
  );
}

export function Modal({ title, open, onClose, children, wide = false }: { title: string; open: boolean; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-start md:items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-label={title}>
      <div className="fixed inset-0 bg-onyx/60" onClick={onClose} aria-hidden="true" />
      <div className={`relative w-full ${wide ? 'max-w-3xl' : 'max-w-xl'} card shadow-[var(--shadow-lift)] animate-fade-up my-8`}>
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-line">
          <h2 className="text-2xl">{title}</h2>
          <button onClick={onClose} className="w-11 h-11 -mr-2 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-ink" aria-label="Đóng">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    success: ['Thành công', '!bg-green-50 !text-success'],
    pending: ['Đang chờ', ''],
    failed: ['Thất bại', '!bg-red-50 !text-danger'],
    active: ['Đang học', '!bg-green-50 !text-success'],
    expired: ['Hết hạn', '!bg-muted !text-muted-foreground'],
    published: ['Đang bán', '!bg-green-50 !text-success'],
    draft: ['Bản nháp', '!bg-muted !text-muted-foreground'],
  };
  const [label, cls] = map[status] || [status, ''];
  return <span className={`badge ${cls}`}>{label}</span>;
}

export const thClass = 'p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground';
export const tdClass = 'p-4 align-middle';
