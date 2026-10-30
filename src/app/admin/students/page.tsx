"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Users, Search, Plus, KeyRound, Trash2, X } from 'lucide-react';
import { PageHeader, LoadingRow, EmptyState, Modal, Field, StatusBadge, thClass, tdClass } from '@/components/admin/AdminUI';

type Notice = { type: 'success' | 'error'; text: string } | null;

export default function StudentsManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState<Notice>(null);
  const [grantFor, setGrantFor] = useState<any>(null);
  const [grantCourse, setGrantCourse] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    () => Promise.all([
      supabase.from('users').select('id, email, full_name, role, created_at, last_active_at, enrollments ( course_id, status, courses ( title ) )').order('created_at', { ascending: false }),
      supabase.from('courses').select('id, title').order('created_at'),
    ]).then(([{ data: userRows }, { data: courseRows }]) => {
      setUsers(userRows || []);
      setCourses(courseRows || []);
      setLoading(false);
    }),
    []
  );

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => !q || u.email?.toLowerCase().includes(q) || u.full_name?.toLowerCase().includes(q));
  }, [users, query]);

  async function grant(e: React.FormEvent) {
    e.preventDefault();
    if (!grantFor || !grantCourse) return;
    setBusy(true);
    const { error } = await supabase.from('enrollments').upsert({ user_id: grantFor.id, course_id: grantCourse, status: 'active' });
    setBusy(false);
    if (error) return setNotice({ type: 'error', text: `Không ghi danh được: ${error.message}` });
    setNotice({ type: 'success', text: `Đã mở khóa học cho ${grantFor.email}.` });
    setGrantFor(null);
    setGrantCourse('');
    load();
  }

  async function revoke(userId: string, courseId: string, email: string) {
    if (!confirm(`Thu hồi quyền học của ${email}?`)) return;
    const { error } = await supabase.from('enrollments').update({ status: 'expired' }).eq('user_id', userId).eq('course_id', courseId);
    setNotice(error ? { type: 'error', text: error.message } : { type: 'success', text: `Đã thu hồi quyền học của ${email}.` });
    load();
  }

  async function callAdminApi(method: 'POST' | 'DELETE', user: any) {
    if (method === 'DELETE' && !confirm(`Xóa vĩnh viễn tài khoản ${user.email}? Thao tác này không thể hoàn tác.`)) return;
    const res = await fetch('/api/admin/user', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id }) });
    const data = await res.json();
    setNotice(res.ok ? { type: 'success', text: data.message } : { type: 'error', text: data.error });
    if (res.ok && method === 'DELETE') load();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Học viên" description={`${users.length} tài khoản đã đăng ký.`} />

      {notice && (
        <p role={notice.type === 'error' ? 'alert' : 'status'} className={`p-4 rounded-md text-sm flex justify-between gap-4 ${notice.type === 'error' ? 'bg-red-50 text-danger' : 'bg-gold-soft text-ink'}`}>
          {notice.text}
          <button onClick={() => setNotice(null)} aria-label="Đóng thông báo"><X size={16} aria-hidden="true" /></button>
        </p>
      )}

      <div className="relative md:w-96">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <label htmlFor="student-search" className="sr-only">Tìm học viên</label>
        <input id="student-search" className="input pl-9" placeholder="Tìm theo email hoặc tên…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {loading ? <LoadingRow /> : filtered.length === 0 ? (
        <EmptyState icon={Users} title="Không tìm thấy học viên" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line"><tr><th className={thClass}>Học viên</th><th className={thClass}>Khóa học</th><th className={thClass}>Hoạt động gần nhất</th><th className={`${thClass} text-right`}>Thao tác</th></tr></thead>
            <tbody className="divide-y divide-line">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-muted/60 align-top">
                  <td className={tdClass}>
                    <p className="font-semibold">{u.full_name || u.email?.split('@')[0]}</p>
                    <p className="text-muted-foreground">{u.email}</p>
                    {u.role === 'admin' && <span className="badge mt-1">Admin</span>}
                  </td>
                  <td className={tdClass}>
                    {u.enrollments?.length ? (
                      <ul className="space-y-1.5">
                        {u.enrollments.map((en: any) => (
                          <li key={en.course_id} className="flex items-center gap-2 flex-wrap">
                            <span>{en.courses?.title}</span>
                            <StatusBadge status={en.status} />
                            {en.status === 'active' && (
                              <button onClick={() => revoke(u.id, en.course_id, u.email)} className="text-xs text-muted-foreground hover:text-danger underline underline-offset-2">Thu hồi</button>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : <span className="text-muted-foreground">Chưa ghi danh</span>}
                  </td>
                  <td className={`${tdClass} whitespace-nowrap text-muted-foreground`}>
                    {u.last_active_at ? new Date(u.last_active_at).toLocaleDateString('vi-VN') : '—'}
                    <p className="text-xs">Đăng ký {new Date(u.created_at).toLocaleDateString('vi-VN')}</p>
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <div className="flex justify-end gap-1">
                      <button onClick={() => { setGrantFor(u); setGrantCourse(courses[0]?.id || ''); }} className="btn btn-dark !min-h-[40px] !px-3 text-xs"><Plus size={14} aria-hidden="true" /> Ghi danh</button>
                      <button onClick={() => callAdminApi('POST', u)} className="w-10 h-10 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-ink" aria-label={`Gửi email đặt lại mật khẩu cho ${u.email}`} title="Gửi email đặt lại mật khẩu">
                        <KeyRound size={16} aria-hidden="true" />
                      </button>
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

      <Modal title="Ghi danh thủ công" open={!!grantFor} onClose={() => setGrantFor(null)}>
        <form onSubmit={grant} className="space-y-5">
          <p className="text-muted-foreground">Mở quyền học cho <strong className="text-ink">{grantFor?.email}</strong> (ví dụ khi học viên chuyển khoản trực tiếp).</p>
          <Field id="grant-course" label="Khóa học">
            <select id="grant-course" className="input" value={grantCourse} onChange={(e) => setGrantCourse(e.target.value)} required>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </Field>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setGrantFor(null)} className="btn btn-outline">Hủy</button>
            <button type="submit" disabled={busy || !grantCourse} className="btn btn-gold">Mở khóa học</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
