'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, Loader2, ShoppingBag } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import { isAdmin } from '@/lib/admin';
import BuyDialog from '@/components/shop/BuyDialog';
import FreeDownloadDialog from '@/components/shop/FreeDownloadDialog';
import type { ShopAsset } from '@/lib/shop';

// Buy or download button. The page around it is cached for everyone, so whether this visitor
// already owns the product is only worked out here in their browser.
export default function ProductBuy({ asset, light = false }: { asset: ShopAsset; light?: boolean }) {
  const free = Number(asset.price) <= 0;
  const [bought, setBought] = useState(false);
  const [email, setEmail] = useState('');
  const [buying, setBuying] = useState<ShopAsset | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [needLogin, setNeedLogin] = useState(false);
  const [gettingFree, setGettingFree] = useState<ShopAsset | null>(null);
  const owned = bought && !free;

  useEffect(() => {
    let live = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !live) return;
      setEmail(user.email || '');
      if (isAdmin(user.email)) return setBought(true);
      const { data } = await supabase
        .from('payments')
        .select('id')
        .eq('user_id', user.id)
        .eq('asset_id', asset.id)
        .eq('status', 'success')
        .limit(1);
      if (live && data?.length) setBought(true);
    })();
    return () => { live = false; };
  }, [asset.id]);

  async function download() {
    setBusy(true);
    setError('');
    setNeedLogin(false);
    try {
      const res = await fetch(`/api/shop/download?assetId=${asset.id}`);
      if (res.status === 401) return setNeedLogin(true);
      const data = await res.json();
      if (data.url) window.open(data.url, '_blank', 'noopener');
      else setError(data.error || 'Không lấy được link tải.');
    } catch {
      setError('Không kết nối được máy chủ. Kiểm tra mạng và thử lại.');
    } finally {
      setBusy(false);
    }
  }

  const note = light ? 'text-stone-300' : 'text-muted-foreground';

  return (
    <>
      <button
        type="button"
        onClick={() => (free ? setGettingFree(asset) : owned ? download() : setBuying(asset))}
        disabled={busy}
        className={`btn w-full ${owned && !light ? 'btn-dark' : 'btn-gold'}`}
      >
        {busy ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : owned || free ? <Download size={16} aria-hidden="true" /> : <ShoppingBag size={16} aria-hidden="true" />}
        {free ? 'Tải miễn phí' : owned ? 'Tải về' : 'Mua ngay'}
      </button>
      {free
        ? <p className={`mt-3 text-center text-xs ${note}`}>Để lại tên, email và Zalo để nhận link tải ngay.</p>
        : !owned && <p className={`mt-3 text-center text-xs ${note}`}>Thanh toán xong nhận link tải ngay qua email.</p>}
      {needLogin && (
        <p role="alert" className={`mt-3 text-center text-sm ${note}`}>
          Bạn cần đăng nhập để tải file. <Link href={`/auth?redirect=/shop/${asset.id}`} className="underline font-semibold">Đăng nhập</Link>
        </p>
      )}
      {error && <p role="alert" className={`mt-3 text-center text-sm ${light ? 'text-red-300' : 'text-danger'}`}>{error}</p>}
      <BuyDialog asset={buying} defaultEmail={email} onClose={() => setBuying(null)} />
      <FreeDownloadDialog asset={gettingFree} defaultEmail={email} onClose={() => setGettingFree(null)} />
    </>
  );
}
