'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

type Item = { id: string; title: string };

// Desktop: follows the reader down the page, marking the section in view. Hidden below lg.
export function PostTocSide({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActive(hit.target.id);
      },
      // A section counts as current while it crosses a thin band near the top of the screen
      { rootMargin: '-20% 0px -75% 0px' },
    );
    for (const { id } of items) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="Mục lục bài viết">
      <p className="text-sm font-bold text-ink">Trong bài này</p>
      <ol role="list" className="mt-3 border-l border-line">
        {items.map((item) => {
          const current = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={current ? 'location' : undefined}
                className={`-ml-px block border-l-2 py-1.5 pl-4 text-sm leading-snug transition-colors ${current ? 'border-gold font-semibold text-ink' : 'border-transparent text-muted-foreground hover:text-ink'}`}
              >
                {item.title}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Phones and tablets: folded by default so it doesn't push the opening down the screen.
export function PostTocInline({ items }: { items: Item[] }) {
  return (
    <details className="group rounded-[var(--radius-md)] border border-line bg-card">
      <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-3 px-4 text-base font-bold text-ink [&::-webkit-details-marker]:hidden">
        Trong bài này
        <ChevronDown size={18} aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <ol role="list" className="border-t border-line px-4 py-2">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="flex min-h-[44px] items-center py-1.5 text-base leading-snug text-stone hover:text-gold">{item.title}</a>
          </li>
        ))}
      </ol>
    </details>
  );
}
