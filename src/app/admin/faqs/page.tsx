'use client';

import { HelpCircle } from 'lucide-react';
import AdminCrud from '@/components/admin/AdminCrud';

export default function AdminFaqsPage() {
  return (
    <AdminCrud
      table="faqs"
      title="Câu hỏi thường gặp"
      description="Phần “Bạn còn băn khoăn?” cuối trang chủ."
      icon={HelpCircle}
      itemLabel="câu hỏi"
      titleKey="question"
      imageKey={null}
      layout="list"
      orderBy={{ column: 'sort_order', ascending: true }}
      emptyRecord={{ question: '', answer: '', sort_order: 0 }}
      fields={[
        { key: 'question', label: 'Câu hỏi', required: true },
        { key: 'answer', label: 'Câu trả lời', type: 'textarea', required: true },
        { key: 'sort_order', label: 'Thứ tự hiển thị', type: 'number', step: 1 },
      ]}
      renderMeta={(row) => <span className="line-clamp-2">{row.answer}</span>}
    />
  );
}
