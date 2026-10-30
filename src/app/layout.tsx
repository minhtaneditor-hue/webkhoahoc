import type { Metadata, Viewport } from "next";
import { Cormorant, Montserrat } from "next/font/google";
import "@/styles/globals.css";

// Design system (design-system/minh-tan-academy/MASTER.md): Cormorant headings + Montserrat body
const cormorant = Cormorant({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  title: {
    default: "Minh Tấn Academy | Khóa học làm video & sáng tạo nội dung",
    template: "%s | Minh Tấn Academy",
  },
  description: "Học làm video, xây dựng thương hiệu cá nhân và biến nội dung thành tài sản cùng Minh Tấn. Khóa học, ebook, preset và coaching 1:1.",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Minh Tấn Academy",
    images: ["/asset/avatar/hero_expert.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#1C1917",
};

import Navbar from "@/components/Navbar";
import GlobalTicker from "@/components/GlobalTicker";
import Footer from "@/components/Footer";
import AIChatAssistant from "@/components/AIChatAssistant";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${cormorant.variable} ${montserrat.variable}`}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[3000] btn btn-dark">
          Bỏ qua tới nội dung chính
        </a>
        <GlobalTicker />
        <Navbar />
        <div id="main">{children}</div>
        <Footer />
        <AIChatAssistant />
      </body>
    </html>
  );
}
