'use client';

import { Clapperboard } from 'lucide-react';
import AdminCrud from '@/components/admin/AdminCrud';
import { parseMedia, WORK_CATEGORIES } from '@/lib/media';
import { COUNTRY_OPTIONS, COUNTRY_BY_CODE } from '@/lib/countries';


const LINK_HINT = 'Link YouTube, TikTok, Facebook, Instagram, Google Drive, hoặc tải ảnh lên bên dưới. Để trống nếu không có.';

export default function AdminStudentWorksPage() {
  return (
    <AdminCrud
      table="student_works"
      title="Sản phẩm học viên"
      description="Video và ảnh học viên làm ra, có thể kèm bản Trước khi học để so sánh. Hiện ở trang Học viên."
      icon={Clapperboard}
      itemLabel="sản phẩm"
      titleKey="title"
      imageKey="after_thumbnail_url"
      orderBy={{ column: 'sort_order', ascending: true }}
      emptyRecord={{
        student_name: '', student_title: '', country: 'VN', city: '', avatar_url: '', title: '', result: '', description: '',
        category: 'bat-dong-san', orientation: 'vertical',
        before_url: '', before_thumbnail_url: '', after_url: '', after_thumbnail_url: '',
        is_featured: false, sort_order: 0,
        facebook_url: '', tiktok_url: '', instagram_url: '', youtube_url: '', website_url: '',
      }}
      fields={[
        { key: 'student_name', label: 'Tên học viên', required: true },
        { key: 'student_title', label: 'Nghề nghiệp / thương hiệu', hint: 'Ví dụ: Chủ tiệm bánh, Môi giới bất động sản' },
        { key: 'country', label: 'Đang sống ở', type: 'select', options: COUNTRY_OPTIONS, hint: 'Hiện trên bản đồ học viên khắp thế giới' },
        { key: 'city', label: 'Thành phố', hint: 'Ví dụ: Sài Gòn, Melbourne, Paris' },
        { key: 'avatar_url', label: 'Ảnh đại diện học viên', type: 'image' },
        { key: 'facebook_url', label: 'Facebook / Fanpage', type: 'url', hint: 'Mỗi học viên chỉ cần nhập link ở 1 sản phẩm.' },
        { key: 'tiktok_url', label: 'TikTok', type: 'url' },
        { key: 'instagram_url', label: 'Instagram', type: 'url' },
        { key: 'youtube_url', label: 'YouTube', type: 'url' },
        { key: 'website_url', label: 'Website', type: 'url' },
        { key: 'title', label: 'Tên sản phẩm', required: true, hint: 'Ví dụ: Video giới thiệu tiệm bánh' },
        { key: 'result', label: 'Kết quả', hint: 'Ví dụ: 1,2 triệu view, +40 đơn trong tuần đầu' },
        { key: 'description', label: 'Mô tả ngắn', type: 'textarea' },
        { key: 'category', label: 'Ngành nghề', type: 'select', options: WORK_CATEGORIES },
        { key: 'orientation', label: 'Khung hình', type: 'select', options: [{ value: 'vertical', label: 'Dọc 9:16 (TikTok, Reels)' }, { value: 'horizontal', label: 'Ngang 16:9 (YouTube)' }] },
        { key: 'before_url', label: 'TRƯỚC khi học: link video / ảnh', hint: LINK_HINT },
        { key: 'before_thumbnail_url', label: 'TRƯỚC khi học: ảnh đại diện / ảnh', type: 'image', hint: 'Bắt buộc nếu là ảnh. Với video TikTok/Facebook nên tải ảnh chụp màn hình lên.' },
        { key: 'after_url', label: 'SAU khi học: link video / ảnh', hint: LINK_HINT },
        { key: 'after_thumbnail_url', label: 'SAU khi học: ảnh đại diện / ảnh', type: 'image', hint: 'Bắt buộc nếu là ảnh. Với video TikTok/Facebook nên tải ảnh chụp màn hình lên.' },
        { key: 'is_featured', label: 'Nổi bật', type: 'checkbox', hint: 'Hiện trên trang chủ' },
        { key: 'sort_order', label: 'Thứ tự hiển thị', type: 'number', step: 1 },
      ]}
      renderMeta={(row) => {
        const before = parseMedia(row.before_url) || (row.before_thumbnail_url ? { label: 'Ảnh' } : null);
        const after = parseMedia(row.after_url) || (row.after_thumbnail_url ? { label: 'Ảnh' } : null);
        return (
          <>
            {row.student_name}{row.city || row.country ? ` (${[row.city, COUNTRY_BY_CODE[row.country]?.name].filter(Boolean).join(', ')})` : ''}{row.result ? ` · ${row.result}` : ''}
            <br />
            Trước: {before ? before.label : '—'} · Sau: {after ? after.label : '—'}{row.is_featured ? ' · Nổi bật' : ''}
          </>
        );
      }}
    />
  );
}
