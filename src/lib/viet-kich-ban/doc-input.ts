'use client';

// Reads a script file the user uploads on /viet-kich-ban (tab "Sửa kịch bản"), in the browser.
// .docx and .txt become plain text here; a PDF is passed on as base64 and read by Claude on the server.

export type ScriptFile = { text: string } | { pdf: string } | { error: string };

const MAX_FILE = 2_500_000; // bytes; keeps the request under Vercel's 4.5 MB limit

// A .docx is a zip; the text lives in word/document.xml. Uses the browser's own inflate, no library.
async function docxText(buf: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buf);
  const view = new DataView(buf);
  // Find the entry through the central directory (sizes in local headers may be zero).
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 66_000); i--) {
    if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('not a zip');
  const count = view.getUint16(eocd + 10, true);
  let p = view.getUint32(eocd + 16, true);
  for (let n = 0; n < count; n++) {
    if (view.getUint32(p, true) !== 0x02014b50) break;
    const method = view.getUint16(p + 10, true);
    const csize = view.getUint32(p + 20, true);
    const nameLen = view.getUint16(p + 28, true);
    const extraLen = view.getUint16(p + 30, true);
    const commentLen = view.getUint16(p + 32, true);
    const local = view.getUint32(p + 42, true);
    const name = new TextDecoder().decode(bytes.subarray(p + 46, p + 46 + nameLen));
    if (name === 'word/document.xml') {
      const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
      const data = bytes.slice(start, start + csize);
      const xml = method === 8
        ? await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text()
        : new TextDecoder().decode(data);
      // One line per paragraph; a table row becomes one line with cells joined by " | "
      // (scripts are often a Thời gian | Cảnh quay | Lời thoại table). Tabs and breaks become spaces.
      const text = xml
        .replace(/<w:tc[ >][\s\S]*?<\/w:tc>/g, (cell) => cell.replace(/<\/w:p>/g, ' ').replace(/<w:br[^>]*\/>/g, ' ') + '\u0001')
        .replace(/<\/w:tr>/g, '\u0002')
        .replace(/<w:tab\/>/g, ' ')
        .replace(/<w:br[^>]*\/>/g, '\n')
        .replace(/<\/w:p>/g, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&')
        .replace(/[ \t]*\u0001[ \t]*\u0002/g, '\n')   // last cell of a row
        .replace(/[ \t]*\u0001[ \t]*/g, ' | ')        // between cells
        .replace(/\u0002/g, '\n')
        .replace(/[ \t]{2,}/g, ' ');
      return text.split('\n').map((l) => l.trim()).join('\n').replace(/\n{3,}/g, '\n\n').trim();
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  throw new Error('no document.xml');
}

function base64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

export async function readScriptFile(file: File): Promise<ScriptFile> {
  const name = file.name.toLowerCase();
  if (file.size > MAX_FILE) return { error: 'File lớn quá 2,5 MB. Bạn dán chữ vào ô nhé.' };
  try {
    if (name.endsWith('.txt')) return { text: (await file.text()).trim() };
    if (name.endsWith('.docx')) {
      const text = await docxText(await file.arrayBuffer());
      return text ? { text } : { error: 'File Word này không có chữ. Bạn dán chữ vào ô nhé.' };
    }
    if (name.endsWith('.pdf')) return { pdf: base64(await file.arrayBuffer()) };
    if (name.endsWith('.doc')) return { error: 'File .doc đời cũ chưa đọc được. Bạn mở bằng Word, lưu lại thành .docx hoặc PDF rồi tải lên nhé.' };
    return { error: 'Chỉ nhận file .docx, .pdf hoặc .txt.' };
  } catch {
    return { error: 'Không đọc được file này. Bạn dán chữ vào ô nhé.' };
  }
}
