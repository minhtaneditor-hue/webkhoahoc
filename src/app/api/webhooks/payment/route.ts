import { NextResponse } from 'next/server';
import { verifyVNPCallback } from '@/lib/vnpay-helper';
import { supabase } from '@/utils/supabase';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { searchParams } = new URL(req.url);
    const vnp_Params = Object.fromEntries(searchParams.entries());

    // 1. Verify Hash
    const isValid = verifyVNPCallback({ ...vnp_Params });
    if (!isValid) {
      return NextResponse.json({ RspCode: '97', Message: 'Invalid Checksum' });
    }

    const orderId = vnp_Params['vnp_TxnRef'];
    const responseCode = vnp_Params['vnp_ResponseCode'];
    const amount = Number(vnp_Params['vnp_Amount']) / 100;
    const transactionId = vnp_Params['vnp_TransactionNo'];

    // 2. Process success (ResponseCode 00)
    if (responseCode === '00') {
      // Find the payment record
      const { data: payment, error: pError } = await supabase
        .from('payments')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (pError || !payment) {
        return NextResponse.json({ RspCode: '01', Message: 'Order not found' });
      }

      if (payment.status === 'success') {
        return NextResponse.json({ RspCode: '02', Message: 'Order already confirmed' });
      }

      // 3. Update Payment Status
      await supabase
        .from('payments')
        .update({ status: 'success', transaction_id: transactionId })
        .eq('id', payment.id);

      // 4. Auto-Enrollment
      await supabase.from('enrollments').upsert({
        user_id: payment.user_id,
        course_id: payment.course_id,
        status: 'active'
      });

      // 5. Send Email Notification
      const { data: user } = await supabase.from('users').select('email').eq('id', payment.user_id).single();
      const { data: course } = await supabase.from('courses').select('title').eq('id', payment.course_id).single();

      if (user && course) {
        await resend.emails.send({
          from: 'Minh Tan Academy <customer@minhtanacademy.com>',
          to: user.email,
          subject: '🚀 CHÀO MỪNG BẠN GIA NHẬP MINH TAN ACADEMY!',
          html: `
            <div style="background-color: #050507; color: #f5f5f5; font-family: 'Montserrat', sans-serif; padding: 40px; border-radius: 20px; border: 1px solid rgba(245, 188, 27, 0.1);">
              <div style="text-align: center; margin-bottom: 40px;">
                <div style="display: inline-block; padding: 10px 20px; background-color: rgba(245, 188, 27, 0.1); border-radius: 50px; font-size: 10px; font-weight: 900; color: #f5bc1b; letter-spacing: 0.3em;">
                  OFFICIAL ENROLLMENT // 2026
                </div>
              </div>
              
              <h1 style="font-size: 28px; font-weight: 900; text-align: center; margin-bottom: 20px;">XÁC NHẬN KÍCH HOẠT THÀNH CÔNG</h1>
              <p style="text-align: center; color: #888888; font-size: 14px; margin-bottom: 40px;">Hệ thống đã ghi nhận thanh toán cho khóa học: <strong style="color: #f5f5f5;">${course.title}</strong></p>
              
              <div style="background-color: rgba(255, 255, 255, 0.02); padding: 30px; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.05); margin-bottom: 40px;">
                <h3 style="font-size: 14px; font-weight: 900; color: #e32636; letter-spacing: 0.1em; margin-bottom: 20px; text-transform: uppercase;">Thông tin truy cập:</h3>
                <p style="font-size: 14px; margin-bottom: 10px;">• <strong>Email:</strong> ${user.email}</p>
                <p style="font-size: 14px; margin-bottom: 25px;">• <strong>Mật khẩu mặc định:</strong> <code style="background: rgba(245, 188, 27, 0.1); padding: 4px 8px; border-radius: 4px; color: #f5bc1b;">21day12345</code></p>
                
                <div style="padding: 15px; background-color: rgba(227, 38, 54, 0.05); border-left: 3px solid #e32636; font-size: 12px; color: #888888;">
                  <strong>Gợi ý bảo mật:</strong> Chúng tôi khuyên bạn nên truy cập vào mục "Security Hub" trong Dashboard để đổi mật khẩu hoặc kích hoạt xác thực 2 lớp (2FA) ngay lập tức.
                </div>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" style="background-color: #f5bc1b; color: #000000; padding: 18px 36px; text-decoration: none; border-radius: 50px; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; display: inline-block;">TRUY CẬP MISSION CONTROL</a>
              </div>
              
              <p style="text-align: center; font-size: 10px; color: #333333; margin-top: 50px; letter-spacing: 0.2em;">
                SECURED BY TANLAB // ENCRYPTED SESSION // © 2026
              </p>
            </div>
          `
        });
      }

      return NextResponse.json({ RspCode: '00', Message: 'Confirm Success' });
    } else {
      // Handle payment failure logic if needed
      return NextResponse.json({ RspCode: '00', Message: 'Payment Failed or Canceled' });
    }
  } catch (error: any) {
    console.error('IPN Error:', error);
    return NextResponse.json({ RspCode: '99', Message: 'Internal Error' });
  }
}
