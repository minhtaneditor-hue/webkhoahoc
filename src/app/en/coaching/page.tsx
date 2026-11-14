import type { Metadata } from 'next';
import Image from 'next/image';
import { Check, ArrowRight, MessageCircle } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import { Reveal } from '@/components/motion/Motion';
import { getSiteSettings } from '@/lib/content';
import { contactFrom } from '@/lib/site-settings';
import JsonLd from '@/components/JsonLd';
import { ORG_ID, PERSON_ID } from '@/lib/brand-entity';
import { SITE_URL } from '@/lib/site-url';
import { languageAlternates } from '@/lib/i18n';
import { COACHING_PACKAGES_USD as packages, COACHING_INCLUDED as included } from '@/lib/coaching-intl';

const DESCRIPTION = 'Learn 1:1 online with Minh Tấn: film and edit video with your phone, then run Facebook and TikTok ads. Taught in Vietnamese. Free 30-minute audit, single sessions and 6- or 10-session programs, scheduled in your time zone.';

export const metadata: Metadata = {
  title: '1:1 Coaching',
  description: DESCRIPTION,
  openGraph: { title: '1:1 video coaching with Minh Tấn | TẤN VA', description: DESCRIPTION, type: 'website', locale: 'en_US', siteName: 'TẤN VA' },
  alternates: { canonical: '/en/coaching', languages: languageAlternates('/coaching') },
};

const topics = [
  { title: 'Phone photography', desc: 'Composition, light, portraits and product photos that look great, with just your phone.' },
  { title: 'Filming with your phone', desc: 'Camera settings, shot sizes, angles, movement, and feeling at ease talking to the camera.' },
  { title: 'Editing on your phone', desc: 'Fast editing in CapCut: cuts, text, captions, sound, color and export.' },
  { title: 'Editing with AI', desc: 'Use AI tools to write scripts, create images and edit videos faster.' },
];

const steps = [
  { title: 'Message us on Messenger', desc: 'Tell us which package you want, what you would like to learn and your time zone.' },
  { title: 'Pay by PayPal or Wise', desc: 'We\'ll send you a PayPal / Wise payment link. No card details on this site.' },
  { title: 'Pick your times and start', desc: 'We confirm your session times in your time zone and send the call link.' },
];

export default async function CoachingPageEn() {
  const CONTACT = contactFrom(await getSiteSettings());
  const chat = CONTACT.messengerHref;
  return (
    <main>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: '1:1 video coaching with Minh Tấn',
        serviceType: 'Video filming and editing coaching',
        description: DESCRIPTION,
        url: `${SITE_URL}/en/coaching`,
        inLanguage: 'en',
        areaServed: ['United States', 'Canada', 'Australia', 'Singapore'].map((name) => ({ '@type': 'Country', name })),
        provider: { '@id': PERSON_ID },
        brand: { '@id': ORG_ID },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Coaching packages',
          itemListElement: [
            { '@type': 'Offer', name: 'Free 30-minute audit', description: 'Online consultation · 30 minutes', price: 0, priceCurrency: 'USD', url: `${SITE_URL}/en/coaching` },
            ...packages.map((p) => ({ '@type': 'Offer', name: p.name, description: p.duration, price: p.price, priceCurrency: 'USD', url: `${SITE_URL}/en/coaching` })),
          ],
        },
      }} />
      {/* Hero */}
      <section className="surface-dark">
        <div className="container-lux py-16 md:py-24 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div>
            <h1 className="text-white text-[clamp(1.75rem,5.5vw,4rem)]">1:1 coaching with Minh Tấn</h1>
            <p className="mt-6 text-lg text-stone-300 leading-relaxed max-w-xl">
              Private online lessons built around what you need: taking photos, filming and editing video with your phone, or editing with AI. Minh Tấn guides you, gives you assignments and reviews your work.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a href="#packages" className="btn btn-gold">See the packages <ArrowRight size={18} aria-hidden="true" /></a>
              <a href={chat} target="_blank" rel="noopener noreferrer" className="btn btn-outline-light"><MessageCircle size={18} aria-hidden="true" /> Message us on Messenger</a>
            </div>
          </div>
          <div className="relative aspect-[4/5] max-w-md w-full mx-auto rounded-[var(--radius-card)] overflow-hidden">
            <Image src="/asset/avatar/hero_expert.jpg" alt="Minh Tấn" fill priority sizes="(min-width: 1024px) 40vw, 90vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Topics */}
      <section className="section bg-card">
        <div className="container-lux">
          <SectionHeading title="What you can learn" description="Pick one topic or combine several. Your program is tailored to you." />
          <dl className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {topics.map(({ title, desc }, i) => (
              <div key={title}>
                <span className="w-10 h-10 rounded-full bg-gold text-white font-bold flex items-center justify-center">{i + 1}</span>
                <dt className="mt-4 text-xl font-bold text-ink">{title}</dt>
                <dd className="mt-2 text-muted-foreground leading-relaxed">{desc}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="section scroll-mt-20">
        <div className="container-lux">
          <SectionHeading title="Choose your package" align="center" description="All sessions are 1:1 online and 2 hours long. Prices in US dollars." />
          <Reveal className="mt-12 grid gap-6 lg:grid-cols-3 max-w-6xl mx-auto items-stretch">
            {packages.map((pkg) => (
              <div key={pkg.name} className={`relative rounded-[var(--radius-card)] p-8 md:p-10 flex flex-col ${pkg.featured ? 'surface-dark shadow-[var(--shadow-lift)]' : 'card'}`}>
                {pkg.featured && <span className="badge absolute -top-3 left-8 !bg-gold-light !text-onyx">Most complete</span>}
                <p className={`text-sm font-semibold ${pkg.featured ? 'text-gold-light' : 'text-gold'}`}>{pkg.duration}</p>
                <h3 className={`mt-2 text-3xl ${pkg.featured ? 'text-white' : ''}`}>{pkg.name}</h3>
                <div className="mt-4 flex items-baseline gap-2 flex-wrap">
                  <p className={`text-4xl font-extrabold tabular-nums ${pkg.featured ? 'text-white' : ''}`}>${pkg.price}</p>
                  <p className={`text-sm ${pkg.featured ? 'text-stone-400' : 'text-muted-foreground'}`}>USD</p>
                </div>
                <ul className={`mt-8 space-y-3 flex-1 ${pkg.featured ? 'text-stone-300' : 'text-stone'}`}>
                  {[...pkg.features, ...included].map((f) => (
                    <li key={f} className="flex gap-3"><Check size={18} className={`shrink-0 mt-0.5 ${pkg.featured ? 'text-gold-light' : 'text-gold'}`} aria-hidden="true" /> {f}</li>
                  ))}
                </ul>
                <div className="mt-8">
                  <a href={chat} target="_blank" rel="noopener noreferrer" className={`btn w-full ${pkg.featured ? 'btn-gold' : 'btn-dark'}`}>
                    {pkg.cta} <ArrowRight size={18} aria-hidden="true" />
                  </a>
                  <p className={`mt-3 text-sm text-center ${pkg.featured ? 'text-stone-400' : 'text-muted-foreground'}`}>
                    Opens Messenger. We&apos;ll send you a PayPal / Wise payment link.
                  </p>
                </div>
              </div>
            ))}
          </Reveal>

          {/* Free audit: the low-commitment first step */}
          <div className="mt-10 max-w-6xl mx-auto card p-8 md:p-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-sm font-semibold text-gold">Online consultation · 30 minutes</p>
              <h3 className="mt-2 text-3xl">Free audit</h3>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 text-stone">
                {[
                  'We look at your channel and your current videos',
                  'We point out what to fix in picture, sound, delivery and editing',
                  'Content ideas that suit you',
                  'Clear next steps',
                ].map((f) => (
                  <li key={f} className="flex gap-3"><Check size={18} className="shrink-0 mt-0.5 text-gold" aria-hidden="true" /> {f}</li>
                ))}
              </ul>
            </div>
            <a href={chat} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              Book a free audit <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      {/* How booking and payment work */}
      <section className="section bg-card">
        <div className="container-lux">
          <SectionHeading title="How booking works" description="No checkout on this site. You book in a chat with us, and pay with a secure link." />
          <ol className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-3">
            {steps.map(({ title, desc }, i) => (
              <li key={title}>
                <span className="w-10 h-10 rounded-full bg-gold text-white font-bold flex items-center justify-center" aria-hidden="true">{i + 1}</span>
                <h3 className="mt-4 text-xl font-bold text-ink">{title}</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">{desc}</p>
              </li>
            ))}
          </ol>
          <a href={chat} target="_blank" rel="noopener noreferrer" className="btn btn-gold mt-12">
            <MessageCircle size={18} aria-hidden="true" /> Message us on Messenger
          </a>
        </div>
      </section>
    </main>
  );
}
