import type { Metadata } from "next";
import { Inter, Manrope, Cabin, Instrument_Serif } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const cabin = Cabin({
  subsets: ["latin"],
  variable: "--font-cabin",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
});

export const metadata: Metadata = {
  title: "AI-Integrated LMS | Premium Online Learning",
  description: "Autonomous training system with AI agents, DRM security, and automated payments.",
};

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChatAssistant from "@/components/AIChatAssistant";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} ${cabin.variable} ${instrumentSerif.variable}`}>
      <body className="antialiased">
        <Navbar />
        {children}
        <Footer />
        <AIChatAssistant />
      </body>
    </html>
  );
}
