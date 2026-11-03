import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type { SupabaseClient } from '@supabase/supabase-js';

// A shop file kept in a private Supabase Storage bucket is written as `storage:<bucket>/<path>` in
// digital_assets.download_url. PDFs from there are stamped with the buyer's name, phone and order
// on every page, so a copy that gets passed around shows who it came from.
const PREFIX = 'storage:';
const LINK_TTL = 60 * 60; // signed links last 1 hour; the buyer can always ask for a new one

export type Buyer = { name: string; phone?: string | null; email?: string | null; orderId: string; paidAt?: string | null };

export function storageFile(url: string): { bucket: string; path: string } | null {
  if (!url.startsWith(PREFIX)) return null;
  const [bucket, ...rest] = url.slice(PREFIX.length).replace(/^\/+/, '').split('/');
  return bucket && rest.length ? { bucket, path: rest.join('/') } : null;
}

export function stampLine(b: Buyer) {
  const date = new Date(b.paidAt || Date.now()).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  return ['Bản của ' + b.name, b.phone, 'Đơn ' + b.orderId, date].filter(Boolean).join(' · ');
}

export async function stampPdf(original: Uint8Array, b: Buyer) {
  const pdf = await PDFDocument.load(original, { updateMetadata: false });
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(await readFile(join(process.cwd(), 'src/assets/fonts/BeVietnamPro-Medium.ttf')));
  const text = stampLine(b);
  const size = 6.5;
  // Skip the cover; every other page gets one quiet line under the footer.
  pdf.getPages().slice(1).forEach((page) => {
    const { width } = page.getSize();
    page.drawText(text, { x: (width - font.widthOfTextAtSize(text, size)) / 2, y: 12, size, font, color: rgb(0.55, 0.57, 0.55) });
  });
  pdf.setSubject(`Bản quyền của ${b.name} · Đơn ${b.orderId}`);
  pdf.setKeywords([b.orderId, b.email || '', b.phone || ''].filter(Boolean));
  return pdf.save();
}

// Signed link to the buyer's own copy. A stamped PDF is made once per order and reused.
export async function buyerLink(supabase: SupabaseClient, file: { bucket: string; path: string }, b: Buyer | null) {
  const store = supabase.storage.from(file.bucket);
  const name = file.path.split('/').pop()!;
  if (!b || !name.toLowerCase().endsWith('.pdf')) return signed(store, file.path, name);

  const copy = `stamped/${b.orderId}/${name}`;
  const { data: found } = await store.list(`stamped/${b.orderId}`, { search: name });
  if (!found?.some((f) => f.name === name)) {
    const { data: blob, error } = await store.download(file.path);
    if (error || !blob) throw new Error(`Cannot read ${file.bucket}/${file.path}: ${error?.message}`);
    const stamped = await stampPdf(new Uint8Array(await blob.arrayBuffer()), b);
    const { error: upErr } = await store.upload(copy, stamped, { contentType: 'application/pdf', upsert: true });
    if (upErr) throw new Error(`Cannot save stamped copy ${copy}: ${upErr.message}`);
  }
  return signed(store, copy, name);
}

async function signed(store: ReturnType<SupabaseClient['storage']['from']>, path: string, name: string) {
  const { data, error } = await store.createSignedUrl(path, LINK_TTL, { download: name });
  if (error || !data) throw new Error(`Cannot sign ${path}: ${error?.message}`);
  return data.signedUrl;
}
