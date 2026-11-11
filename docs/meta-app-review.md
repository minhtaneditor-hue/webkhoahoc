# Xét duyệt ứng dụng Meta cho bot Messenger TẤN VA

App: **TAN VA Messenger Bot** (ID 1785199656048338), Doanh nghiệp: Minh Tấn Editor, Trang: Minh Tấn - Video Advisor (930198020168497).
Mục tiêu: chuyển app sang **Live** để bot trả lời mọi khách, không chỉ người có vai trò trong app.

## 0. Việc phải xong trước (Minh Tấn tự làm)
- **Xác minh doanh nghiệp** Minh Tấn Editor: business.facebook.com > Cài đặt doanh nghiệp > Trung tâm bảo mật > Bắt đầu xác minh. Cần giấy phép kinh doanh (hoặc giấy tờ hộ kinh doanh) đúng tên, địa chỉ, số điện thoại hoặc email tên miền minhtanacademy.com.
- PR "privacy: Messenger data…" đã lên website để `/privacy` có mục Messenger và Yêu cầu xóa dữ liệu.

## 1. Cài đặt > Thông tin cơ bản
| Ô | Giá trị |
|---|---|
| Miền ứng dụng | `minhtanacademy.com` |
| URL chính sách quyền riêng tư | `https://www.minhtanacademy.com/privacy` |
| URL điều khoản dịch vụ | `https://www.minhtanacademy.com/terms` |
| Xóa dữ liệu người dùng | chọn "URL hướng dẫn xóa dữ liệu": `https://www.minhtanacademy.com/privacy#muc-5` |
| Biểu tượng ứng dụng | ảnh vuông 1024×1024 (logo TẤN VA) |
| Hạng mục | Giáo dục (Education) |
| Email liên hệ | minhtaneditor@gmail.com (đã có) |

## 2. Quyền cần xin (Trường hợp sử dụng > Messenger > Quyền và tính năng)
- `pages_messaging` (bắt buộc)
- `pages_manage_metadata` (đăng ký webhook cho Trang)
- `pages_read_engagement` (đọc lịch sử hội thoại để bot học giọng tư vấn)
- `pages_show_list`
- Tính năng **Human Agent** (tùy chọn): để Minh Tấn trả lời khách sau 24 giờ từ trang Admin.

## 3. Mô tả cách dùng (dán vào từng quyền, tiếng Anh)

**pages_messaging**
> TAN VA is a Vietnamese education business that teaches video filming and editing with smartphones. Our app answers messages that customers send to our Facebook Page "Minh Tấn - Video Advisor". When a person messages the Page, our webhook receives the message and an AI assistant replies within seconds with information about our courses (content, schedule, public prices from our website) and helps them register. Cases that need a human (discount requests, complaints, refunds, hesitant customers) are handed to the Page owner, who is notified and replies personally; the bot stops replying to that person while a human handles it. We only reply to people who message us first, within the 24-hour standard messaging window. We never send promotional or unsolicited messages.

**pages_manage_metadata**
> Used only to subscribe our app's webhook to our own Page's `messages`, `messaging_postbacks` and `message_echoes` fields, so we receive customer messages and know when the Page owner has replied personally (then the bot pauses for that conversation).

**pages_read_engagement**
> Used to read the past Messenger conversations of our own Page, so the Page owner can import them into our admin dashboard. The assistant learns the owner's tone and the answers he gave to common questions. Phone numbers, emails and account numbers are removed before processing. The data is never shared with third parties or used for advertising.

**pages_show_list**
> Lets the Page owner pick his Page when connecting it to the app.

**Human Agent**
> The Page owner sometimes needs more than 24 hours to answer a customer's specific question (custom class schedule, group pricing). Human Agent lets him reply personally from our admin dashboard within 7 days of the customer's last message. Automated messages never use this tag.

## 4. Video quay màn hình (một video cho pages_messaging, dùng lại cho các quyền khác)
Quay bằng OBS hoặc Xbox Game Bar, 1–2 phút, có thể không cần tiếng; nên bật phụ đề tiếng Anh ngắn.
1. Mở Messenger bằng tài khoản thử nghiệm, nhắn vào Trang: "Hi, I want to learn video editing on my phone".
2. Cho thấy bot trả lời trong vài giây (hỏi nhu cầu, gợi ý khóa học, đưa link website).
3. Nhắn: "It's too expensive, can you give me a discount?". Cho thấy bot báo đã chuyển cho Minh Tấn.
4. Chuyển sang trang Admin > Facebook Messenger: hội thoại có nhãn "Ca khó", thông báo Telegram/email đã tới.
5. Trong Admin, gõ trả lời khách bằng tay và gửi (Human Agent), cho thấy tin hiện trên Messenger.
6. Tab "Kiến thức của bot": bấm "Nhập tin nhắn cũ" (pages_read_engagement) và cho thấy hồ sơ giọng.

## 5. Gửi và chuyển Live
- Ứng dụng > Xét duyệt ứng dụng > Yêu cầu quyền: thêm các quyền ở mục 2, dán mô tả, tải video, gửi.
- Meta thường trả lời trong vài ngày. Nếu bị từ chối, đọc lý do và sửa đúng điểm đó rồi gửi lại.
- Khi được duyệt: bật công tắc **Chế độ ứng dụng: Live** ở đầu trang. Từ đó bot trả lời mọi khách.
