import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.minhtanacademy.com';

// Search engines index the public pages only; learning, account, payment and admin stay out.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/learn', '/dashboard', '/auth', '/payment', '/certificate'] },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
