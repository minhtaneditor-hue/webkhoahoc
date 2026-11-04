import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';

export const metadata: Metadata = {
  title: 'Về Minh Tấn',
  description: 'Sứ mệnh của TẤN VA: giúp người kinh doanh tự làm video bằng điện thoại để bán hàng và xây thương hiệu.',
  alternates: { canonical: '/about' },
};

// Minh Tấn's own story, in his words (edited). Shown right under the hero.
const story = [
  {
    t: 'Cậu bé quê bắt đầu muộn',
    p: [
      'Tôi sinh ra ở một vùng quê Bình Thuận, nay thuộc Lâm Đồng. Máy ảnh, internet, kể cả chiếc điện thoại, đều đến với tôi rất muộn.',
      'Phải tới năm lớp 11, nhờ môn Tin học, tôi mới lần đầu chạm vào máy vi tính. Khi bạn bè đã chơi game, lập nick Yahoo, thì tôi mới bắt đầu tập gõ từng chữ. Có lẽ vì đến muộn nên tôi tò mò hơn ai hết, và mày mò mọi thứ không biết chán.',
    ],
  },
  {
    t: 'Sài Gòn và lần đầu cầm máy quay',
    p: [
      'Học xong cấp 3, tôi khăn gói vào Sài Gòn. Thật thà, chân chất, ai nói gì cũng tin, và cũng chẳng có mục tiêu hay định hướng gì rõ ràng. Tôi chọn “theo vía” trường Cao đẳng Phát thanh – Truyền hình II.',
      'Rồi lần đầu cầm máy quay, tôi biết mình đã tìm thấy thứ mình yêu. Giờ rảnh, tôi ra công viên học hỏi những người đi trước, săn từng khóa học miễn phí ở Nhà Văn hóa Thanh niên, Nhà Văn hóa Sinh viên để lên tay nghề.',
    ],
  },
  {
    t: 'Học nghề trong môi trường chuyên nghiệp',
    p: [
      'Một cơ duyên đưa tôi vào học việc dựng video tại Điền Quân, đúng thời điểm công ty đang làm những show đình đám như Thách Thức Danh Hài, Giọng Ải Giọng Ai, Đấu Trường Tiếu Lâm. Tôi may mắn được ngồi dựng chính những chương trình ấy.',
      'Môi trường chuyên nghiệp dạy tôi nhiều hơn bất kỳ giáo trình nào: từ kỹ năng, tốc độ đến cách một ê-kíp làm ra sản phẩm phát sóng.',
    ],
  },
  {
    t: 'Từ người làm nghề thành người dạy nghề',
    p: [
      'Biết tôi làm trong môi trường như vậy, bạn bè, người quen bắt đầu nhờ tôi chỉ lại những gì mình học được. Từ những buổi chỉ nhau ấy, tôi bén duyên với việc đi dạy.',
      'Suốt hơn 10 năm làm nghề, tôi tham gia rất nhiều show lớn, show hot, nên hiểu rõ quy trình làm video chuyên nghiệp vận hành ra sao.',
    ],
  },
  {
    t: 'Đưa kỹ thuật máy quay lớn vào chiếc điện thoại',
    p: [
      'Ngày nay ai cũng có một chiếc điện thoại thông minh, và nó chụp ảnh, quay và dựng video cho mạng xã hội rất tốt. Làm video không còn phức tạp như trong trường quay nữa.',
      'Vì vậy tôi tập trung nghiên cứu cách đem toàn bộ kiến thức từ những chiếc máy quay to, xịn sò sang chiếc điện thoại. Khóa “21 Ngày Biến Video Thành Tài Sản” là phần tinh túy nhất tôi đúc kết sau bao năm làm nghề.',
    ],
  },
];

const values = [
  { t: 'Kỹ năng thực chiến', d: 'Không dạy lý thuyết suông. Mọi bài học đều hướng tới kết quả bạn làm ra được từ chiếc smartphone.' },
  { t: 'Cộng đồng đồng hành', d: 'Gia nhập mạng lưới nhà sáng tạo nội dung luôn sẵn sàng hỗ trợ và chia sẻ kinh nghiệm.' },
  { t: 'Kiến thức đã kiểm chứng', d: 'Đúc kết từ hơn 10 năm sản xuất truyền hình và các chiến dịch video cho thương hiệu lớn.' },
];

export default function AboutPage() {
  return (
    <main>
      <section className="container-lux py-12 md:py-20 grid gap-12 lg:grid-cols-2 items-center">
        <div>
          <SectionHeading
            as="h1"

            title="Về TẤN VA"
            description="Sứ mệnh của chúng tôi là giúp một triệu doanh nhân và nhà sáng tạo làm chủ kỹ năng video bằng chính chiếc điện thoại, rồi dùng video để bán hàng và xây thương hiệu."
          />
          <Link href="/courses" className="btn btn-gold mt-8">Khám phá khóa học <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
        <div className="relative aspect-[4/3] rounded-[var(--radius-card)] overflow-hidden bg-muted">
          <Image src="/asset/du_an_tieu_bieu/project_2n1d.webp" alt="Hậu trường show 2 Ngày 1 Đêm" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </section>

      <section className="section" aria-labelledby="story-title">
        <div className="container-lux grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] items-start">
          <div className="lg:sticky lg:top-28">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Câu chuyện của Minh Tấn</p>
            <h2 id="story-title" className="mt-4 text-3xl md:text-4xl leading-tight">
              Năm lớp 11, tôi xin mẹ 2.000 đồng để ra bưu điện… tập gõ Word.
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
                  Tôi bắt đầu muộn hơn rất nhiều người. Nếu tôi làm được, bạn cũng làm được, bằng chính chiếc điện thoại trong túi mình.
                </p>
                <p className="mt-4 text-lg text-stone leading-relaxed">
                  Mong muốn của tôi là giúp các anh chị và những doanh nghiệp nhỏ tự chủ làm video, chụp ảnh đẹp mà không tốn quá nhiều chi phí, để những gì tôi chia sẻ thật sự giúp ích cho công việc của bạn.
                </p>
                <footer className="mt-4 font-bold text-ink">— Minh Tấn</footer>
              </blockquote>
            </li>
          </ol>
        </div>
      </section>

      <section className="section bg-card">
        <div className="container-lux">
          <SectionHeading title="Điều làm nên TẤN VA" />
          <dl className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-3">
            {values.map(({ t, d }) => (
              <div key={t}>
                <dt className="font-display text-3xl font-bold text-ink">{t}</dt>
                <dd className="mt-2 text-lg text-muted-foreground leading-relaxed">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="container-lux section">
        <div className="surface-dark rounded-[var(--radius-card)] px-6 py-14 md:p-16 text-center">
          <h2 className="text-white">Bắt đầu hành trình của bạn</h2>
          <p className="mt-4 text-stone-300 max-w-xl mx-auto">Chiếc điện thoại của bạn đã đủ tốt. Thứ còn thiếu là phương pháp — và chúng tôi ở đây để trao nó cho bạn.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/courses" className="btn btn-gold">Xem khóa học</Link>
            <Link href="/coaching" className="btn btn-outline-light">Coaching 1:1</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
