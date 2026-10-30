'use client';

import { ShoppingBag } from 'lucide-react';
import AdminCrud from '@/components/admin/AdminCrud';
import { formatVND } from '@/lib/supabase-public';

const categories = [
  { value: 'ebook', label: 'Ebook' },
  { value: 'preset', label: 'Preset' },
  { value: 'lut', label: 'LUT màu' },
  { value: 'template', label: 'Template' },
];

export default function AdminShopPage() {
  return (
    <AdminCrud
      table="digital_assets"
      title="Ebook & Preset"
      description="Sản phẩm số bán trên trang Shop. Link tải chỉ được gửi cho người đã thanh toán."
      icon={ShoppingBag}
      itemLabel="sản phẩm"
      emptyRecord={{ title: '', description: '', price: 0, thumbnail_url: '', download_url: '', category: 'ebook' }}
      fields={[
        { key: 'title', label: 'Tên sản phẩm', required: true },
        { key: 'category', label: 'Loại', type: 'select', options: categories },
        { key: 'description', label: 'Mô tả', type: 'textarea' },
        { key: 'price', label: 'Giá (VNĐ)', type: 'number', hint: 'Để 0 nếu muốn tặng miễn phí.' },
        { key: 'thumbnail_url', label: 'Link ảnh bìa', hint: 'Ảnh tỉ lệ 4:3.' },
        { key: 'download_url', label: 'Link tải file', type: 'url', hint: 'Google Drive, Dropbox… Chỉ người mua mới nhận được link này.' },
      ]}
      renderMeta={(row) => <>{categories.find((c) => c.value === row.category)?.label || row.category} · {Number(row.price) > 0 ? formatVND(row.price) : 'Miễn phí'}</>}
    />
  );
}
