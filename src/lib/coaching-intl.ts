// Coaching for customers abroad (/en/coaching and /en), priced in USD; the Vietnamese packages in VND
// live on /coaching. Each session is 2 hours, 1:1 online. Paid by a PayPal or Wise link sent in chat:
// there is no card checkout on the site.
export const COACHING_PACKAGES_USD = [
  {
    name: '10-session program',
    price: 990,
    duration: '10 sessions · 1:1 online · 2 hours each',
    features: [
      '6 sessions of filming and editing with Minh Tấn',
      'Then 4 sessions of ad buying (Facebook and TikTok ads) with a TẤN VA partner expert',
      'Your ads sessions are scheduled while you take the media sessions',
      'Assignments with feedback on your own videos',
    ],
    cta: 'Get started',
    featured: true,
  },
  {
    name: '6-session media program',
    price: 590,
    duration: '6 sessions · 1:1 online · 2 hours each',
    features: [
      'Filming and editing with your phone, 1:1 with Minh Tấn',
      'Program shaped around your business and your goals',
      'Assignments with feedback on your own videos',
    ],
    cta: 'Book now',
    featured: false,
  },
  {
    name: 'Single session',
    price: 99,
    duration: '1 session · 1:1 online · 2 hours',
    features: [
      'Try 1:1 coaching before a full program',
      'Or add an extra session to a program',
      'Bring one topic or one video to work on',
    ],
    cta: 'Book now',
    featured: false,
  },
];

// Included in every package
// Most students abroad are overseas Vietnamese: sessions are taught in Vietnamese
export const COACHING_INCLUDED = ['Taught in Vietnamese', 'Sessions scheduled in your time zone', 'Questions by message between sessions'];
