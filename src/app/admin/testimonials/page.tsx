'use client';

import { Star } from 'lucide-react';
import AdminCrud from '@/components/admin/AdminCrud';
import { COUNTRY_OPTIONS, COUNTRY_BY_CODE } from '@/lib/countries';

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
      emptyRecord={{ name: '', title: '', country: 'VN', city: '', facebook_url: '', results: '', quote: '', story: '', avatar_url: '', sort_order: 0 }}
      fields={[
        { key: 'name', label: 'Họ tên', required: true },
        { key: 'title', label: 'Nghề nghiệp / thương hiệu', hint: 'Ví dụ: Founder Chú Lùn Bakery' },
        { key: 'country', label: 'Đang sống ở', type: 'select', options: COUNTRY_OPTIONS, hint: 'Hiện trên bản đồ học viên khắp thế giới' },
        { key: 'city', label: 'Thành phố', hint: 'Ví dụ: Hà Nội, Sydney, Toronto' },
        { key: 'results', label: 'Kết quả nổi bật', hint: 'Hiện trên nhãn vàng, ví dụ: +300% doanh thu' },
        { key: 'quote', label: 'Câu nói', type: 'textarea', hint: 'Để trống: học viên hiện ở dạng thẻ nhỏ (ảnh, tên, quốc gia, Facebook).' },
        { key: 'facebook_url', label: 'Facebook', type: 'url' },
        { key: 'story', label: 'Câu chuyện dài (không bắt buộc)', type: 'textarea' },
        { key: 'avatar_url', label: 'Ảnh chân dung', type: 'image', hint: 'Ảnh dọc tỉ lệ 4:5 đẹp nhất, tối đa 5 MB.' },
        { key: 'sort_order', label: 'Thứ tự hiển thị', type: 'number', step: 1 },
      ]}
      renderMeta={(row) => <>{row.title}{row.country ? ` · ${COUNTRY_BY_CODE[row.country]?.name ?? row.country}` : ''}{row.results ? ` · ${row.results}` : ''} · thứ tự {row.sort_order}</>}
    />
  );
}
