'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Newspaper } from 'lucide-react';
import AdminCrud from '@/components/admin/AdminCrud';
import { Field } from '@/components/admin/AdminUI';
import { uploadImage } from '@/components/admin/ImageUpload';
import { formatPostDate, slugify } from '@/lib/blog-format';

// Title and link together: a new post's link follows its title until someone edits the link by hand.
function TitleFields({ form, update }: { form: any; update: (patch: Record<string, any>) => void }) {
  const follows = !form.id && (!form.slug || form.slug === slugify(form.title || ''));
  return (
    <div className="space-y-5">
      <Field id="post-title" label="Tiêu đề bài viết" hint="Nên có từ khóa chính, ví dụ “Cách quay video bằng điện thoại đẹp”.">
        <input id="post-title" className="input" required value={form.title ?? ''}
               onChange={(e) => update({ title: e.target.value, ...(follows ? { slug: slugify(e.target.value) } : {}) })} />
      </Field>
      <Field id="post-slug" label="Đường dẫn" hint={`minhtanacademy.com/blog/${form.slug || '...'} — chỉ gồm chữ thường không dấu, số và dấu gạch ngang. Bài đã đăng thì không nên đổi, link cũ sẽ hỏng.`}>
        <input id="post-slug" className="input" required pattern="[a-z0-9]+(-[a-z0-9]+)*" title="Chỉ gồm chữ thường không dấu, số và dấu gạch ngang" value={form.slug ?? ''}
               onChange={(e) => update({ slug: e.target.value })} />
      </Field>
    </div>
  );
}

function ContentField({ form, update }: { form: any; update: (patch: Record<string, any>) => void }) {
  const box = useRef<HTMLTextAreaElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Puts the picture on its own lines where the cursor is
  async function addPicture(file: File) {
    setUploading(true);
    setError('');
    try {
      const url = await uploadImage(file, 'blog_posts');
      const text: string = form.content ?? '';
      const at = box.current?.selectionStart ?? text.length;
      update({ content: `${text.slice(0, at)}\n\n![Mô tả ảnh](${url})\n\n${text.slice(at)}` });
    } catch (err: any) {
      setError(err.message || 'Không tải được ảnh.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Field id="post-content" label="Nội dung" hint="## Tiêu đề lớn · ### Tiêu đề nhỏ · - Danh sách · 1. Danh sách số · > Trích dẫn · **đậm** · *nghiêng* · [chữ](/courses) để gắn link. Sau khi chèn ảnh, sửa chữ “Mô tả ảnh” thành nội dung của ảnh.">
      <textarea id="post-content" ref={box} className="input min-h-[420px] font-mono text-sm leading-relaxed" required value={form.content ?? ''}
                onChange={(e) => update({ content: e.target.value })} />
      <label className="btn btn-outline mt-2 cursor-pointer">
        {uploading ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : <ImagePlus size={16} aria-hidden="true" />}
        {uploading ? 'Đang tải ảnh…' : 'Chèn ảnh vào bài'}
        <input type="file" accept="image/*" className="sr-only" disabled={uploading}
               onChange={(e) => { const f = e.target.files?.[0]; if (f) addPicture(f); e.target.value = ''; }} />
      </label>
      {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
    </Field>
  );
}

export default function AdminBlogPage() {
  return (
    <AdminCrud
      table="blog_posts"
      title="Blog"
      description="Bài viết để khách tìm thấy website trên Google. Bài chỉ hiện ở /blog khi bật “Đăng bài”."
      icon={Newspaper}
      itemLabel="bài viết"
      imageKey="cover_url"
      wideForm
      emptyRecord={{ title: '', slug: '', excerpt: '', content: '', cover_url: '', seo_title: '', seo_description: '', is_published: false }}
      fields={[
        { key: 'title', keys: ['title', 'slug'], label: 'Tiêu đề và đường dẫn', type: 'custom', render: (form, update) => <TitleFields form={form} update={update} /> },
        { key: 'cover_url', label: 'Ảnh bìa', type: 'image', hint: 'Ảnh ngang 16:9, cũng là ảnh hiện khi chia sẻ link.' },
        { key: 'excerpt', label: 'Tóm tắt ngắn', type: 'textarea', hint: 'Hiện ở danh sách bài viết, và trên Google nếu không điền mô tả SEO.' },
        { key: 'content', label: 'Nội dung', type: 'custom', render: (form, update) => <ContentField form={form} update={update} /> },
        { key: 'seo_title', label: 'Tiêu đề trên Google (không bắt buộc)', hint: 'Khoảng 50–60 ký tự. Để trống sẽ dùng tiêu đề bài viết.' },
        { key: 'seo_description', label: 'Mô tả trên Google (không bắt buộc)', type: 'textarea', hint: 'Khoảng 150–160 ký tự. Để trống sẽ dùng phần tóm tắt.' },
        { key: 'is_published', label: 'Trạng thái', type: 'checkbox', hint: 'Đăng bài (bỏ chọn để lưu nháp)' },
      ]}
      renderMeta={(row) => (
        row.is_published && row.published_at
          ? <a href={`/blog/${row.slug}`} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4">Đã đăng {formatPostDate(row.published_at)}</a>
          : <span>Bản nháp</span>
      )}
    />
  );
}
