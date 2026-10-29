"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { useLenis, useScrollTo } from "@/components/motion/SmoothScroll";
import { useReservation } from "@/components/reservation/ReservationProvider";
import { OutlineButton } from "@/components/ui/OutlineButton";
import { site } from "@/lib/site";

const LINKS = [
  { href: "#sobre", label: "Sobre" },
  { href: "#sugestoes", label: "Da Chef" },
  { href: "#cardapio", label: "Cardápio" },
  { href: "#salao", label: "Salão" },
  { href: "#contato", label: "Contato" },
];

export function Header() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const scrollTo = useScrollTo();
  const lenis = useLenis();
  const { openReservation } = useReservation();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    setHidden(y > prev && y > 400 && !open);
  });

  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open, lenis]);

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    scrollTo(href);
  };

  return (
    <>
      <motion.header
        animate={{ y: hidden ? "-110%" : "0%" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${scrolled && !open ? "bg-espresso/80 backdrop-blur-md" : ""}`}
      >
        <div className="container-x flex h-[var(--header-h)] items-center justify-between gap-6">
          <a href="#inicio" onClick={go("#inicio")} aria-label={`${site.name}, início`} className="relative z-10 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-light-sm.webp" alt="" className="h-12 w-auto md:h-14" />
          </a>

          <nav aria-label="Principal" className="hidden md:block">
            <ul className="flex items-center gap-8">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} onClick={go(l.href)} className="group relative py-2 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-cream/80 transition-colors hover:text-cream">
                    {l.label}
                    <span className="absolute inset-x-0 -bottom-0.5 h-px origin-right scale-x-0 bg-candle transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:origin-left group-hover:scale-x-100" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="relative z-10 flex items-center gap-3">
            <OutlineButton className="hidden sm:inline-flex" onClick={() => openReservation()}>
              Reservar mesa
            </OutlineButton>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="menu-overlay"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              className="grid size-11 place-items-center rounded-full border border-cream/25 md:hidden"
            >
              <span className="relative block h-3 w-5">
                <span className={`absolute left-0 top-0 h-px w-full bg-cream transition-transform duration-500 ${open ? "translate-y-1.5 rotate-45" : ""}`} />
                <span className={`absolute bottom-0 left-0 h-px w-full bg-cream transition-transform duration-500 ${open ? "-translate-y-1.5 -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-overlay"
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="grain fixed inset-0 z-40 flex flex-col justify-between bg-walnut px-[var(--gutter)] pb-10 pt-[calc(var(--header-h)+2rem)] md:hidden"
          >
            <nav aria-label="Menu">
              <ul className="space-y-2">
                {LINKS.map((l, i) => (
                  <li key={l.href} className="overflow-hidden">
                    <motion.a
                      href={l.href}
                      onClick={go(l.href)}
                      initial={{ y: "105%" }}
                      animate={{ y: "0%" }}
                      transition={{ delay: 0.25 + i * 0.07, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                      className="block font-display text-5xl leading-tight text-cream"
                    >
                      {l.label}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </nav>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openReservation();
                }}
                className="block w-full rounded-full border border-cream/70 py-4 text-center text-xs font-semibold uppercase tracking-[0.24em] text-cream"
              >
                Reservar mesa
              </button>
              <p className="eyebrow text-center text-cream/50">Qua a sáb 19h–23h · Dom 12h–16h</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
