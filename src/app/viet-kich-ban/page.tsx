import type { Metadata } from 'next';
import VietKichBanTool from './VietKichBanTool';
import JsonLd from '@/components/JsonLd';
import { ORG_ID } from '@/lib/brand-entity';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Viết kịch bản video bằng AI',
  description: 'Dán nội dung của bạn, AI hỏi thêm chỗ còn thiếu rồi viết kịch bản video hoàn chỉnh theo cách Minh Tấn dạy: hook, lời nói, chữ trên màn hình, cảnh quay. Tải về Word hoặc PDF.',
  alternates: { canonical: '/viet-kich-ban' },
};

export default function VietKichBanPage() {
  return (
    <main className="section pt-28 md:pt-32">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Viết kịch bản video bằng AI',
        url: `${SITE_URL}/viet-kich-ban`,
        description: metadata.description,
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Web',
        inLanguage: 'vi',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: 0, priceCurrency: 'VND', description: 'Miễn phí 5 kịch bản' },
        creator: { '@id': ORG_ID },
      }} />
      <div className="container-lux max-w-3xl">
        <span className="badge">Miễn phí 5 kịch bản</span>
        <h1 className="mt-4 text-4xl md:text-5xl">Viết kịch bản video cho bạn</h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
          Bạn chỉ cần dán nội dung muốn nói. Thiếu gì, AI hỏi lại vài câu, rồi viết kịch bản hoàn chỉnh theo cách Minh Tấn dạy: 3 phương án hook, lời nói từng đoạn, chữ trên màn hình và gợi ý cảnh quay bằng điện thoại.
        </p>
        <VietKichBanTool />
      </div>
    </main>
  );
}
