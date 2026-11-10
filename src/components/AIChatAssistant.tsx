"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Phone, Mail, Send, ArrowUp, Sparkles } from "lucide-react";
import { useSiteSettings } from "./SiteContext";
import { contactFrom } from "@/lib/site-settings";
import { isAppShellRoute } from "./Navbar";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content: "Chào bạn, mình là trợ lý AI của TẤN VA. Bạn đang muốn làm video loại nào, hay cần chọn khóa học nào? Cứ hỏi mình nhé.",
};
const SUGGESTIONS = ["Mình mới bắt đầu, nên học khóa nào?", "Gói hội viên có gì?", "Coaching 1:1 học thế nào?"];

// Turns "/courses/abc" paths and https links in a reply into real links; drops markdown bold marks.
function RichText({ text }: { text: string }) {
  const parts = text.replace(/\*\*/g, "").split(/((?:https?:\/\/[^\s)]+)|(?:\/(?:courses|shop|coaching|hoi-vien|blog|students|cham-video)[^\s),.]*))/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          p.startsWith("/") ? (
            <Link key={i} href={p} className="underline text-gold-hover font-semibold break-all">{p}</Link>
          ) : (
            <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="underline text-gold-hover font-semibold break-all">{p}</a>
          )
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

// Floating "Hỗ trợ" button: AI advisor (/api/chat) plus the real contact channels.
export default function AIChatAssistant() {
  const pathname = usePathname();
  const CONTACT = contactFrom(useSiteSettings());
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    inputRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  if (isAppShellRoute(pathname)) return null;

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    const history: Msg[] = [...messages, { role: "user", content: q }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    const setReply = (content: string) =>
      setMessages((m) => [...m.slice(0, -1), { role: "assistant", content }]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(1) }), // greeting is UI-only
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        setReply(data.error || "Trợ lý đang bận, bạn nhắn Zalo giúp mình nhé.");
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setReply(text);
      }
      if (!text.trim()) setReply("Mình chưa trả lời được, bạn thử hỏi lại nhé.");
    } catch {
      setReply("Mất kết nối, bạn thử lại nhé.");
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  const channels = [
    { label: "Zalo", href: CONTACT.zaloHref, icon: Send, external: true },
    { label: "Gọi", href: CONTACT.phoneHref, icon: Phone },
    { label: "Email", href: `mailto:${CONTACT.email}`, icon: Mail },
  ];

  return (
    <div className="fixed bottom-5 right-5 z-[900] flex flex-col items-end gap-3">
      {open && (
        <div role="dialog" aria-label="Trợ lý tư vấn" className="card w-[min(380px,calc(100vw-2.5rem))] h-[min(560px,calc(100dvh-7rem))] flex flex-col overflow-hidden shadow-[var(--shadow-lift)] animate-fade-up">
          <div className="px-4 py-3 bg-onyx text-white flex items-center gap-2 shrink-0">
            <Sparkles size={18} className="text-gold-light" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-semibold text-sm leading-tight">Trợ lý TẤN VA</p>
              <p className="text-[11px] text-white/60 leading-tight">AI trả lời ngay · có thể nhầm, cần chắc chắn hãy nhắn Zalo</p>
            </div>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex"}>
                <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "bg-onyx text-white" : "bg-muted text-ink"}`}>
                  {m.content ? <RichText text={m.content} /> : <span className="inline-flex gap-1" aria-label="Đang trả lời"><span className="animate-pulse">●</span><span className="animate-pulse [animation-delay:150ms]">●</span><span className="animate-pulse [animation-delay:300ms]">●</span></span>}
                </div>
              </div>
            ))}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => ask(s)} className="text-xs px-3 py-2 rounded-full border border-line hover:border-gold hover:bg-gold-soft/40 transition-colors text-left">{s}</button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="border-t border-line p-3 flex items-end gap-2 shrink-0">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input); } }}
              rows={1}
              maxLength={800}
              placeholder="Hỏi về khóa học, CapCut, quay video…"
              aria-label="Câu hỏi của bạn"
              className="flex-1 resize-none rounded-md border border-line px-3 py-2 text-sm max-h-28 focus:outline-none focus:border-gold"
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label="Gửi câu hỏi" className="w-10 h-10 rounded-md bg-onyx text-gold-light flex items-center justify-center shrink-0 disabled:opacity-40">
              <ArrowUp size={18} aria-hidden="true" />
            </button>
          </form>

          <div className="px-3 pb-3 flex items-center gap-2 text-xs text-muted-foreground shrink-0">
            <span>Gặp người thật:</span>
            {channels.map(({ label, href, icon: Icon, external }) => (
              <a key={label} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="inline-flex items-center gap-1 px-2 py-1 rounded border border-line hover:border-gold">
                <Icon size={12} aria-hidden="true" /> {label}
              </a>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Đóng hỗ trợ" : "Mở hỗ trợ"}
        className="h-14 pl-4 pr-5 rounded-full bg-onyx text-white shadow-[var(--shadow-lift)] flex items-center gap-2 hover:bg-ink transition-colors"
      >
        {open ? <X size={20} aria-hidden="true" /> : <MessageCircle size={20} className="text-gold-light" aria-hidden="true" />}
        <span className="text-sm font-semibold">{open ? "Đóng" : "Hỏi AI"}</span>
      </button>
    </div>
  );
}
