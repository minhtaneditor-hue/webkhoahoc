export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * POST /api/cham-video/loi-thoai  (body: audio/wav, 8 kHz mono, at most ~2 minutes)
 * Turns the speech of a video into text so visitors don't have to paste it.
 * The browser sends only the sound track; it goes to 11max (ElevenLabs Scribe v2) and the
 * transcription is deleted there as soon as we have the text. Nothing is stored here.
 */

const BASE = 'https://api.11max.id.vn';
const MAX_BYTES = 4_200_000;          // under Vercel's 4.5 MB request limit (~2 min of 16 kHz or ~4 min of 8 kHz mono WAV)
const DAILY_LIMIT = Number(process.env.STT_DAILY_LIMIT) || 6; // per IP; scoring allows 3, this leaves room for retries
const POLL_MS = 1500;
const POLL_FOR_MS = 30_000;

const hits = new Map<string, { day: string; n: number }>();
function allow(ip: string) {
  const day = new Date().toISOString().slice(0, 10);
  const h = hits.get(ip);
  if (!h || h.day !== day) { hits.set(ip, { day, n: 1 }); return true; }
  if (h.n >= DAILY_LIMIT) return false;
  h.n++;
  return true;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: Request) {
  const key = process.env.ELEVENMAX_API_KEY;
  if (!key) return Response.json({ error: 'Chưa bật tự lấy lời thoại. Bạn dán lời nói vào ô bên dưới nhé.' }, { status: 503 });

  const type = req.headers.get('content-type') || '';
  if (!type.startsWith('audio/wav')) return Response.json({ error: 'Định dạng âm thanh không hợp lệ.' }, { status: 400 });
  const audio = await req.arrayBuffer();
  if (audio.byteLength < 2000) return Response.json({ text: '' }); // silent or no sound track
  if (audio.byteLength > MAX_BYTES) return Response.json({ error: 'Phần tiếng dài quá.' }, { status: 413 });

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  if (!allow(ip)) return Response.json({ error: 'Hôm nay bạn đã lấy lời thoại nhiều lần rồi. Bạn dán lời nói vào ô bên dưới nhé.' }, { status: 429 });

  const headers = { 'xi-api-key': key };
  let taskId = '';
  try {
    const form = new FormData();
    form.append('file', new Blob([audio], { type: 'audio/wav' }), 'audio.wav');
    form.append('language_code', 'vi');
    form.append('tag_audio_events', 'false');
    form.append('timestamps_granularity', 'none');
    // One retry: the link to 11max sometimes drops an upload half way.
    for (let attempt = 1; attempt <= 2 && !taskId; attempt++) {
      try {
        const sub = await fetch(`${BASE}/v1/speech-to-text`, { method: 'POST', headers, body: form, signal: AbortSignal.timeout(20_000) });
        const subData = await sub.json().catch(() => ({}));
        if (!sub.ok || !subData.task_id) throw new Error(`submit ${sub.status} ${subData.error ?? ''}`);
        taskId = subData.task_id;
      } catch (e) {
        if (attempt === 2) throw e;
        console.warn('loi-thoai retry', (e as Error).message);
      }
    }

    const until = Date.now() + POLL_FOR_MS;
    while (Date.now() < until) {
      await sleep(POLL_MS);
      const r = await fetch(`${BASE}/v1/speech-to-text/${taskId}`, { headers });
      const t = await r.json().catch(() => ({}));
      if (t.status === 'completed') {
        const text = String(t.result?.text ?? '').replace(/\s+/g, ' ').trim();
        console.log('loi-thoai ok', Math.round(audio.byteLength / 16000), 's (8 kHz)', t.credits_deducted ?? '?', 'credits');
        return Response.json({ text });
      }
      if (t.status === 'failed') throw new Error(`failed ${t.detail_error ?? ''}`);
    }
    throw new Error('timeout');
  } catch (err) {
    console.error('loi-thoai error', (err as Error).message);
    return Response.json({ error: 'Chưa lấy được lời thoại. Bạn dán lời nói vào ô bên dưới nhé.' }, { status: 502 });
  } finally {
    // Don't keep the visitor's words on 11max.
    if (taskId) await fetch(`${BASE}/v1/speech-to-text/${taskId}`, { method: 'DELETE', headers }).catch(() => {});
  }
}
