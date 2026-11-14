import { SITE_URL } from '@/lib/site-url';

// One description of the brand and its founder, shared by every page's structured data and by
// /llms.txt, so search engines and AI assistants see the same facts everywhere.
// Other names people search for; /about shows them too, so they match visible text.
export const BRAND_ALIASES = ['Tấn VA', 'Minh Tấn Video Advisor', 'Minh Tấn Academy', 'Tấn Academy'];
export const SOCIAL_LINKS = [
  'https://www.facebook.com/profile.php?id=61583837884143',
  'https://www.youtube.com/@minhtanvideoadvisor',
  'https://www.tiktok.com/@minhtanvideoadvisor',
];

// Stable ids let pages point at the same organization and person instead of repeating them
export const ORG_ID = `${SITE_URL}/#organization`;
export const PERSON_ID = `${SITE_URL}/about#minh-tan`;

export const ORGANIZATION = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: 'TẤN VA',
  alternateName: BRAND_ALIASES,
  url: SITE_URL,
  logo: `${SITE_URL}/brand/tan-va-mark.png`,
  founder: { '@id': PERSON_ID },
  sameAs: SOCIAL_LINKS,
};

// Facts here come from the story on /about; keep them in step with that page.
export const PERSON = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'Minh Tấn',
  url: `${SITE_URL}/about`,
  image: `${SITE_URL}/asset/avatar/hero_expert.jpg`,
  jobTitle: 'Giảng viên và cố vấn video',
  worksFor: { '@id': ORG_ID },
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'Trường Cao đẳng Phát thanh – Truyền hình II' },
  knowsAbout: ['Quay video bằng điện thoại', 'Dựng video', 'Video ngắn bán hàng', 'Dựng video bằng AI', 'Viết kịch bản video', 'Xây dựng thương hiệu cá nhân', 'Sản xuất chương trình truyền hình'],
  sameAs: SOCIAL_LINKS,
};
