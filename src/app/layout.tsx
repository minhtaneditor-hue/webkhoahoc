import type { Metadata, Viewport } from "next";
import { Playfair_Display, Be_Vietnam_Pro } from "next/font/google";
import "@/styles/globals.css";

// Two typefaces only: Playfair Display (bold, high-contrast serif) for headings,
// Be Vietnam Pro (sturdy sans designed for Vietnamese) for everything else.
const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700", "800"],
  variable: "--font-playfair",
  display: "swap",
});

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-be-vietnam",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  title: {
    default: "TẤN VA | Từ góc nhìn đến câu chuyện",
    template: "%s | TẤN VA",
  },
  description: "Học làm video, xây dựng thương hiệu cá nhân và biến nội dung thành tài sản cùng Minh Tấn. Khóa học, ebook, preset và coaching 1:1.",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "TẤN VA",
    images: ["/asset/avatar/hero_expert.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#242321",
};

import Navbar from "@/components/Navbar";
import GlobalTicker from "@/components/GlobalTicker";
import Footer from "@/components/Footer";
import AIChatAssistant from "@/components/AIChatAssistant";
import { SiteProvider } from "@/components/SiteContext";
import { getSiteSettings } from "@/lib/content";

// Admin edits trigger revalidatePath('/', 'layout'); this is the fallback refresh window.
export const revalidate = 300;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  return (
    <html lang="vi" className={`${playfair.variable} ${beVietnam.variable}`}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[3000] btn btn-dark">
          Bỏ qua tới nội dung chính
        </a>
        <SiteProvider settings={settings}>
          <GlobalTicker />
          <Navbar />
          <div id="main">{children}</div>
          <Footer />
          <AIChatAssistant />
        </SiteProvider>
      </body>
    </html>
  );
}
