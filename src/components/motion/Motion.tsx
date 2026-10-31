'use client';

import { useRef, type ReactNode, type ElementType } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// All motion lives inside a no-preference media query: under reduced motion (or if JS fails)
// the content is simply in its finished, visible state.
const MOTION_OK = '(prefers-reduced-motion: no-preference)';

/**
 * Signature move: the picture opens like a camera shutter from the right edge
 * and settles from a slight zoom. Used once, on the hero portrait.
 */
export function ShutterImage({ children, className = '' }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const inner = root.current?.querySelector('[data-shutter-inner]');
      if (!root.current || !inner) return;
      // Plays when the picture scrolls into view (it may sit below the first screen)
      gsap.timeline({ defaults: { ease: 'expo.out' }, scrollTrigger: { trigger: root.current, start: 'top 85%', once: true } })
        .from(root.current, { clipPath: 'inset(0% 0% 0% 100% round 16px)', duration: 1.4 }, 0.15)
        .from(inner, { scale: 1.12, duration: 2.2 }, 0.15);
    });
  }, { scope: root });

  return (
    <div ref={root} className={className} style={{ clipPath: 'inset(0% 0% 0% 0% round 16px)' }}>
      <div data-shutter-inner className="absolute inset-0">{children}</div>
    </div>
  );
}

/**
 * Section entrance: direct children arrive in reading order, once, when the block scrolls in.
 * `from` picks the manner so sections don't all move the same way.
 */
export function Reveal({
  children,
  as: Tag = 'div',
  className = '',
  from = 'rise',
  stagger = 0.08,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  from?: 'rise' | 'left' | 'mask';
  stagger?: number;
}) {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const items = root.current ? Array.from(root.current.children) : [];
      const vars: gsap.TweenVars =
        from === 'left' ? { x: -24, opacity: 0 }
        : from === 'mask' ? { clipPath: 'inset(100% 0% 0% 0%)', y: 24 }
        : { y: 24, opacity: 0 };
      gsap.from(items, {
        ...vars,
        duration: 0.9,
        ease: 'expo.out',
        stagger,
        scrollTrigger: { trigger: root.current, start: 'top 85%', once: true },
      });
    });
  }, { scope: root });

  return <Tag ref={root} className={className}>{children}</Tag>;
}
