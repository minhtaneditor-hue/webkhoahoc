'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Upload, Loader2, Sparkles, Copy, Check, RotateCcw, Headphones } from 'lucide-react';
import { CRITERIA, COURSE_21_ID, FREE_LESSONS, type Scorecard } from '@/lib/cham-video/criteria';
import ToolFeedback from '@/components/ToolFeedback';

type Frame = { t: number; data: string; url: string };

const NGANH = ['Bán hàng online', 'Spa, làm đẹp', 'Quán ăn, đồ uống', 'Bất động sản', 'Chia sẻ kiến thức', 'Khác'];
const MUC_TIEU = ['Bán hàng', 'Tăng người theo dõi', 'Xây thương hiệu cá nhân', 'Chia sẻ kiến thức'];
const NEN_TANG = ['TikTok', 'Facebook Reels', 'YouTube Shorts', 'Instagram Reels'];
const MAX_SIDE = 768;

// Pick moments that matter for the rubric: the first frame, the hook (1–2 s), the middle and near the end.
function pickTimes(d: number) {
  const ts = [0.1, Math.min(1.5, d * 0.1), Math.min(3, d * 0.2), d * 0.5, d * 0.85];
  return [...new Set(ts.map((t) => Math.round(Math.max(0, Math.min(t, d - 0.1)) * 10) / 10))];
}

// Reads the video locally and grabs a few JPEG frames; nothing is uploaded.
async function extractFrames(file: File): Promise<{ frames: Frame[]; duration: number }> {
  const url = URL.createObjectURL(file);
  const v = document.createElement('video');
  v.muted = true;
  v.playsInline = true;
  v.preload = 'auto';
  v.src = url;
  try {
    await new Promise<void>((ok, fail) => {
      v.onloadeddata = () => ok();
      v.onerror = () => fail(new Error('load'));
    });
    const duration = v.duration;
    if (!Number.isFinite(duration) || duration <= 0) throw new Error('duration');
    const scale = Math.min(1, MAX_SIDE / Math.max(v.videoWidth, v.videoHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(v.videoWidth * scale);
    canvas.height = Math.round(v.videoHeight * scale);
    const ctx = canvas.getContext('2d')!;
    const frames: Frame[] = [];
    for (const t of pickTimes(duration)) {
      await new Promise<void>((ok) => { v.onseeked = () => ok(); v.currentTime = t; });
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
      frames.push({ t, data: dataUrl.split(',')[1], url: dataUrl });
    }
    return { frames, duration };
  } finally {
    URL.revokeObjectURL(url);
  }
}

const STT_RATE = 8000; // phone quality: same Scribe transcript as 16 kHz in tests, half the upload for slow connections
const STT_MAX_SECONDS = 120; // first two minutes are enough for short videos and fit the upload limit
const STT_TIMEOUT_MS = 60_000;

// Decodes the sound track locally and returns the first two minutes as 8 kHz mono WAV.
async function extractAudioWav(file: File): Promise<Blob | null> {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AC();
  let decoded: AudioBuffer;
  try {
    decoded = await ctx.decodeAudioData(await file.arrayBuffer());
  } catch {
    return null; // no sound track, or a codec the browser can't decode
  } finally {
    ctx.close().catch(() => {});
  }
  const seconds = Math.min(decoded.duration, STT_MAX_SECONDS);
  const off = new OfflineAudioContext(1, Math.ceil(seconds * STT_RATE), STT_RATE);
  const src = off.createBufferSource();
  src.buffer = decoded;
  src.connect(off.destination);
  src.start(0);
  const pcm = (await off.startRendering()).getChannelData(0);

  // 16-bit PCM WAV
  const view = new DataView(new ArrayBuffer(44 + pcm.length * 2));
  const str = (o: number, t: string) => { for (let i = 0; i < t.length; i++) view.setUint8(o + i, t.charCodeAt(i)); };
  str(0, 'RIFF'); view.setUint32(4, 36 + pcm.length * 2, true); str(8, 'WAVE'); str(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, STT_RATE, true); view.setUint32(28, STT_RATE * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  str(36, 'data'); view.setUint32(40, pcm.length * 2, true);
  let peak = 0;
  for (let i = 0; i < pcm.length; i++) {
    const v = Math.max(-1, Math.min(1, pcm[i]));
    peak = Math.max(peak, Math.abs(v));
    view.setInt16(44 + i * 2, v * 0x7fff, true);
  }
  return peak < 0.01 ? null : new Blob([view], { type: 'audio/wav' }); // silent: nothing to transcribe
}

function scoreColor(score10: number) {
  if (score10 >= 8) return 'bg-success';
  if (score10 >= 6) return 'bg-gold';
  if (score10 >= 4) return 'bg-amber-500';
  return 'bg-danger';
}

export default function ChamVideoTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [frames, setFrames] = useState<Frame[]>([]);
  const [duration, setDuration] = useState(0);
  const [form, setForm] = useState({ transcript: '', nganh: NGANH[0], muc_tieu: MUC_TIEU[0], nen_tang: NEN_TANG[0] });
  const [state, setState] = useState<'idle' | 'reading' | 'scoring' | 'done'>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<Scorecard | null>(null);
  const [copied, setCopied] = useState(false);
  const [stt, setStt] = useState<{ state: 'idle' | 'loading' | 'done' | 'none' | 'error'; msg?: string }>({ state: 'idle' });

  // Fills the transcript box from the video's sound (via /api/cham-video/loi-thoai, which uses 11max).
  // Gives up after STT_TIMEOUT_MS so a slow connection never leaves the form locked; a newer video wins.
  const sttRun = useRef(0);
  const transcribe = async (file: File) => {
    const run = ++sttRun.current;
    const stale = () => run !== sttRun.current;
    setStt({ state: 'loading' });
    const wav = await extractAudioWav(file).catch(() => null);
    if (stale()) return;
    if (!wav) { setStt({ state: 'none' }); return; }
    const res = await fetch('/api/cham-video/loi-thoai', { method: 'POST', headers: { 'Content-Type': 'audio/wav' }, body: wav, signal: AbortSignal.timeout(STT_TIMEOUT_MS) })
      .then(async (r) => ({ ok: r.ok, data: await r.json().catch(() => ({})) }))
      .catch((e: Error) => ({ ok: false, data: { error: e.name === 'TimeoutError' ? 'Mạng hơi chậm nên chưa lấy được lời thoại. Bạn dán lời nói vào ô bên dưới, hoặc chọn lại video để thử lần nữa.' : undefined } as { error?: string; text?: string } }));
    if (stale()) return;
    if (!res.ok) { setStt({ state: 'error', msg: res.data.error || 'Chưa lấy được lời thoại. Bạn dán lời nói vào ô bên dưới nhé.' }); return; }
    const text = String(res.data.text || '');
    if (!text) { setStt({ state: 'none' }); return; }
    setForm((f) => (f.transcript.trim() ? f : { ...f, transcript: text }));
    setStt({ state: 'done' });
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    setError('');
    setResult(null);
    setFrames([]);
    if (!file.type.startsWith('video/')) { setError('Bạn chọn file video nhé (mp4, mov).'); return; }
    setFileName(file.name);
    setForm((f) => ({ ...f, transcript: '' }));
    setStt({ state: 'idle' });
    setState('reading');
    try {
      const r = await extractFrames(file);
      if (r.duration > 600) { setError('Video dài quá 10 phút. Công cụ này dành cho video ngắn.'); setState('idle'); return; }
      setFrames(r.frames);
      setDuration(r.duration);
      transcribe(file);
    } catch {
      setError('Trình duyệt chưa đọc được video này. Bạn thử xuất lại sang mp4 hoặc dùng Chrome nhé.');
    }
    setState('idle');
  };

  const submit = async () => {
    setError('');
    setState('scoring');
    const res = await fetch('/api/cham-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, duration, frames: frames.map(({ t, data }) => ({ t, data })) }),
    }).then(async (r) => ({ ok: r.ok, data: await r.json().catch(() => ({})) })).catch(() => ({ ok: false, data: {} as { error?: string } }));
    if (!res.ok) { setError(res.data.error || 'Chưa chấm được, bạn thử lại nhé.'); setState('idle'); return; }
    setResult(res.data as Scorecard);
    setState('done');
    (window as { fbq?: (...a: unknown[]) => void }).fbq?.('trackCustom', 'ChamVideo', { score: (res.data as Scorecard).tong_diem });
    requestAnimationFrame(() => document.getElementById('ket-qua')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const reset = () => {
    setResult(null); setFrames([]); setFileName(''); setState('idle'); setError('');
    sttRun.current++;
    setStt({ state: 'idle' });
    setForm((f) => ({ ...f, transcript: '' }));
    if (inputRef.current) inputRef.current.value = '';
  };

  const copy = async () => {
    if (!result) return;
    const lines = [
      `Video của mình được ${result.tong_diem}/100 điểm (${result.xep_loai}) khi chấm theo công thức 3S của TẤN VA.`,
      ...CRITERIA.map((c, i) => `- ${c.ten}: ${result.tieu_chi[i].diem}/10`),
      `Chấm thử video của bạn: ${location.origin}/cham-video`,
    ];
    await navigator.clipboard.writeText(lines.join('\n')).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const busy = state === 'reading' || state === 'scoring';

  return (
    <div className="mt-8 space-y-6">
      {!result && (
        <div className="card p-5 md:p-8 space-y-6">
          <div>
            <p className="field-label">1. Chọn video</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="w-full rounded-xl border-2 border-dashed border-gold/50 p-6 text-center hover:border-gold transition-colors disabled:opacity-60"
            >
              {state === 'reading'
                ? <span className="inline-flex items-center gap-2"><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Đang đọc video…</span>
                : <span className="inline-flex flex-col items-center gap-1">
                    <Upload size={22} aria-hidden="true" />
                    <span className="font-semibold">{fileName || 'Bấm để chọn video trong máy'}</span>
                    <span className="text-xs text-muted-foreground">Video không tải lên. Máy bạn tự cắt 5 khung hình, chỉ gửi phần tiếng để lấy lời thoại và không lưu lại.</span>
                  </span>}
            </button>
            <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            {frames.length > 0 && (
              <div className="mt-3">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {frames.map((f) => (
                    <figure key={f.t} className="shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={f.url} alt={`Khung giây ${f.t}`} className="h-28 w-auto rounded-lg border border-line" />
                      <figcaption className="mt-1 text-center text-xs text-muted-foreground">giây {f.t}</figcaption>
                    </figure>
                  ))}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Độ dài: {Math.round(duration)} giây</p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="cv-transcript" className="field-label">2. Lời nói trong video</label>
            {stt.state === 'loading' && <p className="mb-2 flex items-center gap-2 text-sm text-gold-hover" role="status"><Loader2 size={16} className="animate-spin" aria-hidden="true" /> Đang tự lấy lời thoại từ video, khoảng 10–20 giây…</p>}
            {stt.state === 'done' && <p className="mb-2 text-sm text-success" role="status">Đã tự lấy lời thoại. Máy có thể nghe sai vài chữ, bạn đọc lại và sửa cho đúng nhé.</p>}
            {stt.state === 'none' && <p className="mb-2 text-sm text-muted-foreground" role="status">Không nghe thấy lời nói trong video. Nếu video có lời, bạn dán vào ô bên dưới.</p>}
            {stt.state === 'error' && <p className="mb-2 text-sm text-danger" role="status">{stt.msg}</p>}
            <textarea
              id="cv-transcript"
              className="input min-h-36"
              maxLength={6000}
              value={form.transcript}
              onChange={(e) => setForm({ ...form, transcript: e.target.value })}
              disabled={stt.state === 'loading'}
              placeholder={frames.length ? 'Lời thoại sẽ tự hiện ở đây. Video không có lời nói thì để trống.' : 'Chọn video ở bước 1, lời thoại sẽ tự hiện ở đây.'}
            />
            <p className="mt-1 text-xs text-muted-foreground">Máy chỉ lấy lời của 2 phút đầu. Phần lời nói, hook và lời kêu gọi được chấm từ chữ trong ô này.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {([
              ['nganh', 'Ngành của bạn', NGANH],
              ['muc_tieu', 'Mục tiêu video', MUC_TIEU],
              ['nen_tang', 'Đăng ở đâu', NEN_TANG],
            ] as const).map(([key, label, opts]) => (
              <div key={key}>
                <label htmlFor={`cv-${key}`} className="field-label">{label}</label>
                <select id={`cv-${key}`} className="input" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}>
                  {opts.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>

          {error && <p role="alert" className="text-sm text-danger">{error}</p>}

          <button type="button" onClick={submit} disabled={busy || frames.length < 2 || stt.state === 'loading'} className="btn btn-gold w-full disabled:opacity-60">
            {state === 'scoring'
              ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Đang chấm, khoảng 30 giây…</>
              : <><Sparkles size={18} aria-hidden="true" /> Chấm video</>}
          </button>
        </div>
      )}

      {result && (
        <section id="ket-qua" className="space-y-5 scroll-mt-28" aria-labelledby="kq-title">
          <div className="card p-6 md:p-8 text-center">
            <p className="text-sm text-muted-foreground">Điểm video của bạn</p>
            <p id="kq-title" className="mt-1 text-6xl font-bold text-ink">{result.tong_diem}<span className="text-2xl text-muted-foreground">/100</span></p>
            <p className="mt-2 font-semibold text-gold-hover">{result.xep_loai}</p>
            <p className="mt-4 text-stone leading-relaxed"><strong className="text-ink">Điểm mạnh:</strong> {result.diem_manh}</p>
          </div>

          <div className="card p-6 md:p-8 border-2 border-gold/60">
            <p className="text-sm font-bold uppercase tracking-wide text-gold-hover">Sửa việc này trước</p>
            <p className="mt-2 text-lg text-ink leading-relaxed">{result.viec_quan_trong_nhat}</p>
          </div>

          <div className="card p-6 md:p-8 space-y-6">
            {CRITERIA.map((c, i) => {
              const t = result.tieu_chi[i];
              return (
                <div key={c.ma}>
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-lg font-semibold text-ink">{c.ten}</h3>
                    <span className="shrink-0 font-bold text-ink">{t.diem}/10</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-line overflow-hidden" aria-hidden="true">
                    <div className={`h-full rounded-full ${scoreColor(t.diem)}`} style={{ width: `${t.diem * 10}%` }} />
                  </div>
                  <p className="mt-3 text-stone leading-relaxed">{t.ly_do}</p>
                  <p className="mt-2 text-ink leading-relaxed"><strong>Sửa:</strong> {t.sua}</p>
                  {t.bai_hoc.length > 0 && (
                    <p className="mt-2 text-sm">
                      Học ở:{' '}
                      {t.bai_hoc.map((n, j) => (
                        <span key={n}>
                          {j > 0 && ', '}
                          <Link href={`/courses/${COURSE_21_ID}`} className="text-gold-hover underline underline-offset-2">
                            Bài {n}{FREE_LESSONS.includes(n) ? ' (học thử miễn phí)' : ''}
                          </Link>
                        </span>
                      ))}{' '}
                      khóa 21 Ngày
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {result.hook_viet_lai.length > 0 && (
            <div className="card p-6 md:p-8">
              <h3 className="text-lg font-semibold text-ink">Gợi ý hook mới cho video này</h3>
              <ol className="mt-3 space-y-3">
                {result.hook_viet_lai.map((h, i) => (
                  <li key={i} className="rounded-xl bg-muted/40 p-4">
                    <p className="text-ink">“{h.cau_noi}”</p>
                    <p className="mt-1 text-sm text-muted-foreground">Chữ giây đầu: {h.chu_giay_dau}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {result.tu_kiem_tra.length > 0 && (
            <div className="card p-6 md:p-8">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-ink"><Headphones size={18} aria-hidden="true" /> Tự nghe lại phần âm thanh</h3>
              <p className="mt-1 text-sm text-muted-foreground">AI không nghe được âm thanh, nên phần này không tính điểm.</p>
              <ul className="mt-3 space-y-2 text-stone">
                {result.tu_kiem_tra.map((x) => <li key={x} className="flex gap-2"><span aria-hidden="true">☐</span>{x}</li>)}
              </ul>
            </div>
          )}

          <ToolFeedback key={result.tong_diem + result.viec_quan_trong_nhat} tool="cham-video" context={{ diem: result.tong_diem }} />

          <div className="card p-6 md:p-8 text-center">
            <p className="text-ink font-semibold">Muốn Minh Tấn xem và sửa video trực tiếp cho bạn?</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Link href={`/courses/${COURSE_21_ID}`} className="btn btn-gold">Xem khóa 21 Ngày</Link>
              <Link href="/coaching" className="btn btn-outline">Đặt lịch Audit miễn phí</Link>
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-4 text-sm">
              <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 text-gold-hover hover:underline">
                {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />} {copied ? 'Đã chép' : 'Chép kết quả để chia sẻ'}
              </button>
              <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-muted-foreground hover:underline">
                <RotateCcw size={16} aria-hidden="true" /> Chấm video khác
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
