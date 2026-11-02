import { Fragment, type ReactNode } from 'react';

// Renders lesson text written with a small Markdown subset (as copied from Unica):
// blank-line paragraphs, "- " list items, "## " headings, **bold**, *italic*, bare links.
// Builds React elements only, never raw HTML.

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|https?:\/\/[^\s)]+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    const k = `${key}-${m.index}`;
    if (t.startsWith('**')) out.push(<strong key={k} className="text-white font-semibold">{t.slice(2, -2)}</strong>);
    else if (t.startsWith('*')) out.push(<em key={k}>{t.slice(1, -1)}</em>);
    else out.push(<a key={k} href={t} target="_blank" rel="noopener noreferrer" className="text-gold-light underline underline-offset-4 break-all">{t}</a>);
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const lines = (text: string, key: string) =>
  text.split('\n').map((l, i, all) => <Fragment key={`${key}-${i}`}>{inline(l, `${key}-${i}`)}{i < all.length - 1 && <br />}</Fragment>);

export default function LessonText({ text, className = '' }: { text: string; className?: string }) {
  const blocks = text.replace(/\r/g, '').split(/\n{2,}/);
  return (
    <div className={`space-y-4 leading-relaxed text-stone-300 ${className}`}>
      {blocks.map((block, bi) => {
        const key = `b${bi}`;
        if (block.startsWith('## ')) return <h2 key={key} className="text-2xl text-white pt-2">{inline(block.slice(3), key)}</h2>;
        // A block with "- " lines becomes a list; continuation lines belong to the item above
        if (/^- /m.test(block)) {
          const items: string[] = [];
          const intro: string[] = [];
          for (const l of block.split('\n')) {
            if (l.startsWith('- ')) items.push(l.slice(2));
            else if (items.length) items[items.length - 1] += `\n${l}`;
            else intro.push(l);
          }
          return (
            <div key={key} className="space-y-3">
              {intro.length > 0 && <p>{lines(intro.join('\n'), `${key}i`)}</p>}
              <ul className="space-y-3">
                {items.map((it, ii) => (
                  <li key={ii} className="pl-4 border-l-2 border-gold-light/40">{lines(it, `${key}-${ii}`)}</li>
                ))}
              </ul>
            </div>
          );
        }
        return <p key={key}>{lines(block, key)}</p>;
      })}
    </div>
  );
}
