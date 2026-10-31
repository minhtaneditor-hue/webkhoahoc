"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { isAppShellRoute } from "./Navbar";

const messages = [
  "Khóa “21 Ngày Biến Video Thành Tài Sản” đang mở đăng ký",
  "Học thử miễn phí bài đầu tiên",
  "Truy cập trọn đời, hỗ trợ 1:1 qua Zalo",
  "Hoàn tiền trong 7 ngày nếu chưa phù hợp",
];

// Slow announcement marquee: pauses on hover, static under reduced motion (see .marquee-track).
export default function GlobalTicker() {
  const pathname = usePathname();
  if (isAppShellRoute(pathname)) return null;

  return (
    <Link href="/courses" className="block surface-dark text-[13px] overflow-hidden group" aria-label="Xem khóa học: 21 Ngày Biến Video Thành Tài Sản đang mở đăng ký">
      <div className="marquee-track py-2.5" style={{ ["--marquee-duration" as string]: "40s" }} aria-hidden="true">
        {[...messages, ...messages, ...messages, ...messages].map((m, i) => (
          <span key={i} className="flex items-center gap-3 px-6 whitespace-nowrap text-stone-300 group-hover:text-white transition-colors">
            <Sparkles size={13} className="text-gold-light shrink-0" />
            {m}
          </span>
        ))}
      </div>
    </Link>
  );
}
