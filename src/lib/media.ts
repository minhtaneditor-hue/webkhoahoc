// Turns a pasted link into something the site can show: an embeddable player,
// a direct video/image, or (unknown hosts) a plain link that opens in a new tab.

export type MediaKind = 'youtube' | 'tiktok' | 'facebook' | 'instagram' | 'drive' | 'video' | 'image' | 'link';

export type ParsedMedia = {
  kind: MediaKind;
  url: string;
  embedUrl?: string;
  thumbnail?: string;
  label: string;
};

const LABELS: Record<MediaKind, string> = {
  youtube: 'YouTube',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  instagram: 'Instagram',
  drive: 'Google Drive',
  video: 'Video',
  image: 'Ảnh',
  link: 'Link',
};

export function parseMedia(raw?: string | null): ParsedMedia | null {
  const url = raw?.trim();
  if (!url) return null;
  const make = (kind: MediaKind, extra: Partial<ParsedMedia> = {}): ParsedMedia => ({ kind, url, label: LABELS[kind], ...extra });

  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return make('youtube', { embedUrl: `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0&modestbranding=1&playsinline=1`, thumbnail: `https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg` });

  const tt = url.match(/tiktok\.com\/.*\/video\/(\d+)/);
  if (tt) return make('tiktok', { embedUrl: `https://www.tiktok.com/embed/v2/${tt[1]}` });

  const ig = url.match(/instagram\.com\/(?:reel|p|tv)\/([\w-]+)/);
  if (ig) return make('instagram', { embedUrl: `https://www.instagram.com/reel/${ig[1]}/embed` });

  if (/(facebook\.com|fb\.watch)\//.test(url)) {
    return make('facebook', { embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false` });
  }

  const drive = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (drive) return make('drive', { embedUrl: `https://drive.google.com/file/d/${drive[1]}/preview` });

  const path = url.split('?')[0].toLowerCase();
  if (/\.(mp4|webm|mov|m4v)$/.test(path)) return make('video');
  if (/\.(jpe?g|png|webp|gif|avif)$/.test(path)) return make('image', { thumbnail: url });

  return make('link');
}

/** Best picture to show for one side of a before/after: uploaded thumbnail, then the media's own. */
export function sideThumbnail(media: ParsedMedia | null, uploaded?: string | null) {
  return uploaded || media?.thumbnail || null;
}

// Student work categories = the student's industry (admin select + public filter)
export const WORK_CATEGORIES = [
  { value: 'bat-dong-san', label: 'Bất động sản' },
  { value: 'am-thuc', label: 'Ẩm thực & F&B' },
  { value: 'lam-dep', label: 'Làm đẹp, nail & spa' },
  { value: 'du-lich', label: 'Du lịch & vlog' },
  { value: 'san-pham', label: 'Kinh doanh sản phẩm' },
  { value: 'me-va-be', label: 'Mẹ & bé' },
  { value: 'sang-tao', label: 'Sáng tạo nội dung' },
  { value: 'khac', label: 'Ngành khác' },
];
