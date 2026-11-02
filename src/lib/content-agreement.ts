// Cam kết bảo mật nội dung khóa học. Shown before the first lesson; the student must tick
// to accept. Bump VERSION whenever the wording changes so everyone re-accepts.
// Drafted as a standard template under Vietnamese law; have a lawyer review before relying on it.

export const AGREEMENT_VERSION = '2026-11-02';
export const AGREEMENT_TITLE = 'Cam kết bảo mật và sử dụng nội dung khóa học';

/** Short, human-friendly student code shown on the video, e.g. "TVA-3F9K2A". */
export function studentCode(userId: string) {
  return 'TVA-' + userId.replace(/-/g, '').slice(0, 6).toUpperCase();
}

export const AGREEMENT_SECTIONS: { heading: string; items: string[] }[] = [
  {
    heading: 'Các bên',
    items: [
      'Bên cung cấp: Minh Tấn Video Advisor (thương hiệu TẤN VA), chủ sở hữu quyền tác giả đối với toàn bộ bài giảng, video, tài liệu, hình ảnh và âm thanh của khóa học (gọi chung là "Nội dung").',
      'Bên sử dụng: người học sở hữu tài khoản đang đăng nhập, được cấp quyền truy cập Nội dung sau khi đăng ký khóa học (gọi là "Học viên").',
    ],
  },
  {
    heading: 'Điều 1. Căn cứ pháp lý',
    items: [
      'Bộ luật Dân sự số 91/2015/QH13.',
      'Luật Sở hữu trí tuệ số 50/2005/QH11, sửa đổi, bổ sung năm 2009, 2019 và 2022.',
      'Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân, cùng các văn bản hướng dẫn hiện hành.',
    ],
  },
  {
    heading: 'Điều 2. Quyền sử dụng của Học viên',
    items: [
      'Học viên được xem Nội dung cho mục đích học tập cá nhân, phi thương mại, trong thời hạn tài khoản còn quyền truy cập.',
      'Quyền truy cập gắn với một tài khoản và một cá nhân, không được chuyển nhượng, cho mượn hay dùng chung.',
      'Học viên được áp dụng kiến thức đã học vào công việc của mình; điều này không bao gồm việc phát tán lại chính Nội dung.',
    ],
  },
  {
    heading: 'Điều 3. Các hành vi bị cấm',
    items: [
      'Tải xuống, ghi lại, quay hoặc chụp màn hình, sao chép toàn bộ hay một phần Nội dung bằng bất kỳ công cụ nào.',
      'Đăng tải, chia sẻ, bán, cho thuê, phát lại Nội dung lên mạng xã hội, nhóm chat, website, ổ lưu trữ hoặc bất kỳ nơi nào khác.',
      'Chia sẻ tài khoản, mật khẩu hoặc đường dẫn bài học cho người khác.',
      'Dùng Nội dung để mở lớp, làm khóa học, tài liệu hay sản phẩm khác mà không có văn bản đồng ý của Bên cung cấp.',
      'Tìm cách vượt qua, gỡ bỏ hoặc che giấu các biện pháp bảo vệ, trong đó có mã học viên hiển thị trên video.',
    ],
  },
  {
    heading: 'Điều 4. Mã học viên và việc ghi nhận truy cập',
    items: [
      'Mỗi Học viên có một mã định danh riêng. Mã này và email của Học viên hiển thị liên tục trên video khi học để nhận diện nguồn phát tán nếu Nội dung bị lộ ra ngoài.',
      'Hệ thống ghi nhận thời điểm đồng ý cam kết, thời điểm truy cập bài học và thông tin trình duyệt để phục vụ bảo vệ Nội dung và giải quyết tranh chấp.',
      'Bằng việc đồng ý, Học viên chấp thuận việc xử lý các dữ liệu trên cho đúng mục đích này, theo Nghị định 13/2023/NĐ-CP. Dữ liệu không được bán hay chia sẻ cho bên thứ ba, trừ khi cơ quan nhà nước có thẩm quyền yêu cầu.',
    ],
  },
  {
    heading: 'Điều 5. Trách nhiệm khi vi phạm',
    items: [
      'Bên cung cấp có quyền khóa ngay tài khoản và chấm dứt quyền truy cập của Học viên vi phạm mà không hoàn lại học phí.',
      'Học viên phải bồi thường toàn bộ thiệt hại thực tế phát sinh do hành vi vi phạm, theo quy định về bồi thường thiệt hại của Bộ luật Dân sự 2015.',
      'Hành vi xâm phạm quyền tác giả có thể bị xử lý hành chính, hoặc truy cứu trách nhiệm hình sự theo Bộ luật Hình sự nếu đủ yếu tố cấu thành; Bên cung cấp có quyền yêu cầu cơ quan có thẩm quyền xử lý.',
      'Bên cung cấp có quyền dùng mã học viên, dữ liệu truy cập và các bằng chứng thu thập được để chứng minh vi phạm.',
    ],
  },
  {
    heading: 'Điều 6. Hiệu lực',
    items: [
      'Cam kết có hiệu lực từ khi Học viên tích chọn đồng ý và áp dụng cho mọi lần truy cập Nội dung, kể cả sau khi khóa học kết thúc.',
      'Tranh chấp được ưu tiên giải quyết bằng thương lượng; nếu không thành, một trong hai bên có quyền đưa ra Tòa án nhân dân có thẩm quyền tại Việt Nam.',
    ],
  },
];
