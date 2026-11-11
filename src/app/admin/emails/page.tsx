"use client";

import { useEffect, useMemo, useState } from 'react';
import { Eye, Loader2, Mail, MailCheck, MailOpen, MailX, RotateCw, Search, Send, UserCheck } from 'lucide-react';
import { resendKind } from '@/lib/email-resend';
import { PageHeader, LoadingRow, EmptyState, Modal, StatCard, thClass, tdClass } from '@/components/admin/AdminUI';

type Row = { email: string; name: string | null; kind: string; label: string; course: string | null; sentAt: string };
type Recipient = { email: string; name: string | null; sentAt: string | null; optedOut: boolean };
type Campaign = { label: string; subject: string; html: string; recipients: Recipient[] };
type Tracked = { email_id: string; to_email: string; subject: string | null; status: string; reason: string | null; sent_at: string; delivered_at: string | null; opened_at: string | null; clicked_at: string | null };
type Data = { rows: Row[]; total: number; optouts: number; campaign: Campaign; remarketing: Campaign; tracking: { ready: boolean; webhook: boolean; rows: Tracked[]; resent: string[] } };
type Order = { orderId: string; status: string; amount: number; createdAt: string; email: string | null; name: string | null; product: string };
type SearchResult = { shown?: string; term: string; orders: Order[]; tracked: Tracked[]; log: { email: string; kind: string; label: string; sentAt: string }[]; resent: string[] };
type CampaignKey = 'campaign' | 'remarketing';

const when = (iso: string) => new Date(iso).toLocaleString('vi-VN');

const PROBLEMS = ['bounced', 'failed', 'suppressed', 'complained'];
const OPENED = ['opened', 'clicked'];
const STATUS_LABELS: Record<string, string> = {
  queued: 'Đang chờ gửi', scheduled: 'Đang chờ gửi', sent: 'Đang gửi', delivery_delayed: 'Gửi chậm',
  delivered: 'Đã tới hộp thư', opened: 'Đã mở', clicked: 'Đã bấm link',
  bounced: 'Bị trả lại', failed: 'Gửi thất bại', suppressed: 'Bị chặn', complained: 'Bị báo spam', canceled: 'Đã hủy',
};
const statusClass = (s: string) => (PROBLEMS.includes(s) ? 'text-danger font-semibold' : OPENED.includes(s) || s === 'delivered' ? 'text-success font-semibold' : 'text-muted-foreground');

/** Plain words first, with Resend's own wording kept so it can be looked up. */
function reasonText(t: Tracked) {
  const raw = t.reason || '';
  if (/quota|limit/i.test(raw)) return `Vượt hạn mức gửi của Resend (${raw})`;
  if (t.status === 'suppressed') return `Địa chỉ này từng bị trả lại hoặc báo spam nên Resend không gửi nữa${raw ? ` (${raw})` : ''}`;
  if (t.status === 'bounced') return `Máy chủ người nhận từ chối, thường do địa chỉ không tồn tại${raw ? ` (${raw})` : ''}`;
  if (t.status === 'complained') return 'Người nhận đã báo thư này là spam';
  if (t.status === 'failed') return raw || 'Resend không cho biết lý do';
  return raw || '—';
}

const ORDER_STATUS: Record<string, string> = { success: 'Đã thanh toán', pending: 'Chờ thanh toán', failed: 'Thất bại', expired: 'Hết hạn', cancelled: 'Đã hủy' };

/** One row per tracked email, with a button to send it again when the page knows how to rebuild it. */
function TrackedTable({ rows, resent, sending, onResend }: { rows: Tracked[]; resent: Set<string>; sending: string | null; onResend: (t: Tracked) => void }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[900px]">
        <thead><tr><th className={thClass}>Người nhận</th><th className={thClass}>Tiêu đề</th><th className={thClass}>Tình trạng</th><th className={thClass}>Lý do</th><th className={thClass}>Gửi lúc</th><th className={thClass}>Gửi lại</th></tr></thead>
        <tbody className="divide-y divide-line">
          {rows.map((t) => (
            <tr key={t.email_id}>
              <td className={`${tdClass} whitespace-nowrap`}>{t.to_email}</td>
              <td className={`${tdClass} min-w-[260px]`}>{t.subject || '—'}</td>
              <td className={`${tdClass} whitespace-nowrap`}>
                <span className={statusClass(t.status)}>{STATUS_LABELS[t.status] || t.status}</span>
                {t.opened_at && <span className="block text-xs text-muted-foreground">Mở {when(t.opened_at)}</span>}
              </td>
              <td className={`${tdClass} text-sm`}>{PROBLEMS.includes(t.status) ? reasonText(t) : '—'}</td>
              <td className={`${tdClass} whitespace-nowrap`}>{when(t.sent_at)}</td>
              <td className={`${tdClass} whitespace-nowrap`}>
                {resent.has(t.email_id) ? <span className="text-sm text-success font-semibold">Đã gửi lại</span>
                  : !resendKind(t.subject) ? <span className="text-xs text-muted-foreground">Chưa hỗ trợ</span>
                  : (
                    <button type="button" onClick={() => onResend(t)} disabled={!!sending} className="btn btn-outline min-h-11 px-3 text-sm" aria-label={`Gửi lại thư cho ${t.to_email}`}>
                      {sending === t.email_id ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <RotateCw size={16} aria-hidden="true" />} Gửi lại
                    </button>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function EmailsPage() {
  const [data, setData] = useState<Data | null>(null);
  const [loadError, setLoadError] = useState('');
  const [kind, setKind] = useState('');
  const [query, setQuery] = useState('');
  const [preview, setPreview] = useState<CampaignKey | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ key: CampaignKey; text: string } | null>(null);
  const [trackFilter, setTrackFilter] = useState('');
  const [trackQuery, setTrackQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [found, setFound] = useState<SearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [sending, setSending] = useState<string | null>(null);
  const [resendNotice, setResendNotice] = useState<{ ok: boolean; text: string } | null>(null);

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

  const tracked = useMemo(() => {
    const q = trackQuery.trim().toLowerCase();
    return (data?.tracking.rows || []).filter((t) =>
      (!trackFilter || (trackFilter === 'problem' ? PROBLEMS.includes(t.status) : trackFilter === 'opened' ? OPENED.includes(t.status) : t.status === trackFilter)) &&
      (!q || t.to_email.includes(q) || (t.subject || '').toLowerCase().includes(q)));
  }, [data, trackFilter, trackQuery]);

  /** The Resend record for a logged send: same address, sent within five minutes of the log row. */
  const outcome = (email: string, sentAt: string) => {
    const at = Date.parse(sentAt);
    return data?.tracking.rows.find((t) => t.to_email === email && Math.abs(Date.parse(t.sent_at) - at) < 5 * 60_000);
  };

  const runSearch = async (term: string) => {
    setSearching(true);
    setSearchError('');
    const res = await fetch(`/api/admin/emails?q=${encodeURIComponent(term)}`);
    const json = await res.json().catch(() => ({}));
    setSearching(false);
    if (!res.ok) { setFound(null); setSearchError(json.error || 'Chưa tìm được, thử lại sau.'); return; }
    setFound({ ...json.search, shown: term.trim() });
  };

  const resendOne = async (t: Tracked) => {
    if (!window.confirm(`Gửi lại thư "${t.subject || 'không tiêu đề'}" tới ${t.to_email}? Thư được tạo lại với link mới nhất.`)) return;
    setSending(t.email_id);
    setResendNotice(null);
    const res = await fetch('/api/admin/emails', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'resend', emailId: t.email_id }) });
    const json = await res.json().catch(() => ({}));
    setSending(null);
    if (!res.ok) { setResendNotice({ ok: false, text: json.error || 'Chưa gửi lại được, thử lại sau.' }); return; }
    setResendNotice({ ok: true, text: `Đã gửi lại tới ${json.to}. Tình trạng thư mới sẽ hiện sau ít phút.` });
    setVersion((v) => v + 1);
    if (found) runSearch(found.term);
  };

  const post = async (key: CampaignKey, action: 'test' | 'send') => {
    setBusy(true);
    setNotice(null);
    const res = await fetch('/api/admin/emails', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, campaign: key }) });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setNotice({ key, text: json.error || 'Chưa gửi được, thử lại sau.' }); return; }
    if (action === 'test') { setNotice({ key, text: `Đã gửi thử tới ${json.to}. Bản này không tính vào thống kê.` }); return; }
    const parts = [`Đã gửi ${json.sent} email`];
    if (json.failed) parts.push(`${json.failed} email lỗi, bấm gửi lại để thử tiếp`);
    if (json.remaining) parts.push(`còn ${json.remaining} người, bấm gửi lại để tiếp tục`);
    setNotice({ key, text: parts.join('. ') + '.' });
    setVersion((v) => v + 1);
  };

  if (loadError) return <EmptyState icon={MailX} title="Chưa tải được dữ liệu" text={loadError} />;
  if (!data) return <LoadingRow />;

  const reached = new Set(data.rows.map((r) => r.email)).size;
  const all = data.tracking.rows;
  const reachedInbox = all.filter((t) => t.status === 'delivered' || OPENED.includes(t.status)).length;
  const openedCount = all.filter((t) => OPENED.includes(t.status)).length;
  const problemCount = all.filter((t) => PROBLEMS.includes(t.status)).length;

  const sections: { key: CampaignKey; who: string }[] = [
    { key: 'remarketing', who: 'người' },
    { key: 'campaign', who: 'học viên' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Email đã gửi" description="Ai đã được gửi email nào và vào lúc nào." />

      <section className="card p-5 md:p-6 space-y-4" aria-labelledby="search-title">
        <div>
          <h2 id="search-title" className="text-2xl">Tìm email hoặc đơn hàng</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tìm trong toàn bộ lịch sử: nhập email, một phần email, tiêu đề thư hoặc mã đơn hàng.</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (searchInput.trim()) runSearch(searchInput); }} className="flex flex-col sm:flex-row gap-3">
          <input type="search" value={searchInput} onChange={(e) => { setSearchInput(e.target.value); if (!e.target.value) { setFound(null); setSearchError(''); } }} placeholder="vd: ten@gmail.com hoặc MTA4626WRTP" aria-label="Email hoặc mã đơn hàng" className="input sm:max-w-md" />
          <button type="submit" disabled={searching || searchInput.trim().length < 2} className="btn btn-gold">
            {searching ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Search size={16} aria-hidden="true" />} Tìm
          </button>
        </form>
        {searchError && <p role="alert" className="text-sm text-danger">{searchError}</p>}
        {resendNotice && <p role="status" className={`text-sm font-medium ${resendNotice.ok ? 'text-success' : 'text-danger'}`}>{resendNotice.text}</p>}
        {found && (
          <div className="space-y-5" aria-live="polite">
            <p className="text-sm font-medium">Kết quả cho &quot;{found.shown || found.term}&quot;: {found.orders.length} đơn hàng, {found.tracked.length} thư có theo dõi, {found.log.length} lượt trong lịch sử gửi.</p>
            {found.orders.length > 0 && (
              <div className="overflow-x-auto">
                <h3 className="text-lg font-semibold mb-2">Đơn hàng</h3>
                <table className="w-full min-w-[760px]">
                  <thead><tr><th className={thClass}>Mã đơn</th><th className={thClass}>Email</th><th className={thClass}>Sản phẩm</th><th className={thClass}>Số tiền</th><th className={thClass}>Trạng thái</th><th className={thClass}>Thời gian</th></tr></thead>
                  <tbody className="divide-y divide-line">
                    {found.orders.map((o) => (
                      <tr key={o.orderId}>
                        <td className={`${tdClass} font-mono text-sm`}>{o.orderId}</td>
                        <td className={`${tdClass} whitespace-nowrap`}>{o.email || '—'}</td>
                        <td className={`${tdClass} min-w-[240px]`}>{o.product}</td>
                        <td className={`${tdClass} whitespace-nowrap`}>{o.amount.toLocaleString('vi-VN')}đ</td>
                        <td className={`${tdClass} whitespace-nowrap`}>{ORDER_STATUS[o.status] || o.status}</td>
                        <td className={`${tdClass} whitespace-nowrap`}>{when(o.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold mb-2">Thư đã gửi</h3>
              {found.tracked.length
                ? <TrackedTable rows={found.tracked} resent={new Set(found.resent)} sending={sending} onResend={resendOne} />
                : <p className="text-sm text-muted-foreground">Không có thư nào có theo dõi. Thư gửi trước 6/11/2026 chỉ có trong lịch sử gửi bên dưới.</p>}
            </div>
            {found.log.length > 0 && (
              <div className="overflow-x-auto">
                <h3 className="text-lg font-semibold mb-2">Lịch sử gửi</h3>
                <table className="w-full min-w-[560px]">
                  <thead><tr><th className={thClass}>Email</th><th className={thClass}>Loại email</th><th className={thClass}>Thời gian</th></tr></thead>
                  <tbody className="divide-y divide-line">
                    {found.log.map((l) => (
                      <tr key={`${l.email}|${l.label}|${l.sentAt}`}>
                        <td className={`${tdClass} whitespace-nowrap`}>{l.email}</td>
                        <td className={tdClass}>{l.label}</td>
                        <td className={`${tdClass} whitespace-nowrap`}>{when(l.sentAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Lượt gửi" value={data.total} icon={Mail} />
        <StatCard label="Số người đã nhận" value={reached} icon={UserCheck} />
        <StatCard label="Đã ngừng nhận" value={data.optouts} icon={MailX} hint="Vẫn nhận email thanh toán và tài khoản" />
      </div>

      <section className="space-y-4" aria-labelledby="delivery-title">
        <div>
          <h2 id="delivery-title" className="text-2xl">Tình trạng từng thư</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tự cập nhật cho mọi thư gửi qua Resend từ ngày 6/11/2026, gồm cả thư sản phẩm miễn phí và thư tài khoản.</p>
        </div>
        {!data.tracking.ready && <p role="status" className="text-sm font-medium text-danger">Chưa bật được theo dõi: cần chạy file 027_email_status.sql trong Supabase.</p>}
        {data.tracking.ready && !data.tracking.webhook && <p role="status" className="text-sm font-medium text-danger">Chưa kết nối webhook Resend, nên trạng thái thư mới không được cập nhật.</p>}
        <div className="grid sm:grid-cols-3 gap-4">
          <StatCard label="Đã tới hộp thư" value={reachedInbox} icon={MailCheck} hint={`Trong ${all.length} thư gần nhất`} />
          <StatCard label="Đã mở" value={openedCount} icon={MailOpen} hint="Con số tương đối, xem ghi chú bên dưới" />
          <StatCard label="Thất bại" value={problemCount} icon={MailX} hint="Bị trả lại, bị chặn, lỗi gửi, báo spam" />
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <input type="search" value={trackQuery} onChange={(e) => setTrackQuery(e.target.value)} placeholder="Tìm theo email hoặc tiêu đề" aria-label="Tìm theo email hoặc tiêu đề" className="input md:max-w-xs" />
          <select value={trackFilter} onChange={(e) => setTrackFilter(e.target.value)} aria-label="Lọc theo tình trạng" className="input md:max-w-xs">
            <option value="">Tất cả tình trạng</option>
            <option value="problem">Thất bại</option>
            <option value="delivered">Đã tới, chưa mở</option>
            <option value="opened">Đã mở</option>
            <option value="delivery_delayed">Gửi chậm</option>
          </select>
        </div>
        {!found && resendNotice && <p role="status" className={`text-sm font-medium ${resendNotice.ok ? 'text-success' : 'text-danger'}`}>{resendNotice.text}</p>}
        {tracked.length === 0 ? (
          <EmptyState icon={Mail} title="Chưa có thư nào ở đây" text={all.length ? 'Thử đổi bộ lọc hoặc từ khóa.' : 'Thư mới sẽ tự hiện ở đây sau khi được gửi.'} />
        ) : (
          <TrackedTable rows={tracked} resent={new Set(data.tracking.resent)} sending={sending} onResend={resendOne} />
        )}
        <p className="text-sm text-muted-foreground">
          &quot;Đã mở&quot; chỉ là con số tương đối: có ứng dụng email tự mở thư thay người dùng, và có người chặn tải ảnh nên đã đọc mà không được tính.
          Nút Gửi lại tạo lại thư với link mới nhất, dùng được cho thư link tải sản phẩm miễn phí, thư sản phẩm đã thanh toán, thư chào mừng vào khóa và thư ưu đãi. Mỗi thư chỉ gửi lại được một lần.
        </p>
      </section>

      {sections.map(({ key, who }) => {
        const campaign = data[key];
        const pending = campaign.recipients.filter((r) => !r.sentAt && !r.optedOut);
        const sendAll = () => {
          if (window.confirm(`Gửi email "${campaign.label}" tới ${pending.length} ${who}? Email đã gửi thì không thu hồi được.`)) post(key, 'send');
        };
        return (
      <section key={key} className="card p-5 md:p-6 space-y-4" aria-labelledby={`${key}-title`}>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h2 id={`${key}-title`} className="text-2xl">{campaign.label}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Tiêu đề: {campaign.subject}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setPreview(key)} className="btn btn-outline"><Eye size={16} aria-hidden="true" /> Xem email</button>
            <button onClick={() => post(key, 'test')} disabled={busy} className="btn btn-outline">Gửi thử cho tôi</button>
            <button onClick={sendAll} disabled={busy || pending.length === 0} className="btn btn-gold">
              <Send size={16} aria-hidden="true" /> {pending.length ? `Gửi cho ${pending.length} ${who}` : 'Đã gửi hết'}
            </button>
          </div>
        </div>
        {notice?.key === key && <p role="status" className="text-sm font-medium">{notice.text}</p>}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr><th className={thClass}>Người nhận</th><th className={thClass}>Email</th><th className={thClass}>Trạng thái</th></tr></thead>
            <tbody className="divide-y divide-line">
              {campaign.recipients.map((r) => (
                <tr key={r.email}>
                  <td className={tdClass}>{r.name || '—'}</td>
                  <td className={tdClass}>{r.email}</td>
                  <td className={`${tdClass} whitespace-nowrap`}>
                    {r.sentAt
                      ? (() => {
                          const o = outcome(r.email, r.sentAt);
                          return o ? <span className={statusClass(o.status)}>{STATUS_LABELS[o.status] || o.status}, {when(r.sentAt)}</span> : `Đã giao cho Resend ${when(r.sentAt)}`;
                        })()
                      : r.optedOut ? 'Đã ngừng nhận, sẽ không gửi' : 'Chưa gửi'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
        );
      })}

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
              <thead><tr><th className={thClass}>Người nhận</th><th className={thClass}>Email</th><th className={thClass}>Loại email</th><th className={thClass}>Khóa học</th><th className={thClass}>Tình trạng</th><th className={thClass}>Thời gian</th></tr></thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={`${r.email}|${r.label}|${r.sentAt}`}>
                    <td className={tdClass}>{r.name || '—'}</td>
                    <td className={tdClass}>{r.email}</td>
                    <td className={tdClass}>{r.label}</td>
                    <td className={tdClass}>{r.course || '—'}</td>
                    <td className={`${tdClass} whitespace-nowrap`}>
                      {(() => { const o = outcome(r.email, r.sentAt); return o ? <span className={statusClass(o.status)}>{STATUS_LABELS[o.status] || o.status}</span> : '—'; })()}
                    </td>
                    <td className={`${tdClass} whitespace-nowrap`}>{when(r.sentAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          Bảng này chỉ gồm thư tự động và chiến dịch. Thư checklist, sản phẩm miễn phí, tư vấn và thanh toán sản phẩm nằm ở bảng Tình trạng từng thư phía trên.
          {data.total > 1000 ? ' Bảng hiện 1000 lượt gần nhất.' : ''}
        </p>
      </section>

      <Modal title="Xem email" open={!!preview} onClose={() => setPreview(null)} wide>
        <iframe title="Nội dung email" srcDoc={preview ? data[preview].html : ''} sandbox="" className="w-full h-[70vh] border border-line rounded-md bg-white" />
      </Modal>
    </div>
  );
}
