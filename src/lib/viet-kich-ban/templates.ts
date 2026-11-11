// Video formats and story frameworks for the script writer (/viet-kich-ban).
// First draft: Tấn will replace the structures with his own later (and the research in
// docs/viet-kich-ban/ feeds this list). Keep ids stable: saved scripts store them.

export type Khung = {
  id: string;
  ten: string;
  mo_ta: string;   // one line shown to the user
  buoc: string[];  // the beats, in order, for the model
};

export type Dang = {
  id: string;
  ten: string;
  mo_ta: string;
  khung: string[];      // suitable frameworks, best first
  can_biet: string[];   // what the script needs; missing items become questions
};

export const KHUNG: Khung[] = [
  {
    id: '3s',
    ten: '3S: Stop – Solution – Sales',
    mo_ta: 'Công thức gốc của Minh Tấn: giữ người xem, đưa giải pháp, kêu gọi hành động.',
    buoc: ['STOP: hook 3 giây đầu làm người xem dừng lướt', 'SOLUTION: vấn đề và giải pháp, một ý chính', 'SALES: lời kêu gọi hành động rõ ràng'],
  },
  {
    id: 'pas',
    ten: 'Nỗi đau – Khuấy – Giải pháp (PAS)',
    mo_ta: 'Gọi đúng nỗi đau, làm nó rõ hơn, rồi đưa sản phẩm ra giải quyết.',
    buoc: ['Nêu nỗi đau khách đang gặp', 'Khuấy: hậu quả nếu để yên, cảm giác khó chịu', 'Giải pháp: sản phẩm/dịch vụ và vì sao nó giải được', 'Kêu gọi hành động'],
  },
  {
    id: 'truoc-sau',
    ten: 'Trước – Sau – Cầu nối',
    mo_ta: 'Cho thấy trước và sau, rồi chỉ ra thứ giúp thay đổi.',
    buoc: ['Trước: tình trạng cũ', 'Sau: kết quả mới, cụ thể', 'Cầu nối: điều đã làm nên thay đổi', 'Kêu gọi hành động'],
  },
  {
    id: 'ke-chuyen-45',
    ten: 'Kể chuyện 45 giây',
    mo_ta: 'Khung kể chuyện của Minh Tấn: hook, vấn đề, bước ngoặt, kết quả.',
    buoc: ['0–6 giây: hook, mở bằng khoảnh khắc căng nhất', '7–18 giây: vấn đề, nhân vật gặp khó', '19–30 giây: bước ngoặt, điều đã thay đổi', '31–45 giây: kết quả, bài học và lời kêu gọi'],
  },
  {
    id: 'hanh-trinh',
    ten: 'Hành trình nhân vật',
    mo_ta: 'Người bình thường gặp thử thách, vượt qua và thay đổi.',
    buoc: ['Cuộc sống bình thường', 'Biến cố hoặc thử thách', 'Vật lộn, thất bại', 'Người dẫn đường hoặc phát hiện', 'Vượt qua', 'Thay đổi và bài học'],
  },
  {
    id: 'aida',
    ten: 'AIDA',
    mo_ta: 'Chú ý – Quan tâm – Mong muốn – Hành động.',
    buoc: ['Attention: gây chú ý', 'Interest: thông tin khiến người xem quan tâm', 'Desire: làm họ muốn có', 'Action: kêu gọi hành động'],
  },
  {
    id: 'danh-sach',
    ten: 'Danh sách mẹo',
    mo_ta: '3–5 mẹo hoặc bước, mỗi ý một đoạn ngắn.',
    buoc: ['Hook nêu lợi ích của cả danh sách', 'Ý 1', 'Ý 2', 'Ý 3 (thêm ý 4–5 nếu video dài)', 'Tóm lại và kêu gọi lưu/theo dõi'],
  },
  {
    id: 'lam-tuong',
    ten: 'Lầm tưởng và sự thật',
    mo_ta: 'Đập một lầm tưởng phổ biến rồi đưa ra cách đúng.',
    buoc: ['Nêu lầm tưởng nhiều người tin', 'Vì sao nó sai, có dẫn chứng', 'Cách đúng', 'Kêu gọi hành động'],
  },
];

export const DANG: Dang[] = [
  {
    id: 'ban-hang',
    ten: 'Bán hàng, giới thiệu sản phẩm',
    mo_ta: 'Video ra đơn cho sản phẩm hoặc dịch vụ.',
    khung: ['3s', 'pas', 'truoc-sau', 'aida'],
    can_biet: ['Sản phẩm/dịch vụ là gì, giá hoặc ưu đãi', 'Khách hàng mục tiêu là ai', 'Nỗi đau hoặc mong muốn của khách', 'Điểm khác biệt so với chỗ khác', 'Bằng chứng: kết quả, feedback, con số', 'Muốn người xem làm gì (nhắn tin, đặt hàng, ghé quán…)'],
  },
  {
    id: 'kien-thuc',
    ten: 'Chia sẻ kiến thức, mẹo',
    mo_ta: 'Dạy một điều hữu ích để tăng theo dõi và uy tín.',
    khung: ['danh-sach', 'lam-tuong', '3s'],
    can_biet: ['Chủ đề và một ý chính muốn người xem nhớ', 'Người xem là ai, họ đang gặp khó gì', 'Các bước hoặc mẹo cụ thể', 'Ví dụ thực tế hoặc trải nghiệm của bạn', 'Muốn người xem làm gì sau khi xem'],
  },
  {
    id: 'ke-chuyen',
    ten: 'Kể chuyện cá nhân, hành trình',
    mo_ta: 'Kể một câu chuyện thật để người xem tin và nhớ bạn.',
    khung: ['ke-chuyen-45', 'hanh-trinh', 'truoc-sau'],
    can_biet: ['Câu chuyện xảy ra khi nào, với ai', 'Khoảnh khắc khó khăn hoặc căng nhất', 'Điều gì đã thay đổi (bước ngoặt)', 'Kết quả hiện tại', 'Bài học muốn gửi người xem', 'Câu chuyện dẫn tới sản phẩm/dịch vụ nào (nếu có)'],
  },
  {
    id: 'vlog',
    ten: 'Vlog, hậu trường',
    mo_ta: 'Một ngày làm việc, hậu trường, cho khách thấy con người thật.',
    khung: ['ke-chuyen-45', '3s', 'danh-sach'],
    can_biet: ['Bối cảnh: ở đâu, làm gì trong ngày', 'Khoảnh khắc thú vị hoặc bất ngờ nhất', 'Điều người xem ít biết về công việc này', 'Cảm xúc hoặc suy nghĩ của bạn', 'Muốn người xem làm gì sau khi xem'],
  },
  {
    id: 'review',
    ten: 'Review, so sánh',
    mo_ta: 'Đánh giá thật hoặc so sánh hai lựa chọn.',
    khung: ['3s', 'truoc-sau', 'danh-sach'],
    can_biet: ['Review/so sánh cái gì', 'Dùng trong bao lâu, hoàn cảnh nào', 'Điểm tốt nhất', 'Điểm chưa tốt (để đáng tin)', 'Hợp với ai, không hợp với ai', 'Kết luận và lời kêu gọi'],
  },
  {
    id: 'feedback',
    ten: 'Feedback khách hàng',
    mo_ta: 'Kể kết quả của một khách hàng thật.',
    khung: ['truoc-sau', 'ke-chuyen-45', 'pas'],
    can_biet: ['Khách là ai (nghề, hoàn cảnh)', 'Trước khi dùng họ gặp vấn đề gì', 'Họ đã dùng gì, trong bao lâu', 'Kết quả cụ thể, có số càng tốt', 'Câu nói hay của khách (nếu có)', 'Lời kêu gọi'],
  },
];

export const DO_DAI = [
  { id: '30', ten: 'Khoảng 30 giây' },
  { id: '60', ten: 'Khoảng 60 giây' },
  { id: '90', ten: '60–90 giây' },
  { id: '180', ten: '2–3 phút' },
];

export const NEN_TANG = ['TikTok', 'Facebook Reels', 'YouTube Shorts', 'Instagram Reels', 'YouTube (video dài)'];

export const dangById = (id: unknown) => DANG.find((d) => d.id === id);
export const khungById = (id: unknown) => KHUNG.find((k) => k.id === id);

/** Shared shape of a finished script (API output, saved in scripts.content, used by the page and the Word export). */
export type KichBan = {
  tieu_de: string;
  hook: { loi_noi: string; chu_tren_man_hinh: string }[];
  doan: { thoi_gian: string; muc_dich: string; loi_noi: string; chu_tren_man_hinh: string; canh_quay: string }[];
  loi_keu_goi: string;
  caption: string;
  meo_quay: string[];
};

// Usage limits. Free: total for the account. Members (active Hội viên): per calendar month.
export const FREE_TOTAL = 5;
export const MEMBER_MONTHLY = 100;
