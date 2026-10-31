'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Rolling figure: counts up to `to` once when scrolled into view. Renders the final value without JS. */
export default function CountUp({ to, suffix = '', className = '' }: { to: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const format = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.round(n)) + suffix;

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const state = { n: 0 };
      if (ref.current) ref.current.textContent = format(0);
      gsap.to(state, {
        n: to,
        duration: 1.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 90%', once: true },
        onUpdate: () => { if (ref.current) ref.current.textContent = format(state.n); },
      });
      return () => { if (ref.current) ref.current.textContent = format(to); };
    });
  }, { scope: ref, dependencies: [to] });

  return <span ref={ref} className={`tabular-nums ${className}`}>{format(to)}</span>;
}
