import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import JsonLd from '@/components/JsonLd';
import { ORGANIZATION, PERSON } from '@/lib/brand-entity';
import { SITE_URL } from '@/lib/site-url';
import { languageAlternates } from '@/lib/i18n';

const DESCRIPTION = 'TẤN VA (Minh Tấn Video Advisor, Minh Tấn Academy) helps business owners and creators make their own videos with a phone, to sell and to build their brand.';

export const metadata: Metadata = {
  title: 'About Minh Tấn',
  description: DESCRIPTION,
  openGraph: { title: 'About Minh Tấn | TẤN VA', description: DESCRIPTION, type: 'profile', locale: 'en_US', siteName: 'TẤN VA' },
  alternates: { canonical: '/en/about', languages: languageAlternates('/about') },
};

// Minh Tấn's story, told in English from the Vietnamese /about page. Keep the facts in step with it.
const story = [
  {
    t: 'A country boy who started late',
    p: [
      'I grew up in the countryside of Bình Thuận, in southern Vietnam. Cameras, the internet, even a mobile phone, all came to me very late.',
      'I touched a computer for the first time in 11th grade, in an IT class. My friends were already gaming and chatting online while I was still learning to type one letter at a time. Maybe because I started late, I was more curious than anyone, and I never got tired of figuring things out.',
    ],
  },
  {
    t: 'Saigon, and picking up a camera for the first time',
    p: [
      'After high school I packed my bags for Saigon. I was naive, believed whatever anyone told me, and had no real plan. I picked the Broadcasting College II almost on a hunch.',
      'Then I held a video camera for the first time, and I knew I had found what I loved. In my free time I went to the parks to learn from older filmmakers, and hunted down every free class at the city’s youth and student centers to sharpen my skills.',
    ],
  },
  {
    t: 'Learning the craft in a professional studio',
    p: [
      'A lucky break got me an apprenticeship as a video editor at Điền Quân, right when the company was making some of Vietnam’s biggest TV shows: Thách Thức Danh Hài, Giọng Ải Giọng Ai (the Vietnamese I Can See Your Voice) and Đấu Trường Tiếu Lâm. I got to edit those very shows.',
      'That professional environment taught me more than any textbook: skills, speed, and how a whole crew turns footage into something ready for broadcast.',
    ],
  },
  {
    t: 'From doing the work to teaching it',
    p: [
      'Once friends and acquaintances knew where I worked, they started asking me to show them what I had learned. Those small favors turned into teaching.',
      'In more than 10 years in the industry I have worked on many big, popular shows, so I know exactly how a professional video workflow runs.',
    ],
  },
  {
    t: 'Bringing big-camera skills to your phone',
    p: [
      'Today everyone has a smartphone, and it takes photos, films and edits video for social media really well. Making video no longer has to be as complicated as in a TV studio.',
      'So I focused on moving everything I know from big professional cameras to the phone. My course “21 Days to Turn Video into an Asset” is the best of what I have learned over all these years.',
    ],
  },
];

const values = [
  { t: 'Practical skills', d: 'No empty theory. Every lesson leads to something you can actually make with your smartphone.' },
  { t: 'A community behind you', d: 'Join a network of content creators who are always ready to help and share what works.' },
  { t: 'Proven know-how', d: 'Built on more than 10 years of TV production and video campaigns for major brands.' },
];

export default function AboutPageEn() {
  return (
    <main>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'AboutPage', url: `${SITE_URL}/en/about`, name: 'About Minh Tấn', inLanguage: 'en', mainEntity: { '@id': PERSON['@id'] } },
          PERSON,
          ORGANIZATION,
        ],
      }} />
      <section className="container-lux py-12 md:py-20 grid gap-12 lg:grid-cols-2 items-center">
        <div>
          <SectionHeading
            as="h1"
            title={<>About TẤN VA <span className="text-[0.5em] font-semibold whitespace-nowrap">(Video Advisor)</span></>}
            description="TẤN VA is Minh Tấn’s brand, also known as Minh Tấn Video Advisor and Minh Tấn Academy. Our mission is to help one million business owners and creators master video with the phone they already have, and then use video to sell and to build their brand."
          />
          <Link href="/en/coaching" className="btn btn-gold mt-8">Explore 1:1 coaching <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
        <div className="relative aspect-[4/3] rounded-[var(--radius-card)] overflow-hidden bg-muted">
          <Image src="/asset/avatar/hero_expert.jpg" alt="Minh Tấn, founder of TẤN VA" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover object-top" />
        </div>
      </section>

      <section className="section" aria-labelledby="story-title">
        <div className="container-lux grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] items-start">
          <div className="lg:sticky lg:top-28">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Minh Tấn’s story</p>
            <h2 id="story-title" className="mt-4 text-3xl md:text-4xl leading-tight">
              In 11th grade, I asked my mom for a few cents to go to the post office… and practice typing in Word.
            </h2>
            <div className="relative mt-8 aspect-[4/5] max-w-sm rounded-[var(--radius-card)] overflow-hidden bg-muted">
              <Image src="/asset/avatar/hero_expert.jpg" alt="Minh Tấn" fill sizes="(min-width: 1024px) 30vw, 90vw" className="object-cover" />
            </div>
          </div>
          <ol className="space-y-10">
            {story.map(({ t, p }, i) => (
              <li key={t} className="grid grid-cols-[2.5rem_1fr] gap-4">
                <span className="w-10 h-10 rounded-full bg-gold/10 text-gold font-extrabold flex items-center justify-center" aria-hidden="true">{i + 1}</span>
                <div>
                  <h3 className="text-2xl font-bold text-ink">{t}</h3>
                  <div className="mt-3 space-y-4 text-lg leading-relaxed text-stone">
                    {p.map((x) => <p key={x.slice(0, 20)}>{x}</p>)}
                  </div>
                </div>
              </li>
            ))}
            <li>
              <blockquote className="border-l-4 border-gold pl-6">
                <p className="font-display text-2xl md:text-3xl leading-snug text-ink">
                  I started much later than most people. If I could do it, so can you, with the phone in your pocket.
                </p>
                <p className="mt-4 text-lg text-stone leading-relaxed">
                  What I want is to help people and small businesses make their own videos and great photos without spending a fortune, so that what I share truly helps your work.
                </p>
                <footer className="mt-4 font-bold text-ink">— Minh Tấn</footer>
              </blockquote>
            </li>
          </ol>
        </div>
      </section>

      <section className="section bg-card">
        <div className="container-lux">
          <SectionHeading title="What makes TẤN VA different" />
          <dl className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-3">
            {values.map(({ t, d }) => (
              <div key={t}>
                <dt className="font-display text-2xl font-semibold tracking-[0.01em] text-ink">{t}</dt>
                <dd className="mt-2 text-lg text-muted-foreground leading-relaxed">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="container-lux section">
        <div className="surface-dark rounded-[var(--radius-card)] px-6 py-14 md:p-16 text-center">
          <h2 className="text-white">Start your journey</h2>
          <p className="mt-4 text-stone-300 max-w-xl mx-auto">Your phone is already good enough. What’s missing is the method, and we’re here to give it to you.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/en/coaching" className="btn btn-gold">1:1 coaching</Link>
            <Link href="/en/students" className="btn btn-outline-light">See students’ work</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
