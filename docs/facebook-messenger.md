# AI chăm sóc khách Facebook Messenger

Bot trả lời tin nhắn Fanpage 24/7, tư vấn theo đúng khóa học / cửa hàng / câu hỏi thường gặp trên website, chốt đơn, và báo cho bạn khi gặp ca khó. Quản lý ở **Admin > Facebook Messenger**.

## Bot làm gì

| Việc | Cách hoạt động |
|---|---|
| Tư vấn | Hỏi nhu cầu, gợi ý đúng khóa/gói, trả lời thắc mắc. Chỉ dùng giá và thông tin có trên website + kiến thức bạn đã duyệt, không bịa. |
| Chốt đơn | Khách đồng ý mua thì bot xin họ tên, số Zalo (và email nếu là khóa online), xác nhận lại sản phẩm + giá, ghi đơn vào tab **Đơn chốt**, gửi link thanh toán và báo bạn ngay. |
| Ca khó | Khiếu nại, hoàn tiền, đã chuyển khoản chưa nhận khóa, khách bực, xin giá riêng, hợp tác, khách muốn gặp người thật… Bot trả lời khách một câu lịch sự, **tạm dừng với khách đó** và gửi thông báo cho bạn qua Telegram và email. |
| Bạn vào trả lời | Trả lời trong Admin hoặc ngay trong hộp thư Fanpage / Meta Business Suite đều được. Bot tự tạm dừng với khách đó 12 giờ (đổi bằng `FB_HUMAN_PAUSE_HOURS`), bấm **Bật lại bot** để nó tiếp tục. |
| Học hỏi | 3 cách: (1) bấm **Dạy bot câu này** dưới một tin nhắn để sửa câu trả lời, dùng ngay; (2) tab **Kiến thức** thêm câu hỏi/trả lời; (3) mỗi thứ Hai bot đọc các hội thoại bạn tự trả lời trong tuần và đề xuất kiến thức mới, bạn duyệt rồi mới dùng (hoặc bấm **Học ngay**). |

Khách nhắn liên tiếp nhiều tin ngắn thì bot đợi khoảng 4 giây rồi trả lời gộp một lần.

## Cài đặt (làm một lần)

### 1. Chạy migration
Supabase > SQL Editor: chạy `supabase/migrations/031_fb_messenger.sql`.

### 2. Tạo Meta app
1. Vào https://developers.facebook.com/apps > **Tạo ứng dụng** > loại **Doanh nghiệp**, thêm sản phẩm **Messenger**.
2. **Messenger > Cài đặt API**: kết nối Fanpage, bấm **Tạo mã** → đó là `FB_PAGE_ACCESS_TOKEN`.
3. **Cài đặt > Thông tin cơ bản**: lấy **ID ứng dụng** (`FB_APP_ID`) và **Khóa bí mật** (`FB_APP_SECRET`).
4. Tự nghĩ một chuỗi ngẫu nhiên cho `FB_VERIFY_TOKEN`.

### 3. Thêm biến môi trường trên Vercel
Project > Settings > Environment Variables (xem `.env.example`):

```
FB_PAGE_ACCESS_TOKEN=...
FB_APP_SECRET=...
FB_APP_ID=...
FB_VERIFY_TOKEN=...
ANTHROPIC_API_KEY=...        # đã có nếu trợ lý chat trên web đang chạy
TELEGRAM_BOT_TOKEN=...       # khuyên dùng để nhận báo ca khó tức thì trên điện thoại
TELEGRAM_CHAT_ID=...
```

Telegram: nhắn @BotFather lệnh `/newbot` để lấy token, nhắn cho bot vừa tạo một tin bất kỳ, rồi mở `https://api.telegram.org/bot<token>/getUpdates` để đọc số `chat.id`.
Email báo ca khó gửi tới `FB_NOTIFY_EMAIL`, nếu trống thì tới email liên hệ trong Admin > Nội dung & liên hệ.

Deploy lại sau khi thêm biến.

### 4. Đăng ký webhook
Meta app > **Messenger > Cài đặt API > Định cấu hình webhook**:
- URL gọi lại: `https://www.minhtanacademy.com/api/webhooks/facebook`
- Mã xác minh: giá trị `FB_VERIFY_TOKEN`
- Đăng ký trường cho Fanpage: `messages`, `messaging_postbacks`, `message_echoes`

### 5. Đưa app lên chế độ Live
Khi app còn ở chế độ phát triển, bot chỉ trả lời người có vai trò trong app (dùng để thử). Để trả lời mọi khách: gửi **Xét duyệt ứng dụng** xin quyền `pages_messaging` (và `human_agent` nếu muốn trả lời khách sau 24 giờ từ Admin), rồi chuyển app sang **Live**.

## Chi phí và tùy chỉnh
- Mặc định bot dùng Claude Opus 5.5 ở mức suy nghĩ thấp (`FB_EFFORT=low`). Muốn rẻ hơn nhiều: `FB_MODEL=claude-haiku-5-5`. Nên đặt hạn mức chi tiêu trong Anthropic Console.
- `FB_BOT_ENABLED=false`: bot chỉ lưu tin nhắn và không tự trả lời (bạn vẫn trả lời từ Admin).
- Tin tự động của Meta (AI chuyển cuộc trò chuyện, trả lời tức thì, luồng bình luận để nhắn tin) không làm bot tạm dừng: tin Fanpage gửi trong vòng 20 giây sau tin của khách được coi là tự động (đổi bằng `FB_AUTO_ECHO_SECONDS`). Log Vercel ghi `[fb echo]` kèm `app_id` cho mỗi tin Fanpage gửi; app nào là công cụ tự động thì thêm vào `FB_AUTOMATED_APP_IDS` (cách nhau bằng dấu phẩy) để mọi tin của nó đều được bỏ qua.
- Quy tắc tư vấn, khi nào chuyển ca khó: sửa `RULES` trong `src/lib/fb/agent.ts`.

## Lưu ý của Facebook
- Trang chỉ được trả lời tự do trong **24 giờ** kể từ tin nhắn cuối của khách. Sau đó trả lời từ Admin cần quyền Human Agent (trong 7 ngày).
- Bot chưa xem được ảnh, video, tin nhắn thoại: nó nhờ khách nhắn bằng chữ.
