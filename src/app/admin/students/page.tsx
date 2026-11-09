"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { formatVND } from '@/lib/supabase-public';
import { Users, Search, Plus, KeyRound, Trash2, X, Download, UserCheck, UserPlus, Moon, Loader2, Lock, Copy, Check } from 'lucide-react';
import { PageHeader, LoadingRow, EmptyState, Modal, Field, StatusBadge, StatCard, thClass, tdClass } from '@/components/admin/AdminUI';

type Notice = { type: 'success' | 'error'; text: string } | null;
type Tab = 'all' | 'learning' | 'lead' | 'inactive';

const DAY = 24 * 60 * 60 * 1000;
const INACTIVE_DAYS = 14;

const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'learning', label: 'Đang học' },
  { key: 'lead', label: 'Chưa mua' },
  { key: 'inactive', label: `Không hoạt động ${INACTIVE_DAYS} ngày` },
];

/** Letters to change to turn a into b: finds an existing student behind a mistyped email. */
function editDistance(a: string, b: string) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = row;
  }
  return prev[b.length];
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-gold rounded-full" style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-semibold tabular-nums w-9 text-right">{value}%</span>
    </div>
  );
}

export default function StudentsManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [notice, setNotice] = useState<Notice>(null);
  const [grantFor, setGrantFor] = useState<any>(null);
  const [grantCourse, setGrantCourse] = useState('');
  const [grantForm, setGrantForm] = useState({ email: '', name: '', sendEmail: true });
  const [grantConfirmed, setGrantConfirmed] = useState(false);
  const [accountFor, setAccountFor] = useState<any>(null);
  const [accountForm, setAccountForm] = useState({ email: '', name: '', courseId: '' });
  const [accountConfirmed, setAccountConfirmed] = useState(false);
  const [accountResult, setAccountResult] = useState<{ email: string; password: string; created: boolean; courseTitle: string | null; warning: string | null } | null>(null);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [now] = useState(() => Date.now());

  const load = useCallback(
    () => Promise.all([
      supabase.from('users').select('id, email, full_name, role, created_at, last_active_at, enrollments ( course_id, status, enrolled_at, courses ( title ) )').order('created_at', { ascending: false }),
      supabase.from('courses').select('id, title, lessons ( id )').order('created_at'),
      supabase.from('student_progress').select('user_id, lesson_id, last_watched_at, lessons ( course_id )').eq('is_completed', true),
      supabase.from('payments').select('id, user_id, amount, status, created_at, order_id, courses ( title ), digital_assets ( title )').order('created_at', { ascending: false }),
    ]).then(([u, c, p, pay]) => {
      setUsers(u.data || []);
      setCourses(c.data || []);
      setProgress(p.data || []);
      setPayments(pay.data || []);
      setLoading(false);
    }),
    []
  );

  useEffect(() => { load(); }, [load]);

  // Derived numbers per user: spend, course progress, last activity
  const lessonCount = useMemo(() => Object.fromEntries(courses.map((c) => [c.id, c.lessons?.length || 0])), [courses]);
  const rows = useMemo(() => users.map((u) => {
    const done = progress.filter((p) => p.user_id === u.id);
    const enrollments = (u.enrollments || []).map((en: any) => {
      const completed = done.filter((p) => p.lessons?.course_id === en.course_id).length;
      const total = lessonCount[en.course_id] || 0;
      return { ...en, completed, total, percent: total ? Math.round((completed / total) * 100) : 0 };
    });
    const paid = payments.filter((p) => p.user_id === u.id && p.status === 'success');
    const lastWatch = done.reduce((max, p) => (p.last_watched_at > max ? p.last_watched_at : max), '');
    const lastActive = [u.last_active_at, lastWatch].filter(Boolean).sort().at(-1) || null;
    return {
      ...u,
      enrollments,
      spent: paid.reduce((s, p) => s + Number(p.amount), 0),
      orders: payments.filter((p) => p.user_id === u.id),
      lastActive,
      isLearning: enrollments.some((e: any) => e.status === 'active'),
      isInactive: !lastActive || now - new Date(lastActive).getTime() > INACTIVE_DAYS * DAY,
    };
  }), [users, progress, payments, lessonCount, now]);

  const stats = useMemo(() => ({
    total: rows.length,
    learning: rows.filter((r) => r.isLearning).length,
    newcomers: rows.filter((r) => now - new Date(r.created_at).getTime() < 30 * DAY).length,
    inactive: rows.filter((r) => r.isLearning && r.isInactive).length,
  }), [rows, now]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((u) =>
      (tab === 'all' || (tab === 'learning' && u.isLearning) || (tab === 'lead' && !u.isLearning) || (tab === 'inactive' && u.isInactive)) &&
      (!q || u.email?.toLowerCase().includes(q) || u.full_name?.toLowerCase().includes(q)));
  }, [rows, query, tab]);

  // Opens a course without payment; /api/admin/grant creates the account when the email is new
  const openGrant = (u?: any) => {
    setGrantFor(u || { isNew: true });
    setGrantCourse(courses[0]?.id || '');
    setGrantForm({ email: u?.email || '', name: u?.full_name || '', sendEmail: true });
    setGrantConfirmed(false);
  };

  // A typed email with no account would silently create a new one: a typo must not get that far
  const grantEmail = grantForm.email.trim().toLowerCase();
  const grantEmailIsNew = !!grantEmail && !users.some((u) => u.email?.toLowerCase() === grantEmail);
  const grantSimilar = grantEmailIsNew ? users.filter((u) => u.email && editDistance(u.email.toLowerCase(), grantEmail) <= 2).map((u) => u.email).slice(0, 3) : [];

  async function grant(e: React.FormEvent) {
    e.preventDefault();
    if (!grantFor || !grantCourse || !grantForm.email.trim()) return;
    if (grantEmailIsNew && !grantConfirmed) return;
    setBusy(true);
    const res = await fetch('/api/admin/grant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...grantForm, courseId: grantCourse }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setNotice({ type: 'error', text: data.error || 'Không cấp quyền được.' });
    setNotice({ type: 'success', text: data.message });
    setGrantFor(null);
    setGrantCourse('');
    load();
  }

  // Creates an account, or replaces the password of an existing one, and shows the new password once
  const openAccount = (u?: any) => {
    setAccountFor(u || { isNew: true });
    setAccountForm({ email: u?.email || '', name: '', courseId: '' });
    setAccountConfirmed(false);
    setAccountResult(null);
    setPasswordCopied(false);
  };

  const closeAccount = () => {
    if (accountResult && !passwordCopied && !confirm('Mật khẩu sẽ không hiện lại sau khi đóng. Vẫn đóng?')) return;
    setAccountFor(null);
    setAccountResult(null);
  };

  const accountEmail = accountForm.email.trim().toLowerCase();
  const accountExisting = users.find((u) => u.email?.toLowerCase() === accountEmail);
  const accountSimilar = accountEmail && !accountExisting ? users.filter((u) => u.email && editDistance(u.email.toLowerCase(), accountEmail) <= 2).map((u) => u.email).slice(0, 3) : [];

  async function submitAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!accountEmail || !accountConfirmed || accountExisting?.role === 'admin') return;
    setBusy(true);
    const res = await fetch('/api/admin/account', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...accountForm, replacePassword: !!accountExisting }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setNotice({ type: 'error', text: data.error || 'Không tạo được tài khoản.' });
    setAccountResult(data);
    load();
  }

  async function copyPassword() {
    if (!accountResult) return;
    try {
      await navigator.clipboard.writeText(`Email: ${accountResult.email}\nMật khẩu: ${accountResult.password}`);
      setPasswordCopied(true);
    } catch {
      setNotice({ type: 'error', text: 'Trình duyệt chặn sao chép. Hãy bôi đen mật khẩu để chép tay.' });
    }
  }

  async function revoke(userId: string, courseId: string, email: string) {
    if (!confirm(`Thu hồi quyền học của ${email}?`)) return;
    const { error } = await supabase.from('enrollments').update({ status: 'expired' }).eq('user_id', userId).eq('course_id', courseId);
    setNotice(error ? { type: 'error', text: error.message } : { type: 'success', text: `Đã thu hồi quyền học của ${email}.` });
    setDetail(null);
    load();
  }

  async function callAdminApi(method: 'POST' | 'DELETE', user: any) {
    if (method === 'DELETE' && !confirm(`Xóa vĩnh viễn tài khoản ${user.email}? Thao tác này không thể hoàn tác.`)) return;
    const res = await fetch('/api/admin/user', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id }) });
    const data = await res.json();
    setNotice(res.ok ? { type: 'success', text: data.message } : { type: 'error', text: data.error });
    if (res.ok && method === 'DELETE') { setDetail(null); load(); }
  }

  const exportCsv = () => {
    const header = ['Email', 'Họ tên', 'Ngày đăng ký', 'Hoạt động gần nhất', 'Khóa học', 'Tiến độ', 'Tổng chi (VNĐ)'];
    const lines = filtered.map((u) => [
      u.email, u.full_name || '', new Date(u.created_at).toLocaleDateString('vi-VN'),
      u.lastActive ? new Date(u.lastActive).toLocaleDateString('vi-VN') : '',
      u.enrollments.map((e: any) => e.courses?.title).join(' | '),
      u.enrollments.map((e: any) => `${e.percent}%`).join(' | '),
      u.spent,
    ]);
    const csv = [header, ...lines].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    Object.assign(document.createElement('a'), { href: url, download: `hoc-vien-${new Date().toISOString().slice(0, 10)}.csv` }).click();
    URL.revokeObjectURL(url);
  };

  const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('vi-VN') : '—');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Học viên"
        description="Theo dõi ai đang học, học tới đâu và đã chi bao nhiêu."
        actions={<>
          <button onClick={() => openGrant()} className="btn btn-gold"><Plus size={16} aria-hidden="true" /> Cấp quyền khóa học</button>
          <button onClick={() => openAccount()} className="btn btn-outline"><UserPlus size={16} aria-hidden="true" /> Tạo tài khoản</button>
          <button onClick={exportCsv} disabled={filtered.length === 0} className="btn btn-outline"><Download size={16} aria-hidden="true" /> Xuất CSV</button>
        </>}
      />

      {notice && (
        <p role={notice.type === 'error' ? 'alert' : 'status'} className={`p-4 rounded-md text-sm flex justify-between gap-4 ${notice.type === 'error' ? 'bg-red-50 text-danger' : 'bg-gold-soft text-ink'}`}>
          {notice.text}
          <button onClick={() => setNotice(null)} aria-label="Đóng thông báo"><X size={16} aria-hidden="true" /></button>
        </p>
      )}

      {!loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Tổng tài khoản" value={stats.total} icon={Users} />
          <StatCard label="Đang học" value={stats.learning} icon={UserCheck} hint="Có ít nhất 1 khóa đang mở" />
          <StatCard label="Đăng ký mới 30 ngày" value={stats.newcomers} icon={UserPlus} />
          <StatCard label="Cần nhắc học" value={stats.inactive} icon={Moon} hint={`Đang học nhưng ${INACTIVE_DAYS} ngày không vào`} />
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
        <div className="flex gap-2 overflow-x-auto no-scrollbar" role="tablist" aria-label="Lọc học viên">
          {TABS.map((t) => (
            <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
                    className={`shrink-0 min-h-[44px] px-4 rounded-md text-sm font-semibold border transition-colors ${tab === t.key ? 'bg-onyx text-white border-onyx' : 'bg-card border-line-strong text-stone hover:border-ink'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative lg:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="student-search" className="sr-only">Tìm học viên</label>
          <input id="student-search" className="input pl-9" placeholder="Tìm theo email hoặc tên…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {loading ? <LoadingRow /> : filtered.length === 0 ? (
        <EmptyState icon={Users} title="Không có học viên phù hợp" text="Thử đổi bộ lọc hoặc từ khóa." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line">
              <tr><th className={thClass}>Học viên</th><th className={thClass}>Khóa học & tiến độ</th><th className={`${thClass} text-right`}>Đã chi</th><th className={thClass}>Hoạt động</th><th className={`${thClass} text-right`}>Thao tác</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-muted/60 align-top">
                  <td className={tdClass}>
                    <button onClick={() => setDetail(u)} className="text-left group">
                      <span className="block font-semibold group-hover:text-gold transition-colors">{u.full_name || u.email?.split('@')[0]}</span>
                      <span className="block text-muted-foreground">{u.email}</span>
                    </button>
                    {u.role === 'admin' && <span className="badge mt-1">Admin</span>}
                  </td>
                  <td className={tdClass}>
                    {u.enrollments.length ? (
                      <ul className="space-y-2">
                        {u.enrollments.map((en: any) => (
                          <li key={en.course_id}>
                            <div className="flex items-center gap-2 flex-wrap"><span>{en.courses?.title}</span>{en.status !== 'active' && <StatusBadge status={en.status} />}</div>
                            <ProgressBar value={en.percent} />
                          </li>
                        ))}
                      </ul>
                    ) : <span className="text-muted-foreground">Chưa ghi danh</span>}
                  </td>
                  <td className={`${tdClass} text-right font-semibold whitespace-nowrap`}>{u.spent ? formatVND(u.spent) : '—'}</td>
                  <td className={`${tdClass} whitespace-nowrap`}>
                    <span className={u.isInactive && u.isLearning ? 'text-danger font-semibold' : ''}>{fmtDate(u.lastActive)}</span>
                    <span className="block text-xs text-muted-foreground">Đăng ký {fmtDate(u.created_at)}</span>
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openGrant(u)} className="btn btn-dark !min-h-[40px] !px-3 text-xs"><Plus size={14} aria-hidden="true" /> Ghi danh</button>
                      <button onClick={() => callAdminApi('POST', u)} className="w-10 h-10 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-ink" aria-label={`Gửi email đặt lại mật khẩu cho ${u.email}`} title="Gửi email đặt lại mật khẩu">
                        <KeyRound size={16} aria-hidden="true" />
                      </button>
                      {u.role !== 'admin' && (
                        <button onClick={() => openAccount(u)} className="w-10 h-10 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-ink" aria-label={`Đặt mật khẩu mới cho ${u.email}`} title="Đặt mật khẩu mới">
                          <Lock size={16} aria-hidden="true" />
                        </button>
                      )}
                      <button onClick={() => callAdminApi('DELETE', u)} className="w-10 h-10 rounded-md flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-danger" aria-label={`Xóa tài khoản ${u.email}`} title="Xóa tài khoản">
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Student detail */}
      <Modal title={detail?.full_name || detail?.email || 'Học viên'} open={!!detail} onClose={() => setDetail(null)} wide>
        {detail && (
          <div className="space-y-6">
            <dl className="grid gap-4 sm:grid-cols-4 text-sm">
              <div><dt className="text-muted-foreground">Email</dt><dd className="font-semibold break-all">{detail.email}</dd></div>
              <div><dt className="text-muted-foreground">Ngày đăng ký</dt><dd className="font-semibold">{fmtDate(detail.created_at)}</dd></div>
              <div><dt className="text-muted-foreground">Hoạt động gần nhất</dt><dd className="font-semibold">{fmtDate(detail.lastActive)}</dd></div>
              <div><dt className="text-muted-foreground">Tổng đã chi</dt><dd className="font-semibold">{formatVND(detail.spent)}</dd></div>
            </dl>

            <section>
              <h3 className="text-xl">Khóa học</h3>
              {detail.enrollments.length === 0 ? <p className="mt-2 text-muted-foreground">Chưa ghi danh khóa nào.</p> : (
                <ul className="mt-3 space-y-3">
                  {detail.enrollments.map((en: any) => (
                    <li key={en.course_id} className="p-4 rounded-md bg-muted">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <p className="font-semibold">{en.courses?.title}</p>
                        <div className="flex items-center gap-2"><StatusBadge status={en.status} />
                          {en.status === 'active' && <button onClick={() => revoke(detail.id, en.course_id, detail.email)} className="text-xs text-muted-foreground hover:text-danger underline underline-offset-2">Thu hồi</button>}
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">Ghi danh {fmtDate(en.enrolled_at)} · đã xong {en.completed}/{en.total} bài</p>
                      <div className="mt-2"><ProgressBar value={en.percent} /></div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3 className="text-xl">Lịch sử thanh toán</h3>
              {detail.orders.length === 0 ? <p className="mt-2 text-muted-foreground">Chưa có giao dịch.</p> : (
                <table className="mt-3 w-full text-sm">
                  <tbody className="divide-y divide-line">
                    {detail.orders.map((o: any) => (
                      <tr key={o.id}>
                        <td className="py-2 pr-3 whitespace-nowrap">{fmtDate(o.created_at)}</td>
                        <td className="py-2 pr-3">{o.courses?.title || o.digital_assets?.title || '—'}</td>
                        <td className="py-2 pr-3 text-right font-semibold whitespace-nowrap">{formatVND(o.amount)}</td>
                        <td className="py-2"><StatusBadge status={o.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </div>
        )}
      </Modal>

      <Modal title="Cấp quyền khóa học" open={!!grantFor} onClose={() => setGrantFor(null)}>
        <form onSubmit={grant} className="space-y-5">
          <p className="text-muted-foreground">Mở khóa học miễn phí, không cần thanh toán: tặng học viên, học viên chuyển khoản trực tiếp, đối tác… Email chưa có tài khoản thì hệ thống tự tạo và gửi link đặt mật khẩu.</p>
          <Field id="grant-email" label="Email học viên">
            <input id="grant-email" type="email" className="input" required value={grantForm.email} disabled={!grantFor?.isNew}
                   onChange={(e) => { setGrantForm({ ...grantForm, email: e.target.value }); setGrantConfirmed(false); }} placeholder="hocvien@gmail.com" autoComplete="off" />
          </Field>
          {grantEmailIsNew && (
            <div role="alert" className="rounded-md bg-red-50 p-4 text-sm space-y-3">
              <p className="font-semibold text-danger">Email này chưa có tài khoản. Cấp quyền sẽ tạo tài khoản mới.</p>
              {grantSimilar.length > 0 && (
                <div>
                  <p>Có phải bạn định nhập:</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {grantSimilar.map((m) => (
                      <button key={m} type="button" onClick={() => { setGrantForm({ ...grantForm, email: m }); setGrantConfirmed(false); }} className="btn btn-outline !min-h-[36px] !px-3 text-sm">{m}</button>
                    ))}
                  </div>
                </div>
              )}
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 shrink-0 accent-[var(--color-gold)]" checked={grantConfirmed} onChange={(e) => setGrantConfirmed(e.target.checked)} />
                <span>Tôi đã kiểm tra, email <strong>{grantEmail}</strong> viết đúng.</span>
              </label>
            </div>
          )}
          {grantFor?.isNew && (
            <Field id="grant-name" label="Họ tên (không bắt buộc)">
              <input id="grant-name" className="input" value={grantForm.name} onChange={(e) => setGrantForm({ ...grantForm, name: e.target.value })} autoComplete="off" />
            </Field>
          )}
          <Field id="grant-course" label="Khóa học">
            <select id="grant-course" className="input" value={grantCourse} onChange={(e) => setGrantCourse(e.target.value)} required>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </Field>
          <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
            <input type="checkbox" className="w-5 h-5 accent-[var(--color-gold)]" checked={grantForm.sendEmail} onChange={(e) => setGrantForm({ ...grantForm, sendEmail: e.target.checked })} />
            <span className="text-sm">Gửi email chào mừng (kèm link đặt mật khẩu nếu là tài khoản mới)</span>
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setGrantFor(null)} className="btn btn-outline">Hủy</button>
            <button type="submit" disabled={busy || !grantCourse || !grantForm.email.trim() || (grantEmailIsNew && !grantConfirmed)} className="btn btn-gold">{busy && <Loader2 size={16} className="animate-spin" aria-hidden="true" />} Cấp quyền</button>
          </div>
        </form>
      </Modal>

      <Modal title={accountFor?.isNew ? 'Tạo tài khoản' : 'Đặt mật khẩu mới'} open={!!accountFor} onClose={closeAccount}>
        {accountResult ? (
          <div className="space-y-5">
            <p role="status" className="font-semibold">{accountResult.created ? 'Đã tạo tài khoản.' : 'Đã đổi mật khẩu.'}{accountResult.courseTitle ? ` Đã mở khóa “${accountResult.courseTitle}”.` : ''}</p>
            {accountResult.warning && <p role="alert" className="rounded-md bg-red-50 p-4 text-sm text-danger">{accountResult.warning}</p>}
            <dl className="rounded-md bg-muted p-4 space-y-3 text-sm">
              <div><dt className="text-muted-foreground">Email</dt><dd className="font-semibold break-all">{accountResult.email}</dd></div>
              <div><dt className="text-muted-foreground">Mật khẩu</dt><dd className="font-mono font-semibold text-base break-all select-all">{accountResult.password}</dd></div>
            </dl>
            <p className="text-sm text-muted-foreground">Mật khẩu chỉ hiện một lần và hệ thống không gửi email. Hãy gửi riêng cho học viên và nhắc họ đổi sau khi vào.</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={copyPassword} className="btn btn-outline">{passwordCopied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />} {passwordCopied ? 'Đã sao chép' : 'Sao chép'}</button>
              <button type="button" onClick={closeAccount} className="btn btn-gold">Xong</button>
            </div>
          </div>
        ) : (
          <form onSubmit={submitAccount} className="space-y-5">
            <p className="text-muted-foreground">Dùng khi học viên không nhận được email. Hệ thống tạo mật khẩu ngẫu nhiên, xác nhận sẵn email và không gửi thư.</p>
            <Field id="account-email" label="Email học viên">
              <input id="account-email" type="email" className="input" required value={accountForm.email} disabled={!accountFor?.isNew}
                     onChange={(e) => { setAccountForm({ ...accountForm, email: e.target.value }); setAccountConfirmed(false); }} placeholder="hocvien@gmail.com" autoComplete="off" />
            </Field>
            {accountExisting?.role === 'admin' ? (
              <p role="alert" className="rounded-md bg-red-50 p-4 text-sm font-semibold text-danger">Đây là tài khoản admin, không đổi mật khẩu ở đây.</p>
            ) : accountEmail && (
              <div role="alert" className="rounded-md bg-red-50 p-4 text-sm space-y-3">
                <p className="font-semibold text-danger">{accountExisting ? 'Email này đã có tài khoản. Tiếp tục sẽ thay mật khẩu hiện tại, học viên không dùng được mật khẩu cũ nữa.' : 'Email này chưa có tài khoản. Tiếp tục sẽ tạo tài khoản mới.'}</p>
                {accountSimilar.length > 0 && (
                  <div>
                    <p>Có phải bạn định nhập:</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {accountSimilar.map((m) => (
                        <button key={m} type="button" onClick={() => { setAccountForm({ ...accountForm, email: m }); setAccountConfirmed(false); }} className="btn btn-outline !min-h-[36px] !px-3 text-sm">{m}</button>
                      ))}
                    </div>
                  </div>
                )}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 shrink-0 accent-[var(--color-gold)]" checked={accountConfirmed} onChange={(e) => setAccountConfirmed(e.target.checked)} />
                  <span>{accountExisting ? <>Tôi muốn thay mật khẩu của <strong>{accountEmail}</strong>.</> : <>Tôi đã kiểm tra, email <strong>{accountEmail}</strong> viết đúng.</>}</span>
                </label>
              </div>
            )}
            {accountEmail && !accountExisting && (
              <Field id="account-name" label="Họ tên (không bắt buộc)">
                <input id="account-name" className="input" value={accountForm.name} onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })} autoComplete="off" />
              </Field>
            )}
            <Field id="account-course" label="Mở khóa học (không bắt buộc)">
              <select id="account-course" className="input" value={accountForm.courseId} onChange={(e) => setAccountForm({ ...accountForm, courseId: e.target.value })}>
                <option value="">Không mở khóa nào</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </Field>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={closeAccount} className="btn btn-outline">Hủy</button>
              <button type="submit" disabled={busy || !accountEmail || !accountConfirmed || accountExisting?.role === 'admin'} className="btn btn-gold">{busy && <Loader2 size={16} className="animate-spin" aria-hidden="true" />} {accountExisting ? 'Đặt mật khẩu mới' : 'Tạo tài khoản'}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
