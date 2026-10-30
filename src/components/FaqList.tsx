import { ChevronDown } from 'lucide-react';

// Native <details> accordion: keyboard + screen-reader friendly with no JS.
export default function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="space-y-2">
      {items.map((faq) => (
        <details key={faq.q} className="group bg-card px-5 md:px-6">
          <summary className="flex items-center justify-between gap-6 py-5 list-none [&::-webkit-details-marker]:hidden">
            <span className="text-lg font-semibold text-ink">{faq.q}</span>
            <ChevronDown size={20} aria-hidden="true" className="shrink-0 text-gold transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <p className="pb-6 -mt-1 text-muted-foreground leading-relaxed max-w-3xl">{faq.a}</p>
        </details>
      ))}
    </div>
  );
}
