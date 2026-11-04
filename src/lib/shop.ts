// Shared by the shop list and a product's own page. Long fields are plain text in the admin
// form, so these turn them into lists.

export const CATEGORY_LABELS: Record<string, string> = {
  ebook: 'Ebook',
  preset: 'Preset',
  lut: 'LUT màu',
  template: 'Template',
  skill: 'Skill AI',
  wedding: 'Cưới hỏi',
  travel: 'Du lịch',
  vlog: 'Vlog',
  cinematic: 'Điện ảnh',
};

export type ShopAsset = {
  id: string;
  title: string;
  description?: string | null;
  price: number | string;
  thumbnail_url?: string | null;
  category?: string | null;
  // Missing until migration 023 has run; every section below copes with that.
  preview_url?: string | null;
  highlights?: string | null;
  requirements?: string | null;
  samples?: string | null;
  faq?: string | null;
};

// One item per line, blank lines ignored.
export const lines = (text?: string | null) =>
  (text || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

// Blocks split by a blank line: first line is the question, the rest is the answer.
export function parseFaq(text?: string | null) {
  return (text || '')
    .split(/\r?\n\s*\r?\n/)
    .map((block) => lines(block))
    .filter((b) => b.length >= 2)
    .map(([q, ...a]) => ({ q, a: a.join(' ') }));
}

// The details section mixes text and pictures: a paragraph written ![what it shows](url) is a picture.
export function parseDetails(text?: string | null) {
  return (text || '').split(/\r?\n\s*\r?\n/).flatMap((block): { text?: string; alt?: string; src?: string }[] => {
    const picture = block.trim().match(/^!\[([^\]]*)\]\((\S+)\)$/);
    if (picture) return [{ alt: picture[1], src: picture[2] }];
    return block.trim() ? [{ text: block.trim() }] : [];
  });
}

// The first paragraph opens the page; anything after it goes in its own section further down.
export function splitDescription(text?: string | null) {
  const [lead = '', ...rest] = (text || '').trim().split(/\r?\n\s*\r?\n/);
  return { lead, rest: rest.join('\n\n') };
}
