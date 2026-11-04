import type { Metadata } from 'next';

// The shop page is a client component, so its title and description come from here.
// Product pages (./[id]) set their own.
export const metadata: Metadata = {
  title: 'Ebook, preset và LUT màu làm video',
  description: 'Ebook, preset, LUT màu và template giúp bạn làm video nhanh và đẹp hơn, từ Minh Tấn. Xem chi tiết từng sản phẩm và mua online.',
  alternates: { canonical: '/shop' },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
