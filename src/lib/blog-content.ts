import { slugify } from '@/lib/blog-format';

// Splits a post's Markdown subset into the parts the post page lays out separately:
// the opening, numbered sections (which also feed the table of contents) and the sources list.

export type Block =
  | { kind: 'h3' | 'p' | 'quote'; text: string }
  | { kind: 'ul' | 'ol'; items: string[] }
  | { kind: 'img'; alt: string; src: string }
  | { kind: 'notes'; items: { label: string; text: string }[] };

export type Section = { id: string; title: string; blocks: Block[] };
export type Source = { title: string; url?: string };
export type ParsedPost = { intro: Block[]; sections: Section[]; sources: Source[] };

// "**Nên áp dụng:** nội dung" -> label + text
const LABELLED = /^\*\*([^*]+?):?\*\*:?\s+(.+)$/;
const SOURCES_HEADING = /^(nguồn|nguồn tham khảo|tài liệu tham khảo)$/i;

const plain = (text: string) => text.replace(/\*+/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').trim();

function parseBlocks(lines: string[]) {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length) blocks.push({ kind: 'p', text: paragraph.join(' ') });
    paragraph = [];
  };
  for (const line of lines) {
    const img = line.match(/^!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)$/);
    const list = line.match(/^(?:([-*])|\d+[.)])\s+(.*)$/);
    if (!line) {
      flush();
    } else if (line.startsWith('### ')) {
      flush();
      blocks.push({ kind: 'h3', text: line.slice(4) });
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
  return groupNotes(blocks);
}

// Two or more paragraphs in a row that each open with a bold label read better as cards.
function groupNotes(blocks: Block[]) {
  const out: Block[] = [];
  let run: { label: string; text: string; source: Block }[] = [];
  const end = () => {
    if (run.length >= 2) out.push({ kind: 'notes', items: run.map(({ label, text }) => ({ label, text })) });
    else out.push(...run.map((r) => r.source));
    run = [];
  };
  for (const b of blocks) {
    const m = b.kind === 'p' ? b.text.match(LABELLED) : null;
    if (m) {
      // The text no longer follows its label in the same sentence, so it opens with a capital
      run.push({ label: m[1], text: m[2].charAt(0).toUpperCase() + m[2].slice(1), source: b });
    } else {
      end();
      out.push(b);
    }
  }
  end();
  return out;
}

function parseSources(lines: string[]): Source[] {
  return lines
    .map((line) => line.replace(/^(?:[-*]|\d+[.)])\s+/, ''))
    .filter(Boolean)
    .map((line) => {
      const link = line.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
      return link ? { title: link[1], url: link[2] } : { title: plain(line) };
    });
}

export function parsePost(content: string): ParsedPost {
  const parts: { title: string | null; lines: string[] }[] = [{ title: null, lines: [] }];
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();
    // The post title is the page's only h1, so a "# " line in the text counts as a section too
    if (/^##? /.test(line)) parts.push({ title: plain(line.replace(/^#+\s+/, '')), lines: [] });
    else parts[parts.length - 1].lines.push(line);
  }

  const used = new Set<string>();
  const uniqueId = (title: string) => {
    const base = slugify(title) || 'muc';
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    return id;
  };

  const sections: Section[] = [];
  const sources: Source[] = [];
  for (const part of parts.slice(1)) {
    if (SOURCES_HEADING.test(part.title!)) sources.push(...parseSources(part.lines));
    else sections.push({ id: uniqueId(part.title!), title: part.title!, blocks: parseBlocks(part.lines) });
  }
  return { intro: parseBlocks(parts[0].lines), sections, sources };
}

// Sections short enough, with no pictures, close the post as a highlighted panel.
export const isClosingPanel = (section: Section) =>
  section.blocks.length <= 4 && section.blocks.every((b) => b.kind === 'p' || b.kind === 'ul' || b.kind === 'ol');

// "Ảnh bảng so sánh vùng an toàn" -> "Bảng so sánh vùng an toàn"
export function captionFromAlt(alt: string) {
  const text = alt.trim().replace(/^(ảnh|hình ảnh|hình|minh họa)[:\s]+/i, '');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function sourceHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}
