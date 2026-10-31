'use client';

import { Star } from 'lucide-react';
import AdminCrud from '@/components/admin/AdminCrud';

export default function AdminTestimonialsPage() {
  return (
    <AdminCrud
      table="students"
      title="Học viên tiêu biểu"
      description="Các thẻ học viên ở trang chủ và trang Học viên. Số thứ tự nhỏ hiện trước; trang chủ hiện 4 người đầu tiên."
      icon={Star}
      itemLabel="học viên"
      titleKey="name"
      imageKey="avatar_url"
      imageClassName="aspect-[4/5]"
      orderBy={{ column: 'sort_order', ascending: true }}
      emptyRecord={{ name: '', title: '', results: '', quote: '', story: '', avatar_url: '', sort_order: 0 }}
      fields={[
        { key: 'name', label: 'Họ tên', required: true },
        { key: 'title', label: 'Nghề nghiệp / thương hiệu', hint: 'Ví dụ: Founder Chú Lùn Bakery' },
        { key: 'results', label: 'Kết quả nổi bật', hint: 'Hiện trên nhãn vàng, ví dụ: +300% doanh thu' },
        { key: 'quote', label: 'Câu nói', type: 'textarea', required: true },
        { key: 'story', label: 'Câu chuyện dài (không bắt buộc)', type: 'textarea' },
        { key: 'avatar_url', label: 'Ảnh chân dung', type: 'image', hint: 'Ảnh dọc tỉ lệ 4:5 đẹp nhất, tối đa 5 MB.' },
        { key: 'sort_order', label: 'Thứ tự hiển thị', type: 'number', step: 1 },
      ]}
      renderMeta={(row) => <>{row.title}{row.results ? ` · ${row.results}` : ''} · thứ tự {row.sort_order}</>}
    />
  );
}
