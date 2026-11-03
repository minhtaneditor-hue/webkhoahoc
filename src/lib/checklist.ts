// Free lead magnet: "Checklist quay video bằng điện thoại", distilled from the 21 Ngày course.
// Shown right after sign-up and sent by email (/api/leads).

export const CHECKLIST_TITLE = 'Checklist quay video bằng điện thoại';

export const CHECKLIST: { group: string; items: string[] }[] = [
  {
    group: 'Trước khi quay',
    items: [
      'Lau sạch ống kính bằng khăn mềm (bước bị quên nhiều nhất, làm video mờ đục)',
      'Bật chế độ máy bay hoặc Không làm phiền để cuộc gọi không cắt ngang',
      'Pin trên 50%, bộ nhớ trống ít nhất 10 GB',
      'Cài 1080p hoặc 4K, 30 khung hình/giây; bật lưới (grid) để canh bố cục',
      'Gạch 3–5 ý chính theo công thức 3S: Dừng lại · Giải pháp · Mời gọi',
    ],
  },
  {
    group: 'Ánh sáng & khung hình',
    items: [
      'Ngồi đối diện cửa sổ hoặc nguồn sáng, không để nguồn sáng sau lưng',
      'Đặt máy ngang tầm mắt, mắt nằm ở đường 1/3 phía trên khung hình',
      'Nền phía sau gọn gàng, có chiều sâu (ngồi cách tường ít nhất 1 mét)',
      'Chạm giữ vào mặt để khoá nét và độ sáng (AE/AF Lock) trước khi bấm quay',
    ],
  },
  {
    group: 'Âm thanh',
    items: [
      'Dùng mic cài áo nếu có; không có thì quay gần máy và ở phòng nhỏ, ít vang',
      'Tắt quạt, điều hoà ồn; quay thử 5 giây rồi nghe lại bằng tai nghe',
    ],
  },
  {
    group: 'Khi quay',
    items: [
      'Câu đầu tiên đánh thẳng vào vấn đề người xem đang gặp (3 giây đầu quyết định)',
      'Nói theo ý đã gạch, không học thuộc từng chữ; sai thì dừng 2 giây rồi nói lại câu đó',
      'Quay thêm 5–10 cảnh minh hoạ (B-roll) cho nội dung bạn nói',
    ],
  },
  {
    group: 'Sau khi quay',
    items: [
      'Cắt bỏ đoạn "à, ờ", im lặng; thêm tiêu đề to rõ ở giây đầu tiên',
      'Thêm phụ đề, nhạc nền nhỏ hơn giọng nói',
      'Xem lại một lượt ở tốc độ 1.5x để soi lỗi chính tả trước khi xuất 1080p',
    ],
  },
];
