"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isAppShellRoute } from "./Navbar";

// Slim announcement bar. Static (no marquee) so it stays readable and motion-safe.
export default function GlobalTicker() {
  const pathname = usePathname();
  if (isAppShellRoute(pathname)) return null;

  return (
    <div className="surface-dark text-[13px]">
      <div className="container-lux flex items-center justify-center sm:justify-between gap-4 min-h-[40px] py-2">
        <p className="text-stone-300 text-center sm:text-left">
          <span className="text-gold-light font-semibold">Khóa “21 Ngày Biến Video Thành Tài Sản”</span>
          <span className="hidden sm:inline"> đang mở đăng ký — học trọn đời, hỗ trợ 1:1.</span>
        </p>
        <Link href="/courses" className="hidden sm:inline text-gold-light font-semibold underline-offset-4 hover:underline whitespace-nowrap">
          Xem khóa học →
        </Link>
      </div>
    </div>
  );
}
