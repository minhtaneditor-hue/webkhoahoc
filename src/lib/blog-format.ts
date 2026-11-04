// "Cách quay video đẹp" -> "cach-quay-video-dep"
export function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const formatPostDate = (iso: string) =>
  new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(iso));

export const readingMinutes = (content: string) =>
  Math.max(1, Math.round(content.trim().split(/\s+/).length / 200));
