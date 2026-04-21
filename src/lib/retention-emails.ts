export const getRetentionEmailTemplate = (type: 'inactivity' | 'expiry' | 'lead-fomo' | 'renewal-privilege', data: { name: string; courseTitle?: string; days?: number; expiryDate?: string }) => {
  const styles = `
    background-color: #050507;
    color: #f5f5f5;
    font-family: 'Montserrat', sans-serif;
    padding: 40px;
    border-radius: 24px;
    border: 1px solid rgba(227, 38, 54, 0.1);
    max-width: 600px;
    margin: auto;
  `;

  const footer = `
    <p style="text-align: center; font-size: 10px; color: #333; margin-top: 50px; letter-spacing: 0.2em;">
      SECURED BY TANLAB // ENCRYPTED SESSION // © 2026
    </p>
  `;

  if (type === 'inactivity') {
    return `
      <div style="${styles}">
        <div style="text-align: center; margin-bottom: 30px;">
           <div style="display: inline-block; padding: 8px 16px; background: rgba(227, 38, 54, 0.1); color: #e32636; border-radius: 50px; font-size: 10px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase;">
             Mission Alert // Pending Action
           </div>
        </div>
        <h1 style="font-size: 24px; font-weight: 900; text-align: center; margin-bottom: 20px; line-height: 1.2;">BÀI GIẢNG ĐANG CHỜ ĐỢI BẠN, ${data.name.toUpperCase()}</h1>
        <p style="color: #888; font-size: 15px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
          Đã 3 ngày trôi qua kể từ lần cuối bạn truy cập đài chỉ huy. Đừng để ngọn lửa kiến thức nguội lạnh. Khóa học <strong>${data.courseTitle}</strong> đang có những bí mật chưa được khai phá.
        </p>
        <div style="background: rgba(255,255,255,0.02); padding: 25px; border-radius: 20px; border: 1px dashed rgba(255,255,255,0.1); margin-bottom: 35px; text-align: center;">
           <p style="font-size: 13px; color: #f5bc1b; font-weight: bold; margin: 0;">Tiếp tục hành trình từ nơi bạn đã dừng lại.</p>
        </div>
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" style="background: #e32636; color: white; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: 900; font-size: 13px; letter-spacing: 0.1em;">RE-DEPLOY MISSION &rarr;</a>
        </div>
        ${footer}
      </div>
    `;
  }

  if (type === 'expiry') {
    return `
      <div style="${styles}">
        <div style="text-align: center; margin-bottom: 30px;">
           <div style="display: inline-block; padding: 8px 16px; background: rgba(245, 188, 27, 0.1); color: #f5bc1b; border-radius: 50px; font-size: 10px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase;">
             Access Warning // Expiration Imminent
           </div>
        </div>
        <h1 style="font-size: 24px; font-weight: 900; text-align: center; margin-bottom: 20px; line-height: 1.2;">QUYỀN TRUY CẬP SẮP HẾT HẠN</h1>
        <p style="color: #888; font-size: 15px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
          Chào ${data.name}, khóa học <strong>${data.courseTitle}</strong> của bạn sẽ hết hạn vào ngày <strong style="color: #f5f5f5;">${data.expiryDate}</strong>. 
          Hãy tập trung cao độ để hoàn thành các bài giảng cuối cùng trước khi cổng truy cập đóng lại.
        </p>
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" style="background: #f5bc1b; color: black; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: 900; font-size: 13px; letter-spacing: 0.1em;">HOÀN THÀNH NGAY &rarr;</a>
        </div>
        ${footer}
      </div>
    `;
  }

  if (type === 'lead-fomo') {
    return `
      <div style="${styles}">
        <div style="text-align: center; margin-bottom: 30px;">
           <div style="display: inline-block; padding: 8px 16px; background: rgba(245, 188, 27, 0.1); color: #f5bc1b; border-radius: 50px; font-size: 10px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase;">
             Exclusive Invitation // 2026
           </div>
        </div>
        <h1 style="font-size: 24px; font-weight: 900; text-align: center; margin-bottom: 20px; line-height: 1.2;">CƠ HỘI CUỐI CÙNG ĐỂ NÂNG TẦM KỸ NĂNG</h1>
        <p style="color: #888; font-size: 15px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
          Chào ${data.name}, chúng tôi nhận thấy bạn đã đăng ký tài khoản nhưng vẫn chưa bắt đầu hành trình của mình. Thế giới Video & Photography đang thay đổi chóng mặt, đừng để mình bị bỏ lại phía sau.
        </p>
        <div style="background: linear-gradient(135deg, rgba(245, 188, 27, 0.05), rgba(0,0,0,0)); padding: 30px; border-radius: 20px; border: 1px solid rgba(245, 188, 27, 0.1); margin-bottom: 35px; text-align: center;">
           <p style="font-size: 12px; color: #f5f5f5; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.1em;">Đặc quyền dành riêng cho bạn:</p>
           <p style="font-size: 18px; color: #f5bc1b; font-weight: 900; margin: 0;">NHẬP MÃ "TANLAB" ĐỂ GIẢM NGAY 500.000Đ</p>
        </div>
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/" style="background: #f5bc1b; color: black; padding: 18px 36px; text-decoration: none; border-radius: 50px; font-weight: 900; font-size: 13px; letter-spacing: 0.1em; display: inline-block;">KÍCH HOẠT QUYỀN TRUY CẬP &rarr;</a>
        </div>
        ${footer}
      </div>
    `;
  }

  if (type === 'renewal-privilege') {
    return `
      <div style="${styles}">
        <div style="text-align: center; margin-bottom: 30px;">
           <div style="display: inline-block; padding: 8px 16px; background: rgba(227, 38, 54, 0.1); color: #e32636; border-radius: 50px; font-size: 10px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase;">
             Mission Status // Ending Soon
           </div>
        </div>
        <h1 style="font-size: 24px; font-weight: 900; text-align: center; margin-bottom: 20px; line-height: 1.2;">DUY TRÌ ĐẶC QUYỀN TRUY CẬP CỦA BẠN</h1>
        <p style="color: #888; font-size: 15px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
          Chào ${data.name}, hành trình của bạn với khóa học <strong>${data.courseTitle}</strong> sẽ chính thức khép lại sau 1 tuần nữa. Đừng để những nỗ lực học tập của bạn bị gián đoạn.
        </p>
        <div style="background: rgba(227, 38, 54, 0.05); padding: 25px; border-radius: 20px; border: 1px dashed rgba(227, 38, 54, 0.2); margin-bottom: 35px; text-align: center;">
           <p style="font-size: 13px; color: #e32636; font-weight: bold; margin-bottom: 5px;">Hết hạn vào: ${data.expiryDate}</p>
           <p style="font-size: 11px; color: #888; margin: 0;">Gia hạn ngay để nhận thêm mã giảm giá nâng cấp khóa học khác!</p>
        </div>
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" style="background: #e32636; color: white; padding: 18px 36px; text-decoration: none; border-radius: 50px; font-weight: 900; font-size: 13px; letter-spacing: 0.1em; display: inline-block;">GIA HẠN ĐẶC QUYỀN &rarr;</a>
        </div>
        ${footer}
      </div>
    `;
  }

  return '';
};
