'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export default function CopyButton({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<'idle' | 'done' | 'failed'>('idle');

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState('done');
    } catch {
      setState('failed');
    }
    setTimeout(() => setState('idle'), 2000);
  }

  return (
    <button type="button" onClick={copy} aria-label={label} className="btn btn-outline shrink-0 !min-h-[44px] !px-4 !py-0 text-sm">
      {state === 'done' ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
      <span aria-live="polite">{state === 'done' ? 'Đã chép' : state === 'failed' ? 'Không chép được' : 'Chép'}</span>
    </button>
  );
}
