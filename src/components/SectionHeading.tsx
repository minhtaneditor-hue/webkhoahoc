import type { ReactNode } from 'react';

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  light = false,
  as: Tag = 'h2',
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  light?: boolean;
  as?: 'h1' | 'h2';
}) {
  return (
    <div className={`max-w-2xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      {eyebrow && <p className={`eyebrow mb-4 ${light ? '!text-gold-light' : ''}`}>{eyebrow}</p>}
      <Tag className={light ? 'text-white' : 'text-ink'}>{title}</Tag>
      {description && (
        <p className={`mt-4 text-lg leading-relaxed ${light ? 'text-stone-300' : 'text-muted-foreground'}`}>{description}</p>
      )}
    </div>
  );
}
