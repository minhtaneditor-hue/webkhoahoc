import Link from 'next/link';
import { ArrowRight, Check, Sparkles, ShieldCheck } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import { Reveal } from '@/components/motion/Motion';
import { CRITERIA } from '@/lib/cham-video/criteria';

// Home page entry to the free scoring tool (/cham-video). The scorecard on the right is a
// labelled sample, so visitors see what they get before choosing a video.
const SAMPLE = [6, 7, 4, 8, 5, 7]; // per criterion, out of 10, in CRITERIA order
const SAMPLE_TOTAL = Math.round(CRITERIA.reduce((s, c, i) => s + (SAMPLE[i] * c.weight) / 10, 0));

const GETS = [
  'Điểm từng phần: hook 3 giây đầu, thông điệp, lời kêu gọi, hình ảnh, chữ, lời nói',
  'Một việc nên sửa trước tiên ở video sau',
  '2 câu hook viết lại cho đúng video của bạn',
];

export default function ChamVideoTeaser() {
  return (
    <section className="section" aria-labelledby="cham-video-title">
      <div className="container-lux">
        <div className="card p-6 md:p-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center [&>*]:min-w-0">
          <Reveal>
            <span className="badge"><Sparkles size={14} aria-hidden="true" /> Mới · Miễn phí</span>
            <div className="mt-4">
              <SectionHeading
                title={<span id="cham-video-title">Video của bạn được bao nhiêu điểm?</span>}
                description="Chọn một video trong máy, lời thoại được tự lấy, và AI chấm theo đúng bộ tiêu chí Minh Tấn dùng để sửa bài cho học viên. Khoảng 30 giây là có kết quả."
              />
            </div>
            <ul className="mt-6 space-y-3">
              {GETS.map((g) => (
                <li key={g} className="flex gap-3 text-ink"><Check size={20} className="text-gold shrink-0 mt-0.5" aria-hidden="true" /> {g}</li>
              ))}
            </ul>
            <div className="mt-8">
              <Link href="/cham-video" className="btn btn-gold w-full sm:w-auto">Chấm video của tôi <ArrowRight size={18} aria-hidden="true" /></Link>
            </div>
            <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
              <ShieldCheck size={16} className="shrink-0 mt-0.5" aria-hidden="true" /> Video không tải lên, chỉ gửi phần tiếng để lấy lời thoại. 3 lượt miễn phí mỗi ngày.
            </p>
          </Reveal>

          <Reveal>
            <div className="rounded-2xl bg-ivory border border-line p-5 md:p-6" aria-label="Phiếu chấm mẫu">
              <div className="flex items-baseline justify-between">
                <p className="text-sm text-muted-foreground">Phiếu chấm mẫu</p>
                <p className="font-bold text-ink"><span className="text-4xl">{SAMPLE_TOTAL}</span><span className="text-muted-foreground">/100</span></p>
              </div>
              <ul className="mt-5 space-y-3.5">
                {CRITERIA.map((c, i) => (
                  <li key={c.ma}>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink">{c.ten}</span>
                      <span className="font-semibold text-ink">{SAMPLE[i]}/10</span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-line overflow-hidden" aria-hidden="true">
                      <div className={`h-full rounded-full ${SAMPLE[i] >= 7 ? 'bg-success' : SAMPLE[i] >= 5 ? 'bg-gold' : 'bg-danger'}`} style={{ width: `${SAMPLE[i] * 10}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-5 rounded-xl border-2 border-gold/60 p-3 text-sm text-ink">
                <strong className="text-gold-hover">Sửa việc này trước:</strong> Mở video bằng kết quả khách nhận được, đừng mở bằng lời chào.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
