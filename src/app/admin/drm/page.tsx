"use client";

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { ShieldCheck, Radio, ShieldAlert, Ban, Film, Loader2 } from 'lucide-react';
import { PageHeader, LoadingRow, StatCard, EmptyState, thClass, tdClass } from '@/components/admin/AdminUI';

// tVNDRM monitor: who is watching right now, what was blocked, which videos are encrypted.
// Reads through RLS (migration 014: admins only). Revoking flips drm_sessions.revoked;
// the player stops at its next heartbeat or key/segment request.

const LIVE_MS = 45000;
const VIOLATION_NAMES: Record<string, string> = {
  devtools_detected: 'Mở DevTools', devtools_docked: 'Mở DevTools (gắn cạnh)', shortcut_violation: 'Phím tắt bị chặn',
  printscreen: 'Chụp màn hình', display_capture_requested: 'Quay màn hình trong trình duyệt', focus_lost: 'Rời cửa sổ',
  tab_hidden: 'Chuyển tab', concurrent_stream_blocked: 'Xem trên 2 thiết bị', segment_rate_exceeded: 'Tải đoạn video quá nhanh',
  key_rate_exceeded: 'Lấy khoá quá nhanh', many_accounts_one_device: 'Nhiều tài khoản một máy', ip_hopping: 'Đổi IP liên tục',
  session_burst: 'Mở phiên quá nhiều', text_copy: 'Cố copy bài đọc', text_print: 'Cố in bài đọc',
};
const REVOKE_NAMES: Record<string, string> = {
  too_many_violations: 'Vi phạm nhiều lần', revoked_by_admin: 'Admin thu hồi', download_tool_suspected: 'Nghi công cụ tải video',
};
const SOFT = ['focus_lost', 'tab_hidden'];
const time = (t: string) => new Date(t).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });

export default function DrmPage() {
  const [data, setData] = useState<{ live: any[]; blocked: any[]; violations: any[]; videos: any[]; lessons: Record<string, string>; emails: Record<string, string> } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const since = new Date(Date.now() - LIVE_MS).toISOString();
    const [live, blocked, violations, videos, lessons] = await Promise.all([
      supabase.from('drm_sessions').select('*').eq('revoked', false).gt('last_seen', since).order('last_seen', { ascending: false }),
      supabase.from('drm_sessions').select('*').eq('revoked', true).in('revoke_reason', Object.keys(REVOKE_NAMES)).order('created_at', { ascending: false }).limit(20),
      supabase.from('drm_violations').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('drm_videos').select('*').order('created_at', { ascending: false }),
      supabase.from('lessons').select('title, video_url').like('video_url', 'drm:%'),
    ]);
    const ids = [...new Set([...(live.data || []), ...(blocked.data || []), ...(violations.data || [])].map((r) => r.user_id).filter(Boolean))];
    const { data: users } = ids.length ? await supabase.from('users').select('id, email').in('id', ids) : { data: [] };
    setData({
      live: live.data || [], blocked: blocked.data || [], violations: violations.data || [], videos: videos.data || [],
      lessons: Object.fromEntries((lessons.data || []).map((l) => [l.video_url.slice(4).trim(), l.title])),
      emails: Object.fromEntries((users || []).map((u) => [u.id, u.email])),
    });
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  const revoke = async (id: string) => {
    setBusy(id);
    await supabase.from('drm_sessions').update({ revoked: true, revoke_reason: 'revoked_by_admin' }).eq('id', id);
    setBusy(null);
    load();
  };

  if (!data) return <LoadingRow />;
  const day = Date.now() - 86400e3;
  const severe24h = data.violations.filter((v) => !SOFT.includes(v.type) && new Date(v.created_at).getTime() > day).length;
  const who = (uid: string) => data.emails[uid] || uid?.slice(0, 8);

  return (
    <div className="space-y-6">
      <PageHeader title="Bảo vệ video (DRM)" description="Theo dõi phiên đang xem, thao tác vi phạm và video đã mã hoá. Tự làm mới mỗi 15 giây." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Đang xem" value={data.live.length} icon={Radio} hint="Phiên còn gửi tín hiệu trong 45 giây" />
        <StatCard label="Vi phạm 24 giờ" value={severe24h} icon={ShieldAlert} hint="Không tính rời cửa sổ / chuyển tab" />
        <StatCard label="Phiên bị khoá" value={data.blocked.length} icon={Ban} hint="20 phiên gần nhất" />
        <StatCard label="Video đã mã hoá" value={data.videos.length} icon={Film} />
      </div>

      <section className="card overflow-x-auto">
        <h2 className="text-2xl p-5 pb-0">Đang xem</h2>
        {data.live.length === 0 ? <p className="p-5 text-muted-foreground">Không có ai đang xem video DRM.</p> : (
          <table className="w-full mt-2">
            <thead><tr><th className={thClass}>Học viên</th><th className={thClass}>Video</th><th className={thClass}>IP</th><th className={thClass}>Bắt đầu</th><th className={thClass}>Vi phạm</th><th className={thClass}></th></tr></thead>
            <tbody className="divide-y divide-line">
              {data.live.map((s) => (
                <tr key={s.id}>
                  <td className={tdClass}>{who(s.user_id)}</td>
                  <td className={tdClass}>{data.lessons[s.video_id] || s.video_id}</td>
                  <td className={`${tdClass} tabular-nums`}>{s.ip}</td>
                  <td className={tdClass}>{time(s.created_at)}</td>
                  <td className={`${tdClass} tabular-nums`}>{s.violations}</td>
                  <td className={`${tdClass} text-right`}>
                    <button type="button" onClick={() => revoke(s.id)} disabled={busy === s.id} className="btn btn-outline min-h-[36px] py-1 text-sm">
                      {busy === s.id && <Loader2 size={14} className="animate-spin" aria-hidden="true" />} Thu hồi
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5 md:p-6">
          <h2 className="text-2xl">Thao tác vi phạm gần đây</h2>
          {data.violations.length === 0 ? <p className="mt-4 text-muted-foreground">Chưa có vi phạm nào.</p> : (
            <ul className="mt-4 divide-y divide-line text-sm">
              {data.violations.slice(0, 30).map((v) => (
                <li key={v.id} className="py-2.5 flex items-baseline justify-between gap-4">
                  <span className="min-w-0">
                    <span className={`font-semibold ${SOFT.includes(v.type) ? 'text-muted-foreground' : 'text-ink'}`}>{VIOLATION_NAMES[v.type] || v.type}</span>
                    <span className="text-muted-foreground"> · {who(v.user_id)}{v.video_id ? ` · ${data.lessons[v.video_id] || v.video_id}` : ''}</span>
                  </span>
                  <span className="text-muted-foreground whitespace-nowrap">{time(v.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5 md:p-6">
          <h2 className="text-2xl">Phiên bị khoá</h2>
          {data.blocked.length === 0 ? <p className="mt-4 text-muted-foreground">Chưa có phiên nào bị khoá.</p> : (
            <ul className="mt-4 divide-y divide-line text-sm">
              {data.blocked.map((s) => (
                <li key={s.id} className="py-2.5 flex items-baseline justify-between gap-4">
                  <span className="min-w-0"><span className="font-semibold text-ink">{REVOKE_NAMES[s.revoke_reason] || s.revoke_reason}</span><span className="text-muted-foreground"> · {who(s.user_id)} · {s.ip}</span></span>
                  <span className="text-muted-foreground whitespace-nowrap">{time(s.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card p-5 md:p-6">
        <h2 className="text-2xl">Video đã mã hoá</h2>
        <p className="mt-1 text-sm text-muted-foreground">Gắn vào bài học bằng cách điền <code className="px-1 rounded bg-muted">drm:MÃ-VIDEO</code> vào ô Video của bài học.</p>
        {data.videos.length === 0 ? (
          <div className="mt-4"><EmptyState icon={ShieldCheck} title="Chưa có video nào được mã hoá" text="Chạy scripts/drm/encrypt-upload.mjs để mã hoá và tải video lên." /></div>
        ) : (
          <ul className="mt-4 divide-y divide-line text-sm">
            {data.videos.map((v) => (
              <li key={v.id} className="py-2.5 flex items-baseline justify-between gap-4">
                <span className="min-w-0"><code className="font-semibold text-ink">drm:{v.id}</code><span className="text-muted-foreground"> · {v.title || 'Không tên'} · {v.key_count} khoá</span></span>
                <span className={`whitespace-nowrap ${data.lessons[v.id] ? 'text-success' : 'text-muted-foreground'}`}>{data.lessons[v.id] ? `Bài: ${data.lessons[v.id]}` : 'Chưa gắn bài học'}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
