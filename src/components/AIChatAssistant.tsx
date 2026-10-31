"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Phone, Mail, Send } from "lucide-react";
import { useSiteSettings } from "./SiteContext";
import { contactFrom } from "@/lib/site-settings";
import { isAppShellRoute } from "./Navbar";

// Floating "Hỗ trợ" button: real contact channels instead of a non-functional AI box.
export default function AIChatAssistant() {
  const pathname = usePathname();
  const CONTACT = contactFrom(useSiteSettings());
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (isAppShellRoute(pathname)) return null;

  const channels = [
    { label: "Nhắn Zalo", detail: CONTACT.phone, href: CONTACT.zaloHref, icon: Send, external: true },
    { label: "Gọi hotline", detail: CONTACT.phone, href: CONTACT.phoneHref, icon: Phone },
    { label: "Gửi email", detail: CONTACT.email, href: `mailto:${CONTACT.email}`, icon: Mail },
  ];

  return (
    <div className="fixed bottom-5 right-5 z-[900] flex flex-col items-end gap-3">
      {open && (
        <div ref={panelRef} role="dialog" aria-label="Liên hệ hỗ trợ" className="card w-[min(320px,calc(100vw-2.5rem))] p-5 shadow-[var(--shadow-lift)] animate-fade-up">
          <p className="font-display text-2xl font-bold">Cần tư vấn?</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Đội ngũ phản hồi trong giờ hành chính, thường dưới 30 phút.</p>
          <ul className="space-y-2">
            {channels.map(({ label, detail, href, icon: Icon, external }) => (
              <li key={label}>
                <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                   className="flex items-center gap-3 p-3 rounded-md border border-line hover:border-gold hover:bg-gold-soft/40 transition-colors">
                  <span className="w-10 h-10 rounded-md bg-onyx text-gold-light flex items-center justify-center shrink-0"><Icon size={18} aria-hidden="true" /></span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink">{label}</span>
                    <span className="block text-xs text-muted-foreground truncate">{detail}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Đóng hỗ trợ" : "Mở hỗ trợ"}
        className="h-14 pl-4 pr-5 rounded-full bg-onyx text-white shadow-[var(--shadow-lift)] flex items-center gap-2 hover:bg-ink transition-colors"
      >
        {open ? <X size={20} aria-hidden="true" /> : <MessageCircle size={20} className="text-gold-light" aria-hidden="true" />}
        <span className="text-sm font-semibold">{open ? "Đóng" : "Hỗ trợ"}</span>
      </button>
    </div>
  );
}
