"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { AlertTriangle, Bot, BrainCircuit, Check, GraduationCap, Loader2, MessageCircle, Pause, Play, Plus, Send, ShoppingCart, Trash2 } from 'lucide-react';
import { PageHeader, LoadingRow, EmptyState, StatCard, Modal, Field, thClass, tdClass } from '@/components/admin/AdminUI';

// Facebook Messenger customer care (migration 031, /api/webhooks/facebook, src/lib/fb/agent.ts)

type Convo = { psid: string; name: string | null; profile_pic: string | null; bot_paused_until: string | null; needs_human: boolean; handoff_reason: string | null; status: 'open' | 'done'; last_message_at: string; last_customer_at: string | null };
type Msg = { id: number; role: 'customer' | 'bot' | 'admin'; text: string; created_at: string };
type Order = { id: number; psid: string | null; customer_name: string; phone: string; email: string | null; product: string; price: string | null; note: string | null; status: string; created_at: string };
type Knowledge = { id: number; question: string; answer: string; source: string; status: 'suggested' | 'approved'; created_at: string };

const TABS = [
  { key: 'chats', label: 'Hội thoại', icon: MessageCircle },
  { key: 'orders', label: 'Đơn chốt', icon: ShoppingCart },
  { key: 'knowledge', label: 'Kiến thức của bot', icon: BrainCircuit },
] as const;
type Tab = (typeof TABS)[number]['key'];

const ORDER_STATUS: Record<string, string> = { new: 'Mới', confirmed: 'Đã xác nhận', paid: 'Đã thanh toán', cancelled: 'Hủy' };
const SOURCE: Record<string, string> = { manual: 'Bạn dạy', 'admin-reply': 'Từ câu bạn trả lời', learned: 'AI tự rút ra' };
const time = (at: string) => new Date(at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
/** Facebook only allows free replies within 24h of the customer's last message. */
const outside24h = (c: Convo) => !c.last_customer_at || Date.now() - new Date(c.last_customer_at).getTime() > 24 * 3600_000;
const paused = (c: Convo) => !!c.bot_paused_until && new Date(c.bot_paused_until).getTime() > Date.now();

async function api(body: Record<string, unknown>) {
  const res = await fetch('/api/admin/messenger', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra.');
  return data;
}

export default function MessengerPage() {
  const [tab, setTab] = useState<Tab>('chats');
  const [convos, setConvos] = useState<Convo[] | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [knowledge, setKnowledge] = useState<Knowledge[]>([]);
  // ?c=<psid> from the alert links; the admin layout renders pages only in the browser
  const [nameError, setNameError] = useState('');
  const [selected, setSelected] = useState<string | null>(() => (typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('c')));

  const loadConvos = useCallback(async () => {
    const { data } = await supabase.from('fb_conversations').select('*').order('last_message_at', { ascending: false }).limit(300);
    setConvos((data || []) as Convo[]);
  }, []);
  const loadOrders = useCallback(async () => {
    const { data } = await supabase.from('fb_orders').select('*').order('created_at', { ascending: false }).limit(500);
    setOrders((data || []) as Order[]);
  }, []);
  const loadKnowledge = useCallback(async () => {
    const { data } = await supabase.from('fb_knowledge').select('*').order('created_at', { ascending: false }).limit(1000);
    setKnowledge((data || []) as Knowledge[]);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => { loadConvos(); loadOrders(); loadKnowledge(); });
    // customers whose name Facebook did not give at first: look them up again, then refresh the list
    api({ action: 'names' }).then((d) => { if (d.filled) loadConvos(); if (d.missing && d.error) setNameError(d.error); }).catch(() => {});
    const t = setInterval(loadConvos, 15_000); // new messages show up without reloading
    return () => clearInterval(t);
  }, [loadConvos, loadOrders, loadKnowledge]);

  const hard = convos?.filter((c) => c.needs_human).length || 0;
  const newOrders = orders.filter((o) => o.status === 'new').length;
  const suggested = knowledge.filter((k) => k.status === 'suggested').length;
  const today = new Date().toDateString();
  const todayChats = convos?.filter((c) => new Date(c.last_message_at).toDateString() === today).length || 0;

  return (
    <div className="space-y-8">
      <PageHeader title="Facebook Messenger" description="AI tư vấn và chốt đơn trên Fanpage. Ca khó được chuyển cho bạn, bot học thêm từ chính câu trả lời của bạn." actions={<BotSwitch />} />

      {nameError && (
        <p className="text-sm rounded-lg border border-line p-3" role="status">
          <b>Facebook chưa cho đọc tên khách.</b> Lý do Facebook trả về: {nameError}. Thường cần xin quyền <b>Business Asset User Profile Access</b> (Meta app → App Review) hoặc tạo lại Page token có quyền <code>pages_messaging</code> và <code>pages_read_engagement</code>.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ca cần bạn xử lý" value={hard} icon={AlertTriangle} hint="Bot đã tạm dừng với những khách này" />
        <StatCard label="Đơn mới chờ xác nhận" value={newOrders} icon={ShoppingCart} hint={`${orders.length} đơn bot đã chốt`} />
        <StatCard label="Hội thoại hôm nay" value={todayChats} icon={MessageCircle} hint={`${convos?.length || 0} khách đã nhắn`} />
        <StatCard label="Kiến thức chờ duyệt" value={suggested} icon={GraduationCap} hint={`${knowledge.length - suggested} điều bot đang dùng`} />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-line" role="tablist">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
                  className={`flex items-center gap-2 px-4 min-h-[44px] text-sm font-semibold border-b-2 -mb-px ${tab === key ? 'border-gold text-ink' : 'border-transparent text-muted-foreground hover:text-ink'}`}>
            <Icon size={16} aria-hidden="true" /> {label}
            {key === 'chats' && hard > 0 && <span className="badge !bg-red-50 !text-danger">{hard}</span>}
            {key === 'orders' && newOrders > 0 && <span className="badge">{newOrders}</span>}
            {key === 'knowledge' && suggested > 0 && <span className="badge">{suggested}</span>}
          </button>
        ))}
      </div>

      {tab === 'chats' && (convos === null ? <LoadingRow /> : <Chats convos={convos} selected={selected} onSelect={setSelected} reload={loadConvos} onTaught={loadKnowledge} />)}
      {tab === 'orders' && <Orders orders={orders} reload={loadOrders} onOpen={(psid) => { setSelected(psid); setTab('chats'); }} />}
      {tab === 'knowledge' && <KnowledgeTab items={knowledge} reload={loadKnowledge} />}
    </div>
  );
}

// ---------------------------------------------------------------- main switch

/** Turns the whole bot on or off (also /bat, /tat in Telegram). Messages are still saved while it is off. */
function BotSwitch() {
  const [on, setOn] = useState<boolean | null>(null);
  const [locked, setLocked] = useState(false);
  const [busy, setBusy] = useState<'' | 'bot' | 'telegram' | 'answer'>('');
  const [note, setNote] = useState('');

  useEffect(() => {
    api({ action: 'bot' }).then((d) => { setOn(d.on); setLocked(d.locked); }).catch((e) => setNote(e.message));
  }, []);

  async function flip() {
    if (on === null) return;
    if (on && !confirm('Tắt bot? Khách nhắn tin sẽ không được tự trả lời cho tới khi bạn bật lại.')) return;
    setBusy('bot'); setNote('');
    try { const d = await api({ action: 'bot', on: !on }); setOn(d.on); setLocked(d.locked); }
    catch (e) { setNote((e as Error).message); }
    setBusy('');
  }

  async function answerAll() {
    setBusy('answer'); setNote('');
    try { const d = await api({ action: 'answer_all' }); setNote(d.waiting ? `Bot đang trả lời ${d.waiting} khách đang chờ. Danh sách tự cập nhật sau ít giây.` : 'Không có khách nào đang chờ trả lời.'); }
    catch (e) { setNote((e as Error).message); }
    setBusy('');
  }

  async function connectTelegram() {
    setBusy('telegram'); setNote('');
    try { await api({ action: 'telegram' }); setNote('Đã kết nối. Nhắn /trangthai cho bot Telegram để thử.'); }
    catch (e) { setNote((e as Error).message); }
    setBusy('');
  }

  return (
    <div className="flex flex-col items-start md:items-end gap-2">
      <div className="flex flex-wrap gap-2">
        <button onClick={flip} disabled={on === null || !!busy} aria-pressed={!!on}
                className={`btn ${on ? 'btn-outline' : 'btn-gold'}`}>
          {busy === 'bot' || on === null ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : on ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
          {on === null ? 'Đang tải…' : on ? 'Bot đang bật · Tắt bot' : 'Bot đang tắt · Bật bot'}
        </button>
        <button onClick={answerAll} disabled={!!busy || !on} className="btn btn-gold">
          {busy === 'answer' ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Bot size={16} aria-hidden="true" />} Trả lời tất cả khách đang chờ
        </button>
        <button onClick={connectTelegram} disabled={!!busy} className="btn btn-outline">
          {busy === 'telegram' ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Send size={16} aria-hidden="true" />} Kết nối Telegram
        </button>
      </div>
      {locked && <p className="text-sm text-danger">FB_BOT_ENABLED=false trên Vercel đang khóa bot ở trạng thái tắt.</p>}
      {note && <p className="text-sm text-muted-foreground" role="status">{note}</p>}
    </div>
  );
}

// ---------------------------------------------------------------- conversations

function Chats({ convos, selected, onSelect, reload, onTaught }: { convos: Convo[]; selected: string | null; onSelect: (p: string) => void; reload: () => void; onTaught: () => void }) {
  const [filter, setFilter] = useState<'hard' | 'open' | 'all'>('all');
  const list = useMemo(() => convos.filter((c) => filter === 'all' || (filter === 'hard' ? c.needs_human : c.status === 'open')), [convos, filter]);
  const current = convos.find((c) => c.psid === selected) || null;

  if (!convos.length) {
    return <EmptyState icon={MessageCircle} title="Chưa có tin nhắn" text="Khi khách nhắn Fanpage, hội thoại sẽ hiện ở đây. Xem hướng dẫn kết nối trong docs/facebook-messenger.md." />;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <div className="card overflow-hidden">
        <div className="flex gap-1 p-2 border-b border-line">
          {([['all', 'Tất cả'], ['hard', 'Ca khó'], ['open', 'Đang mở']] as const).map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} className={`flex-1 min-h-[40px] rounded-md text-sm font-medium ${filter === k ? 'bg-muted text-ink' : 'text-muted-foreground hover:bg-muted/60'}`}>{l}</button>
          ))}
        </div>
        <ul className="max-h-[70vh] overflow-y-auto divide-y divide-line">
          {list.map((c) => (
            <li key={c.psid}>
              <button onClick={() => onSelect(c.psid)} className={`w-full text-left p-3 flex gap-3 items-start hover:bg-muted/60 ${c.psid === selected ? 'bg-muted' : ''}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {c.profile_pic ? <img src={c.profile_pic} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" /> : <span className="w-10 h-10 rounded-full bg-gold-soft text-gold flex items-center justify-center font-bold shrink-0">{(c.name || '?').slice(-1)}</span>}
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-semibold truncate">{c.name || 'Khách Facebook'}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{time(c.last_message_at)}</span>
                  </span>
                  {c.needs_human
                    ? <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-danger"><AlertTriangle size={12} aria-hidden="true" /> {c.handoff_reason || 'Cần bạn xử lý'}</span>
                    : <span className="mt-1 block text-xs text-muted-foreground">{paused(c) ? 'Bot đang tạm dừng' : c.status === 'done' ? 'Đã xử lý' : 'Bot đang trả lời'}</span>}
                </span>
              </button>
            </li>
          ))}
          {!list.length && <li className="p-6 text-center text-sm text-muted-foreground">Không có hội thoại nào.</li>}
        </ul>
      </div>

      {current ? <Thread key={current.psid} convo={current} reload={reload} onTaught={onTaught} /> : (
        <div className="card p-10 text-center text-muted-foreground hidden lg:block">Chọn một hội thoại để xem.</div>
      )}
    </div>
  );
}

function Thread({ convo, reload, onTaught }: { convo: Convo; reload: () => void; onTaught: () => void }) {
  const [msgs, setMsgs] = useState<Msg[] | null>(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [teach, setTeach] = useState<{ question: string; answer: string } | null>(null);

  const load = useCallback(() => supabase.from('fb_messages').select('id, role, text, created_at').eq('psid', convo.psid).order('created_at').limit(500)
    .then(({ data }) => setMsgs((data || []) as Msg[])), [convo.psid]);
  useEffect(() => {
    const t = setInterval(load, 10_000);
    void Promise.resolve().then(load);
    return () => clearInterval(t);
  }, [load]);

  const run = async (action: string, extra: Record<string, unknown> = {}) => {
    setBusy(action); setError('');
    try {
      await api({ action, psid: convo.psid, ...extra });
      if (action === 'send') setText('');
      await Promise.all([load(), reload()]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra.');
    } finally {
      setBusy('');
    }
  };

  const openTeach = (i: number) => {
    if (!msgs) return;
    const before = msgs.slice(0, i).reverse();
    const q = [];
    for (const m of before) { if (m.role !== 'customer') break; q.unshift(m.text); }
    setTeach({ question: q.join(' ') || '', answer: msgs[i].text });
  };

  const isPaused = paused(convo);
  const late = outside24h(convo);

  return (
    <div className="card flex flex-col min-h-[60vh]">
      <div className="p-4 border-b border-line flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">{convo.name || 'Khách Facebook'}</p>
          <p className="text-xs text-muted-foreground">
            {isPaused ? `Bot tạm dừng tới ${time(convo.bot_paused_until!)}` : 'Bot đang tự trả lời'}
            {late && ' · Đã quá 24 giờ từ tin cuối của khách'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isPaused
            ? <button onClick={() => run('resume')} disabled={!!busy} className="btn btn-outline !min-h-[40px] !px-3 text-sm"><Play size={14} aria-hidden="true" /> Bật lại bot</button>
            : <button onClick={() => run('pause', { hours: 24 })} disabled={!!busy} className="btn btn-outline !min-h-[40px] !px-3 text-sm"><Pause size={14} aria-hidden="true" /> Dừng bot 24h</button>}
          {convo.status === 'open' && <button onClick={() => run('done')} disabled={!!busy} className="btn btn-outline !min-h-[40px] !px-3 text-sm"><Check size={14} aria-hidden="true" /> Đã xử lý</button>}
        </div>
      </div>

      {convo.needs_human && (
        <p className="mx-4 mt-4 p-3 rounded-md bg-red-50 text-danger text-sm flex gap-2"><AlertTriangle size={16} className="shrink-0 mt-0.5" aria-hidden="true" /> Bot chuyển ca này cho bạn: {convo.handoff_reason || 'cần người xử lý'}</p>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[55vh]">
        {msgs === null ? <LoadingRow /> : msgs.map((m, i) => (
          <div key={m.id} className={`flex ${m.role === 'customer' ? 'justify-start' : 'justify-end'}`}>
            <div className="max-w-[80%]">
              <div className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${m.role === 'customer' ? 'bg-muted text-ink' : m.role === 'bot' ? 'bg-gold-soft text-ink' : 'bg-ink text-white'}`}>{m.text}</div>
              <p className={`mt-1 text-[11px] text-muted-foreground flex items-center gap-2 ${m.role === 'customer' ? '' : 'justify-end'}`}>
                {m.role === 'bot' && <><Bot size={11} aria-hidden="true" /> Bot ·</>}{m.role === 'admin' && 'Bạn ·'} {time(m.created_at)}
                {m.role !== 'customer' && <button onClick={() => openTeach(i)} className="underline underline-offset-2 hover:text-ink">Dạy bot câu này</button>}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form className="p-4 border-t border-line space-y-2" onSubmit={(e) => { e.preventDefault(); if (text.trim()) run('send', { text }); }}>
        {error && <p className="text-sm text-danger" role="alert">{error}</p>}
        <div className="flex gap-2">
          <label htmlFor="fb-reply" className="sr-only">Trả lời khách</label>
          <textarea id="fb-reply" value={text} onChange={(e) => setText(e.target.value)} rows={2} className="input flex-1" placeholder="Trả lời khách với tư cách Fanpage… (bot sẽ tạm dừng với khách này)" />
          <button type="submit" disabled={!text.trim() || !!busy} className="btn btn-gold self-end" aria-label="Gửi">
            {busy === 'send' ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Send size={16} aria-hidden="true" />}
          </button>
        </div>
      </form>

      <TeachModal value={teach} onClose={() => setTeach(null)} onSaved={() => { setTeach(null); onTaught(); }} />
    </div>
  );
}

/** Saves a corrected answer as approved knowledge: the bot uses it from the next message on. */
function TeachModal({ value, onClose, onSaved, id }: { value: { question: string; answer: string } | null; onClose: () => void; onSaved: () => void; id?: number }) {
  const [q, setQ] = useState('');
  const [a, setA] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [last, setLast] = useState(value);
  if (value !== last) { setLast(value); setQ(value?.question || ''); setA(value?.answer || ''); setError(''); }

  const save = async () => {
    if (!q.trim() || !a.trim()) { setError('Nhập cả câu hỏi và câu trả lời.'); return; }
    setSaving(true);
    const row = { question: q.trim(), answer: a.trim(), status: 'approved' as const };
    const { error } = id ? await supabase.from('fb_knowledge').update(row).eq('id', id) : await supabase.from('fb_knowledge').insert({ ...row, source: 'manual' });
    setSaving(false);
    if (error) setError(error.message); else onSaved();
  };

  return (
    <Modal title={id ? 'Sửa kiến thức' : 'Dạy bot'} open={!!value} onClose={onClose} wide>
      <div className="space-y-4">
        <Field id="k-q" label="Khi khách hỏi" hint="Viết khái quát để bot nhận ra cả những câu hỏi tương tự.">
          <textarea id="k-q" value={q} onChange={(e) => setQ(e.target.value)} rows={2} className="input" />
        </Field>
        <Field id="k-a" label="Bot nên trả lời" hint="Đúng giọng của bạn. Bot dùng ngay từ tin nhắn tiếp theo.">
          <textarea id="k-a" value={a} onChange={(e) => setA(e.target.value)} rows={5} className="input" />
        </Field>
        {error && <p className="text-sm text-danger" role="alert">{error}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-outline">Hủy</button>
          <button onClick={save} disabled={saving} className="btn btn-gold">{saving && <Loader2 size={16} className="animate-spin" aria-hidden="true" />} Lưu và dùng ngay</button>
        </div>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------- orders

function Orders({ orders, reload, onOpen }: { orders: Order[]; reload: () => void; onOpen: (psid: string) => void }) {
  const setStatus = async (id: number, status: string) => {
    await supabase.from('fb_orders').update({ status }).eq('id', id);
    reload();
  };
  if (!orders.length) return <EmptyState icon={ShoppingCart} title="Chưa có đơn" text="Khi bot chốt được đơn trên Messenger, đơn sẽ hiện ở đây và bạn nhận thông báo." />;
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-line"><tr><th className={thClass}>Thời gian</th><th className={thClass}>Khách</th><th className={thClass}>Sản phẩm</th><th className={thClass}>Ghi chú</th><th className={thClass}>Trạng thái</th></tr></thead>
        <tbody className="divide-y divide-line">
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-muted/60 align-top">
              <td className={`${tdClass} whitespace-nowrap`}>{time(o.created_at)}</td>
              <td className={tdClass}>
                <p className="font-semibold">{o.customer_name}</p>
                <a href={`https://zalo.me/${o.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-gold hover:underline">{o.phone}</a>
                {o.email && <p className="text-muted-foreground">{o.email}</p>}
              </td>
              <td className={tdClass}><p className="font-semibold">{o.product}</p><p className="text-muted-foreground">{o.price || '—'}</p></td>
              <td className={tdClass}>
                <p className="max-w-xs">{o.note || '—'}</p>
                {o.psid && <button onClick={() => onOpen(o.psid!)} className="mt-1 text-gold hover:underline">Xem hội thoại</button>}
              </td>
              <td className={tdClass}>
                <label htmlFor={`os-${o.id}`} className="sr-only">Trạng thái đơn</label>
                <select id={`os-${o.id}`} value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="input !min-h-[40px]">
                  {Object.entries(ORDER_STATUS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------- voice (migration 032)

type Voice = { id: number; profile: string; status: 'draft' | 'active' | 'archived'; conversations: number; created_at: string };

function VoiceCard({ onLearned }: { onLearned: () => void }) {
  const [voice, setVoice] = useState<Voice | null>(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState<'' | 'import' | 'build' | 'save'>('');
  const [note, setNote] = useState('');
  const stopRef = useRef(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from('fb_voice').select('*').neq('status', 'archived').order('id', { ascending: false }).limit(1).maybeSingle();
    setVoice(data as Voice | null);
    setText(data?.profile || '');
  }, []);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const importAll = async () => {
    setBusy('import'); stopRef.current = false; setNote('Đang đọc hộp thư Fanpage…');
    let after: string | undefined; let convos = 0; let msgs = 0;
    try {
      for (let i = 0; i < 500; i++) {
        const r = await api({ action: 'import', after });
        convos += r.conversations; msgs += r.messages;
        setNote(`Đã đọc ${convos} hội thoại, thêm ${msgs} tin nhắn mới…`);
        if (!r.next || stopRef.current) break;
        after = r.next;
      }
      setNote(`Xong: đã đọc ${convos} hội thoại, thêm ${msgs} tin nhắn mới. Bấm “Tạo hồ sơ giọng”.`);
    } catch (e) {
      setNote(e instanceof Error ? e.message : 'Có lỗi xảy ra.');
    } finally {
      setBusy('');
    }
  };

  const build = async () => {
    setBusy('build'); setNote('AI đang đọc cách bạn trả lời khách, mất khoảng 1–3 phút…');
    try {
      const res = await fetch('/api/admin/messenger/voice', { method: 'POST' });
      const r = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(r.error || 'Có lỗi xảy ra.');
      await load();
      setNote(`Đã viết hồ sơ từ ${r.conversations} hội thoại (${r.messages} tin bạn trả lời). Đọc lại, sửa nếu cần rồi bấm “Dùng giọng này”. Đang rút thêm câu hỏi thường gặp…`);
      const l = await api({ action: 'learn', days: 3650 }).catch(() => null);
      if (l) { setNote((n) => n.replace('Đang rút thêm câu hỏi thường gặp…', `Có thêm ${l.added} câu hỏi đáp chờ duyệt bên dưới.`)); onLearned(); }
    } catch (e) {
      setNote(e instanceof Error ? e.message : 'Có lỗi xảy ra.');
    } finally {
      setBusy('');
    }
  };

  const save = async (activate: boolean) => {
    if (!voice) return;
    setBusy('save');
    if (activate) await supabase.from('fb_voice').update({ status: 'archived' }).eq('status', 'active').neq('id', voice.id);
    const { error } = await supabase.from('fb_voice').update({ profile: text.trim(), ...(activate ? { status: 'active' } : {}) }).eq('id', voice.id);
    setNote(error ? error.message : activate ? 'Bot đã nhắn theo giọng này từ tin nhắn tiếp theo.' : 'Đã lưu nháp.');
    await load();
    setBusy('');
  };
  const turnOff = async () => {
    if (!voice || !confirm('Tắt giọng riêng? Bot sẽ quay về cách nói chuyện mặc định.')) return;
    await supabase.from('fb_voice').update({ status: 'archived' }).eq('id', voice.id);
    setNote('Đã tắt giọng riêng.');
    await load();
  };

  return (
    <div className="card p-5 space-y-4">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <p className="font-semibold">Giọng của bạn {voice?.status === 'active' && <span className="ml-2 text-xs font-semibold text-gold">Bot đang dùng</span>}{voice?.status === 'draft' && <span className="ml-2 text-xs font-semibold text-muted-foreground">Bản nháp, bot chưa dùng</span>}</p>
          <p className="text-sm text-muted-foreground">Bot đọc các tin nhắn bạn từng tư vấn khách trên Fanpage để học cách bạn xưng hô, hỏi nhu cầu, xử lý lăn tăn và chốt đơn. Số điện thoại, email, số tài khoản, tên khách và giá riêng được lược bỏ trước khi AI đọc.</p>
          {note && <p className="mt-2 text-sm text-ink" role="status">{note}</p>}
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {busy === 'import'
            ? <button onClick={() => { stopRef.current = true; }} className="btn btn-outline"><Loader2 size={16} className="animate-spin" aria-hidden="true" /> Dừng nhập</button>
            : <button onClick={importAll} disabled={!!busy} className="btn btn-outline"><MessageCircle size={16} aria-hidden="true" /> 1. Nhập tin nhắn cũ</button>}
          <button onClick={build} disabled={!!busy} className="btn btn-gold">{busy === 'build' ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <BrainCircuit size={16} aria-hidden="true" />} 2. Tạo hồ sơ giọng</button>
        </div>
      </div>

      {voice && (
        <div className="space-y-3">
          <label htmlFor="voice-profile" className="text-sm font-semibold">Hồ sơ giọng ({voice.conversations} hội thoại · {time(voice.created_at)})</label>
          <textarea id="voice-profile" value={text} onChange={(e) => setText(e.target.value)} rows={16}
                    className="w-full rounded-xl border border-line bg-white p-3 text-sm leading-relaxed" />
          <div className="flex flex-wrap gap-2">
            <button onClick={() => save(true)} disabled={!!busy || !text.trim()} className="btn btn-gold"><Check size={16} aria-hidden="true" /> Dùng giọng này</button>
            <button onClick={() => save(false)} disabled={!!busy} className="btn btn-outline">Lưu nháp</button>
            {voice.status === 'active' && <button onClick={turnOff} className="btn btn-outline">Tắt giọng riêng</button>}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- knowledge

function KnowledgeTab({ items, reload }: { items: Knowledge[]; reload: () => void }) {
  const [editing, setEditing] = useState<{ id?: number; question: string; answer: string } | null>(null);
  const [learning, setLearning] = useState(false);
  const [note, setNote] = useState('');
  const suggested = items.filter((k) => k.status === 'suggested');
  const approved = items.filter((k) => k.status === 'approved');

  const learn = async () => {
    setLearning(true); setNote('');
    try {
      const r = await api({ action: 'learn', days: 14 });
      setNote(r.read ? `Đã đọc ${r.read} hội thoại có bạn trả lời, rút ra ${r.added} điều mới chờ duyệt.` : 'Chưa có hội thoại nào bạn tự trả lời trong 14 ngày qua.');
      reload();
    } catch (e) {
      setNote(e instanceof Error ? e.message : 'Có lỗi xảy ra.');
    } finally {
      setLearning(false);
    }
  };
  const approve = async (id: number) => { await supabase.from('fb_knowledge').update({ status: 'approved' }).eq('id', id); reload(); };
  const remove = async (id: number) => { if (confirm('Xóa điều này khỏi kiến thức của bot?')) { await supabase.from('fb_knowledge').delete().eq('id', id); reload(); } };

  const row = (k: Knowledge) => (
    <li key={k.id} className="p-4 flex flex-col md:flex-row gap-3 md:items-start">
      <div className="flex-1 min-w-0">
        <p className="font-semibold">{k.question}</p>
        <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{k.answer}</p>
        <p className="mt-2 text-xs text-muted-foreground">{SOURCE[k.source] || k.source} · {time(k.created_at)}</p>
      </div>
      <div className="flex gap-2 shrink-0">
        {k.status === 'suggested' && <button onClick={() => approve(k.id)} className="btn btn-gold !min-h-[40px] !px-3 text-sm"><Check size={14} aria-hidden="true" /> Duyệt</button>}
        <button onClick={() => setEditing({ id: k.id, question: k.question, answer: k.answer })} className="btn btn-outline !min-h-[40px] !px-3 text-sm">Sửa</button>
        <button onClick={() => remove(k.id)} className="btn btn-outline !min-h-[40px] !px-3 text-sm" aria-label="Xóa"><Trash2 size={14} aria-hidden="true" /></button>
      </div>
    </li>
  );

  return (
    <div className="space-y-8">
      <VoiceCard onLearned={reload} />

      <div className="card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="font-semibold">Bot học từ cách bạn trả lời</p>
          <p className="text-sm text-muted-foreground">Mỗi thứ Hai bot tự đọc các hội thoại bạn đã trả lời và đề xuất kiến thức mới. Chỉ những điều bạn duyệt mới được dùng. Bot cũng luôn biết khóa học, cửa hàng và câu hỏi thường gặp trên website.</p>
          {note && <p className="mt-2 text-sm text-ink" role="status">{note}</p>}
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={learn} disabled={learning} className="btn btn-outline">{learning ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <BrainCircuit size={16} aria-hidden="true" />} Học ngay</button>
          <button onClick={() => setEditing({ question: '', answer: '' })} className="btn btn-gold"><Plus size={16} aria-hidden="true" /> Thêm</button>
        </div>
      </div>

      {suggested.length > 0 && (
        <section>
          <h2 className="text-2xl mb-3">Chờ duyệt ({suggested.length})</h2>
          <ul className="card divide-y divide-line">{suggested.map(row)}</ul>
        </section>
      )}
      <section>
        <h2 className="text-2xl mb-3">Bot đang dùng ({approved.length})</h2>
        {approved.length ? <ul className="card divide-y divide-line">{approved.map(row)}</ul>
          : <EmptyState icon={GraduationCap} title="Chưa có kiến thức riêng" text="Thêm câu hỏi khách hay hỏi và cách bạn muốn bot trả lời, hoặc bấm “Dạy bot câu này” trong một hội thoại." />}
      </section>

      <TeachModal value={editing} id={editing?.id} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />
    </div>
  );
}
