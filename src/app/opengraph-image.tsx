import { ImageResponse } from 'next/og';
import { ogAssets, ShareCard, OG_SIZE } from '@/lib/og';

// Link preview for every page that has no image of its own (Zalo, Facebook, Messenger…)
export const alt = 'TẤN VA: học làm video bằng điện thoại cùng Minh Tấn';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image() {
  const a = await ogAssets();
  return new ImageResponse(
    <ShareCard a={a} eyebrow="Học cùng Minh Tấn" title="Học làm video bằng chính chiếc điện thoại"
               subtitle="Quay, dựng và bán hàng bằng video. Khóa học online, Coaching 1:1 và Audit miễn phí." />,
    { ...size, fonts: a.fonts },
  );
}
