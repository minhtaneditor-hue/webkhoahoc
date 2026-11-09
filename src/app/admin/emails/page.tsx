"use client";

import { useEffect, useMemo, useState } from 'react';
import { Eye, Mail, MailX, Send, UserCheck } from 'lucide-react';
import { PageHeader, LoadingRow, EmptyState, Modal, StatCard, thClass, tdClass } from '@/components/admin/AdminUI';

type Row = { email: string; name: string | null; kind: string; label: string; course: string | null; sentAt: string };
type Recipient = { email: string; name: string | null; sentAt: string | null; optedOut: boolean };
type Data = {
  rows: Row[]; total: number; optouts: number;
  campaign: { label: string; subject: string; html: string; recipients: Recipient[] };
};

const when = (iso: string) => new Date(iso).toLocaleString('vi-VN');

export default function EmailsPage() {
  const [data, setData] = useState<Data | null>(null);
  const [loadError, setLoadError] = useState('');
  const [kind, setKind] = useState('');
  const [query, setQuery] = useState('');
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const [version, setVersion] = useState(0); // bumped after a send to reload the numbers

  useEffect(() => {
    fetch('/api/admin/emails').then(async (res) => {
      const json = await res.json().catch(() => ({}));
      if (res.ok) setData(json);
      else setLoadError(json.error || 'Chưa tải được dữ liệu.');
    });
  }, [version]);

  const kinds = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>();
    for (const r of data?.rows || []) counts.set(r.label, { label: r.label, count: (counts.get(r.label)?.count || 0) + 1 });
    return [...counts.values()].sort((a, b) => b.count - a.count);
  }, [data]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data?.rows || []).filter((r) =>
      (!kind || r.label === kind) &&
      (!q || r.email.includes(q) || (r.name || '').toLowerCase().includes(q)));
  }, [data, kind, query]);

  const post = async (action: 'test' | 'send') => {
    setBusy(true);
    setNotice('');
    const res = await fetch('/api/admin/emails', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setNotice(json.error || 'Chưa gửi được, thử lại sau.'); return; }
    if (action === 'test') { setNotice(`Đã gửi thử tới ${json.to}. Bản này không tính vào thống kê.`); return; }
    const parts = [`Đã gửi ${json.sent} email`];
    if (json.failed) parts.push(`${json.failed} email lỗi, bấm gửi lại để thử tiếp`);
    if (json.remaining) parts.push(`còn ${json.remaining} người, bấm gửi lại để tiếp tục`);
    setNotice(parts.join('. ') + '.');
    setVersion((v) => v + 1);
  };

  if (loadError) return <EmptyState icon={MailX} title="Chưa tải được dữ liệu" text={loadError} />;
  if (!data) return <LoadingRow />;

  const { campaign } = data;
  const pending = campaign.recipients.filter((r) => !r.sentAt && !r.optedOut);
  const reached = new Set(data.rows.map((r) => r.email)).size;

  const sendAll = () => {
    if (window.confirm(`Gửi email "${campaign.label}" tới ${pending.length} học viên? Email đã gửi thì không thu hồi được.`)) post('send');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Email đã gửi" description="Ai đã được gửi email nào và vào lúc nào." />

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Lượt gửi" value={data.total} icon={Mail} />
        <StatCard label="Số người đã nhận" value={reached} icon={UserCheck} />
        <StatCard label="Đã ngừng nhận" value={data.optouts} icon={MailX} hint="Vẫn nhận email thanh toán và tài khoản" />
      </div>

      <section className="card p-5 md:p-6 space-y-4" aria-labelledby="campaign-title">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h2 id="campaign-title" className="text-2xl">{campaign.label}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Tiêu đề: {campaign.subject}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setPreview(true)} className="btn btn-outline"><Eye size={16} aria-hidden="true" /> Xem email</button>
            <button onClick={() => post('test')} disabled={busy} className="btn btn-outline">Gửi thử cho tôi</button>
            <button onClick={sendAll} disabled={busy || pending.length === 0} className="btn btn-gold">
              <Send size={16} aria-hidden="true" /> {pending.length ? `Gửi cho ${pending.length} học viên` : 'Đã gửi hết'}
            </button>
          </div>
        </div>
        {notice && <p role="status" className="text-sm font-medium">{notice}</p>}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr><th className={thClass}>Học viên</th><th className={thClass}>Email</th><th className={thClass}>Trạng thái</th></tr></thead>
            <tbody className="divide-y divide-line">
              {campaign.recipients.map((r) => (
                <tr key={r.email}>
                  <td className={tdClass}>{r.name || '—'}</td>
                  <td className={tdClass}>{r.email}</td>
                  <td className={`${tdClass} whitespace-nowrap`}>
                    {r.sentAt ? `Đã gửi ${when(r.sentAt)}` : r.optedOut ? 'Đã ngừng nhận, sẽ không gửi' : 'Chưa gửi'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="log-title">
        <h2 id="log-title" className="text-2xl">Lịch sử gửi</h2>
        <div className="flex flex-col md:flex-row gap-3">
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo tên hoặc email" aria-label="Tìm theo tên hoặc email" className="input md:max-w-xs" />
          <select value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Lọc theo loại email" className="input md:max-w-xs">
            <option value="">Tất cả loại email</option>
            {kinds.map((k) => <option key={k.label} value={k.label}>{k.label} ({k.count})</option>)}
          </select>
        </div>
        {rows.length === 0 ? (
          <EmptyState icon={Mail} title="Không có email nào khớp" />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead><tr><th className={thClass}>Người nhận</th><th className={thClass}>Email</th><th className={thClass}>Loại email</th><th className={thClass}>Khóa học</th><th className={thClass}>Thời gian</th></tr></thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={`${r.email}|${r.label}|${r.sentAt}`}>
                    <td className={tdClass}>{r.name || '—'}</td>
                    <td className={tdClass}>{r.email}</td>
                    <td className={tdClass}>{r.label}</td>
                    <td className={tdClass}>{r.course || '—'}</td>
                    <td className={`${tdClass} whitespace-nowrap`}>{when(r.sentAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          &quot;Đã gửi&quot; nghĩa là hệ thống gửi email đã nhận thư, chưa cho biết người nhận có mở hay không.
          Email checklist, sản phẩm miễn phí, tư vấn và thanh toán sản phẩm hiện chưa được ghi lại nên không có ở đây.
          {data.total > 1000 ? ' Bảng hiện 1000 lượt gần nhất.' : ''}
        </p>
      </section>

      <Modal title="Xem email" open={preview} onClose={() => setPreview(false)} wide>
        <iframe title="Nội dung email" srcDoc={campaign.html} sandbox="" className="w-full h-[70vh] border border-line rounded-md bg-white" />
      </Modal>
    </div>
  );
}
