import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import AdContactBanner from '@/components/blog/AdContactBanner';
import PostCard from '@/components/blog/PostCard';
import { getPublishedPosts } from '@/lib/blog';

// Read fresh on every visit, like the post pages, so the list always matches them.
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const posts = await getPublishedPosts();
  return {
    title: 'Blog',
    openGraph: { title: 'Blog làm video bằng điện thoại | TẤN VA', type: 'website', locale: 'vi_VN', siteName: 'TẤN VA' },
    description: 'Hướng dẫn quay, dựng và làm video bán hàng bằng điện thoại, viết kịch bản và xây thương hiệu cá nhân, từ Minh Tấn.',
    alternates: { canonical: '/blog' },
    // An empty page should not be in search results
    ...(posts.length === 0 ? { robots: { index: false } } : {}),
  };
}

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  return (
    <main className="container-lux pt-12 pb-20 md:pt-20">
      <SectionHeading as="h1" title="Blog làm video" description="Cách quay, dựng và bán hàng bằng video với chiếc điện thoại bạn đang có." />
      {posts.length > 0 ? (
        <>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => <PostCard key={post.id} post={post} />)}
          </ul>
          <div className="mt-12"><AdContactBanner /></div>
        </>
      ) : (
        <div className="mt-10 card p-8 md:p-10 max-w-2xl">
          <p className="text-lg text-stone">Bài viết đầu tiên đang được chuẩn bị. Trong lúc chờ, bạn có thể xem các khóa học làm video.</p>
          <Link href="/courses" className="btn btn-dark mt-6">Xem khóa học <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
      )}
    </main>
  );
}
