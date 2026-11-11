'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Sparkles, Copy, Check, FileText, FileDown, RotateCcw, MessageCircleQuestion, History } from 'lucide-react';
import { DANG, DO_DAI, NEN_TANG, dangById, khungById, type KichBan } from '@/lib/viet-kich-ban/templates';
import { asText, downloadWord, printPdf } from '@/lib/viet-kich-ban/export';

type Usage = { loggedIn: boolean; unavailable?: boolean; member?: boolean; used?: number; limit?: number; freeTotal?: number; history?: { id: string; tieu_de: string; dang: string; created_at: string }[] };
type Question = { hoi: string; goi_y: string; tra_loi: string };

const post = (body: object) =>
  fetch('/api/viet-kich-ban', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    .then(async (r) => ({ ok: r.ok, data: await r.json().catch(() => ({})) }))
    .catch(() => ({ ok: false, data: {} as Record<string, unknown> }));

export default function VietKichBanTool() {
  const [usage, setUsage] = useState<Usage | null>(null);
  const [form, setForm] = useState({ dang: DANG[0].id, khung: DANG[0].khung[0], do_dai: '60', nen_tang: NEN_TANG[0], nganh: '', noi_dung: '' });
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [state, setState] = useState<'idle' | 'asking' | 'writing' | 'done'>('idle');
  const [error, setError] = useState('');
  const [hetLuot, setHetLuot] = useState(false);
  const [script, setScript] = useState<KichBan | null>(null);
  const [copied, setCopied] = useState(false);

  const loadUsage = () => fetch('/api/viet-kich-ban').then((r) => r.json()).then(setUsage).catch(() => setUsage({ loggedIn: false }));
  useEffect(() => { loadUsage(); }, []);

  const dang = dangById(form.dang)!;
  const left = usage?.loggedIn ? Math.max(0, (usage.limit ?? 0) - (usage.used ?? 0)) : 0;

  const scrollTop = () => requestAnimationFrame(() => document.getElementById('cong-cu')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));

  const ask = async () => {
    setError('');
    setState('asking');
    const res = await post({ ...form, step: 'hoi' });
    setState('idle');
    if (!res.ok) { setError((res.data.error as string) || 'Chưa kiểm tra được, bạn thử lại nhé.'); return; }
    const qs = ((res.data.cau_hoi as { hoi: string; goi_y: string }[]) || []).map((q) => ({ ...q, tra_loi: '' }));
    if (qs.length === 0) { write([]); return; }
    setQuestions(qs);
    scrollTop();
  };

  const write = async (qs: Question[]) => {
    setError('');
    setState('writing');
    const res = await post({ ...form, step: 'viet', tra_loi: qs.filter((q) => q.tra_loi.trim()).map(({ hoi, tra_loi }) => ({ hoi, tra_loi })) });
    if (!res.ok) {
      setState('idle');
      setHetLuot(!!res.data.hetLuot);
      setError((res.data.error as string) || 'Chưa viết được, bạn thử lại nhé.');
      return;
    }
    setScript(res.data.content as KichBan);
    setState('done');
    setUsage((u) => (u ? { ...u, used: res.data.used as number } : u));
    loadUsage();
    (window as { fbq?: (...a: unknown[]) => void }).fbq?.('trackCustom', 'VietKichBan', { dang: form.dang });
    scrollTop();
  };

  const open = async (id: string) => {
    const r = await fetch(`/api/viet-kich-ban?id=${encodeURIComponent(id)}`).then((x) => x.json()).catch(() => null);
    if (r?.content) { setScript(r.content); setState('done'); scrollTop(); }
  };

  const reset = () => { setScript(null); setQuestions(null); setState('idle'); setError(''); setHetLuot(false); scrollTop(); };

  const copy = async () => {
    if (!script) return;
    await navigator.clipboard.writeText(asText(script)).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!usage) {
    return <div className="mt-8 card p-8 flex justify-center"><Loader2 className="animate-spin" aria-label="Đang tải" /></div>;
  }

  if (!usage.loggedIn) {
    return (
      <div className="mt-8 card p-6 md:p-8">
        <h2 className="text-2xl text-ink">Đăng nhập để bắt đầu</h2>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          Tài khoản miễn phí được viết {usage.freeTotal ?? 5} kịch bản. Kịch bản bạn viết được lưu lại để mở lại và tải về bất cứ lúc nào.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/auth?mode=signup&redirect=/viet-kich-ban" className="btn btn-gold">Tạo tài khoản miễn phí</Link>
          <Link href="/auth?redirect=/viet-kich-ban" className="btn btn-outline">Đăng nhập</Link>
        </div>
      </div>
    );
  }

  if (usage.unavailable) {
    return <div className="mt-8 card p-6 md:p-8 text-muted-foreground">Công cụ đang bảo trì. Bạn quay lại sau ít phút nhé.</div>;
  }

  const busy = state === 'asking' || state === 'writing';

  return (
    <div id="cong-cu" className="mt-8 space-y-6 scroll-mt-28">
      <p className="text-sm text-muted-foreground">
        {usage.member ? 'Hội viên' : 'Tài khoản miễn phí'}: còn <strong className="text-ink">{left}</strong>/{usage.limit} kịch bản{usage.member ? ' trong tháng này' : ''}.
      </p>

      {!script && !questions && (
        <div className="card p-5 md:p-8 space-y-6">
          <fieldset>
            <legend className="field-label">1. Bạn muốn làm video gì?</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {DANG.map((d) => (
                <label key={d.id} className={`cursor-pointer rounded-xl border p-3 transition-colors ${form.dang === d.id ? 'border-gold bg-gold-soft/40' : 'border-line hover:border-gold/60'}`}>
                  <input type="radio" name="dang" value={d.id} checked={form.dang === d.id} onChange={() => setForm({ ...form, dang: d.id, khung: d.khung[0] })} className="sr-only" />
                  <span className="block font-semibold text-ink">{d.ten}</span>
                  <span className="block text-sm text-muted-foreground">{d.mo_ta}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="vkb-khung" className="field-label">2. Kể theo kiểu nào</label>
            <select id="vkb-khung" className="input" value={form.khung} onChange={(e) => setForm({ ...form, khung: e.target.value })}>
              {dang.khung.map((id) => { const k = khungById(id)!; return <option key={id} value={id}>{k.ten}</option>; })}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">{khungById(form.khung)?.mo_ta}</p>
          </div>

          <div>
            <label htmlFor="vkb-noidung" className="field-label">3. Nội dung bạn muốn nói</label>
            <textarea
              id="vkb-noidung"
              className="input min-h-44"
              maxLength={5000}
              value={form.noi_dung}
              onChange={(e) => setForm({ ...form, noi_dung: e.target.value })}
              placeholder="Viết tự nhiên như đang kể cho bạn bè: bạn bán gì / muốn chia sẻ gì, cho ai, có câu chuyện hay kết quả nào. Viết lộn xộn cũng được, thiếu gì AI sẽ hỏi lại."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="vkb-dodai" className="field-label">Độ dài</label>
              <select id="vkb-dodai" className="input" value={form.do_dai} onChange={(e) => setForm({ ...form, do_dai: e.target.value })}>
                {DO_DAI.map((d) => <option key={d.id} value={d.id}>{d.ten}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="vkb-nentang" className="field-label">Đăng ở đâu</label>
              <select id="vkb-nentang" className="input" value={form.nen_tang} onChange={(e) => setForm({ ...form, nen_tang: e.target.value })}>
                {NEN_TANG.map((n) => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="vkb-nganh" className="field-label">Ngành (không bắt buộc)</label>
              <input id="vkb-nganh" className="input" maxLength={120} value={form.nganh} onChange={(e) => setForm({ ...form, nganh: e.target.value })} placeholder="Spa, quán cà phê…" />
            </div>
          </div>

          {error && <ErrorBox error={error} hetLuot={hetLuot} />}

          <button type="button" onClick={ask} disabled={busy || form.noi_dung.trim().length < 20 || left === 0} className="btn btn-gold w-full disabled:opacity-60">
            {busy
              ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> {state === 'asking' ? 'Đang đọc nội dung…' : 'Đang viết kịch bản, khoảng 30 giây…'}</>
              : <><Sparkles size={18} aria-hidden="true" /> Viết kịch bản</>}
          </button>
          {left === 0 && !error && <ErrorBox error={usage.member ? 'Bạn đã dùng hết lượt của tháng này.' : 'Bạn đã dùng hết lượt miễn phí.'} hetLuot={!usage.member} />}
        </div>
      )}

      {!script && questions && (
        <div className="card p-5 md:p-8 space-y-5">
          <div className="flex gap-3">
            <MessageCircleQuestion className="text-gold shrink-0" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-semibold text-ink">Cho mình hỏi thêm vài câu</h2>
              <p className="text-sm text-muted-foreground">Trả lời càng cụ thể, kịch bản càng sát. Câu nào chưa có thì để trống.</p>
            </div>
          </div>
          {questions.map((q, i) => (
            <div key={i}>
              <label htmlFor={`vkb-q${i}`} className="field-label">{q.hoi}</label>
              <textarea
                id={`vkb-q${i}`}
                className="input min-h-20"
                maxLength={1000}
                value={q.tra_loi}
                placeholder={`Ví dụ: ${q.goi_y}`}
                onChange={(e) => setQuestions(questions.map((x, j) => (j === i ? { ...x, tra_loi: e.target.value } : x)))}
              />
            </div>
          ))}
          {error && <ErrorBox error={error} hetLuot={hetLuot} />}
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={() => write(questions)} disabled={busy} className="btn btn-gold flex-1 disabled:opacity-60">
              {state === 'writing' ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Đang viết kịch bản, khoảng 30 giây…</> : <><Sparkles size={18} aria-hidden="true" /> Viết kịch bản</>}
            </button>
            <button type="button" onClick={() => setQuestions(null)} disabled={busy} className="btn btn-outline">Sửa nội dung</button>
          </div>
        </div>
      )}

      {script && <ScriptView k={script} copied={copied} onCopy={copy} onReset={reset} />}

      {!!usage.history?.length && (
        <div className="card p-5 md:p-6">
          <h2 className="flex items-center gap-2 font-semibold text-ink"><History size={18} aria-hidden="true" /> Kịch bản của bạn</h2>
          <ul className="mt-3 divide-y divide-line">
            {usage.history.map((h) => (
              <li key={h.id}>
                <button type="button" onClick={() => open(h.id)} className="w-full flex justify-between gap-3 py-3 text-left hover:text-gold-hover">
                  <span className="min-w-0 truncate text-ink">{h.tieu_de || 'Kịch bản'}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{new Date(h.created_at).toLocaleDateString('vi-VN')}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ErrorBox({ error, hetLuot }: { error: string; hetLuot: boolean }) {
  return (
    <div role="alert" className="rounded-xl border border-danger/40 p-4 text-sm">
      <p className="text-danger">{error}</p>
      {hetLuot && <Link href="/hoi-vien" className="btn btn-gold mt-3">Xem gói Hội viên</Link>}
    </div>
  );
}

function ScriptView({ k, copied, onCopy, onReset }: { k: KichBan; copied: boolean; onCopy: () => void; onReset: () => void }) {
  return (
    <section className="space-y-5" aria-labelledby="kb-title">
      <div className="card p-5 md:p-8">
        <h2 id="kb-title" className="text-2xl md:text-3xl text-ink">{k.tieu_de}</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={onCopy} className="btn btn-outline !min-h-[44px] text-sm">{copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />} {copied ? 'Đã chép' : 'Chép kịch bản'}</button>
          <button type="button" onClick={() => downloadWord(k)} className="btn btn-outline !min-h-[44px] text-sm"><FileText size={16} aria-hidden="true" /> Tải Word</button>
          <button type="button" onClick={() => printPdf(k)} className="btn btn-outline !min-h-[44px] text-sm"><FileDown size={16} aria-hidden="true" /> Tải PDF</button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Tải PDF: trong hộp in, chọn "Lưu dưới dạng PDF".</p>
      </div>

      <div className="card p-5 md:p-8">
        <h3 className="text-lg font-semibold text-ink">3 phương án hook</h3>
        <ol className="mt-3 space-y-3">
          {k.hook.map((h, i) => (
            <li key={i} className="rounded-xl bg-muted/40 p-4">
              <p className="text-ink">{i + 1}. “{h.loi_noi}”</p>
              {h.chu_tren_man_hinh && <p className="mt-1 text-sm text-muted-foreground">Chữ giây đầu: {h.chu_tren_man_hinh}</p>}
            </li>
          ))}
        </ol>
      </div>

      <div className="card p-5 md:p-8">
        <h3 className="text-lg font-semibold text-ink">Kịch bản</h3>
        <ol className="mt-4 space-y-5">
          {k.doan.map((d, i) => (
            <li key={i} className="border-l-2 border-gold/60 pl-4">
              <p className="text-sm font-semibold text-gold-hover">{d.thoi_gian} · {d.muc_dich}</p>
              <p className="mt-1 text-ink leading-relaxed">{d.loi_noi}</p>
              {d.chu_tren_man_hinh && <p className="mt-1 text-sm text-stone"><strong>Chữ:</strong> {d.chu_tren_man_hinh}</p>}
              <p className="mt-1 text-sm text-muted-foreground"><strong>Cảnh quay:</strong> {d.canh_quay}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6 rounded-xl border-2 border-gold/60 p-4">
          <p className="text-sm font-bold uppercase tracking-wide text-gold-hover">Lời kêu gọi</p>
          <p className="mt-1 text-ink">{k.loi_keu_goi}</p>
        </div>
      </div>

      <div className="card p-5 md:p-8 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-ink">Caption</h3>
          <p className="mt-2 text-stone whitespace-pre-line">{k.caption}</p>
        </div>
        {k.meo_quay.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-ink">Mẹo quay</h3>
            <ul className="mt-2 space-y-1.5 text-stone">{k.meo_quay.map((m) => <li key={m} className="flex gap-2"><span aria-hidden="true">•</span>{m}</li>)}</ul>
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={onReset} className="btn btn-outline"><RotateCcw size={16} aria-hidden="true" /> Viết kịch bản khác</button>
        <Link href="/cham-video" className="btn btn-outline">Quay xong? Chấm video miễn phí</Link>
      </div>
    </section>
  );
}
