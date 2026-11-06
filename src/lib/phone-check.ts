// Server-side check for Zalo numbers on the lead forms. It catches typos and made-up numbers, but
// cannot prove a number has a Zalo account: only opening it in Zalo shows that.

export type PhoneCheck = { ok: true; phone: string } | { ok: false; error: string };

const WRONG: PhoneCheck = { ok: false, error: 'Số Zalo chưa đúng. Bạn nhập số di động 10 số giúp mình nhé.' };
const MADE_UP = new Set(['0123456789', '0987654321']);

/** 912345678, 84912345678, +84 912 345 678 and +840912345678 all become 0912345678. */
export function checkZalo(raw: unknown): PhoneCheck {
  const text = String(raw ?? '').trim().slice(0, 24);
  const digits = text.replace(/\D/g, '');

  // A foreign number keeps its country code; only its length can be checked
  if (text.startsWith('+') && !digits.startsWith('84')) {
    return digits.length >= 8 && digits.length <= 15 ? { ok: true, phone: `+${digits}` } : WRONG;
  }

  let national = digits.startsWith('84') && digits.length >= 11 ? digits.slice(2) : digits;
  if (national.length === 9) national = `0${national}`;
  if (!/^0[35789]\d{8}$/.test(national)) return WRONG;
  if (MADE_UP.has(national) || /(\d)\1{7}$/.test(national)) return WRONG;
  return { ok: true, phone: national };
}
