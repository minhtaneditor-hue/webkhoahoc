import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import JsonLd from '@/components/JsonLd';
import AdContactBanner from '@/components/blog/AdContactBanner';
import PostCard from '@/components/blog/PostCard';
import PostContent, { PostSources } from '@/components/blog/PostContent';
import { PostTocInline, PostTocSide } from '@/components/blog/PostToc';
import { getPost, getPublishedPosts } from '@/lib/blog';
import { parsePost } from '@/lib/blog-content';
import { formatPostDate, readingMinutes } from '@/lib/blog-format';
import { SITE_URL } from '@/lib/site-url';

// Read fresh on every visit: a cached copy kept a just-published post "not found" and an
// unpublished one visible, and the admin's page refresh does not clear either.
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

function CourseCta({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`surface-dark rounded-[var(--radius-card)] ${compact ? 'p-5' : 'p-6'}`}>
      <p className={`font-bold text-ivory ${compact ? 'text-lg leading-snug' : 'text-2xl'}`}>Muốn học bài bản hơn?</p>
      <p className={`mt-2 text-stone-300 ${compact ? 'text-sm leading-snug' : ''}`}>Xem các khóa học làm video bằng điện thoại cùng Minh Tấn, có bài học thử miễn phí.</p>
      <Link href="/courses" className={`btn btn-gold mt-4 ${compact ? 'w-full' : ''}`}>Xem khóa học <ArrowRight size={18} aria-hidden="true" /></Link>
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Không tìm thấy bài viết' };
  const description = post.seo_description || post.excerpt || undefined;
  return {
    title: post.seo_title || post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      locale: 'vi_VN',
      siteName: 'TẤN VA',
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: ['Minh Tấn'],
      images: post.cover_url ? [post.cover_url] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, recent] = await Promise.all([getPost(slug), getPublishedPosts(4)]);
  if (!post) notFound();
  const related = recent.filter((p) => p.id !== post.id).slice(0, 3);
  const url = `${SITE_URL}/blog/${post.slug}`;
  const parsed = parsePost(post.content);
  const toc = parsed.sections.map(({ id, title }) => ({ id, title }));

  return (
    <main className="pt-10 pb-20 md:pt-16">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.seo_description || post.excerpt || undefined,
            image: post.cover_url || undefined,
            datePublished: post.published_at,
            dateModified: post.updated_at,
            inLanguage: 'vi',
            url,
            mainEntityOfPage: url,
            author: { '@type': 'Person', name: 'Minh Tấn', url: `${SITE_URL}/about` },
            publisher: { '@type': 'Organization', name: 'TẤN VA', url: SITE_URL, logo: { '@type': 'ImageObject', url: `${SITE_URL}/brand/tan-va-mark.png` } },
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
              { '@type': 'ListItem', position: 3, name: post.title, item: url },
            ],
          },
        ],
      }} />

      <article className="container-lux">
        <header className="max-w-4xl">
          <Link href="/blog" className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-ink min-h-[44px]">
            <ChevronLeft size={16} aria-hidden="true" /> Tất cả bài viết
          </Link>
          <h1 className="mt-2 text-[2rem] md:text-5xl leading-[1.15] text-ink">{post.title}</h1>
          <div className="mt-6 flex items-center gap-3">
            <Image src="/asset/avatar/hero_expert.jpg" alt="" width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
            <p className="text-sm leading-snug text-muted-foreground">
              <Link href="/about" className="block font-semibold text-ink hover:underline underline-offset-4">Minh Tấn</Link>
              <time dateTime={post.published_at}>{formatPostDate(post.published_at)}</time>
              {' · '}{readingMinutes(post.content)} phút đọc
            </p>
          </div>
        </header>

        <div className="mt-8 md:mt-10 lg:grid lg:grid-cols-[minmax(0,44rem)_15.5rem] lg:justify-between lg:gap-12">
          <div className="min-w-0">
            {post.cover_url && (
              <div className="relative mb-8 aspect-video overflow-hidden rounded-[var(--radius-card)] bg-muted">
                <Image src={post.cover_url} alt="" fill priority sizes="(min-width: 1024px) 704px, 100vw" className="object-cover" unoptimized={post.cover_url.startsWith('http')} />
              </div>
            )}
            <PostContent post={parsed} afterIntro={toc.length > 1 ? <div className="lg:hidden"><PostTocInline items={toc} /></div> : null} midSlot={<AdContactBanner />} />

            <div className="mt-10 lg:hidden"><CourseCta /></div>

            <section aria-label="Tác giả" className="mt-10 flex items-center gap-4 rounded-[var(--radius-card)] border border-line bg-card p-5">
              <Image src="/asset/avatar/hero_expert.jpg" alt="" width={64} height={64} className="h-16 w-16 shrink-0 rounded-full object-cover" />
              <div className="min-w-0">
                <p className="font-bold text-ink"><Link href="/about" className="hover:underline underline-offset-4">Minh Tấn</Link></p>
                <p className="mt-0.5 text-sm leading-snug text-muted-foreground">Giảng viên, cố vấn video. Chia sẻ cách quay và dựng video bằng điện thoại, ứng dụng AI.</p>
              </div>
            </section>

            <div className="mt-10"><PostSources sources={parsed.sources} /></div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-8">
              {toc.length > 1 && <PostTocSide items={toc} />}
              <CourseCta compact />
            </div>
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-posts" className="container-lux mt-16">
          <h2 id="related-posts" className="text-3xl md:text-4xl text-ink">Bài viết khác</h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => <PostCard key={p.id} post={p} />)}
          </ul>
        </section>
      )}
    </main>
  );
}
