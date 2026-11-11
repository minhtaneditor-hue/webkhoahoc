'use client';

import type { KichBan } from './templates';

// Downloads for a finished script: Word (.docx built in the browser) and PDF (the browser's
// own "Save as PDF" print dialog, which keeps Vietnamese text exact without embedding fonts).

function fileName(k: KichBan, ext: string) {
  const base = (k.tieu_de || 'kich-ban').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd')
    .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 60);
  return `${base || 'kich-ban'}.${ext}`;
}

export function asText(k: KichBan) {
  return [
    k.tieu_de.toUpperCase(),
    '',
    'PHƯƠNG ÁN HOOK',
    ...k.hook.map((h, i) => `${i + 1}. "${h.loi_noi}"${h.chu_tren_man_hinh ? ` (chữ: ${h.chu_tren_man_hinh})` : ''}`),
    '',
    'KỊCH BẢN',
    ...k.doan.flatMap((d) => [
      `[${d.thoi_gian}] ${d.muc_dich}`,
      `Lời nói: ${d.loi_noi}`,
      ...(d.chu_tren_man_hinh ? [`Chữ trên màn hình: ${d.chu_tren_man_hinh}`] : []),
      `Cảnh quay: ${d.canh_quay}`,
      '',
    ]),
    `LỜI KÊU GỌI: ${k.loi_keu_goi}`,
    '',
    `CAPTION: ${k.caption}`,
    '',
    'MẸO QUAY',
    ...k.meo_quay.map((m) => `- ${m}`),
    '',
    'Viết bằng công cụ của TẤN VA · minhtanacademy.com/viet-kich-ban',
  ].join('\n');
}

export async function downloadWord(k: KichBan) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');
  const label = (l: string, v: string) => new Paragraph({ children: [new TextRun({ text: `${l}: `, bold: true }), new TextRun(v)], spacing: { after: 60 } });
  const doc = new Document({
    styles: { default: { document: { run: { font: 'Arial', size: 24 } } } },
    sections: [{
      children: [
        new Paragraph({ text: k.tieu_de, heading: HeadingLevel.TITLE }),
        new Paragraph({ text: 'Phương án hook', heading: HeadingLevel.HEADING_2 }),
        ...k.hook.map((h, i) => new Paragraph({
          children: [new TextRun({ text: `${i + 1}. “${h.loi_noi}”`, bold: true }), ...(h.chu_tren_man_hinh ? [new TextRun(`  (chữ: ${h.chu_tren_man_hinh})`)] : [])],
          spacing: { after: 80 },
        })),
        new Paragraph({ text: 'Kịch bản', heading: HeadingLevel.HEADING_2 }),
        ...k.doan.flatMap((d) => [
          new Paragraph({ text: `${d.thoi_gian} · ${d.muc_dich}`, heading: HeadingLevel.HEADING_3 }),
          label('Lời nói', d.loi_noi),
          ...(d.chu_tren_man_hinh ? [label('Chữ trên màn hình', d.chu_tren_man_hinh)] : []),
          label('Cảnh quay', d.canh_quay),
        ]),
        new Paragraph({ text: 'Lời kêu gọi', heading: HeadingLevel.HEADING_2 }),
        new Paragraph(k.loi_keu_goi),
        new Paragraph({ text: 'Caption', heading: HeadingLevel.HEADING_2 }),
        new Paragraph(k.caption),
        new Paragraph({ text: 'Mẹo quay', heading: HeadingLevel.HEADING_2 }),
        ...k.meo_quay.map((m) => new Paragraph({ text: m, bullet: { level: 0 } })),
        new Paragraph({ children: [new TextRun({ text: 'Viết bằng công cụ của TẤN VA · minhtanacademy.com/viet-kich-ban', italics: true, color: '888888', size: 18 })], spacing: { before: 400 } }),
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

export function printPdf(k: KichBan) {
  // Print from a hidden iframe: no pop-up to be blocked, and the page itself stays put.
  document.getElementById('kb-print')?.remove();
  const frame = document.createElement('iframe');
  frame.id = 'kb-print';
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(frame);
  const w = frame.contentWindow;
  if (!w) return false;
  w.document.open();
  w.document.write(`<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>${esc(fileName(k, 'pdf').replace(/\.pdf$/, ''))}</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;color:#1c1917;max-width:720px;margin:32px auto;padding:0 20px;line-height:1.5}
  h1{font-size:24px;margin:0 0 16px} h2{font-size:16px;text-transform:uppercase;letter-spacing:.04em;color:#9a3412;margin:24px 0 8px;border-bottom:1px solid #e7e5e4;padding-bottom:4px}
  .seg{margin:0 0 14px;break-inside:avoid} .t{font-weight:700} p{margin:2px 0} .l{font-weight:700} .foot{margin-top:32px;color:#888;font-size:12px}
  @media print{body{margin:0 auto}}
</style></head><body>
<h1>${esc(k.tieu_de)}</h1>
<h2>Phương án hook</h2>${k.hook.map((h, i) => `<p><b>${i + 1}. “${esc(h.loi_noi)}”</b>${h.chu_tren_man_hinh ? ` (chữ: ${esc(h.chu_tren_man_hinh)})` : ''}</p>`).join('')}
<h2>Kịch bản</h2>${k.doan.map((d) => `<div class="seg"><p class="t">${esc(d.thoi_gian)} · ${esc(d.muc_dich)}</p><p><span class="l">Lời nói:</span> ${esc(d.loi_noi)}</p>${d.chu_tren_man_hinh ? `<p><span class="l">Chữ trên màn hình:</span> ${esc(d.chu_tren_man_hinh)}</p>` : ''}<p><span class="l">Cảnh quay:</span> ${esc(d.canh_quay)}</p></div>`).join('')}
<h2>Lời kêu gọi</h2><p>${esc(k.loi_keu_goi)}</p>
<h2>Caption</h2><p>${esc(k.caption)}</p>
<h2>Mẹo quay</h2><ul>${k.meo_quay.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>
<p class="foot">Viết bằng công cụ của TẤN VA · minhtanacademy.com/viet-kich-ban</p>
</body></html>`);
  w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 300);
  return true;
}
