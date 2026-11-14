# Bật Cloudflare proxy cho minhtanacademy.com

Mục đích: khách ở Việt Nam kết nối tới Cloudflare (ổn định hơn), Cloudflare chuyển tiếp sang Vercel.
Đo ngày 14/11/2026 từ mạng Viettel: tới Vercel khoảng 1/10 lần không kết nối được, gần nửa số lần chậm hơn 2 giây; tới Cloudflare 15/15 lần thành công, không lần nào chậm.

Trước khi bật: bản code đọc IP thật của khách qua Cloudflare (`src/lib/client-ip.ts`) phải đã lên web.

## Bước 1. Chế độ SSL (làm trước khi bật đám mây cam)
Cloudflare › chọn `minhtanacademy.com` › **SSL/TLS** › **Overview** › chọn **Full (strict)**.
Không chọn Flexible: Vercel luôn chuyển sang https, Flexible sẽ gây vòng lặp chuyển hướng (lỗi "too many redirects").

## Bước 2. Không cho Cloudflare lưu sẵn trang HTML
Mặc định Cloudflare chỉ lưu file tĩnh (ảnh, JS, CSS) và không lưu HTML. Giữ nguyên như vậy:
- **Caching** › **Configuration** › Caching Level: **Standard**.
- Không tạo Cache Rule "Cache Everything".
- Không bật **Rocket Loader** (Speed › Optimization). Nó làm hỏng script của Next.js.
- **Auto Minify**: tắt nếu còn thấy tùy chọn này.

## Bước 3. Bật proxy
Cloudflare › **DNS** › **Records**:
- Bản ghi `A` tên `@` (giá trị `76.76.21.21`): bấm vào đám mây xám để thành **cam (Proxied)**.
- Bản ghi tên `www`: tương tự, chuyển sang **cam**.
- Bản ghi khác (email, xác minh Resend, TXT, MX): **không đụng tới**.

Vài phút sau, mở `https://www.minhtanacademy.com` và nhấn Ctrl+F5.

## Bước 4. Kiểm tra sau khi bật (báo Claude kiểm tra cùng)
- Trang chủ, khóa học, cửa hàng, blog mở bình thường.
- Đăng nhập, đăng xuất, khu học tập.
- Tạo đơn chuyển khoản, trang QR hiện đúng; webhook SePay tự kích hoạt đơn.
- Video bài học (DRM) phát được.
- Trong Vercel › Domains, hai tên miền vẫn không báo lỗi chứng chỉ.

## Tắt khẩn cấp
Có lỗi lạ: Cloudflare › DNS › bấm đám mây cam của `@` và `www` về **xám (DNS only)**. Web trở lại như cũ sau vài phút. Không cần sửa code: code chạy đúng cả khi có và không có Cloudflare.
