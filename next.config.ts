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
  poweredByHeader: false,
  // Fonts and pictures read from disk by the link-preview images (src/lib/og.tsx)
  outputFileTracingIncludes: {
    '/opengraph-image': ['./src/assets/**/*'],
    '/courses/**': ['./src/assets/**/*'],
  },
  // Baseline security headers: no framing by other sites (clickjacking), no MIME sniffing,
  // no full URLs leaked to other sites, no camera/mic/location access.
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }];
  },
  images: {
    remotePatterns: [
      ...(supabaseHost ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }] : []),
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
};

export default nextConfig;
