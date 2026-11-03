'use client';

import { MessageSquareHeart } from 'lucide-react';
import AdminCrud from '@/components/admin/AdminCrud';
import { parseMedia } from '@/lib/media';
import { COUNTRY_OPTIONS, COUNTRY_BY_CODE } from '@/lib/countries';

export default function AdminFeedbackVideosPage() {
  return (
    <AdminCrud
      table="feedback_videos"
      title="Video feedback học viên"
      description="Clip học viên nói về khóa học và giảng viên. Hiện ở trang Học viên."
      icon={MessageSquareHeart}
      itemLabel="video"
      titleKey="student_name"
      imageKey="thumbnail_url"
      imageClassName="aspect-[4/5]"
      orderBy={{ column: 'sort_order', ascending: true }}
      emptyRecord={{ student_name: '', student_title: '', country: 'VN', quote: '', video_url: '', thumbnail_url: '', orientation: 'vertical', sort_order: 0 }}
      fields={[
        { key: 'student_name', label: 'Tên học viên', required: true },
        { key: 'student_title', label: 'Nghề nghiệp / thương hiệu' },
        { key: 'country', label: 'Đang sống ở', type: 'select', options: COUNTRY_OPTIONS },
        { key: 'quote', label: 'Câu nói nổi bật', type: 'textarea', hint: 'Một câu ngắn trích từ clip, hiện dưới video.' },
        { key: 'video_url', label: 'Link video', required: true, hint: 'YouTube (nên để Không công khai), TikTok, Facebook, Google Drive…' },
        { key: 'thumbnail_url', label: 'Ảnh bìa', type: 'image', videoFrame: true, hint: 'Bấm “Chọn từ clip”, mở file clip trên máy và chọn khung hình đẹp. Không bắt buộc với YouTube (tự lấy ảnh); nên có với Facebook/TikTok/Drive.' },
        { key: 'orientation', label: 'Khung hình', type: 'select', options: [{ value: 'vertical', label: 'Dọc 9:16' }, { value: 'horizontal', label: 'Ngang 16:9' }] },
        { key: 'sort_order', label: 'Thứ tự hiển thị', type: 'number', step: 1 },
      ]}
      renderMeta={(row) => <>{parseMedia(row.video_url)?.label || 'Link'}{row.country ? ` · ${COUNTRY_BY_CODE[row.country]?.name ?? row.country}` : ''}{row.quote ? ` · “${row.quote.slice(0, 40)}”` : ''}</>}
    />
  );
}
