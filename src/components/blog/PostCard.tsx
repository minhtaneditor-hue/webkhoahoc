import Link from 'next/link';
import Image from 'next/image';
import { BookOpen } from 'lucide-react';
import type { BlogPostCard } from '@/lib/blog';
import { formatPostDate } from '@/lib/blog-format';

export default function PostCard({ post }: { post: BlogPostCard }) {
  return (
    <li className="card card-hover overflow-hidden flex flex-col">
      <Link href={`/blog/${post.slug}`} className="relative block aspect-video bg-muted" tabIndex={-1} aria-hidden="true">
        {post.cover_url ? (
          <Image src={post.cover_url} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" unoptimized={post.cover_url.startsWith('http')} />
        ) : (
          <span className="absolute inset-0 surface-dark flex items-center justify-center"><BookOpen size={36} className="text-gold-light" /></span>
        )}
      </Link>
      <div className="p-6 flex-1 flex flex-col">
        <h2 className="text-2xl leading-snug"><Link href={`/blog/${post.slug}`} className="hover:underline underline-offset-4">{post.title}</Link></h2>
        {post.excerpt && <p className="mt-3 text-muted-foreground line-clamp-3">{post.excerpt}</p>}
        <time dateTime={post.published_at} className="mt-auto pt-4 text-sm text-muted-foreground">{formatPostDate(post.published_at)}</time>
      </div>
    </li>
  );
}
