import { MailCheck } from 'lucide-react';

/** Shown once a file link has been emailed: many land in Spam, so say where to look. */
export default function CheckInboxNote({ email }: { email?: string }) {
  return (
    <div className="mt-4 flex gap-3 rounded-md border border-line bg-muted p-4 text-left text-sm">
      <MailCheck size={20} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
      <p className="leading-relaxed">
        {email && <>Link tải đã được gửi tới <strong className="break-all">{email}</strong>. </>}
        Anh chị vui lòng kiểm tra hộp thư đến, nếu không thấy vui lòng kiểm tra trong mục <strong>Spam</strong>.
      </p>
    </div>
  );
}
