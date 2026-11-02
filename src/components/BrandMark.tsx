import { useId } from 'react';

// TẤN VA mark: a "T" whose bar folds into a Play button (Brand Kit 1.0, Cinematic Ember).
// Redrawn as SVG from the brand sheet; swap in the designer's master file when available.
export default function BrandMark({ size = 36, className = '' }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-t`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F6A56C" />
          <stop offset="0.55" stopColor="#E06A43" />
          <stop offset="1" stopColor="#B4432F" />
        </linearGradient>
        <linearGradient id={`${id}-p`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E0603E" />
          <stop offset="0.6" stopColor="#B83A30" />
          <stop offset="1" stopColor="#7A2228" />
        </linearGradient>
      </defs>
      {/* Play triangle, sitting behind the T */}
      <path d="M21 13.5c0-2.3 2.5-3.7 4.5-2.6l17 9.6c2 1.2 2 4 0 5.2l-17 9.6c-2 1.1-4.5-.3-4.5-2.6z" fill={`url(#${id}-p)`} />
      {/* T: bar slants into the play's top edge, stem drops down-left */}
      <path d="M6.5 7.5h22.8c1.6 0 2.4 1.9 1.3 3l-2.9 3c-.5.5-1.1.7-1.8.7h-6.2v22.6c0 1.2-.6 2.2-1.6 2.8l-3.4 2c-1.3.8-3-.2-3-1.7V14.2H5.2c-1.6 0-2.4-1.9-1.3-3l1.4-1.4c.3-.9.7-2.3 1.2-2.3z" fill={`url(#${id}-t)`} />
    </svg>
  );
}
