'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import { PASSWORD_RULE, PASSWORD_HINT } from '@/lib/password';

// Reached from the reset-password email (the link has already signed the user in).
export default function UpdatePasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!PASSWORD_RULE.test(password)) return setError(PASSWORD_HINT);
    if (password !== confirm) return setError('Hai lần nhập mật khẩu chưa khớp.');
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setError(error.message.includes('different') ? 'Mật khẩu mới phải khác mật khẩu cũ.' : error.message);
    router.replace('/dashboard');
  }

  if (email === undefined) {
    return <main className="container-lux py-24 flex justify-center text-muted-foreground"><Loader2 className="animate-spin" aria-hidden="true" /></main>;
  }

  if (!email) {
    return (
      <main className="container-lux py-24 text-center">
        <h1 className="text-4xl">Link đã hết hạn</h1>
        <p className="mt-3 text-muted-foreground">Vui lòng gửi lại link đặt lại mật khẩu mới.</p>
        <Link href="/auth" className="btn btn-gold mt-8">Gửi lại link</Link>
      </main>
    );
  }

  return (
    <main className="container-lux py-16 md:py-24 flex justify-center">
      <form onSubmit={submit} className="card w-full max-w-md p-8 space-y-5">
        <div>
          <h1 className="text-4xl">Đặt mật khẩu mới</h1>
          <p className="mt-2 text-muted-foreground">Cho tài khoản {email}</p>
        </div>
        <label className="block">
          <span className="block text-sm font-semibold">Mật khẩu mới</span>
          <span className="relative block mt-1.5">
            <input className="input pr-12" type={show ? 'text' : 'password'} autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-muted-foreground" aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
              {show ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          </span>
          <span className="block mt-1.5 text-xs text-muted-foreground">{PASSWORD_HINT}</span>
        </label>
        <label className="block">
          <span className="block text-sm font-semibold">Nhập lại mật khẩu mới</span>
          <input className="input mt-1.5" type={show ? 'text' : 'password'} autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </label>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        <button type="submit" disabled={busy} className="btn btn-gold w-full">
          {busy && <Loader2 size={18} className="animate-spin" aria-hidden="true" />} Lưu mật khẩu mới
        </button>
      </form>
    </main>
  );
}
