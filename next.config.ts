import type { NextConfig } from "next";

// Images uploaded from the admin live in Supabase Storage; YouTube thumbnails are used as showreel stills.
const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "").hostname;
  } catch {
    return "";
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...(supabaseHost ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }] : []),
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
};

export default nextConfig;
