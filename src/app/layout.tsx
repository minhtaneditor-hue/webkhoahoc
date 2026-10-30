import type { Metadata } from "next";
import { Inter, Manrope, Cabin, Instrument_Serif } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin", "vietnamese"],
  variable: "--font-manrope",
});

const cabin = Cabin({
  subsets: ["latin", "vietnamese"],
  variable: "--font-cabin",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
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
    <html lang="vi" className={`${inter.variable} ${manrope.variable} ${cabin.variable} ${instrumentSerif.variable}`}>
      <body className="antialiased">
        <GlobalTicker />
        <Navbar />
        {children}
        <Footer />
        <AIChatAssistant />
      </body>
    </html>
  );
}
