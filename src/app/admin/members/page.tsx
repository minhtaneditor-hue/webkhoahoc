"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { formatVND } from '@/lib/supabase-public';
import { BadgeCheck, Clock, Wallet, Search, Plus, Crown, Loader2 } from 'lucide-react';
import { PageHeader, StatCard, LoadingRow, EmptyState, Modal, Field, thClass, tdClass } from '@/components/admin/AdminUI';

type Member = { user_id: string; expires_at: string; updated_at: string; users: { email: string; full_name: string | null } | null };
type State = 'active' | 'soon' | 'expired';

const DAY = 864e5;
const SOON_DAYS = 7;
const stateOf = (m: Member, now: number): State => {
  const left = Date.parse(m.expires_at) - now;
  return left <= 0 ? 'expired' : left <= SOON_DAYS * DAY ? 'soon' : 'active';
};
const STATE_BADGE: Record<State, [string, string]> = {
  active: ['Còn hạn', '!bg-green-50 !text-success'],
  soon: ['Sắp hết hạn', ''],
  expired: ['Hết hạn', '!bg-muted !text-muted-foreground'],
};
const TABS: { key: 'all' | State; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'active', label: 'Còn hạn' },
  { key: 'soon', label: `Sắp hết (≤ ${SOON_DAYS} ngày)` },
  { key: 'expired', label: 'Hết hạn' },
];
const MONTH_OPTIONS = [1, 3, 6, 12];
const dateVN = (iso: string) => new Date(iso).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

export default function MembersAdmin() {
  const [members, setMembers] = useState<Member[]>([]);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | State>('all');
  const [query, setQuery] = useState('');
  const [grant, setGrant] = useState<{ email: string; months: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const [{ data: rows }, { data: paid }] = await Promise.all([
      supabase.from('memberships').select('user_id, expires_at, updated_at, users ( email, full_name )').order('expires_at', { ascending: true }),
      supabase.from('payments').select('amount').not('membership_plan', 'is', null).eq('status', 'success').gte('created_at', monthStart.toISOString()),
    ]);
    setMembers((rows as unknown as Member[]) || []);
    setRevenue((paid || []).reduce((sum, p) => sum + Number(p.amount || 0), 0));
    setNow(Date.now());
    setLoading(false);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch, same pattern as the other admin pages
  useEffect(() => { load(); }, [load]);

  const counts = useMemo(() => {
    const c = { active: 0, soon: 0, expired: 0 };
    members.forEach((m) => { c[stateOf(m, now)]++; });
    return c;
  }, [members, now]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) =>
      (tab === 'all' || stateOf(m, now) === tab) &&
      (!q || [m.users?.email, m.users?.full_name].some((v) => v?.toLowerCase().includes(q))));
  }, [members, tab, query, now]);

  async function submitGrant(e: React.FormEvent) {
    e.preventDefault();
    if (!grant) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(grant),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không cộng được.');
      setNotice(`Đã cộng ${grant.months} tháng cho ${grant.email}. Hội viên đến hết ngày ${dateVN(data.expiresAt)}.`);
      setGrant(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không cộng được.');
    }
    setBusy(false);
  }

  const openGrant = (email = '') => { setError(''); setGrant({ email, months: 1 }); };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hội viên"
        description="Ai đang là hội viên, còn hạn tới ngày nào. Hội viên không tự gia hạn: mỗi đơn hoặc mỗi lần cộng tay sẽ cộng nối tiếp vào thời hạn còn lại."
        actions={<button onClick={() => openGrant()} className="btn btn-gold whitespace-nowrap"><Plus size={16} aria-hidden="true" /> Cộng tháng</button>}
      />

      {notice && <p role="status" className="rounded-md bg-green-50 p-4 text-sm text-success">{notice}</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Đang là hội viên" value={loading ? '—' : counts.active + counts.soon} icon={BadgeCheck} />
        <StatCard label={`Sắp hết hạn (≤ ${SOON_DAYS} ngày)`} value={loading ? '—' : counts.soon} icon={Clock} hint="Nên nhắn nhắc gia hạn" />
        <StatCard label="Doanh thu hội viên tháng này" value={loading ? '—' : formatVND(revenue)} icon={Wallet} hint="Đơn đã thanh toán, không tính tháng tặng" />
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="flex gap-2 overflow-x-auto no-scrollbar" role="tablist" aria-label="Lọc theo trạng thái">
          {TABS.map((t) => (
            <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
                    className={`shrink-0 min-h-[44px] px-4 rounded-md text-sm font-semibold border transition-colors ${tab === t.key ? 'bg-onyx text-white border-onyx' : 'bg-card border-line-strong text-stone hover:border-ink'}`}>
              {t.label} <span className="opacity-60">({t.key === 'all' ? members.length : counts[t.key]})</span>
            </button>
          ))}
        </div>
        <div className="relative md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="member-search" className="sr-only">Tìm hội viên</label>
          <input id="member-search" className="input pl-9" placeholder="Email, họ tên…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {loading ? <LoadingRow /> : filtered.length === 0 ? (
        <EmptyState icon={Crown} title="Chưa có hội viên" text={members.length ? 'Thử đổi bộ lọc hoặc từ khóa.' : 'Hội viên sẽ xuất hiện khi có người thanh toán hoặc khi bạn cộng tháng tặng.'} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line">
              <tr><th className={thClass}>Học viên</th><th className={thClass}>Hết hạn</th><th className={thClass}>Còn lại</th><th className={thClass}>Trạng thái</th><th className={thClass}><span className="sr-only">Thao tác</span></th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((m) => {
                const state = stateOf(m, now);
                const daysLeft = Math.ceil((Date.parse(m.expires_at) - now) / DAY);
                const [label, cls] = STATE_BADGE[state];
                return (
                  <tr key={m.user_id} className="hover:bg-muted/60">
                    <td className={tdClass}>
                      <span className="block font-semibold">{m.users?.full_name || '—'}</span>
                      <span className="block text-muted-foreground break-all">{m.users?.email}</span>
                    </td>
                    <td className={`${tdClass} whitespace-nowrap tabular-nums`}>{dateVN(m.expires_at)}</td>
                    <td className={`${tdClass} whitespace-nowrap tabular-nums`}>{daysLeft > 0 ? `${daysLeft} ngày` : `Hết ${-daysLeft} ngày trước`}</td>
                    <td className={tdClass}><span className={`badge ${cls}`}>{label}</span></td>
                    <td className={`${tdClass} text-right`}>
                      {m.users?.email && (
                        <button onClick={() => openGrant(m.users!.email)} className="btn btn-outline !min-h-[40px] !px-3 whitespace-nowrap">
                          <Plus size={14} aria-hidden="true" /> Cộng tháng
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal title="Cộng tháng hội viên" open={!!grant} onClose={() => setGrant(null)}>
        {grant && (
          <form onSubmit={submitGrant} className="space-y-5">
            <Field id="grant-email" label="Email học viên" hint="Tài khoản phải có sẵn trên website.">
              <input id="grant-email" type="email" required className="input" value={grant.email}
                     onChange={(e) => setGrant({ ...grant, email: e.target.value })} placeholder="hocvien@gmail.com" />
            </Field>
            <fieldset>
              <legend className="field-label">Cộng thêm</legend>
              <div className="grid grid-cols-4 gap-2">
                {MONTH_OPTIONS.map((n) => (
                  <button key={n} type="button" aria-pressed={grant.months === n} onClick={() => setGrant({ ...grant, months: n })}
                          className={`min-h-[44px] rounded-md text-sm font-semibold border transition-colors ${grant.months === n ? 'bg-onyx text-white border-onyx' : 'bg-card border-line-strong text-stone hover:border-ink'}`}>
                    {n} tháng
                  </button>
                ))}
              </div>
            </fieldset>
            <p className="text-sm text-muted-foreground">Còn hạn thì cộng nối tiếp, hết hạn thì tính từ hôm nay. Không gửi email cho học viên.</p>
            {error && <p role="alert" className="text-sm text-danger">{error}</p>}
            <button type="submit" disabled={busy} className="btn btn-gold w-full">
              {busy && <Loader2 size={16} className="animate-spin" aria-hidden="true" />} Cộng {grant.months} tháng
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
