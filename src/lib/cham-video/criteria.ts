// Criteria and weights for the free video scoring tool (/cham-video). Must match section 1 of docs/cham-video/tieu-chi-cham.md.
export const CRITERIA = [
  { ma: 'hook', ten: 'Hook 3 giây đầu', weight: 30 },
  { ma: 'thong_diep', ten: 'Thông điệp và giải pháp', weight: 20 },
  { ma: 'cta', ten: 'Lời kêu gọi hành động', weight: 15 },
  { ma: 'hinh_anh', ten: 'Hình ảnh: ánh sáng, bố cục', weight: 15 },
  { ma: 'chu', ten: 'Chữ và phụ đề', weight: 10 },
  { ma: 'loi_noi', ten: 'Lời nói và nhịp', weight: 10 },
] as const;

export type CriterionCode = (typeof CRITERIA)[number]['ma'];

export function ratingFor(total: number) {
  if (total >= 80) return 'Sẵn sàng đăng';
  if (total >= 60) return 'Ổn, sửa 1–2 chỗ là tốt hơn hẳn';
  if (total >= 40) return 'Có nền, nhưng đang mất người xem ở đầu video';
  return 'Nên làm lại theo công thức 3S';
}

export type Scorecard = {
  tong_diem: number;
  xep_loai: string;
  diem_manh: string;
  tieu_chi: { ma: CriterionCode; diem: number; ly_do: string; sua: string; bai_hoc: number[] }[];
  hook_viet_lai: { cau_noi: string; chu_giay_dau: string }[];
  viec_quan_trong_nhat: string;
  tu_kiem_tra: string[];
};

// The 21-day course; lesson numbers in the scorecard point here.
export const COURSE_21_ID = 'd290f1ee-6c54-4b01-90e6-d701748f0851';
export const FREE_LESSONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 21, 22];
