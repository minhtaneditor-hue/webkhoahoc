import { type ReactNode } from 'react';
import Link from 'next/link';

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
      else if (href.startsWith('/')) out.push(<Link key={k} href={href} className="text-gold underline underline-offset-4">{label}</Link>);
      else out.push(<a key={k} href={href} target="_blank" rel="noopener noreferrer" className="text-gold underline underline-offset-4">{label}</a>);
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

type Block =
  | { kind: 'h2' | 'h3' | 'p' | 'quote'; text: string }
  | { kind: 'ul' | 'ol'; items: string[] }
  | { kind: 'img'; alt: string; src: string };

function parse(content: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length) blocks.push({ kind: 'p', text: paragraph.join(' ') });
    paragraph = [];
  };
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();
    const img = line.match(/^!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)$/);
    const list = line.match(/^(?:([-*])|\d+[.)])\s+(.*)$/);
    if (!line) {
      flush();
    } else if (line.startsWith('### ')) {
      flush();
      blocks.push({ kind: 'h3', text: line.slice(4) });
    } else if (line.startsWith('## ') || line.startsWith('# ')) {
      // The post title is the page's only h1, so a "# " line in the text becomes an h2
      flush();
      blocks.push({ kind: 'h2', text: line.replace(/^#+\s+/, '') });
    } else if (line.startsWith('> ')) {
      flush();
      blocks.push({ kind: 'quote', text: line.slice(2) });
    } else if (img) {
      flush();
      blocks.push({ kind: 'img', alt: img[1], src: img[2] });
    } else if (list) {
      flush();
      const kind = list[1] ? 'ul' : 'ol';
      const prev = blocks[blocks.length - 1];
      if (prev && prev.kind === kind) prev.items.push(list[2]);
      else blocks.push({ kind, items: [list[2]] });
    } else {
      paragraph.push(line);
    }
  }
  flush();
  return blocks;
}

export default function PostContent({ content }: { content: string }) {
  return (
    <div className="space-y-5 text-lg leading-relaxed text-stone">
      {parse(content).map((b, i) => {
        const k = String(i);
        switch (b.kind) {
          case 'h2': return <h2 key={k} className="pt-6 text-3xl md:text-4xl text-ink">{inline(b.text, k)}</h2>;
          case 'h3': return <h3 key={k} className="pt-3 text-2xl text-ink">{inline(b.text, k)}</h3>;
          case 'quote': return <blockquote key={k} className="border-l-4 border-gold pl-5 italic">{inline(b.text, k)}</blockquote>;
          case 'ul': return <ul key={k} className="list-disc space-y-2 pl-6">{b.items.map((t, j) => <li key={j}>{inline(t, `${k}-${j}`)}</li>)}</ul>;
          case 'ol': return <ol key={k} className="list-decimal space-y-2 pl-6">{b.items.map((t, j) => <li key={j}>{inline(t, `${k}-${j}`)}</li>)}</ol>;
          // Pictures come in any size from the admin, so they keep their own shape
          // eslint-disable-next-line @next/next/no-img-element
          case 'img': return <img key={k} src={b.src} alt={b.alt} loading="lazy" className="w-full h-auto rounded-[var(--radius-card)]" />;
          default: return <p key={k}>{inline(b.text, k)}</p>;
        }
      })}
    </div>
  );
}
