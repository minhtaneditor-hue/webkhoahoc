"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Download, Inbox, Users, X } from 'lucide-react';
import { PageHeader, LoadingRow, EmptyState, StatCard, thClass, tdClass } from '@/components/admin/AdminUI';

// People who left their email for the free checklist (migration 015, /api/leads)
const SOURCES: Record<string, string> = { 'free-product': 'Tải sản phẩm miễn phí', home: 'Trang chủ', courses: 'Trang khóa học' };

// One verdict per person from every tracked email (migration 027, Resend webhook). Tracking started
// after many leads joined, so "none" means no data, not that nothing was ever sent.
type MailState = 'complained' | 'opened' | 'bounced' | 'delivered' | 'sending' | 'failed' | 'none';
type Tracked = { to_email: string; status: string; reason: string | null; sent_at: string };
const MAIL_STATES: Record<MailState, { label: string; className: string }> = {
  complained: { label: 'Báo spam', className: 'text-danger font-semibold' },
  opened: { label: 'Đã mở', className: 'text-success font-semibold' },
  bounced: { label: 'Bị trả lại', className: 'text-danger font-semibold' },
  delivered: { label: 'Đã tới', className: 'text-success' },
  sending: { label: 'Đang gửi', className: 'text-muted-foreground' },
  failed: { label: 'Gửi lỗi', className: 'text-danger' },
  none: { label: 'Chưa có dữ liệu', className: 'text-muted-foreground' },
};
const stateOf = (status: string): MailState => {
  if (status === 'complained') return 'complained';
  if (status === 'opened' || status === 'clicked') return 'opened';
  if (status === 'bounced' || status === 'suppressed') return 'bounced';
  if (status === 'delivered') return 'delivered';
  return status === 'failed' ? 'failed' : 'sending';
};

/** Spam reports and opens always count. Otherwise the newest email decides, ignoring a send that failed on our side. */
function mailVerdict(mails: Tracked[]): { state: MailState; reason: string | null } {
  const has = (state: MailState) => mails.some((m) => stateOf(m.status) === state);
  if (has('complained')) return { state: 'complained', reason: null };
  if (has('opened')) return { state: 'opened', reason: null };
  const newest = [...mails].sort((a, b) => b.sent_at.localeCompare(a.sent_at));
  const latest = newest.find((m) => stateOf(m.status) !== 'failed') || newest[0];
  return latest ? { state: stateOf(latest.status), reason: latest.reason } : { state: 'none', reason: null };
}

export default function LeadsPage() {
  const [rows, setRows] = useState<any[] | null>(null);
  // Every file link handed out (migration 026): who, which product, when
  const [downloads, setDownloads] = useState<{ email: string | null; title: string; at: string }[]>([]);
  const [tracked, setTracked] = useState<Tracked[]>([]);
  const [mailState, setMailState] = useState('');
  const [product, setProduct] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    supabase.from('leads').select('*').order('created_at', { ascending: false }).then(({ data }) => setRows(data || []));
    supabase.from('email_status').select('to_email, status, reason, sent_at').limit(50000).then(({ data }) => setTracked((data || []) as Tracked[]));
    supabase.from('asset_downloads').select('email, created_at, digital_assets ( title )').order('created_at', { ascending: false }).limit(50000).then(({ data }) => {
      setDownloads(((data || []) as any[]).filter((d) => d.digital_assets?.title).map((d) => ({ email: d.email, title: d.digital_assets.title, at: d.created_at })));
    });
  }, []);

  // Dates are whole days in the admin's own time zone, both ends included
  const inRange = useMemo(() => {
    const start = from ? new Date(`${from}T00:00:00`).getTime() : -Infinity;
    const end = to ? new Date(`${to}T23:59:59.999`).getTime() : Infinity;
    return (at: string) => { const t = new Date(at).getTime(); return t >= start && t <= end; };
  }, [from, to]);

  const products = useMemo(() => [...new Set(downloads.map((d) => d.title))].sort(), [downloads]);
  const matching = useMemo(() => downloads.filter((d) => (!product || d.title === product) && inRange(d.at)), [downloads, product, inRange]);
  const people = useMemo(() => new Set(matching.map((d) => d.email).filter(Boolean)), [matching]);
  const filtering = !!(product || from || to);

  const verdicts = useMemo(() => {
    const byEmail = new Map<string, Tracked[]>();
    for (const m of tracked) byEmail.set(m.to_email, [...(byEmail.get(m.to_email) || []), m]);
    return new Map([...byEmail].map(([email, mails]) => [email, mailVerdict(mails)]));
  }, [tracked]);
  const verdictOf = useCallback((email: string) => verdicts.get(email.toLowerCase()) || { state: 'none' as MailState, reason: null }, [verdicts]);

  // "Đã tải" shows the filtered downloads, one line per product with how many times
  const taken = useMemo(() => {
    const next: Record<string, Record<string, number>> = {};
    for (const d of matching) {
      if (!d.email) continue;
      const counts = (next[d.email] ??= {});
      counts[d.title] = (counts[d.title] || 0) + 1;
    }
    return next;
  }, [matching]);

  // A product filter keeps those who took it. A date filter alone also keeps leads who signed up that day.
  const shown = useMemo(() => (rows || []).filter((r) => {
    if (mailState && verdictOf(r.email).state !== mailState) return false;
    if (!filtering) return true;
    if (taken[r.email]) return true;
    return !product && inRange(r.created_at);
  }), [rows, taken, filtering, product, inRange, mailState, verdictOf]);

  const takenText = (email: string) => Object.entries(taken[email] || {}).map(([t, n]) => (n > 1 ? `${t} (${n} lần)` : t));
  const clearFilters = () => { setProduct(''); setFrom(''); setTo(''); setMailState(''); };

  const exportCsv = () => {
    const lines = [['Tên', 'Email', 'Trạng thái email', 'Zalo', 'Nguồn', 'Đã tải', 'Ngày'], ...shown.map((r) => [r.name || '', r.email, MAIL_STATES[verdictOf(r.email).state].label, r.phone || '', SOURCES[r.source] || r.source || '', takenText(r.email).join(' | '), new Date(r.created_at).toLocaleString('vi-VN')])];
    const csv = '﻿' + lines.map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'khach-tiem-nang.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Khách tiềm năng"
        description="Người để lại thông tin để nhận Checklist quay video hoặc tải sản phẩm miễn phí. Nhắn Zalo hoặc gửi ưu đãi để chuyển họ thành học viên."
        actions={rows?.length ? <button onClick={exportCsv} className="btn btn-outline"><Download size={16} aria-hidden="true" /> Tải CSV</button> : undefined}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Tổng số đã tải" value={matching.length} icon={Download} hint={filtering ? 'Theo bộ lọc đang chọn' : 'Tất cả sản phẩm, mọi thời gian'} />
        <StatCard label="Số người đã tải" value={people.size} icon={Users} hint="Mỗi email tính 1 người" />
        <StatCard label="Khách trong danh sách" value={shown.length} icon={Inbox} hint={filtering || mailState ? 'Theo bộ lọc đang chọn' : 'Tất cả khách tiềm năng'} />
      </div>

      <div className="card p-4 flex flex-wrap items-end gap-4">
        <div className="min-w-[14rem] flex-1">
          <label htmlFor="lead-product" className="field-label">Sản phẩm</label>
          <select id="lead-product" className="input" value={product} onChange={(e) => setProduct(e.target.value)}>
            <option value="">Tất cả sản phẩm</option>
            {products.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="lead-from" className="field-label">Từ ngày</label>
          <input id="lead-from" type="date" className="input" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label htmlFor="lead-to" className="field-label">Đến ngày</label>
          <input id="lead-to" type="date" className="input" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div>
          <label htmlFor="lead-mail-state" className="field-label">Trạng thái email</label>
          <select id="lead-mail-state" className="input" value={mailState} onChange={(e) => setMailState(e.target.value)}>
            <option value="">Tất cả</option>
            {(Object.keys(MAIL_STATES) as MailState[]).map((s) => <option key={s} value={s}>{MAIL_STATES[s].label}</option>)}
          </select>
        </div>
        {(filtering || mailState) && <button type="button" onClick={clearFilters} className="btn btn-outline"><X size={16} aria-hidden="true" /> Bỏ lọc</button>}
      </div>

      {!rows ? <LoadingRow /> : rows.length === 0 ? (
        <EmptyState icon={Inbox} title="Chưa có ai đăng ký" text="Form nhận checklist nằm ở trang chủ và trang Khóa học." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead><tr><th className={thClass}>Tên</th><th className={thClass}>Email</th><th className={thClass}>Trạng thái email</th><th className={thClass}>Zalo</th><th className={thClass}>Nguồn</th><th className={thClass}>Đã tải</th><th className={thClass}>Ngày</th></tr></thead>
            <tbody className="divide-y divide-line">
              {shown.length === 0 && <tr><td colSpan={7} className={`${tdClass} text-center text-muted-foreground`}>Không có khách nào khớp bộ lọc.</td></tr>}
              {shown.map((r) => (
                <tr key={r.id}>
                  <td className={tdClass}>{r.name || '—'}</td>
                  <td className={tdClass}><a href={`mailto:${r.email}`} className="underline underline-offset-4">{r.email}</a></td>
                  <td className={`${tdClass} whitespace-nowrap ${MAIL_STATES[verdictOf(r.email).state].className}`} title={verdictOf(r.email).reason || undefined}>{MAIL_STATES[verdictOf(r.email).state].label}</td>
                  <td className={tdClass}>{r.phone ? <a href={`https://zalo.me/${r.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{r.phone}</a> : '—'}</td>
                  <td className={tdClass}>{SOURCES[r.source] || r.source || '—'}</td>
                  <td className={tdClass}>{taken[r.email] ? <ul className="space-y-1 min-w-[12rem]">{takenText(r.email).map((t) => <li key={t}>{t}</li>)}</ul> : '—'}</td>
                  <td className={`${tdClass} whitespace-nowrap`}>{new Date(r.created_at).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
