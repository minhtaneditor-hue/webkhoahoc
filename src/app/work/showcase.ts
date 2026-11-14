// Kept out of WorkGallery.tsx ('use client'): a server page importing data from a client module
// gets a client reference instead of the array, which broke prerendering /work without Supabase data.
// Shown until the admin adds projects in /admin/work
export const SHOWCASE = [
  { id: 'p1', title: '2 Ngày 1 Đêm', category: 'TV', thumbnail_url: '/asset/du_an_tieu_bieu/project_2n1d.webp' },
  { id: 'p2', title: 'Anh Trai Say Hi — Movie', category: 'cinematic', thumbnail_url: '/asset/du_an_tieu_bieu/project_atsh_movie.jpg' },
  { id: 'p3', title: 'Anh Trai Say Hi — Las Vegas', category: 'cinematic', thumbnail_url: '/asset/du_an_tieu_bieu/project_atsh_vegas.webp' },
  { id: 'p4', title: 'Người Hùng Tí Hon', category: 'TV', thumbnail_url: '/asset/du_an_tieu_bieu/project_nhth.jpg' },
  { id: 'p5', title: 'Mái Ấm Tình Thương', category: 'TV', thumbnail_url: '/asset/du_an_tieu_bieu/project_matn.webp' },
  { id: 'p6', title: 'Ký Ức Vui Vẻ', category: 'TV', thumbnail_url: '/asset/du_an_tieu_bieu/project_kuvv.png' },
];
