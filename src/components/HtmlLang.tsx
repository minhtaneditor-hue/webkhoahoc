'use client';

import { useEffect } from 'react';

// The root layout renders <html lang="vi">. English sections set the document language while
// they are on screen, so screen readers switch voice, and put it back when the visitor leaves.
export default function HtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    return () => { root.lang = 'vi'; };
  }, [lang]);
  return null;
}
