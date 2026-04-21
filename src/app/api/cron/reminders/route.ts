import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { Resend } from 'resend';
import { getRetentionEmailTemplate } from '@/lib/retention-emails';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
  try {
    // 1. Security Check (Manual trigger protection)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized manual trigger attempt.' }, { status: 401 });
    }

    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000)).toISOString();
    const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString();

    // 2. Scan for Inactive Students (3+ days)
    const { data: inactiveEnrollments } = await supabase
      .from('enrollments')
      .select(`
        id,
        user_id,
        course_id,
        progress_percent,
        courses (title),
        users (email, last_active_at)
      `)
      .not('status', 'eq', 'completed')
      .lt('users.last_active_at', threeDaysAgo);

    const sentInactivity = [];
    if (inactiveEnrollments) {
      for (const enrollment of inactiveEnrollments) {
        const user = (enrollment as any).users;
        const course = (enrollment as any).courses;
        
        await resend.emails.send({
          from: 'Minh Tan Academy <customer@minhtanacademy.com>',
          to: user.email,
          subject: '🔥 BÀI GIẢNG ĐANG CHỜ ĐỢI BẠN!',
          html: getRetentionEmailTemplate('inactivity', { 
            name: user.email.split('@')[0], 
            courseTitle: course.title 
          })
        });
        sentInactivity.push(user.email);
      }
    }

    // 3. Scan for Subscriptions Expiring Soon (Exactly 7 days left)
    const sevenDaysFromNowStart = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
    sevenDaysFromNowStart.setHours(0,0,0,0);
    const sevenDaysFromNowEnd = new Date(sevenDaysFromNowStart.getTime() + (24 * 60 * 60 * 1000));

    const { data: expiringEnrollments } = await supabase
      .from('enrollments')
      .select(`
        id,
        user_id,
        course_id,
        expires_at,
        courses (title),
        users (email)
      `)
      .gte('expires_at', sevenDaysFromNowStart.toISOString())
      .lt('expires_at', sevenDaysFromNowEnd.toISOString());

    const sentExpiry = [];
    if (expiringEnrollments) {
      for (const enrollment of expiringEnrollments) {
        const user = (enrollment as any).users;
        const course = (enrollment as any).courses;
        
        await resend.emails.send({
          from: 'Minh Tan Academy <customer@minhtanacademy.com>',
          to: user.email,
          subject: '⚠️ CẢNH BÁO: GIA HẠN ĐẶC QUYỀN TRUY CẬP CỦA BẠN!',
          html: getRetentionEmailTemplate('renewal-privilege', { 
            name: user.email.split('@')[0], 
            courseTitle: course.title,
            expiryDate: new Date(enrollment.expires_at).toLocaleDateString('vi-VN')
          })
        });
        sentExpiry.push(user.email);
      }
    }

    // 4. Lead Nurturing (Registered but 0 enrollments after 24h)
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000)).toISOString();
    
    // Sub-query or filter to find users with no enrollments
    const { data: potentialLeads } = await supabase
      .from('users')
      .select(`id, email, created_at`)
      .lt('created_at', twentyFourHoursAgo);

    const sentLeads = [];
    if (potentialLeads) {
      for (const lead of potentialLeads) {
        // Check if this lead has any enrollments
        const { count } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', lead.id);

        if (count === 0) {
          await resend.emails.send({
            from: 'Minh Tan Academy <customer@minhtanacademy.com>',
            to: lead.email,
            subject: '🚀 MÓN QUÀ KHỞI ĐẦU DÀNH RIÊNG CHO BẠN!',
            html: getRetentionEmailTemplate('lead-fomo', { 
              name: lead.email.split('@')[0] 
            })
          });
          sentLeads.push(lead.email);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: { 
        inactivity: sentInactivity.length, 
        expiring_renewals: sentExpiry.length,
        lead_conversions: sentLeads.length
      } 
    });

  } catch (error: any) {
    console.error('CRON Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
