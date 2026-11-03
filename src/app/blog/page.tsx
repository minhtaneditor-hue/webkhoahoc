import { redirect } from 'next/navigation';

// Blog is hidden until there are real posts (the old page only had placeholder titles).
export default function BlogPage() {
  redirect('/');
}
