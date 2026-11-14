import { COUNTRY_BY_CODE } from '@/lib/countries';

// Phase 1 of the English site: a few public pages live under /en, everything else is Vietnamese only.
export type Lang = 'vi' | 'en';

export const isEnPath = (pathname: string | null | undefined) =>
  !!pathname && (pathname === '/en' || pathname.startsWith('/en/'));

// Vietnamese page -> its English twin. Pages missing here have no English version yet.
const EN_TWINS: Record<string, string> = {
  '/': '/en',
  '/coaching': '/en/coaching',
  '/students': '/en/students',
  '/about': '/en/about',
};
const VI_TWINS: Record<string, string> = Object.fromEntries(Object.entries(EN_TWINS).map(([vi, en]) => [en, vi]));

/** The page to open when switching language: the twin page if there is one, else that language's home. */
export function switchLangHref(pathname: string | null | undefined): string {
  const path = (pathname || '/').replace(/\/+$/, '') || '/';
  return isEnPath(path) ? VI_TWINS[path] ?? '/' : EN_TWINS[path] ?? '/en';
}

/** hreflang alternates for a Vietnamese/English page pair (relative to metadataBase). */
export const languageAlternates = (viPath: string) => ({
  vi: viPath,
  en: EN_TWINS[viPath],
  'x-default': viPath,
});

// Country names: the list in countries.ts is Vietnamese; English comes from the browser/Node Intl data.
let regionNames: Intl.DisplayNames | null = null;
export function countryName(code: string | null | undefined, lang: Lang): string | null {
  if (!code) return null;
  const vi = COUNTRY_BY_CODE[code]?.name ?? null;
  if (lang === 'vi' || !vi) return vi;
  try {
    regionNames ??= new Intl.DisplayNames(['en'], { type: 'region' });
    return regionNames.of(code) ?? vi;
  } catch {
    return vi;
  }
}

// English labels for WORK_CATEGORIES (src/lib/media.ts), keyed by value
export const WORK_CATEGORY_EN: Record<string, string> = {
  'bat-dong-san': 'Real estate',
  'am-thuc': 'Food & beverage',
  'lam-dep': 'Beauty, nails & spa',
  'du-lich': 'Travel & vlogs',
  'san-pham': 'Product sellers',
  'me-va-be': 'Mother & baby',
  'sang-tao': 'Content creators',
  khac: 'Other',
};
export const workCategoryLabel = (c: { value: string; label: string }, lang: Lang) =>
  lang === 'en' ? WORK_CATEGORY_EN[c.value] ?? c.label : c.label;
