'use client';

import { useLang } from '@/lib/use-lang';

// "Skip to main content" for keyboard users, in the page's language
export default function SkipLink() {
  const en = useLang() === 'en';
  return (
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[3000] btn btn-dark">
      {en ? 'Skip to main content' : 'Bỏ qua tới nội dung chính'}
    </a>
  );
}
