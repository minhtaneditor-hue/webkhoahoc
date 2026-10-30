import type { ReactNode } from 'react';

// No eyebrow/kicker above the heading: both taste-skill and Impeccable ban it. The heading carries its own weight.
export default function SectionHeading({
  title,
  description,
  align = 'left',
  light = false,
  as: Tag = 'h2',
}: {
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  light?: boolean;
  as?: 'h1' | 'h2';
}) {
  return (
    <div className={`max-w-2xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      <Tag className={light ? 'text-white' : 'text-ink'}>{title}</Tag>
      {description && (
        <p className={`mt-4 text-lg leading-relaxed ${light ? 'text-stone-300' : 'text-muted-foreground'}`}>{description}</p>
      )}
    </div>
  );
}
