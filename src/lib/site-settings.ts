// Editable homepage / site texts stored in the `site_settings` table (key -> value).
// The defaults are what the site shows when a key has never been saved.
// Shared by the server fetchers (src/lib/content.ts) and the admin form (/admin/settings).

export type SettingField = {
  key: string;
  label: string;
  group: 'hero' | 'home' | 'contact';
  type?: 'text' | 'textarea' | 'url' | 'image';
  hint?: string;
  default: string;
};

export const SETTING_FIELDS: SettingField[] = [
  // Video header
  { key: 'hero_title', group: 'hero', label: 'Tiêu đề lớn', default: 'Video là tài sản.' },
  { key: 'hero_subtitle', group: 'hero', label: 'Dòng mô tả dưới tiêu đề', type: 'textarea', default: 'Học quay, dựng và bán hàng bằng video từ người làm truyền hình, chỉ với chiếc điện thoại của bạn.' },
  { key: 'showreel_youtube_id', group: 'hero', label: 'Video nền (link YouTube)', hint: 'Dán link YouTube, ví dụ https://youtu.be/CZdPDogA86Q', default: 'CZdPDogA86Q' },
  { key: 'showreel_start', group: 'hero', label: 'Bắt đầu video từ giây thứ', hint: 'Để bỏ qua đoạn chữ mở đầu của video', default: '10' },
  { key: 'showreel_poster', group: 'hero', label: 'Ảnh tĩnh (hiện trên điện thoại)', type: 'image', default: 'https://i.ytimg.com/vi/CZdPDogA86Q/maxres2.jpg' },
  { key: 'ticker_messages', group: 'hero', label: 'Dải thông báo chạy chữ', type: 'textarea', hint: 'Mỗi dòng là một thông báo', default: 'Khóa “21 Ngày Biến Video Thành Tài Sản” đang mở đăng ký\nHọc thử miễn phí\nTruy cập trọn đời, hỗ trợ 1:1 qua Zalo\nHoàn tiền trong 7 ngày nếu chưa phù hợp' },

  // Homepage sections
  { key: 'advisor_bio', group: 'home', label: 'Giới thiệu Minh Tấn Video Advisor', type: 'textarea', default: 'Hơn 10 năm làm truyền hình, từng tham gia hậu kỳ 2 Ngày 1 Đêm và Anh Trai Say Hi. Giờ Minh Tấn dạy lại quy trình đó, rút gọn cho chiếc điện thoại của bạn.' },
  { key: 'students_title', group: 'home', label: 'Tiêu đề phần học viên', default: 'Học viên nói gì về Minh Tấn Video Advisor' },
  { key: 'students_subtitle', group: 'home', label: 'Mô tả phần học viên', type: 'textarea', default: 'Họ bắt đầu giống bạn: một chiếc điện thoại và mong muốn làm video tốt hơn. Đây là kết quả của họ.' },
  { key: 'stat_students', group: 'home', label: 'Số học viên (chỉ ghi số)', default: '1000' },
  { key: 'stat_years', group: 'home', label: 'Số năm làm truyền hình (chỉ ghi số)', default: '10' },
  { key: 'students_page_learners', group: 'home', label: 'Trang Học viên: số học viên hiển thị (chỉ ghi số)', default: '1000' },
  { key: 'students_page_works', group: 'home', label: 'Trang Học viên: số sản phẩm hiển thị (chỉ ghi số)', default: '500' },
  { key: 'statement', group: 'home', label: 'Câu tuyên ngôn (chữ tô dần khi cuộn)', type: 'textarea', default: 'Một video quay tử tế sẽ tiếp tục bán hàng cho bạn nhiều năm sau ngày đăng. Khóa học này dạy bạn làm ra những video như thế.' },

  // Contact
  { key: 'contact_phone', group: 'contact', label: 'Hotline', default: '0922 255 861' },
  { key: 'contact_zalo', group: 'contact', label: 'Link Zalo', type: 'url', default: 'https://zalo.me/0922255861' },
  { key: 'contact_zalo_group', group: 'contact', label: 'Link nhóm Zalo cộng đồng (học viên nộp bài tập)', type: 'url', hint: 'Để trống thì nút Nộp bài tập mở Zalo cá nhân ở trên', default: '' },
  { key: 'contact_email', group: 'contact', label: 'Email', default: 'tanva@minhtanacademy.com' },
  { key: 'fb_pixel_id', group: 'contact', label: 'Facebook Pixel ID (chỉ ghi dãy số)', hint: 'Lấy trong Meta Events Manager. Để trống là không gắn Pixel', default: '' },
  { key: 'contact_address', group: 'contact', label: 'Địa chỉ', default: 'Quận 1, TP. Hồ Chí Minh' },
];

export const SETTING_GROUPS: Record<SettingField['group'], string> = {
  hero: 'Header video & thông báo',
  home: 'Các phần trên trang chủ',
  contact: 'Thông tin liên hệ',
};

export type SiteSettings = Record<string, string>;

export const DEFAULT_SETTINGS: SiteSettings = Object.fromEntries(SETTING_FIELDS.map((f) => [f.key, f.default]));

/** Accepts a full YouTube link or a bare id and returns the 11-character id. */
export function toYoutubeId(value: string) {
  const match = value.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  if (match) return match[1];
  return /^[\w-]{11}$/.test(value.trim()) ? value.trim() : '';
}

/** Contact details derived from settings, shaped for links. */
export function contactFrom(s: SiteSettings) {
  const digits = (s.contact_phone || '').replace(/\D/g, '');
  return {
    phone: s.contact_phone,
    phoneHref: `tel:${digits}`,
    zaloHref: s.contact_zalo || `https://zalo.me/${digits}`,
    zaloGroupHref: s.contact_zalo_group || s.contact_zalo || `https://zalo.me/${digits}`,
    email: s.contact_email,
    address: s.contact_address,
  };
}
export type Contact = ReturnType<typeof contactFrom>;
