'use client';

import { MessageSquareQuote } from 'lucide-react';
import AdminCrud from '@/components/admin/AdminCrud';

export default function AdminFeedbackPage() {
  return (
    <AdminCrud
      table="feedback_images"
      title="Ảnh feedback"
      description="Ảnh chụp tin nhắn, bình luận của học viên. Hiện ở tường feedback chạy ngang trên trang chủ và trang Học viên."
      icon={MessageSquareQuote}
      itemLabel="ảnh feedback"
      titleKey="caption"
      imageKey="image_url"
      imageClassName="aspect-[5/2]"
      orderBy={{ column: 'sort_order', ascending: true }}
      emptyRecord={{ image_url: '', caption: '', width: 1024, height: 400, sort_order: 0 }}
      fields={[
        { key: 'image_url', label: 'Ảnh chụp màn hình', type: 'image', required: true, sizeKeys: { width: 'width', height: 'height' }, hint: 'Ảnh ngang (chụp bình luận/tin nhắn), tối đa 5 MB.' },
        { key: 'caption', label: 'Ghi chú (chỉ admin thấy)', hint: 'Ví dụ: tên học viên, khóa học' },
        { key: 'sort_order', label: 'Thứ tự hiển thị', type: 'number', step: 1 },
      ]}
      renderMeta={(row) => <>Thứ tự {row.sort_order}</>}
    />
  );
}
