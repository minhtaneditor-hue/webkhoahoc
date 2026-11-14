import { Fragment, type ReactNode } from 'react';
import { ExternalLink, Lightbulb } from 'lucide-react';

// Renders lesson text written with a small Markdown subset (as copied from Unica) and gives it
// structure: a bold line on its own is a section heading, "- **Bước N: ...**" starts a step
// card, "**Mục đích**: ..." style lines become labelled rows, "Lời động viên" becomes a callout.
// Builds React elements only, never raw HTML.

const LABELS = ['Mục tiêu bài học', 'Mục đích', 'Cách thực hiện', 'Khó khăn', 'Cách khắc phục', 'Bài tập thực hành',
  'Lời động viên từ Coach', 'Lời động viên cuối cùng', 'Lời động viên', 'Cách mình hay làm'];
const TONE: Record<string, string> = {
  'Khó khăn': 'text-red-300 bg-red-400/10 border-red-400/25',
  'Cách khắc phục': 'text-emerald-300 bg-emerald-400/10 border-emerald-400/25',
  'Bài tập thực hành': 'text-sky-300 bg-sky-400/10 border-sky-400/25',
};
const NEUTRAL = 'text-gold-light bg-gold-light/10 border-gold-light/25';

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

type Line =
  | { kind: 'heading'; text: string }
  | { kind: 'numbered'; n: string; title: string; text: string }
  | { kind: 'label'; label: string; text: string }
  | { kind: 'link'; url: string }
  | { kind: 'text'; text: string }
  | { kind: 'gap' };

// "**Mục đích**: x" / "**Mục đích:** x" -> label row
const labelRe = new RegExp(`^\\*\\*(${LABELS.join('|')}):?\\*\\*:?\\s*(.*)$`);
const plainLabelRe = new RegExp(`^(${LABELS.join('|')}):\\s*(.*)$`);

function parseLine(raw: string): Line {
  const line = raw.trim();
  if (!line) return { kind: 'gap' };
  if (/^https?:\/\/\S+$/.test(line)) return { kind: 'link', url: line };
  // "**1. Tư duy**: text" -> numbered section
  const nm = line.match(/^\*\*(\d+)\.\s*([^*]+?):?\*\*:?\s*(.*)$/);
  if (nm) return { kind: 'numbered', n: nm[1], title: nm[2].trim(), text: nm[3] };
  // Known labels, bold or plain ("Cách thực hiện: ...")
  const lm = line.match(labelRe) || line.match(plainLabelRe);
  if (lm) return { kind: 'label', label: lm[1], text: lm[2] };
  // Any short bold lead-in followed by text ("**Viết nháp:** ...", "**S1 - STOP**: ...") is a label too
  const gm = line.match(/^\*\*([^*]{2,45}?):?\*\*:?\s+(\S.*)$/);
  if (gm) return { kind: 'label', label: gm[1].trim(), text: gm[2] };
  // A line that is one bold phrase is a section heading
  if (/^\*\*[^*]+\*\*:?$/.test(line) && line.length < 90) return { kind: 'heading', text: line.replace(/^\*\*|\*\*:?$/g, '').replace(/:$/, '') };
  return { kind: 'text', text: line };
}

function LineView({ line, k }: { line: Line; k: string }) {
  if (line.kind === 'heading')
    return <h3 className="pt-4 text-xl md:text-2xl text-white font-display font-semibold flex items-center gap-3"><span className="w-1 self-stretch rounded-full bg-gold-light" aria-hidden="true" />{inline(line.text, k)}</h3>;
  if (line.kind === 'numbered')
    return (
      <div className="pt-4">
        <h3 className="flex items-center gap-3 text-xl md:text-2xl text-white font-display font-semibold">
          <span className="w-9 h-9 shrink-0 rounded-full bg-gold text-white text-base font-sans font-bold flex items-center justify-center">{line.n}</span>
          {inline(line.title, k)}
        </h3>
        {line.text && <p className="mt-2 text-stone-300">{inline(line.text, k)}</p>}
      </div>
    );
  if (line.kind === 'link')
    return (
      <a href={line.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-md border border-gold-light/40 text-gold-light text-sm font-semibold hover:bg-gold-light/10">
        <ExternalLink size={16} aria-hidden="true" /> Mở tài liệu
      </a>
    );
  if (line.kind === 'label') {
    if (line.label.startsWith('Lời động viên'))
      return (
        <aside className="rounded-r-lg border-l-4 border-gold-light bg-gold-light/10 px-5 py-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-gold-light"><Lightbulb size={16} aria-hidden="true" /> {line.label}</p>
          <p className="mt-1.5 text-stone-200">{inline(line.text, k)}</p>
        </aside>
      );
    return (
      // Fixed-width label column so every label and every text line start on the same edges
      <div className="grid gap-1.5 sm:grid-cols-[9.5rem_1fr] sm:gap-x-4 sm:items-start">
        <span className={`justify-self-start sm:justify-self-stretch sm:mt-0.5 rounded-md border px-2.5 py-1 text-xs leading-tight text-center font-semibold ${TONE[line.label] || NEUTRAL}`}>{line.label}</span>
        {line.text && <p>{inline(line.text, k)}</p>}
      </div>
    );
  }
  if (line.kind === 'text') return <p>{inline(line.text, k)}</p>;
  return null;
}

export default function LessonText({ text, className = '' }: { text: string; className?: string }) {
  // Several labels sometimes share one line on Unica: put each on its own line
  const labelInline = new RegExp(`(\\S)\\s*(\\*\\*(?:${LABELS.join('|')}):?\\*\\*)`, 'g');
  const src = text.replace(/\r/g, '').replace(labelInline, '$1\n$2');

  // Split into flow lines and step cards ("- **Bước 1: ...**" plus the lines under it)
  const blocks: { step?: { n: string; title: string }; lines: Line[] }[] = [{ lines: [] }];
  for (const raw of src.split('\n')) {
    const item = raw.match(/^-\s+(.*)$/);
    if (item) {
      const step = item[1].match(/^\*\*(?:Bước\s*)?(\d+)[:.]\s*([^*]+)\*\*\s*$/);
      blocks.push(step ? { step: { n: step[1], title: step[2].trim() }, lines: [] } : { lines: [parseLine(item[1])] });
      continue;
    }
    const line = parseLine(raw);
    // A blank line or a heading ends a step card
    if (blocks[blocks.length - 1].step && (line.kind === 'heading' || (line.kind === 'gap' && blocks[blocks.length - 1].lines.length))) blocks.push({ lines: [] });
    blocks[blocks.length - 1].lines.push(line);
  }

  return (
    <div className={`space-y-4 leading-relaxed text-stone-300 ${className}`}>
      {blocks.map((b, bi) => {
        const body = b.lines.filter((l) => l.kind !== 'gap').map((l, li) => <LineView key={li} line={l} k={`${bi}-${li}`} />);
        if (b.step)
          return (
            <section key={bi} className="rounded-xl border border-white/10 bg-white/[0.04] p-5 md:p-6">
              <h3 className="flex items-center gap-3 text-lg md:text-xl text-white font-semibold">
                <span className="w-9 h-9 shrink-0 rounded-full bg-gold text-white text-base font-bold flex items-center justify-center">{b.step.n}</span>
                {b.step.title}
              </h3>
              {body.length > 0 && <div className="mt-4 space-y-3">{body}</div>}
            </section>
          );
        return body.length ? <Fragment key={bi}>{body}</Fragment> : null;
      })}
    </div>
  );
}
