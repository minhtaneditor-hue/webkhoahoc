import WorldMap from './WorldMap';
import CountUp from '@/components/motion/CountUp';
import { Reveal } from '@/components/motion/Motion';
import { COUNTRY_BY_CODE, flagUrl } from '@/lib/countries';
import type { StudentPlace } from '@/lib/content';
import { countryName, type Lang } from '@/lib/i18n';

// "Students all over the world": map + country list. Renders nothing until the
// admin has set where at least two countries' worth of students live.
export default function WorldStudents({ places, lang = 'vi', title = lang === 'en' ? 'TẤN VA students around the world' : 'Học viên TẤN VA ở khắp thế giới' }: { places: StudentPlace[]; lang?: Lang; title?: string }) {
  const known = places.filter((p) => COUNTRY_BY_CODE[p.code]);
  if (known.length < 2) return null;
  const abroad = known.filter((p) => p.code !== 'VN').length;

  return (
    <section aria-labelledby="world-title" className="surface-dark overflow-hidden border-t border-white/[0.08]">
      <div className="container-lux py-20 md:py-28">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <Reveal>
            <h2 id="world-title" className="text-white text-[clamp(1.625rem,4.5vw,3.5rem)] leading-[1.2] max-w-3xl">{title}</h2>
            <p className="mt-5 text-lg text-stone-300 max-w-xl">
              {lang === 'en'
                ? `From Vietnam to ${abroad} other countries, students learn online and put it to work right away, wherever they live.`
                : `Từ Việt Nam tới ${abroad} quốc gia khác, học viên học online và áp dụng ngay cho công việc ở nơi họ sống.`}
            </p>
          </Reveal>
          <p className="font-display font-bold text-gold-light leading-none">
            <span className="text-6xl md:text-7xl"><CountUp to={known.length} /></span>
            <span className="block mt-2 font-sans font-normal text-base text-stone-300">{lang === 'en' ? 'countries with students' : 'quốc gia có học viên'}</span>
          </p>
        </div>

        <div className="mt-10 md:mt-14">
          <WorldMap places={known} />
        </div>

        <ul className="mt-8 flex flex-wrap gap-2.5">
          {known.map((p) => {
            const c = COUNTRY_BY_CODE[p.code];
            return (
              <li key={p.code} className="flex items-center gap-2 rounded-full bg-white/[0.06] pl-2 pr-4 py-2 text-sm text-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={flagUrl(p.code)} alt="" width={24} height={16} loading="lazy" className="!rounded-[3px] w-6 h-4 object-cover" />
                <span className="font-semibold text-white">{countryName(c.code, lang)}</span>
                {p.cities.length > 0 && <span className="text-stone-400">· {p.cities.slice(0, 3).join(', ')}</span>}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
