import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Khu học tập' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
