import type { Metadata } from 'next';
import HtmlLang from '@/components/HtmlLang';

// English pages (phase 1: home, coaching, students, about). The root layout stays the shell;
// this wrapper marks the content as English and the client effect does the same for <html>.
export const metadata: Metadata = {
  title: {
    default: 'TẤN VA',
    template: 'TẤN VA / %s',
  },
  description: 'Learn to film and edit video with your phone, with Minh Tấn: 1:1 online coaching for business owners and creators, scheduled in your time zone.',
  openGraph: { type: 'website', locale: 'en_US', alternateLocale: ['vi_VN'], siteName: 'TẤN VA' },
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="en">
      <HtmlLang lang="en" />
      {children}
    </div>
  );
}
