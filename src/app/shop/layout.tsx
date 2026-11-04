import type { Metadata } from 'next';

// The shop page is a client component, so its title and description come from here.
// Product pages (./[id]) set their own.
export const metadata: Metadata = {
  title: 'Sản phẩm khác',
  openGraph: { title: 'Ebook và skill AI làm video | TẤN VA', type: 'website', locale: 'vi_VN', siteName: 'TẤN VA' },
  description: 'Ebook và skill AI giúp bạn làm video nhanh và đẹp hơn, từ Minh Tấn. Xem chi tiết từng sản phẩm và mua online.',
  alternates: { canonical: '/shop' },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
