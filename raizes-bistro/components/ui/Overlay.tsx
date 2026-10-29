"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { useLenis } from "@/components/motion/SmoothScroll";

type Props = {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  /** "modal" centraliza; "drawer" entra pela direita ocupando a altura toda. */
  variant?: "modal" | "drawer";
};

/** Camada sobre a página: trava o scroll (Lenis), fecha com Esc/clique fora e devolve o foco. */
export function Overlay({ open, onClose, label, children, variant = "modal" }: Props) {
  const lenis = useLenis();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open, lenis, onClose]);

  const drawer = variant === "drawer";

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90]" initial={{ opacity: 1 }} exit={{ opacity: 1 }}>
          <motion.div
            className="absolute inset-0 bg-espresso/75 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            data-lenis-prevent
            initial={drawer ? { x: "100%" } : { opacity: 0, y: 40 }}
            animate={drawer ? { x: "0%" } : { opacity: 1, y: 0 }}
            exit={drawer ? { x: "100%" } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className={
              drawer
                ? "grain absolute inset-y-0 right-0 w-full max-w-3xl overflow-y-auto bg-walnut outline-none"
                : "grain absolute inset-x-3 bottom-3 top-3 overflow-y-auto rounded-sm bg-walnut outline-none md:inset-x-auto md:left-1/2 md:top-1/2 md:bottom-auto md:max-h-[92svh] md:w-[min(64rem,94vw)] md:-translate-x-1/2 md:-translate-y-1/2"
            }
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="sticky right-4 top-4 z-10 float-right m-4 grid size-11 place-items-center rounded-full border border-cream/25 bg-walnut/80 text-cream transition-colors hover:border-candle hover:text-candle"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
