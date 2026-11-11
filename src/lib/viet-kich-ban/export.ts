'use client';

import type { KichBan } from './templates';

// Downloads for a finished script, branded: a header ("Minh Tấn Academy"), a footer with the
// disclaimer and contact links, and for free accounts a diagonal website watermark on every page.
// Word is built in the browser (docx); PDF goes through the browser's print dialog
// ("Save as PDF"), which keeps Vietnamese text exact without embedding fonts.

export type DocBrand = {
  phone: string;
  zaloHref: string;
  zaloGroupHref?: string; // only when a community group link is set in Admin
  fanpage?: string;
  watermark: boolean;     // free accounts
};

const SITE = 'minhtanacademy.com';
const BRAND = 'Minh Tấn Academy';
const DISCLAIMER = 'Kịch bản do AI tạo từ nội dung bạn cung cấp và có thể có sai lệch. Vui lòng kiểm tra lại trước khi sử dụng. Minh Tấn Academy không chịu trách nhiệm về thông tin trong kịch bản.';
const FREE_NOTE = `Bản miễn phí. Hội viên tải file không có watermark: ${SITE}/hoi-vien`;

function fileName(k: KichBan, ext: string) {
  const base = (k.tieu_de || 'kich-ban').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd')
    .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 60);
  return `${base || 'kich-ban'}.${ext}`;
}

const shortUrl = (u: string) => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

function contactParts(b: DocBrand) {
  return [
    { label: 'Zalo', text: b.phone, href: b.zaloHref },
    ...(b.zaloGroupHref ? [{ label: 'Cộng đồng Zalo', text: shortUrl(b.zaloGroupHref), href: b.zaloGroupHref }] : []),
    ...(b.fanpage ? [{ label: 'Fanpage', text: 'Facebook Minh Tấn Academy', href: b.fanpage }] : []),
    { label: 'Web', text: SITE, href: `https://${SITE}` },
  ];
}

// Transparent PNG with the website written diagonally, light enough to read the script through it.
function watermarkPng(): Promise<Uint8Array> {
  const c = document.createElement('canvas');
  c.width = 1200;
  c.height = 1600;
  const ctx = c.getContext('2d')!;
  ctx.translate(c.width / 2, c.height / 2);
  ctx.rotate(-Math.PI / 5);
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(154, 52, 18, 0.10)';
  ctx.font = 'bold 120px Arial, sans-serif';
  ctx.fillText(SITE, 0, -40);
  ctx.font = 'bold 64px Arial, sans-serif';
  ctx.fillText(BRAND, 0, 70);
  return new Promise((ok) => c.toBlob(async (b) => ok(new Uint8Array(await b!.arrayBuffer())), 'image/png'));
}

export async function downloadWord(k: KichBan, brand: DocBrand) {
  const d = await import('docx');
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, Header, Footer, AlignmentType, PageNumber, ExternalHyperlink, ImageRun, BorderStyle } = d;
  const GOLD = '9A3412';
  const GREY = '78716C';
  const label = (l: string, v: string) => new Paragraph({ children: [new TextRun({ text: `${l}: `, bold: true }), new TextRun(v)], spacing: { after: 60 } });

  const wm = brand.watermark ? await watermarkPng() : null;
  const header = new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'D6C7B8', space: 4 } },
        children: [
          ...(wm ? [new ImageRun({
            type: 'png',
            data: wm,
            transformation: { width: 600, height: 800 },
            floating: {
              horizontalPosition: { relative: d.HorizontalPositionRelativeFrom.PAGE, align: d.HorizontalPositionAlign.CENTER },
              verticalPosition: { relative: d.VerticalPositionRelativeFrom.PAGE, align: d.VerticalPositionAlign.CENTER },
              behindDocument: true,
              allowOverlap: true,
            },
          })] : []),
          new TextRun({ text: 'KỊCH BẢN VIDEO  ·  ', color: GREY, size: 16 }),
          new TextRun({ text: BRAND, bold: true, color: GOLD, size: 18 }),
          new TextRun({ text: `  ·  ${SITE}`, color: GREY, size: 16 }),
        ],
      }),
    ],
  });

  const contacts = contactParts(brand);
  const footer = new Footer({
    children: [
      new Paragraph({
        border: { top: { style: BorderStyle.SINGLE, size: 6, color: 'D6C7B8', space: 4 } },
        children: [new TextRun({ text: DISCLAIMER, italics: true, color: GREY, size: 15 })],
        spacing: { after: 40 },
      }),
      new Paragraph({
        children: contacts.flatMap((c, i) => [
          ...(i ? [new TextRun({ text: '  ·  ', color: GREY, size: 15 })] : []),
          new TextRun({ text: `${c.label}: `, color: GREY, size: 15 }),
          new ExternalHyperlink({ link: c.href, children: [new TextRun({ text: c.text, color: GOLD, size: 15 })] }),
        ]),
        spacing: { after: 40 },
      }),
      ...(brand.watermark ? [new Paragraph({ children: [new TextRun({ text: FREE_NOTE, bold: true, color: GOLD, size: 15 })], spacing: { after: 40 } })] : []),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ children: ['Trang ', PageNumber.CURRENT, '/', PageNumber.TOTAL_PAGES], color: GREY, size: 15 })],
      }),
    ],
  });

  const doc = new Document({
    creator: BRAND,
    title: k.tieu_de,
    styles: { default: { document: { run: { font: 'Arial', size: 24 } } } },
    sections: [{
      headers: { default: header },
      footers: { default: footer },
      children: [
        new Paragraph({ text: k.tieu_de, heading: HeadingLevel.TITLE }),
        new Paragraph({ text: 'Phương án hook', heading: HeadingLevel.HEADING_2 }),
        ...k.hook.map((h, i) => new Paragraph({
          children: [new TextRun({ text: `${i + 1}. “${h.loi_noi}”`, bold: true }), ...(h.chu_tren_man_hinh ? [new TextRun(`  (chữ: ${h.chu_tren_man_hinh})`)] : [])],
          spacing: { after: 80 },
        })),
        new Paragraph({ text: 'Kịch bản', heading: HeadingLevel.HEADING_2 }),
        ...k.doan.flatMap((x) => [
          new Paragraph({ text: `${x.thoi_gian} · ${x.muc_dich}`, heading: HeadingLevel.HEADING_3 }),
          label('Lời nói', x.loi_noi),
          ...(x.chu_tren_man_hinh ? [label('Chữ trên màn hình', x.chu_tren_man_hinh)] : []),
          label('Cảnh quay', x.canh_quay),
        ]),
        new Paragraph({ text: 'Lời kêu gọi', heading: HeadingLevel.HEADING_2 }),
        new Paragraph(k.loi_keu_goi),
        new Paragraph({ text: 'Caption', heading: HeadingLevel.HEADING_2 }),
        new Paragraph(k.caption),
        new Paragraph({ text: 'Mẹo quay', heading: HeadingLevel.HEADING_2 }),
        ...k.meo_quay.map((m) => new Paragraph({ text: m, bullet: { level: 0 } })),
      ],
    }],
  });
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName(k, 'docx');
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export function printPdf(k: KichBan, brand: DocBrand) {
  // Print from a hidden iframe: no pop-up to be blocked, and the page itself stays put.
  // Fixed-position header, footer and watermark repeat on every printed page.
  document.getElementById('kb-print')?.remove();
  const frame = document.createElement('iframe');
  frame.id = 'kb-print';
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(frame);
  const w = frame.contentWindow;
  if (!w) return false;
  const contacts = contactParts(brand).map((c) => `${esc(c.label)}: <a href="${esc(c.href)}">${esc(c.text)}</a>`).join(' &nbsp;·&nbsp; ');
  w.document.open();
  w.document.write(`<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>${esc(fileName(k, 'pdf').replace(/\.pdf$/, ''))}</title>
<style>
  @page{size:A4;margin:10mm 14mm}
  body{font-family:Arial,Helvetica,sans-serif;color:#1c1917;line-height:1.5;margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .hd{position:fixed;top:0;left:0;right:0;background:#fff;text-align:right;font-size:10px;color:#78716c;border-bottom:1px solid #d6c7b8;padding-bottom:3px}
  .hd b{color:#9a3412}
  .ft{position:fixed;bottom:0;left:0;right:0;background:#fff;font-size:9.5px;color:#78716c;border-top:1px solid #d6c7b8;padding-top:4px}
  .ft a{color:#9a3412;text-decoration:none} .ft p{margin:0 0 2px} .ft .free{color:#9a3412;font-weight:700}
  .wm{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-36deg);text-align:center;color:rgba(154,52,18,.09);font-weight:700;white-space:nowrap;z-index:-1}
  .wm .a{font-size:64px} .wm .b{font-size:34px}
  h1{font-size:24px;margin:0 0 16px} h2{font-size:15px;text-transform:uppercase;letter-spacing:.04em;color:#9a3412;margin:22px 0 8px;border-bottom:1px solid #e7e5e4;padding-bottom:4px}
  table.pg{width:100%;border-collapse:collapse} table.pg td{padding:0;vertical-align:top} .sp-h{height:12mm} .sp-f{height:27mm}
  .seg{margin:0 0 14px;break-inside:avoid} .t{font-weight:700} p{margin:2px 0} .l{font-weight:700}
</style></head><body>
<div class="hd">KỊCH BẢN VIDEO · <b>${BRAND}</b> · ${SITE}</div>
${brand.watermark ? `<div class="wm"><div class="a">${SITE}</div><div class="b">${BRAND}</div></div>` : ''}
<div class="ft"><p><i>${esc(DISCLAIMER)}</i></p><p>${contacts}</p>${brand.watermark ? `<p class="free">${esc(FREE_NOTE)}</p>` : ''}</div>
<table class="pg"><thead><tr><td><div class="sp-h"></div></td></tr></thead><tfoot><tr><td><div class="sp-f"></div></td></tr></tfoot><tbody><tr><td>
<h1>${esc(k.tieu_de)}</h1>
<h2>Phương án hook</h2>${k.hook.map((h, i) => `<p><b>${i + 1}. “${esc(h.loi_noi)}”</b>${h.chu_tren_man_hinh ? ` (chữ: ${esc(h.chu_tren_man_hinh)})` : ''}</p>`).join('')}
<h2>Kịch bản</h2>${k.doan.map((x) => `<div class="seg"><p class="t">${esc(x.thoi_gian)} · ${esc(x.muc_dich)}</p><p><span class="l">Lời nói:</span> ${esc(x.loi_noi)}</p>${x.chu_tren_man_hinh ? `<p><span class="l">Chữ trên màn hình:</span> ${esc(x.chu_tren_man_hinh)}</p>` : ''}<p><span class="l">Cảnh quay:</span> ${esc(x.canh_quay)}</p></div>`).join('')}
<h2>Lời kêu gọi</h2><p>${esc(k.loi_keu_goi)}</p>
<h2>Caption</h2><p>${esc(k.caption)}</p>
<h2>Mẹo quay</h2><ul>${k.meo_quay.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>
</td></tr></tbody></table>
</body></html>`);
  w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 300);
  return true;
}
