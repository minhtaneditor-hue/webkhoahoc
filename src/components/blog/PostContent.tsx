import { Fragment, type ReactNode } from 'react';
import Link from 'next/link';
import { captionFromAlt, isClosingPanel, sourceHost, type Block, type ParsedPost, type Section, type Source } from '@/lib/blog-content';

// Renders a post written in a small Markdown subset: ## and ### headings, - and 1. lists,
// > quotes, ![alt](url) pictures on their own line, **bold**, *italic* and [links](url).
// Builds React elements only, never raw HTML, and only follows http(s) and same-site links.

const safeHref = (url: string) => (/^(https?:\/\/|\/(?!\/))/.test(url) ? url : null);

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\[[^\]]+\]\([^)\s]+\)|\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    const k = `${key}-${m.index}`;
    if (t.startsWith('[')) {
      const [, label, url] = t.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/)!;
      const href = safeHref(url);
      if (!href) out.push(label);
      else if (href.startsWith('/')) out.push(<Link key={k} href={href} className="text-gold underline underline-offset-4 hover:text-gold-hover">{label}</Link>);
      else out.push(<a key={k} href={href} target="_blank" rel="noopener noreferrer" className="text-gold underline underline-offset-4 hover:text-gold-hover">{label}</a>);
    } else if (t.startsWith('**')) {
      out.push(<strong key={k} className="font-semibold text-ink">{t.slice(2, -2)}</strong>);
    } else {
      out.push(<em key={k}>{t.slice(1, -1)}</em>);
    }
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function BlockView({ block: b, id, lead }: { block: Block; id: string; lead?: boolean }) {
  switch (b.kind) {
    case 'h3':
      return <h3 className="pt-3 text-xl md:text-2xl font-bold text-ink">{inline(b.text, id)}</h3>;
    case 'quote':
      return <blockquote className="rounded-r-[var(--radius-md)] border-l-4 border-gold bg-gold-soft/60 py-4 pl-5 pr-4 text-ink">{inline(b.text, id)}</blockquote>;
    case 'ul':
      return (
        <ul role="list" className="space-y-3">
          {b.items.map((t, j) => (
            <li key={j} className="relative pl-6">
              <span aria-hidden="true" className="absolute left-0.5 top-[0.72em] h-1.5 w-1.5 rounded-full bg-gold" />
              {inline(t, `${id}-${j}`)}
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol role="list" className="space-y-3">
          {b.items.map((t, j) => (
            <li key={j} className="relative pl-11">
              <span aria-hidden="true" className="absolute left-0 top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-gold-soft text-sm font-bold text-gold">{j + 1}</span>
              {inline(t, `${id}-${j}`)}
            </li>
          ))}
        </ol>
      );
    case 'notes':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {b.items.map((n, j) => (
            <div key={j} className="rounded-[var(--radius-card)] border border-line bg-card p-5 text-base leading-relaxed">
              <p className="font-bold text-ink">{inline(n.label, `${id}-${j}-l`)}</p>
              <p className="mt-1.5">{inline(n.text, `${id}-${j}`)}</p>
            </div>
          ))}
        </div>
      );
    case 'img': {
      const caption = captionFromAlt(b.alt);
      return (
        <figure className="my-8">
          {/* Pictures come in any size from the admin, so they keep their own shape */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={b.src} alt={b.alt} loading="lazy" className="h-auto w-full rounded-[var(--radius-card)] border border-line" />
          {caption && <figcaption className="mt-2.5 text-center text-sm leading-snug text-muted-foreground">{caption}</figcaption>}
        </figure>
      );
    }
    default:
      return lead
        ? <p className="text-xl md:text-[1.375rem] font-medium leading-relaxed text-ink">{inline(b.text, id)}</p>
        : <p>{inline(b.text, id)}</p>;
  }
}

function SectionView({ section, number, panel }: { section: Section; number: number; panel: boolean }) {
  const body = section.blocks.map((b, i) => <BlockView key={i} block={b} id={`${section.id}-${i}`} />);
  if (panel) {
    return (
      <section id={section.id} aria-labelledby={`${section.id}-h`} className="scroll-mt-24 rounded-[var(--radius-card)] bg-gold-soft p-6 md:p-8 text-ink">
        <h2 id={`${section.id}-h`} className="text-2xl md:text-3xl font-bold leading-tight text-ink">{section.title}</h2>
        <div className="mt-4 space-y-4">{body}</div>
      </section>
    );
  }
  return (
    <section id={section.id} aria-labelledby={`${section.id}-h`} className="scroll-mt-24 border-t border-line pt-8 space-y-5">
      <h2 id={`${section.id}-h`} className="flex gap-3 text-2xl md:text-3xl font-bold leading-tight text-ink">
        <span aria-hidden="true" className="shrink-0 tabular-nums text-gold">{String(number).padStart(2, '0')}</span>
        <span>{section.title}</span>
      </h2>
      {body}
    </section>
  );
}

export default function PostContent({ post, afterIntro, midSlot }: { post: ParsedPost; afterIntro?: ReactNode; midSlot?: ReactNode }) {
  const last = post.sections[post.sections.length - 1];
  const hasPanel = post.sections.length >= 3 && !!last && isClosingPanel(last);
  // Roughly a third of the way down, once the reader has settled in
  const midAfter = Math.max(0, Math.ceil(post.sections.length / 3) - 1);
  return (
    <div className="space-y-10 text-[1.0625rem] md:text-lg leading-[1.7] text-stone">
      {post.intro.length > 0 && (
        <div className="space-y-5">
          {post.intro.map((b, i) => <BlockView key={i} block={b} id={`intro-${i}`} lead={i === 0 && b.kind === 'p'} />)}
        </div>
      )}
      {afterIntro}
      {post.sections.map((s, i) => (
        <Fragment key={s.id}>
          <SectionView section={s} number={i + 1} panel={hasPanel && s === last} />
          {i === midAfter && midSlot}
        </Fragment>
      ))}
    </div>
  );
}

// Deliberately quiet: a reference list at the foot of the post, not part of the reading flow.
export function PostSources({ sources }: { sources: Source[] }) {
  if (sources.length === 0) return null;
  return (
    <section aria-labelledby="post-sources" className="border-t border-line pt-6">
      <h2 id="post-sources" className="text-sm font-bold leading-normal text-ink">Nguồn tham khảo <span className="font-medium text-muted-foreground">({sources.length})</span></h2>
      <ul role="list" className="mt-3 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
        {sources.map((s, i) => (
          <li key={i} className="min-w-0 text-sm leading-snug">
            {s.url ? (
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="group block">
                <span className="text-stone underline-offset-2 group-hover:text-gold group-hover:underline">{s.title}</span>
                <span className="block truncate text-xs leading-normal text-muted-foreground">{sourceHost(s.url)}</span>
              </a>
            ) : (
              <span className="text-stone">{s.title}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
