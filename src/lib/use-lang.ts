'use client';

import { usePathname } from 'next/navigation';
import { isEnPath, type Lang } from '@/lib/i18n';

/** Language of the current page, from its path (/en... is English). For client components. */
export function useLang(): Lang {
  return isEnPath(usePathname()) ? 'en' : 'vi';
}
