import { NextResponse } from 'next/server';
import { r2Get, verifyShopFile } from '@/lib/drm/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Streams a shop file from R2 for a link made by /api/shop/download (shopFileLink).
// Extra query parameters (fbclid from Facebook's in-app browser, utm_…) are ignored.
export async function GET(req: Request) {
  const file = verifyShopFile(new URL(req.url).searchParams);
  if (!file) {
    return new NextResponse('Link tải đã hết hạn. Quay lại trang sản phẩm và bấm tải lại nhé.', {
      status: 403, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }
  const res = await r2Get(file.key);
  if (!res.ok || !res.body) {
    res.body?.cancel();
    return new NextResponse('Không tìm thấy file. Vui lòng nhắn Zalo để được gửi lại.', {
      status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }
  const ascii = file.name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\x20-\x7e]|"/g, '_');
  const headers: Record<string, string> = {
    'Content-Type': res.headers.get('content-type') || 'application/octet-stream',
    'Content-Disposition': `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(file.name)}`,
    'Cache-Control': 'private, no-store',
  };
  const size = res.headers.get('content-length');
  if (size) headers['Content-Length'] = size;
  return new NextResponse(res.body, { headers });
}
