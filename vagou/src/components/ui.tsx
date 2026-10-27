"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { create } from "zustand";
import { I } from "./icons";
import { Wordmark, WORD_RATIO } from "./brand";
import { cx } from "@/lib/util";

/* ---------- marca ---------- */
export function Logo({ dark = false, className, height = 24 }: { dark?: boolean; className?: string; height?: number }) {
  return <Wordmark className={cx("block", dark ? "text-white" : "text-ink", className)} style={{ height, width: height * WORD_RATIO }} />;
}

/* ---------- títulos ---------- */
export function PageTitle({ sec, title, muted, children }: { sec?: string; title: string; muted?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {sec && <div className="sec mb-2">{sec}</div>}
        <h1 className="title text-[30px] md:text-[38px]">
          {title} {muted && <span className="g">{muted}</span>}
        </h1>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

/* ---------- dinheiro em serifa, centavos em cinza ---------- */
export function Money({ value, className, cents = true }: { value: number; className?: string; cents?: boolean }) {
  const neg = value < 0;
  const [int, dec] = Math.abs(value).toFixed(2).split(".");
  const intFmt = Number(int).toLocaleString("pt-BR");
  return (
    <span className={cx("num whitespace-nowrap", className)}>
      {neg ? "− " : ""}R$ {intFmt}
      {cents && <span className="text-muted-2">,{dec}</span>}
    </span>
  );
}

/* ---------- placa ---------- */
export function Plate({ placa, size }: { placa: string; size?: "md" | "lg" }) {
  return (
    <span className={cx("plate", size)}>
      <span>{placa}</span>
    </span>
  );
}

/* ---------- gráfico em código de barras ---------- */
export function Bars({ values, highlight, red, className, labels }: { values: number[]; highlight?: number[]; red?: number[]; className?: string; labels?: string[] }) {
  const max = Math.max(1, ...values);
  return (
    <div className={cx("flex h-full flex-col", className)}>
      <div className="bars flex-1" role="img" aria-label="Gráfico de barras">
        {values.map((v, i) => (
          <i
            key={i}
            title={labels?.[i] ? `${labels[i]}: ${v}` : String(v)}
            className={cx(highlight?.includes(i) && "k", red?.includes(i) && "r")}
            style={{ height: `${Math.max(2, (v / max) * 100)}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const w = 64;
  const h = 24;
  const d = values
    .map((v, i) => `${i === 0 ? "M" : "L"}${((i / (values.length - 1)) * w).toFixed(1)},${(h - 2 - ((v - min) / (max - min || 1)) * (h - 4)).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className={className} aria-hidden>
      <path d={d} fill="none" stroke="#222" strokeWidth="1.2" />
    </svg>
  );
}

export function Delta({ value }: { value: number }) {
  if (!isFinite(value)) return null;
  const up = value >= 0;
  return (
    <span className={cx("text-[11px] font-semibold", up ? "text-ok-ink" : "text-alert-ink")}>
      {up ? "▲" : "▼"} {Math.abs(value).toFixed(1).replace(".", ",")}%
    </span>
  );
}

/* ---------- ícone redondo ---------- */
export function IconCircle({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx("inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-paper shadow-[0_3px_12px_rgba(0,0,0,0.06)]", className)}>{children}</span>;
}

export function Avatar({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cx("inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e6e1db] to-[#cfc7be] text-[10.5px] font-semibold text-[#555]", className)}>
      {text}
    </span>
  );
}

/* ---------- modal ---------- */
export function Modal({ open, onClose, title, children, width = 520, footer }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; width?: number; footer?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => {
      const el =
        ref.current?.querySelector<HTMLElement>("[data-autofocus]") ??
        ref.current?.querySelector<HTMLElement>("form input, form select, form textarea, input, select, textarea");
      el?.focus();
    }, 20);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey, true);
      prev?.focus?.();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(30,30,30,0.28)] p-0 backdrop-blur-[3px] sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" className="glass max-h-[92dvh] w-full overflow-auto bg-[rgba(255,255,255,0.96)] p-6 scroll-soft sm:rounded-[26px]" style={{ maxWidth: width }}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="num text-[26px] leading-tight">{title}</div>
          <button className="btn btn-light btn-sm !px-2" onClick={onClose} aria-label="Fechar">
            <I.x size={16} />
          </button>
        </div>
        {children}
        {footer && <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- campos ---------- */
export function Field({ label, children, hint, className }: { label: string; children: ReactNode; hint?: string; className?: string }) {
  return (
    <label className={cx("block", className)}>
      <span className="label mb-1.5 block">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11.5px] text-muted">{hint}</span>}
    </label>
  );
}

export function MoneyInput({ value, onChange, className, autoFocus }: { value: number; onChange: (v: number) => void; className?: string; autoFocus?: boolean }) {
  return (
    <div className={cx("relative", className)}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-muted">R$</span>
      <input
        className="input !pl-9"
        inputMode="decimal"
        autoFocus={autoFocus}
        value={Number.isFinite(value) ? String(value).replace(".", ",") : ""}
        onChange={(e) => {
          const v = Number(e.target.value.replace(/\./g, "").replace(",", "."));
          onChange(Number.isFinite(v) ? v : 0);
        }}
      />
    </div>
  );
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button key={o.value} type="button" className="chip" data-on={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Empty({ title, text, icon }: { title: string; text?: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      {icon && <IconCircle>{icon}</IconCircle>}
      <div className="text-[16px] font-medium">{title}</div>
      {text && <div className="max-w-sm text-[14px] text-muted">{text}</div>}
    </div>
  );
}

export function Kpi({ label, value, extra, spark }: { label: string; value: ReactNode; extra?: ReactNode; spark?: number[] }) {
  return (
    <div className="relative min-w-0 px-5 py-4">
      <div className="label mb-1">{label}</div>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="num whitespace-nowrap text-[24px] leading-none md:text-[26px]">{value}</span>
        {extra}
      </div>
      {spark && <Sparkline values={spark} className="absolute right-4 top-6 hidden xl:block" />}
    </div>
  );
}

/* ---------- avisos ---------- */
interface Toast {
  id: number;
  text: string;
  tone: "ok" | "alert" | "info";
}
export const useToasts = create<{ items: Toast[]; push: (t: Omit<Toast, "id">) => void; drop: (id: number) => void }>((set) => ({
  items: [],
  push: (t) => {
    const id = Date.now() + Math.random();
    set((s) => ({ items: [...s.items, { ...t, id }] }));
    setTimeout(() => set((s) => ({ items: s.items.filter((x) => x.id !== id) })), 3800);
  },
  drop: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
}));
export const toast = (text: string, tone: Toast["tone"] = "ok") => useToasts.getState().push({ text, tone });

export function Toasts() {
  const items = useToasts((s) => s.items);
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex flex-col gap-2 no-print" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className="pointer-events-auto flex items-center gap-3 rounded-[16px] bg-dark px-4 py-3 text-[14px] text-white shadow-[var(--shadow-pop)]">
          <span className={cx("size-2 rounded-full", t.tone === "ok" ? "bg-ok" : t.tone === "alert" ? "bg-alert" : "bg-white")} />
          {t.text}
        </div>
      ))}
    </div>
  );
}

/* ---------- autorização do gerente ---------- */
export function PinInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      className="input text-center text-[22px] tracking-[0.6em]"
      type="password"
      inputMode="numeric"
      autoComplete="off"
      maxLength={6}
      value={value}
      placeholder="••••"
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
      data-autofocus
    />
  );
}
