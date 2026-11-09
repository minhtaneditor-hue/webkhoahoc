// Server-side check for the "nhận tài liệu" forms: is the address well formed, is the domain not a
// typo, and can the domain receive mail at all (it has MX records)? This cannot prove one mailbox
// exists: Gmail and most providers do not reveal that without a paid checking service.

export type EmailCheck =
  | { ok: true; email: string }
  | { ok: false; error: string; suggestion?: string };

// Real domains, safe to skip the DNS lookup. Several sit one letter from gmail.com, so they must never be "corrected".
const KNOWN = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.com.vn', 'ymail.com', 'rocketmail.com',
  'hotmail.com', 'outlook.com', 'outlook.com.vn', 'live.com', 'msn.com', 'icloud.com', 'me.com', 'mac.com',
  'mail.com', 'email.com', 'gmx.com', 'aol.com', 'proton.me', 'protonmail.com', 'zoho.com', 'yandex.com', 'naver.com', 'qq.com', '163.com',
]);
const POPULAR = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
const FAKE = /(^|\.)(example\.(com|net|org)|test\.com|test|invalid|local|localhost|example)$/;
const BAD_ENDING = /\.(con|cmo|ocm|comm|coom|cpm|xom|vom)$/;

function distance(a: string, b: string) {
  let row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const next = [i];
    for (let j = 1; j <= b.length; j++) next[j] = Math.min(row[j] + 1, next[j - 1] + 1, row[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    row = next;
  }
  return row[b.length];
}

/** gmai.com → gmail.com, gmail.con → gmail.com, gmail.com.vn → gmail.com, abc.con → abc.com */
function correctDomain(domain: string) {
  if (KNOWN.has(domain)) return null;
  if (domain.startsWith('gmail.')) return 'gmail.com';
  const close = POPULAR.find((d) => distance(domain, d) <= 2);
  if (close) return close;
  if (BAD_ENDING.test(domain)) return domain.replace(BAD_ENDING, '.com');
  return null;
}

/** true/false from DNS. null means DNS itself failed, which says nothing about the address. */
async function canReceiveMail(domain: string): Promise<boolean | null> {
  try {
    // DNS over HTTPS: only the domain is sent, never the address
    const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const { Status, Answer } = await res.json() as { Status: number; Answer?: { type: number; data: string }[] };
    if (Status === 3) return false; // the domain does not exist
    if (Status !== 0) return null;
    // A lone "0 ." record is RFC 7505 for "accepts no mail"
    return (Answer || []).some((r) => r.type === 15 && !/^\d+\s+\.?$/.test(r.data.trim()));
  } catch {
    return null;
  }
}

export async function checkEmail(raw: unknown): Promise<EmailCheck> {
  const email = String(raw ?? '').trim().toLowerCase();
  const wrong = { ok: false as const, error: 'Email sai. Bạn kiểm tra lại giúp mình nhé.' };
  if (email.length > 120) return wrong;
  const parts = email.split('@');
  if (parts.length !== 2) return wrong;
  const [local, domain] = parts;
  if (!/^[a-z0-9](?:[a-z0-9._%+'-]*[a-z0-9_+-])?$/.test(local) || local.includes('..') || local.length > 64) return wrong;
  if (!/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(domain)) return wrong;

  const corrected = correctDomain(domain);
  if (corrected) {
    const suggestion = `${local}@${corrected}`;
    return { ok: false, error: `Đuôi email sai. Có phải ý bạn là ${suggestion}?`, suggestion };
  }
  if (FAKE.test(domain)) return { ok: false, error: 'Email này không có thật. Bạn nhập email đang dùng giúp mình nhé.' };

  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    const name = local.split('+')[0];
    const letters = name.replace(/\./g, '');
    if (!/^[a-z0-9.]+$/.test(name) || letters.length < 5 || letters.length > 30) return { ok: false, error: 'Email Gmail này sai. Bạn kiểm tra lại phần trước dấu @ nhé.' };
    return { ok: true, email };
  }
  if (KNOWN.has(domain)) return { ok: true, email };

  // A DNS failure lets the address through, so an outage never turns real people away
  if ((await canReceiveMail(domain)) === false) return { ok: false, error: `Email sai: ${domain} không nhận được email. Bạn kiểm tra lại đuôi email nhé.` };
  return { ok: true, email };
}
