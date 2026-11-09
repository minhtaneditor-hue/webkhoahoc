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
  // Missing until migration 028 has run: no sale then.
  old_price?: number | string | null;
  sale_ends_on?: string | null;
};

type Priced = Pick<ShopAsset, 'price' | 'old_price' | 'sale_ends_on'>;

/**
 * What a product costs right now. During a sale, price is the sale price and old_price the listed
 * one; once sale_ends_on is over (end of that day, Vietnam time) old_price applies again by itself.
 * The checkout uses this too, so the page and the bill always agree.
 */
export function assetPricing(a: Priced, now = Date.now()) {
  const price = Number(a.price) || 0;
  const listed = Number(a.old_price) || 0;
  if (listed <= price) return { price, oldPrice: null, endsOn: null };
  const ends = a.sale_ends_on ? Date.parse(`${a.sale_ends_on.slice(0, 10)}T23:59:59+07:00`) : NaN;
  if (!Number.isNaN(ends) && now > ends) return { price: listed, oldPrice: null, endsOn: null };
  return { price, oldPrice: listed, endsOn: Number.isNaN(ends) ? null : a.sale_ends_on!.slice(0, 10) };
}

// "2026-11-16" → "16/11"
export const shortDate = (isoDay: string) => isoDay.slice(8, 10) + '/' + isoDay.slice(5, 7);

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
