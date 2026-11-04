import type { Metadata } from 'next';

// The work page is a client component, so its title and description come from here.
export const metadata: Metadata = {
  title: 'Dự án',
  openGraph: { title: 'Dự án truyền hình và video tiêu biểu | TẤN VA', type: 'website', locale: 'vi_VN', siteName: 'TẤN VA' },
  description: 'Những tác phẩm truyền hình, điện ảnh và video thương hiệu, sản xuất cùng các đài truyền hình và nhãn hàng hàng đầu.',
  alternates: { canonical: '/work' },
};

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
