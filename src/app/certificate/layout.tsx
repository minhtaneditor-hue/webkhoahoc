import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Chứng chỉ' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
