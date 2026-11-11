// Countries students can be from, with a map point (roughly the main city where
// the Vietnamese community lives, not the geographic centre).
export type Country = { code: string; name: string; lat: number; lng: number };

export const COUNTRIES: Country[] = [
  { code: 'VN', name: 'Việt Nam', lat: 16.0, lng: 106.5 },
  { code: 'US', name: 'Mỹ', lat: 37.5, lng: -98 },
  { code: 'CA', name: 'Canada', lat: 45.5, lng: -75 },
  { code: 'AU', name: 'Úc', lat: -33.9, lng: 151 },
  { code: 'NZ', name: 'New Zealand', lat: -36.8, lng: 174.8 },
  { code: 'GB', name: 'Anh', lat: 51.5, lng: -0.1 },
  { code: 'FR', name: 'Pháp', lat: 48.9, lng: 2.4 },
  { code: 'DE', name: 'Đức', lat: 52.5, lng: 13.4 },
  { code: 'NL', name: 'Hà Lan', lat: 52.4, lng: 4.9 },
  { code: 'BE', name: 'Bỉ', lat: 50.8, lng: 4.4 },
  { code: 'CH', name: 'Thụy Sĩ', lat: 47.4, lng: 8.5 },
  { code: 'CZ', name: 'Séc', lat: 50.1, lng: 14.4 },
  { code: 'PL', name: 'Ba Lan', lat: 52.2, lng: 21 },
  { code: 'NO', name: 'Na Uy', lat: 59.9, lng: 10.8 },
  { code: 'SE', name: 'Thụy Điển', lat: 59.3, lng: 18.1 },
  { code: 'FI', name: 'Phần Lan', lat: 60.2, lng: 24.9 },
  { code: 'DK', name: 'Đan Mạch', lat: 55.7, lng: 12.6 },
  { code: 'IT', name: 'Ý', lat: 41.9, lng: 12.5 },
  { code: 'ES', name: 'Tây Ban Nha', lat: 40.4, lng: -3.7 },
  { code: 'RU', name: 'Nga', lat: 55.8, lng: 37.6 },
  { code: 'JP', name: 'Nhật Bản', lat: 35.7, lng: 139.7 },
  { code: 'KR', name: 'Hàn Quốc', lat: 37.6, lng: 127 },
  { code: 'TW', name: 'Đài Loan', lat: 25, lng: 121.5 },
  { code: 'CN', name: 'Trung Quốc', lat: 31.2, lng: 121.5 },
  { code: 'HK', name: 'Hồng Kông', lat: 22.3, lng: 114.2 },
  { code: 'SG', name: 'Singapore', lat: 1.35, lng: 103.8 },
  { code: 'MY', name: 'Malaysia', lat: 3.1, lng: 101.7 },
  { code: 'TH', name: 'Thái Lan', lat: 13.8, lng: 100.5 },
  { code: 'KH', name: 'Campuchia', lat: 11.6, lng: 104.9 },
  { code: 'LA', name: 'Lào', lat: 18, lng: 102.6 },
  { code: 'PH', name: 'Philippines', lat: 14.6, lng: 121 },
  { code: 'ID', name: 'Indonesia', lat: -6.2, lng: 106.8 },
  { code: 'IN', name: 'Ấn Độ', lat: 19.1, lng: 72.9 },
  { code: 'AE', name: 'UAE (Dubai)', lat: 25.2, lng: 55.3 },
  { code: 'IL', name: 'Israel', lat: 32.1, lng: 34.8 },
  { code: 'ZA', name: 'Nam Phi', lat: -26.2, lng: 28 },
  { code: 'BR', name: 'Brazil', lat: -23.5, lng: -46.6 },
  { code: 'MX', name: 'Mexico', lat: 19.4, lng: -99.1 },
];

export const COUNTRY_BY_CODE = Object.fromEntries(COUNTRIES.map((c) => [c.code, c]));

/**
 * Small flag picture (Windows has no emoji flags, so use an image). Served from public/flags
 * (40px PNGs from flagcdn.com) so pages skip a connection to another site.
 */
export function flagUrl(code: string) {
  return `/flags/${code.toLowerCase()}.png`;
}

export const COUNTRY_OPTIONS = [
  { value: '', label: 'Chưa chọn' },
  ...COUNTRIES.map((c) => ({ value: c.code, label: c.name })),
];
