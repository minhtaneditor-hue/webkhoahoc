'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import AdminCrud from '@/components/admin/AdminCrud';
import { formatVND } from '@/lib/supabase-public';
import { assetPricing, shortDate } from '@/lib/shop';

const categories = [
  { value: 'ebook', label: 'Ebook' },
  { value: 'preset', label: 'Preset' },
  { value: 'lut', label: 'LUT màu' },
  { value: 'template', label: 'Template' },
  { value: 'skill', label: 'Skill AI' },
];

export default function AdminShopPage() {
  // Per product: how many times a file link was handed out, and to how many different people
  const [stats, setStats] = useState<Record<string, { times: number; people: Set<string> }>>({});
  useEffect(() => {
    supabase.from('asset_downloads').select('asset_id, email').limit(50000).then(({ data }) => {
      const next: typeof stats = {};
      for (const d of data || []) {
        const s = (next[d.asset_id] ??= { times: 0, people: new Set() });
        s.times += 1;
        if (d.email) s.people.add(d.email);
      }
      setStats(next);
    });
  }, []);

  return (
    <AdminCrud
      table="digital_assets"
      title="Sản phẩm khác"
      description="Sản phẩm số bán trên trang Shop. Link tải chỉ được gửi cho người đã thanh toán."
      icon={ShoppingBag}
      itemLabel="sản phẩm"
      emptyRecord={{ title: '', description: '', price: 0, old_price: 0, sale_ends_on: '', thumbnail_url: '', download_url: '', category: 'ebook', preview_url: '', highlights: '', requirements: '', samples: '', faq: '' }}
      fields={[
        { key: 'title', label: 'Tên sản phẩm', required: true },
        { key: 'category', label: 'Loại', type: 'select', options: categories },
        { key: 'description', label: 'Mô tả', type: 'textarea', hint: 'Đoạn đầu tiên hiện ở đầu trang sản phẩm. Các đoạn sau (cách một dòng trống) hiện ở mục Thông tin chi tiết. Muốn chèn ảnh, viết riêng một đoạn: ![mô tả ảnh](link ảnh).' },
        { key: 'price', label: 'Giá bán (VNĐ)', type: 'number', hint: 'Giá người mua trả. Để 0 nếu muốn tặng miễn phí.' },
        { key: 'old_price', label: 'Giá niêm yết (VNĐ)', type: 'number', hint: 'Chỉ điền khi đang giảm giá: giá gốc, hiện gạch ngang kèm phần trăm giảm. Để 0 nếu không giảm.' },
        { key: 'sale_ends_on', label: 'Giảm giá đến hết ngày', hint: 'Viết dạng 2026-11-16. Sau ngày này, website tự bán lại bằng giá niêm yết. Để trống nếu giảm không thời hạn.' },
        { key: 'thumbnail_url', label: 'Ảnh bìa', type: 'image', hint: 'Ảnh tỉ lệ 4:3, tối đa 5 MB.' },
        { key: 'preview_url', label: 'Video giới thiệu', type: 'url', hint: 'Link YouTube, hoặc link file video (mp4, webm) sẽ tự chạy không tiếng. Để trống thì trang sản phẩm dùng ảnh bìa.' },
        { key: 'highlights', label: 'Bạn nhận được gì', type: 'textarea', hint: 'Mỗi ý một dòng.' },
        { key: 'requirements', label: 'Bạn cần có gì', type: 'textarea', hint: 'Mỗi ý một dòng. Ví dụ phần mềm, thiết bị cần có để dùng được sản phẩm.' },
        { key: 'samples', label: 'Chép và dùng ngay', type: 'textarea', hint: 'Mỗi câu một dòng, mỗi câu có nút Chép. Hợp với Skill AI: câu lệnh cài, câu mẫu để nói với Claude. Ai vào trang cũng thấy, đừng ghi nội dung chỉ dành cho người mua.' },
        { key: 'faq', label: 'Câu hỏi thường gặp', type: 'textarea', hint: 'Dòng đầu là câu hỏi, dòng sau là trả lời. Các câu cách nhau một dòng trống.' },
        { key: 'download_url', label: 'Link tải file', type: 'url', hint: 'Google Drive, Dropbox… Chỉ người mua mới nhận được link này. Ebook PDF đóng tên người mua: tải file lên kho shop-files trên Supabase rồi ghi storage:shop-files/ten-file.pdf (hoặc file trên R2: r2:shop/ebooks/ten-file.pdf)' },
      ]}
      renderMeta={(row) => <>{categories.find((c) => c.value === row.category)?.label || row.category} · {Number(row.price) > 0 ? formatVND(assetPricing(row as any).price) : 'Miễn phí'}{assetPricing(row as any).oldPrice ? ` (giảm từ ${formatVND(row.old_price)}${row.sale_ends_on ? `, đến hết ${shortDate(String(row.sale_ends_on))}` : ''})` : ''}<br />{stats[row.id] ? `${stats[row.id].times} lượt tải · ${stats[row.id].people.size} người` : 'Chưa có lượt tải'}</>}
    />
  );
}
