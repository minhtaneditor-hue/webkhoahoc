// Checks a finished post, uploads its pictures to Supabase Storage and adds it to blog_posts.
// The site reads blog_posts directly, so a published row needs no redeploy.
//
// Run from the repo root:
//   node scripts/blog/publish.mjs list                   recent posts (to avoid repeating a topic)
//   node scripts/blog/publish.mjs check <post.json>      run every check, write nothing
//   node scripts/blog/publish.mjs publish <post.json>    go live
//   node scripts/blog/publish.mjs draft <post.json>      save without publishing (admin can finish it)
//
// post.json: { slug, title, excerpt, seo_title, seo_description, cover: "cover.png", content }
// Pictures sit next to post.json. In `content`, write them as ![alt](local:file.png).
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const SITE = 'https://www.minhtanacademy.com';
const MIN_WORDS = 800;
const MIN_IMAGES = 2; // inside the post, on top of the cover
const MIN_SOURCES = 3;

function loadEnv() {
  for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = process.env;
  if (!url || !key) throw new Error('.env.local is missing the Supabase URL or service role key');
  return createClient(url, key, { auth: { persistSession: false } });
}

const lower = (s = '') => s.normalize('NFC').toLowerCase();
const unaccent = (s = '') => lower(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, ' ').trim();
const count = (text, phrase) => (phrase ? lower(text).split(phrase).length - 1 : 0);

// Checks a machine can make. Whether the post answers the search is the writer's job (see the blog-seo-tan skill).
function seoProblems(post, existing) {
  const errors = [];
  const warnings = [];
  const content = post.content || '';
  const keyword = lower(post.focus_keyword || '').trim();
  const words = (s) => unaccent(s).split(' ').filter(Boolean);
  const body = content.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/\]\([^)]*\)/g, ']');
  const bodyWords = body.trim().split(/\s+/);
  const images = [...content.matchAll(/^!\[([^\]]*)\]\(local:([^)\s]+)\)\s*$/gm)];
  const h2 = (content.match(/^## .+$/gm) || []).filter((h) => !/nguồn tham khảo/i.test(h));
  const links = [...content.matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)].filter((m) => m.index === 0 || content[m.index - 1] !== '!');
  const internal = links.filter((m) => m[2].startsWith('/'));

  if (post.seo_title && post.seo_title.length < 30) errors.push('seo_title: cần ít nhất 30 ký tự');
  if (post.seo_title && post.seo_title.length > 52) errors.push(`seo_title: tối đa 52 ký tự vì website thêm " | TẤN VA" phía sau (đang ${post.seo_title.length})`);
  if (post.seo_description && (post.seo_description.length < 120 || post.seo_description.length > 160)) errors.push(`seo_description: cần 120–160 ký tự (đang ${post.seo_description.length})`);
  if (/^# /m.test(content)) errors.push('content: không dùng tiêu đề #, vì title đã là H1 duy nhất của trang');
  if (internal.length < 2) errors.push(`link nội bộ: cần ít nhất 2 (đang ${internal.length})`);
  for (const [, label] of links) {
    if (/^(tại đây|ở đây|xem thêm|click|bấm vào đây|link này)$/i.test(label.trim())) errors.push(`link "${label}": chữ link phải mô tả đúng trang đích`);
  }
  for (const [, , file] of images) {
    if (/^(image|img|anh|hinh|picture|illustration)[-_]?\d*\./i.test(file)) errors.push(`ảnh ${file}: đặt tên file mô tả nội dung ảnh`);
  }
  const slugWords = (post.slug || '').split('-');
  if (slugWords.length > 8) errors.push(`slug: quá dài (${slugWords.length} từ), nên 3–6 từ`);
  if (/(^|-)20\d\d(-|$)/.test(post.slug || '')) errors.push('slug: không chứa năm, để bài dùng lâu dài');

  if (!keyword) {
    errors.push('focus_keyword: khai báo từ khóa chính của bài');
    return { errors, warnings };
  }
  const has = (text) => count(text, keyword) > 0;
  if (!has(post.title)) errors.push(`title: chưa có từ khóa chính "${post.focus_keyword}"`);
  if (!has(post.seo_title)) errors.push('seo_title: chưa có từ khóa chính');
  if (!has(post.seo_description)) errors.push('seo_description: chưa có từ khóa chính');
  if (!has(bodyWords.slice(0, 100).join(' '))) errors.push('100 từ đầu: chưa có từ khóa chính');
  if (!images.some(([, alt]) => has(alt))) errors.push('ảnh: ít nhất 1 mô tả ảnh cần có từ khóa chính');

  const kw = words(keyword);
  const inSlug = kw.filter((w) => slugWords.includes(w)).length;
  if (inSlug / kw.length < 0.7) errors.push('slug: chưa chứa từ khóa chính');
  const overlap = (h) => kw.filter((w) => words(h).includes(w)).length / kw.length;
  if (!h2.some((h) => overlap(h) >= 0.5)) errors.push('mục ##: ít nhất 1 tiêu đề mục cần có từ của từ khóa chính');

  const density = (count(body, keyword) * kw.length) / bodyWords.length;
  if (density > 0.025) warnings.push(`mật độ từ khóa ${(density * 100).toFixed(1)}%: đọc lại xem có bị nhồi không`);
  const clash = existing.filter((p) => p.slug !== post.slug && has(p.title));
  if (clash.length) warnings.push(`bài cũ cùng từ khóa: ${clash.map((p) => p.slug).join(', ')}. Cân nhắc đổi góc hoặc cập nhật bài cũ`);
  if (existing.some((p) => p.slug !== post.slug) && !internal.some((m) => m[2].startsWith('/blog/'))) warnings.push('chưa link tới bài blog cũ nào, thêm nếu có bài liên quan');
  return { errors, warnings };
}

// Same rules as src/components/blog/PostContent.tsx, which renders only a small Markdown subset:
// anything outside it would show up as raw symbols on the page.
function problems(post, dir, existing = []) {
  const out = [];
  out.push(...seoProblems(post, existing).errors);
  const content = post.content || '';
  const blocks = content.split(/\r?\n\s*\r?\n/).map((b) => b.trim()).filter(Boolean);
  const words = content.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').trim().split(/\s+/).length;
  const h2 = content.match(/^## .+$/gm) || [];
  const images = [...content.matchAll(/^!\[([^\]]*)\]\(local:([^)\s]+)\)\s*$/gm)];
  const sourcesAt = content.search(/^## Nguồn tham khảo\s*$/m);
  const sources = sourcesAt < 0 ? [] : content.slice(sourcesAt).match(/\]\(https?:\/\/[^)\s]+\)/g) || [];

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(post.slug || '')) out.push('slug: chỉ gồm chữ thường không dấu, số và dấu gạch ngang');
  if (!post.title || post.title.length < 20 || post.title.length > 90) out.push('title: cần 20–90 ký tự');
  if (!post.excerpt || post.excerpt.length < 80 || post.excerpt.length > 220) out.push('excerpt: cần 80–220 ký tự');
  if (!post.seo_title) out.push('seo_title: bắt buộc');
  if (!post.seo_description) out.push('seo_description: bắt buộc');
  if (!post.cover || !existsSync(join(dir, post.cover))) out.push(`cover: không thấy file ${post.cover}`);

  // The hook: the post page shows no excerpt, so the opening paragraph has to do that job.
  const first = blocks[0] || '';
  if (/^(#|!\[|>|- |\* |\d+[.)] )/.test(first)) out.push('hook: khối đầu tiên của content phải là một đoạn văn mở bài');
  else if (first.length < 80 || first.length > 500) out.push(`hook: đoạn mở bài cần 80–500 ký tự (đang ${first.length})`);

  if (words < MIN_WORDS) out.push(`content: mới ${words} từ, cần ít nhất ${MIN_WORDS}`);
  if (h2.length < 3) out.push(`content: cần ít nhất 3 tiêu đề ## (đang ${h2.length})`);
  if (images.length < MIN_IMAGES) out.push(`content: cần ít nhất ${MIN_IMAGES} ảnh minh họa dạng ![mô tả](local:file.png), đứng riêng một dòng (đang ${images.length})`);
  for (const [, alt, file] of images) {
    if (alt.trim().length < 10) out.push(`ảnh ${file}: cần mô tả (alt) rõ nội dung ảnh`);
    if (!existsSync(join(dir, file))) out.push(`ảnh ${file}: không thấy file`);
  }
  if (sources.length < MIN_SOURCES) out.push(`content: cần mục "## Nguồn tham khảo" ở cuối với ít nhất ${MIN_SOURCES} link (đang ${sources.length})`);

  // Syntax the page cannot render
  if (/^```/m.test(content)) out.push('content: không dùng khối code ```; trang blog không hiển thị được');
  if (/`/.test(content)) out.push('content: không dùng dấu ` ; trang blog không hiển thị được');
  if (/^\s*\|.*\|\s*$/m.test(content)) out.push('content: không dùng bảng Markdown; hãy chuyển thành ảnh loại compare');
  if (/^#### /m.test(content)) out.push('content: chỉ dùng ## và ###');
  if (/^[ \t]+[-*] /m.test(content)) out.push('content: không dùng danh sách lồng nhau');
  if (/<[a-z][^>]*>/i.test(content)) out.push('content: không dùng thẻ HTML');
  if (/^!\[[^\]]*\]\((?!local:)/m.test(content)) out.push('content: ảnh phải là file local, viết ![mô tả](local:file.png)');
  if (/\b(TODO|TBD|lorem ipsum)\b/i.test(content)) out.push('content: còn nội dung tạm');
  return out;
}

async function main() {
  const [command, postFile] = process.argv.slice(2);
  const supabase = loadEnv();

  if (command === 'list') {
    const { data, error } = await supabase.from('blog_posts').select('slug, title, is_published, published_at, created_at').order('created_at', { ascending: false }).limit(60);
    if (error) throw error;
    for (const p of data) console.log(`${(p.published_at || p.created_at).slice(0, 10)} ${p.is_published ? 'live ' : 'draft'} ${p.slug} | ${p.title}`);
    return;
  }
  if (!['check', 'publish', 'draft'].includes(command) || !postFile) throw new Error('Usage: publish.mjs list | check|publish|draft <post.json>');

  const dir = dirname(postFile);
  const post = JSON.parse(readFileSync(postFile, 'utf8').replace(/^\uFEFF/, ''));
  const { data: existing, error: lookupError } = await supabase.from('blog_posts').select('slug, title');
  if (lookupError) throw lookupError;
  const found = problems(post, dir, existing);
  if (existing.some((p) => p.slug === post.slug)) found.push(`slug: "${post.slug}" đã có bài, không ghi đè`);
  for (const note of seoProblems(post, existing).warnings) console.log(`LƯU Ý: ${note}`);
  if (found.length) {
    console.error(`KHÔNG ĐẠT:\n- ${found.join('\n- ')}`);
    process.exitCode = 2; // not process.exit(): it crashes Node on Windows while fetch handles are closing
    return;
  }
  if (command === 'check') {
    console.log('ĐẠT');
    return;
  }

  // Pictures first, so a failed upload leaves no post with broken images.
  const store = supabase.storage.from('media');
  const uploaded = [];
  const upload = async (file) => {
    const path = `blog_posts/${post.slug}/${file}`;
    const { error } = await store.upload(path, readFileSync(join(dir, file)), { contentType: 'image/png', cacheControl: '31536000', upsert: false });
    if (error) throw new Error(`Upload ${file}: ${error.message}`);
    uploaded.push(path);
    return store.getPublicUrl(path).data.publicUrl;
  };

  try {
    const cover_url = await upload(post.cover);
    let content = post.content;
    for (const file of new Set([...content.matchAll(/\(local:([^)\s]+)\)/g)].map((m) => m[1]))) {
      content = content.replaceAll(`(local:${file})`, `(${await upload(file)})`);
    }
    const { error } = await supabase.from('blog_posts').insert({
      slug: post.slug, title: post.title, excerpt: post.excerpt, content, cover_url,
      seo_title: post.seo_title, seo_description: post.seo_description, is_published: command === 'publish',
    });
    if (error) throw error;
  } catch (err) {
    if (uploaded.length) await store.remove(uploaded);
    throw err;
  }

  const url = `${SITE}/blog/${post.slug}`;
  if (command === 'draft') {
    console.log(`ĐÃ LƯU NHÁP: ${post.slug} (xem ở ${SITE}/admin/blog)`);
    return;
  }
  // A published row is the source of truth; this only tells whether visitors can reach it yet.
  const res = await fetch(url, { redirect: 'manual' }).catch(() => null);
  console.log(`ĐÃ ĐĂNG: ${url}\nTrang công khai trả về: ${res ? res.status : 'không kết nối được'}`);
}

main().catch((e) => { console.error(e.message || e); process.exitCode = 1; });
