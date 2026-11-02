"use client";

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/utils/supabase';
import { formatVND } from '@/lib/supabase-public';
import { Plus, Pencil, Trash2, Database, ListVideo, ExternalLink, X, ArrowUp, ArrowDown, FolderPlus } from 'lucide-react';
import { PageHeader, LoadingRow, EmptyState, Modal, Field, StatusBadge } from '@/components/admin/AdminUI';
import ImageUpload from '@/components/admin/ImageUpload';
import { revalidateSite } from '@/lib/revalidate';
import { groupByChapter, type Chapter } from '@/lib/curriculum';

const emptyCourse = { title: '', slug: '', description: '', price: 0, old_price: '', thumbnail_url: '', is_published: false };
const emptyLesson = { title: '', video_url: '', content: '', is_free: false, chapter_id: '' };

const slugify = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

type Notice = { type: 'success' | 'error'; text: string } | null;

export default function CourseManagement() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice>(null);
  const [editing, setEditing] = useState<any>(null); // course form state (null = closed)
  const [lessonsFor, setLessonsFor] = useState<any>(null); // course whose lessons are open
  const [lessons, setLessons] = useState<any[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessonForm, setLessonForm] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    () => supabase.from('courses').select('*, lessons ( id )').order('created_at').then(({ data }) => {
      setCourses(data || []);
      setLoading(false);
    }),
    []
  );

  useEffect(() => { load(); }, [load]);

  const loadLessons = useCallback(async (courseId: string) => {
    const [{ data }, { data: ch }] = await Promise.all([
      supabase.from('lessons').select('*').eq('course_id', courseId).order('order_index'),
      supabase.from('chapters').select('id, title, order_index').eq('course_id', courseId).order('order_index'),
    ]);
    setLessons(data || []);
    setChapters(ch || []);
  }, []);

  async function saveCourse(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const payload = {
      title: editing.title.trim(),
      slug: editing.slug.trim() || slugify(editing.title),
      description: editing.description || null,
      price: Number(editing.price) || 0,
      old_price: editing.old_price === '' || editing.old_price == null ? null : Number(editing.old_price),
      thumbnail_url: editing.thumbnail_url || null,
      is_published: !!editing.is_published,
    };
    const { error } = editing.id
      ? await supabase.from('courses').update(payload).eq('id', editing.id)
      : await supabase.from('courses').insert(payload);
    setBusy(false);
    if (error) return setNotice({ type: 'error', text: `Không lưu được: ${error.message}` });
    setNotice({ type: 'success', text: `Đã lưu khóa học “${payload.title}”.` });
    setEditing(null);
    load();
    revalidateSite();
  }

  async function togglePublish(course: any) {
    const { error } = await supabase.from('courses').update({ is_published: !course.is_published }).eq('id', course.id);
    if (error) return setNotice({ type: 'error', text: error.message });
    load();
    revalidateSite();
  }

  async function deleteCourse(course: any) {
    if (!confirm(`Xóa khóa học “${course.title}” cùng toàn bộ bài học? Không thể hoàn tác.`)) return;
    const { error } = await supabase.from('courses').delete().eq('id', course.id);
    setNotice(error ? { type: 'error', text: error.message } : { type: 'success', text: 'Đã xóa khóa học.' });
    load();
    revalidateSite();
  }

  async function openLessons(course: any) {
    setLessonsFor(course);
    setLessonForm(null);
    await loadLessons(course.id);
  }

  async function saveLesson(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const payload = {
      title: lessonForm.title.trim(),
      video_url: lessonForm.video_url.trim() || null,
      content: lessonForm.content || null,
      is_free: !!lessonForm.is_free,
      chapter_id: lessonForm.chapter_id || null,
    };
    const { error } = lessonForm.id
      ? await supabase.from('lessons').update(payload).eq('id', lessonForm.id)
      : await supabase.from('lessons').insert({ ...payload, course_id: lessonsFor.id, order_index: (lessons.at(-1)?.order_index ?? 0) + 1 });
    setBusy(false);
    if (error) return setNotice({ type: 'error', text: `Không lưu được bài học: ${error.message}` });
    setLessonForm(null);
    loadLessons(lessonsFor.id);
    load();
    revalidateSite();
  }

  async function deleteLesson(lesson: any) {
    if (!confirm(`Xóa bài “${lesson.title}”?`)) return;
    await supabase.from('lessons').delete().eq('id', lesson.id);
    loadLessons(lessonsFor.id);
    load();
    revalidateSite();
  }

  // Swap with the neighbour inside the same chapter
  async function moveLesson(group: any[], index: number, dir: -1 | 1) {
    const a = group[index];
    const b = group[index + dir];
    if (!a || !b) return;
    await Promise.all([
      supabase.from('lessons').update({ order_index: b.order_index }).eq('id', a.id),
      supabase.from('lessons').update({ order_index: a.order_index }).eq('id', b.id),
    ]);
    loadLessons(lessonsFor.id);
    revalidateSite();
  }

  async function addChapter() {
    const title = prompt('Tên chương mới', `Chương ${chapters.length + 1}: `)?.trim();
    if (!title) return;
    const { error } = await supabase.from('chapters').insert({ course_id: lessonsFor.id, title, order_index: (chapters.at(-1)?.order_index ?? 0) + 1 });
    if (error) return setNotice({ type: 'error', text: `Không tạo được chương: ${error.message}. Có thể bạn chưa chạy migration 008.` });
    loadLessons(lessonsFor.id);
    revalidateSite();
  }

  async function renameChapter(ch: Chapter) {
    const title = prompt('Đổi tên chương', ch.title)?.trim();
    if (!title || title === ch.title) return;
    await supabase.from('chapters').update({ title }).eq('id', ch.id);
    loadLessons(lessonsFor.id);
    revalidateSite();
  }

  async function deleteChapter(ch: Chapter) {
    if (!confirm(`Xóa “${ch.title}”? Các bài trong chương vẫn được giữ, chuyển sang mục “Chưa xếp chương”.`)) return;
    await supabase.from('chapters').delete().eq('id', ch.id);
    loadLessons(lessonsFor.id);
    revalidateSite();
  }

  async function moveChapter(index: number, dir: -1 | 1) {
    const a = chapters[index];
    const b = chapters[index + dir];
    if (!a || !b) return;
    await Promise.all([
      supabase.from('chapters').update({ order_index: b.order_index }).eq('id', a.id),
      supabase.from('chapters').update({ order_index: a.order_index }).eq('id', b.id),
    ]);
    loadLessons(lessonsFor.id);
    revalidateSite();
  }

  const iconBtn = 'w-9 h-9 rounded-md flex items-center justify-center hover:bg-muted disabled:opacity-30';
  let lessonNo = 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Khóa học & bài học"
        description="Tạo khóa học, sắp xếp lộ trình và chọn bài học thử miễn phí."
        actions={<button onClick={() => setEditing({ ...emptyCourse })} className="btn btn-gold"><Plus size={16} aria-hidden="true" /> Tạo khóa học</button>}
      />

      {notice && (
        <p role={notice.type === 'error' ? 'alert' : 'status'} className={`p-4 rounded-md text-sm flex justify-between gap-4 ${notice.type === 'error' ? 'bg-red-50 text-danger' : 'bg-gold-soft text-ink'}`}>
          {notice.text}<button onClick={() => setNotice(null)} aria-label="Đóng thông báo"><X size={16} aria-hidden="true" /></button>
        </p>
      )}

      {loading ? <LoadingRow /> : courses.length === 0 ? (
        <EmptyState icon={Database} title="Chưa có khóa học" action={<button onClick={() => setEditing({ ...emptyCourse })} className="btn btn-gold">Tạo khóa học đầu tiên</button>} />
      ) : (
        <ul className="space-y-4">
          {courses.map((c) => (
            <li key={c.id} className="card p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative w-full md:w-40 aspect-video rounded-md overflow-hidden bg-muted shrink-0">
                <Image src={c.thumbnail_url || '/asset/hoc_vien/tan.jpg'} alt="" fill sizes="160px" className="object-cover" unoptimized={!!c.thumbnail_url?.startsWith('http')} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap"><StatusBadge status={c.is_published ? 'published' : 'draft'} /><span className="text-sm text-muted-foreground">{c.lessons?.length || 0} bài học</span></div>
                <h2 className="mt-1 text-2xl truncate">{c.title}</h2>
                <p className="text-sm text-muted-foreground">{formatVND(c.price)}{c.old_price ? ` · giá gốc ${formatVND(c.old_price)}` : ''}</p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <button onClick={() => openLessons(c)} className="btn btn-dark !min-h-[40px] !px-3 text-sm"><ListVideo size={16} aria-hidden="true" /> Bài học</button>
                <button onClick={() => setEditing({ ...c, old_price: c.old_price ?? '' })} className="btn btn-outline !min-h-[40px] !px-3 text-sm"><Pencil size={14} aria-hidden="true" /> Sửa</button>
                <button onClick={() => togglePublish(c)} className="btn btn-outline !min-h-[40px] !px-3 text-sm">{c.is_published ? 'Ẩn' : 'Mở bán'}</button>
                <Link href={`/courses/${c.id}`} target="_blank" className="w-10 h-10 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-ink" aria-label={`Xem trang ${c.title}`}><ExternalLink size={16} aria-hidden="true" /></Link>
                <button onClick={() => deleteCourse(c)} className="w-10 h-10 rounded-md flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-danger" aria-label={`Xóa ${c.title}`}><Trash2 size={16} aria-hidden="true" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Course form */}
      <Modal title={editing?.id ? 'Sửa khóa học' : 'Tạo khóa học'} open={!!editing} onClose={() => setEditing(null)}>
        {editing && (
          <form onSubmit={saveCourse} className="space-y-5">
            <Field id="c-title" label="Tên khóa học">
              <input id="c-title" className="input" required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </Field>
            <Field id="c-slug" label="Đường dẫn (slug)" hint="Để trống sẽ tự tạo từ tên khóa học.">
              <input id="c-slug" className="input" value={editing.slug || ''} placeholder={slugify(editing.title)} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
            </Field>
            <Field id="c-desc" label="Mô tả ngắn">
              <textarea id="c-desc" className="input min-h-[96px]" value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="c-price" label="Học phí (VNĐ)">
                <input id="c-price" type="number" min={0} step={1000} className="input" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} />
              </Field>
              <Field id="c-old" label="Giá gốc (gạch ngang)" hint="Không bắt buộc">
                <input id="c-old" type="number" min={0} step={1000} className="input" value={editing.old_price} onChange={(e) => setEditing({ ...editing, old_price: e.target.value })} />
              </Field>
            </div>
            <Field id="c-thumb" label="Ảnh bìa" hint="Ảnh ngang tỉ lệ 16:9, tối đa 5 MB.">
              <ImageUpload id="c-thumb" folder="courses" value={editing.thumbnail_url || ''} onChange={(url) => setEditing((cur: any) => ({ ...cur, thumbnail_url: url }))} />
            </Field>
            <label className="flex items-center gap-3 min-h-[44px]">
              <input type="checkbox" className="w-5 h-5 accent-[#A84E3C]" checked={!!editing.is_published} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
              <span className="font-semibold">Mở bán công khai</span>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="btn btn-outline">Hủy</button>
              <button type="submit" disabled={busy || !editing.title.trim()} className="btn btn-gold">Lưu khóa học</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Lessons manager */}
      <Modal title={`Chương & bài học — ${lessonsFor?.title || ''}`} open={!!lessonsFor} onClose={() => setLessonsFor(null)} wide>
        {lessonForm ? (
          <form onSubmit={saveLesson} className="space-y-5">
            <Field id="l-title" label="Tên bài học">
              <input id="l-title" className="input" required value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} />
            </Field>
            <Field id="l-chapter" label="Thuộc chương">
              <select id="l-chapter" className="input" value={lessonForm.chapter_id || ''} onChange={(e) => setLessonForm({ ...lessonForm, chapter_id: e.target.value })}>
                <option value="">Chưa xếp chương</option>
                {chapters.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </Field>
            <Field id="l-video" label="Video" hint="Link YouTube/Vimeo, hoặc drm:MÃ-VIDEO cho video bảo vệ bằng DRM.">
              <input id="l-video" className="input" value={lessonForm.video_url || ''} onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })} />
            </Field>
            <Field id="l-content" label="Nội dung / ghi chú bài học">
              <textarea id="l-content" className="input min-h-[120px]" value={lessonForm.content || ''} onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })} />
            </Field>
            <label className="flex items-center gap-3 min-h-[44px]">
              <input type="checkbox" className="w-5 h-5 accent-[#A84E3C]" checked={!!lessonForm.is_free} onChange={(e) => setLessonForm({ ...lessonForm, is_free: e.target.checked })} />
              <span className="font-semibold">Cho học thử miễn phí</span>
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setLessonForm(null)} className="btn btn-outline">Quay lại</button>
              <button type="submit" disabled={busy || !lessonForm.title.trim()} className="btn btn-gold">Lưu bài học</button>
            </div>
          </form>
        ) : (
          <div className="space-y-5">
            {lessons.length === 0 && chapters.length === 0 && <p className="text-muted-foreground">Khóa học chưa có chương và bài học. Tạo chương trước, rồi thêm bài vào từng chương.</p>}
            {groupByChapter(chapters, lessons).map((g, gi) => (
              <section key={g.chapter?.id || 'loose'} className="border border-line rounded-md">
                <header className="flex items-center gap-2 p-3 bg-muted rounded-t-md">
                  <h3 className="flex-1 min-w-0 font-sans text-base font-bold truncate">{g.chapter ? g.chapter.title : 'Chưa xếp chương'} <span className="font-normal text-muted-foreground">· {g.lessons.length} bài</span></h3>
                  {g.chapter && (
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => moveChapter(gi, -1)} disabled={gi === 0} className={iconBtn} aria-label="Chuyển chương lên"><ArrowUp size={16} aria-hidden="true" /></button>
                      <button onClick={() => moveChapter(gi, 1)} disabled={gi >= chapters.length - 1} className={iconBtn} aria-label="Chuyển chương xuống"><ArrowDown size={16} aria-hidden="true" /></button>
                      <button onClick={() => renameChapter(g.chapter!)} className={iconBtn} aria-label={`Đổi tên ${g.chapter.title}`}><Pencil size={15} aria-hidden="true" /></button>
                      <button onClick={() => deleteChapter(g.chapter!)} className={`${iconBtn} hover:!bg-red-50 hover:text-danger`} aria-label={`Xóa ${g.chapter.title}`}><Trash2 size={15} aria-hidden="true" /></button>
                    </div>
                  )}
                </header>
                <ol className="divide-y divide-line">
                  {g.lessons.map((l, i) => (
                    <li key={l.id} className="flex items-center gap-3 p-3">
                      <span className="w-7 text-center font-display text-xl text-muted-foreground">{++lessonNo}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{l.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{l.video_url || 'Chưa có video'}{l.is_free ? ' · Học thử' : ''}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => moveLesson(g.lessons, i, -1)} disabled={i === 0} className={iconBtn} aria-label="Chuyển lên"><ArrowUp size={16} aria-hidden="true" /></button>
                        <button onClick={() => moveLesson(g.lessons, i, 1)} disabled={i === g.lessons.length - 1} className={iconBtn} aria-label="Chuyển xuống"><ArrowDown size={16} aria-hidden="true" /></button>
                        <button onClick={() => setLessonForm({ ...emptyLesson, ...l, chapter_id: l.chapter_id || '' })} className={iconBtn} aria-label={`Sửa ${l.title}`}><Pencil size={15} aria-hidden="true" /></button>
                        <button onClick={() => deleteLesson(l)} className={`${iconBtn} hover:!bg-red-50 hover:text-danger`} aria-label={`Xóa ${l.title}`}><Trash2 size={15} aria-hidden="true" /></button>
                      </div>
                    </li>
                  ))}
                </ol>
                {g.chapter && (
                  <div className="p-3 border-t border-line">
                    <button onClick={() => setLessonForm({ ...emptyLesson, chapter_id: g.chapter!.id })} className="btn btn-outline !min-h-[40px] !px-3 text-sm"><Plus size={15} aria-hidden="true" /> Thêm bài vào chương này</button>
                  </div>
                )}
              </section>
            ))}
            <div className="flex flex-wrap gap-2">
              <button onClick={addChapter} className="btn btn-gold"><FolderPlus size={16} aria-hidden="true" /> Thêm chương</button>
              <button onClick={() => setLessonForm({ ...emptyLesson, chapter_id: chapters.at(-1)?.id || '' })} className="btn btn-outline"><Plus size={16} aria-hidden="true" /> Thêm bài học</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
