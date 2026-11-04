'use client';

import { useRef, useState } from 'react';
import { Camera, Eye, EyeOff, Loader2, UserRound } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import { PASSWORD_RULE, PASSWORD_HINT } from '@/lib/password';

export type Profile = { full_name?: string | null; avatar_url?: string | null; phone?: string | null };
type Notice = { ok: boolean; text: string } | null;

/** Shrinks a photo in the browser so a large phone picture still uploads quickly. */
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 512 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('shrink'))), 'image/jpeg', 0.85));
}

function Message({ notice }: { notice: Notice }) {
  if (!notice) return null;
  return <p role={notice.ok ? 'status' : 'alert'} className={`text-sm ${notice.ok ? 'text-success' : 'text-danger'}`}>{notice.text}</p>;
}

/** Khu học tập > Hồ sơ: name (printed on certificates), phone, photo and a new password. Email stays fixed: course access hangs on it. */
export default function ProfileForm({ userId, email, profile, onSaved }: { userId: string; email: string; profile: Profile; onSaved: (patch: Profile) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(profile.full_name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [photoNotice, setPhotoNotice] = useState<Notice>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [passBusy, setPassBusy] = useState(false);
  const [passNotice, setPassNotice] = useState<Notice>(null);
  // The phone column arrives with migration 025; until then the field stays hidden
  const hasPhone = 'phone' in profile;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);
    const cleanName = name.trim().slice(0, 80);
    const cleanPhone = phone.trim();
    if (cleanPhone && cleanPhone.replace(/\D/g, '').length < 9) return setNotice({ ok: false, text: 'Số điện thoại chưa đúng.' });
    const patch: Profile = { full_name: cleanName || null, ...(hasPhone ? { phone: cleanPhone || null } : {}) };
    setBusy(true);
    const { error } = await supabase.from('users').update(patch).eq('id', userId);
    setBusy(false);
    if (error) return setNotice({ ok: false, text: 'Chưa lưu được, vui lòng thử lại.' });
    onSaved(patch);
    setNotice({ ok: true, text: 'Đã lưu thông tin.' });
  }

  async function changePhoto(file: File) {
    setPhotoNotice(null);
    if (!file.type.startsWith('image/')) return setPhotoNotice({ ok: false, text: 'Vui lòng chọn file ảnh.' });
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', new File([await shrink(file)], 'avatar.jpg', { type: 'image/jpeg' }));
      const res = await fetch('/api/profile/avatar', { method: 'POST', body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setPhotoNotice({ ok: false, text: data.error || 'Chưa tải được ảnh, vui lòng thử lại.' });
      onSaved({ avatar_url: data.url });
    } catch {
      setPhotoNotice({ ok: false, text: 'Không đọc được ảnh này, vui lòng chọn ảnh khác.' });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPassNotice(null);
    if (!PASSWORD_RULE.test(password)) return setPassNotice({ ok: false, text: PASSWORD_HINT });
    if (password !== confirm) return setPassNotice({ ok: false, text: 'Hai lần nhập mật khẩu chưa khớp.' });
    setPassBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setPassBusy(false);
    if (error) return setPassNotice({ ok: false, text: error.message.includes('different') ? 'Mật khẩu mới phải khác mật khẩu cũ.' : 'Chưa đổi được mật khẩu, vui lòng thử lại.' });
    setPassword('');
    setConfirm('');
    setPassNotice({ ok: true, text: 'Đã đổi mật khẩu.' });
  }

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      <form onSubmit={save} className="card p-6 space-y-5">
        <h3 className="text-2xl">Thông tin cá nhân</h3>
        <div className="flex items-center gap-4">
          <span className="w-20 h-20 shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element -- the student's own uploaded photo
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover !rounded-none" />
            ) : <UserRound size={32} className="text-muted-foreground" aria-hidden="true" />}
          </span>
          <div className="min-w-0">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn btn-outline !min-h-[44px] text-sm">
              {uploading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Camera size={16} aria-hidden="true" />}
              {uploading ? 'Đang tải…' : 'Đổi ảnh đại diện'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && changePhoto(e.target.files[0])} />
            <div className="mt-2"><Message notice={photoNotice} /></div>
          </div>
        </div>
        <div>
          <label htmlFor="profile-name" className="field-label">Họ và tên</label>
          <input id="profile-name" className="input" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Nguyễn Văn A" />
          <p className="mt-1.5 text-sm text-muted-foreground">Tên này sẽ in trên chứng chỉ, nên ghi đầy đủ và có dấu.</p>
        </div>
        {hasPhone && (
          <div>
            <label htmlFor="profile-phone" className="field-label">Số điện thoại / Zalo</label>
            <input id="profile-phone" type="tel" inputMode="tel" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="09xx xxx xxx" />
          </div>
        )}
        <div>
          <label htmlFor="profile-email" className="field-label">Email đăng nhập</label>
          <input id="profile-email" className="input" value={email} disabled />
          <p className="mt-1.5 text-sm text-muted-foreground">Khóa học gắn với email này. Cần đổi email, bạn nhắn Hỗ trợ.</p>
        </div>
        <Message notice={notice} />
        <button type="submit" disabled={busy} className="btn btn-dark">{busy && <Loader2 size={16} className="animate-spin" aria-hidden="true" />} Lưu thông tin</button>
      </form>

      <form onSubmit={changePassword} className="card p-6 space-y-5 self-start">
        <h3 className="text-2xl">Đổi mật khẩu</h3>
        <div>
          <label htmlFor="profile-password" className="field-label">Mật khẩu mới</label>
          <span className="relative block">
            <input id="profile-password" className="input pr-12" type={show ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-ink" aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
              {show ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          </span>
          <p className="mt-1.5 text-sm text-muted-foreground">{PASSWORD_HINT}</p>
        </div>
        <div>
          <label htmlFor="profile-confirm" className="field-label">Nhập lại mật khẩu mới</label>
          <input id="profile-confirm" className="input" type={show ? 'text' : 'password'} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <Message notice={passNotice} />
        <button type="submit" disabled={passBusy || !password || !confirm} className="btn btn-outline">{passBusy && <Loader2 size={16} className="animate-spin" aria-hidden="true" />} Đổi mật khẩu</button>
      </form>
    </div>
  );
}
