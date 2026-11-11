'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Loader2, CheckCircle2 } from 'lucide-react';

// "Was this useful?" box under the result of the free AI tools. Goes to /api/feedback.
export default function ToolFeedback({ tool, context }: { tool: 'cham-video' | 'viet-kich-ban'; context?: Record<string, string | number> }) {
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [comment, setComment] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');

  const send = async (r: 'up' | 'down' | null, text: string) => {
    setError('');
    setState('sending');
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool, rating: r, comment: text, context }),
    }).then(async (x) => ({ ok: x.ok, data: await x.json().catch(() => ({})) })).catch(() => ({ ok: false, data: {} as { error?: string } }));
    if (!res.ok) { setState('idle'); setError(res.data.error || 'Chưa gửi được, bạn thử lại nhé.'); return; }
    setState('done');
  };

  if (state === 'done') {
    return (
      <div className="card p-5 md:p-6" role="status">
        <p className="flex items-center gap-2 font-semibold text-ink"><CheckCircle2 size={20} className="text-success" aria-hidden="true" /> Cảm ơn bạn! Minh Tấn đọc từng góp ý để làm công cụ tốt hơn.</p>
      </div>
    );
  }

  const placeholder = rating === 'down'
    ? 'Chỗ nào chưa đúng hoặc chưa hợp với bạn?'
    : 'Bạn muốn công cụ làm thêm gì, hay sửa chỗ nào? (không bắt buộc)';

  return (
    <div className="card p-5 md:p-6">
      <p className="font-semibold text-ink">Kết quả này có giúp ích cho bạn không?</p>
      <div className="mt-3 flex gap-2">
        {([['up', 'Có ích', ThumbsUp], ['down', 'Chưa ổn', ThumbsDown]] as const).map(([value, label, Icon]) => (
          <button
            key={value}
            type="button"
            aria-pressed={rating === value}
            onClick={() => setRating(value)}
            className={`btn !min-h-[44px] text-sm ${rating === value ? 'btn-gold' : 'btn-outline'}`}
          >
            <Icon size={16} aria-hidden="true" /> {label}
          </button>
        ))}
      </div>
      {rating && (
        <div className="mt-4">
          <label htmlFor={`fb-${tool}`} className="sr-only">Góp ý của bạn</label>
          <textarea id={`fb-${tool}`} className="input min-h-24" maxLength={1000} value={comment} onChange={(e) => setComment(e.target.value)} placeholder={placeholder} />
          {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
          <button type="button" onClick={() => send(rating, comment)} disabled={state === 'sending'} className="btn btn-gold mt-3 disabled:opacity-60">
            {state === 'sending' && <Loader2 size={16} className="animate-spin" aria-hidden="true" />} Gửi góp ý
          </button>
        </div>
      )}
    </div>
  );
}
