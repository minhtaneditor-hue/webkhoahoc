'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';
import type { MembershipPlan } from '@/lib/membership';

/** Creates a bank-transfer order for a membership plan and opens its QR page. Asks guests to sign in first. */
export default function MembershipBuy({ plan, label, featured }: { plan: MembershipPlan; label: string; featured?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const buy = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membershipPlan: plan }),
      });
      if (res.status === 401) {
        router.push(`/auth?redirect=${encodeURIComponent('/hoi-vien#bang-gia')}`);
        return;
      }
      const data = await res.json();
      if (data.url) window.location.assign(data.url);
      else setError(data.error || 'Không tạo được đơn thanh toán. Vui lòng thử lại.');
    } catch {
      setError('Không kết nối được máy chủ. Kiểm tra mạng và thử lại.');
    }
    setLoading(false);
  };

  return (
    <div>
      <button type="button" onClick={buy} disabled={loading} className={`btn w-full ${featured ? 'btn-gold' : 'btn-outline'}`}>
        {loading && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
        {label}
        {!loading && <ArrowRight size={18} aria-hidden="true" />}
      </button>
      {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
    </div>
  );
}
