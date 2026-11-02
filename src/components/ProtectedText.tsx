'use client';

import { useEffect, type ReactNode } from 'react';

// Wraps paid lesson text: no selecting, copying, dragging or printing, and a faint tiled student ID
// behind the words so a screenshot that leaks can be traced. Attempts are logged like video
// violations (shown in Admin > Bảo vệ video). Screenshots themselves can't be blocked by a browser.

const report = (() => {
  const last: Record<string, number> = {};
  return (type: string) => {
    if (Date.now() - (last[type] || 0) < 5000) return;
    last[type] = Date.now();
    fetch('/api/drm/violation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type }) }).catch(() => {});
  };
})();

export default function ProtectedText({ watermark, children }: { watermark: string; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key?.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'a', 's', 'p', 'u'].includes(key)) {
        e.preventDefault();
        report(key === 'p' ? 'text_print' : 'text_copy');
      }
    };
    const onPrint = () => report('text_print');
    document.addEventListener('keydown', onKey);
    window.addEventListener('beforeprint', onPrint);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('beforeprint', onPrint);
    };
  }, []);

  const block = (type: string) => (e: React.SyntheticEvent) => { e.preventDefault(); report(type); };

  return (
    <div className="protected-text relative">
      <div
        className="relative select-none [-webkit-touch-callout:none]"
        onCopy={block('text_copy')}
        onCut={block('text_copy')}
        onContextMenu={block('text_copy')}
        onDragStart={(e) => e.preventDefault()}
      >
        {children}
        {/* Faint student ID tiled over the text: survives cropping, stays readable for the student */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -inset-1/4 grid grid-cols-3 gap-x-16 gap-y-28 -rotate-[24deg] opacity-[0.07] content-start">
            {Array.from({ length: 60 }).map((_, i) => (
              <span key={i} className="whitespace-nowrap font-mono text-xs text-white">{watermark}</span>
            ))}
          </div>
        </div>
      </div>
      <p className="print-only hidden">Nội dung khóa học được bảo vệ bản quyền và không thể in.</p>
    </div>
  );
}
