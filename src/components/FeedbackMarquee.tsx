import Image from 'next/image';
import type { FeedbackImage } from '@/lib/content';
import { skipOptimizer } from '@/lib/image';

// Two rows of real feedback screenshots drifting in opposite directions.
// Pure CSS (marquee-track): pauses on hover, becomes a static wrap under reduced motion.
export default function FeedbackMarquee({ images }: { images: FeedbackImage[] }) {
  if (images.length === 0) return null;
  const rows = [images, [...images].reverse()];
  return (
    <div className="space-y-5 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]" aria-label="Ảnh chụp phản hồi của học viên">
      {rows.map((row, r) => (
        <div key={r} className="overflow-hidden">
          <ul className={`marquee-track gap-5 ${r === 1 ? 'marquee-reverse' : ''}`} style={{ ['--marquee-duration' as string]: r === 1 ? '70s' : '55s' }}>
            {/* The list is rendered twice so the loop is seamless; the copy is hidden from screen readers */}
            {[...row, ...row].map((img, i) => (
              <li key={`${img.src}-${i}`} aria-hidden={i >= row.length || undefined} className="shrink-0">
                <Image
                  src={img.src}
                  alt={i < row.length ? 'Phản hồi của học viên' : ''}
                  width={img.width}
                  height={img.height}
                  sizes="420px"
                  unoptimized={skipOptimizer(img.src)}
                  className="h-28 md:h-36 w-auto bg-white shadow-photo"
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
