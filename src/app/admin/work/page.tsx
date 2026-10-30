'use client';

import { Briefcase } from 'lucide-react';
import AdminCrud from '@/components/admin/AdminCrud';

const categories = [
  { value: 'short-video', label: 'Video ngắn' },
  { value: 'cinematic', label: 'Điện ảnh' },
  { value: 'brand', label: 'Thương hiệu' },
  { value: 'TV', label: 'Truyền hình' },
];

export default function AdminWorkPage() {
  return (
    <AdminCrud
      table="projects"
      title="Dự án"
      description="Portfolio hiển thị ở trang Dự án. Khi chưa có dự án nào, trang dùng danh sách mặc định."
      icon={Briefcase}
      itemLabel="dự án"
      emptyRecord={{ title: '', description: '', thumbnail_url: '', video_url: '', category: 'short-video', client_name: '' }}
      fields={[
        { key: 'title', label: 'Tên dự án', required: true },
        { key: 'category', label: 'Thể loại', type: 'select', options: categories },
        { key: 'client_name', label: 'Khách hàng / Đài' },
        { key: 'description', label: 'Mô tả', type: 'textarea' },
        { key: 'thumbnail_url', label: 'Link ảnh bìa', hint: 'Ảnh tỉ lệ 4:3.' },
        { key: 'video_url', label: 'Link video', hint: 'YouTube hoặc Vimeo (không bắt buộc).' },
      ]}
      renderMeta={(row) => <>{categories.find((c) => c.value === row.category)?.label || row.category}{row.client_name ? ` · ${row.client_name}` : ''}</>}
    />
  );
}
