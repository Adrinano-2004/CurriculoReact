"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useScrollTo } from "@/components/motion/SmoothScroll";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { dishBySlug, formatPrice, menu, plateSrc } from "@/lib/menu";
import { whatsappLink } from "@/lib/site";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Cardápio: lista no estilo das artes da casa (nome em caixa alta espaçada, preço em oliva)
 * e, ao lado, uma tábua de nogueira onde o prato visto de cima é servido a cada item em foco.
 * Desktop: o prato troca no hover. Celular (e desktop sem hover): troca conforme o item passa pelo meio da tela.
 */
export function Menu() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(menu[0].dishes[0].slug);
  const [turn, setTurn] = useState(0);
  const hovering = useRef(false);
  const [small, setSmall] = useState(false);
  const scrollTo = useScrollTo();

  useEffect(() => setSmall(window.innerWidth < 768), []);

  const activeRef = useRef(active);
  const show = (slug: string) => {
    if (activeRef.current === slug) return;
    activeRef.current = slug;
    setActive(slug);
    setTurn((t) => t + 1);
  };

  // Pré-carrega os pratos quando a seção se aproxima
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        menu.forEach((c) => c.dishes.forEach((d) => (new Image().src = plateSrc(d.slug, window.innerWidth < 768))));
        io.disconnect();
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      // Item que cruza o meio da tela vira o prato servido (quando não há hover)
      gsap.utils.toArray<HTMLElement>("[data-dish]").forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 58%",
          end: "bottom 58%",
          onToggle: (self) => self.isActive && !hovering.current && show(el.dataset.dish!),
        });
      });

      const split = SplitText.create(".menu-title", { type: "lines", mask: "lines", linesClass: "split-line" });
      gsap.from(split.lines, {
        yPercent: 110,
        stagger: 0.1,
        duration: 1.2,
        ease: "power4.out",
        scrollTrigger: { trigger: ".menu-title", start: "top 85%" },
      });
      gsap.utils.toArray<HTMLElement>(".menu-group").forEach((group) => {
        gsap.from(group.querySelectorAll(".menu-row"), {
          autoAlpha: 0,
          y: 24,
          stagger: 0.06,
          duration: 0.9,
          scrollTrigger: { trigger: group, start: "top 80%" },
        });
      });
      return () => split.revert();
    },
    { scope: sectionRef },
  );

  const dish = dishBySlug[active];
  const category = menu.find((c) => c.dishes.some((d) => d.slug === active))!;

  return (
    <section ref={sectionRef} id="cardapio" aria-labelledby="cardapio-title" className="relative bg-linen text-ink">
      <div className="container-x pb-24 pt-24 md:pb-36 md:pt-36">
        <header className="max-w-3xl">
          <p className="eyebrow text-terracotta">Cardápio</p>
          <h2 id="cardapio-title" className="menu-title title-lg mt-5 text-walnut">
            Massas frescas, molhos autorais e memórias servidas à mesa.
          </h2>
          <nav aria-label="Categorias do cardápio" className="mt-9 flex flex-wrap gap-2">
            {menu.map((c) => (
              <a
                key={c.id}
                href={`#menu-${c.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(`#menu-${c.id}`);
                }}
                className="rounded-full border border-ink/20 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-ink/80 transition-colors duration-300 hover:border-walnut hover:bg-walnut hover:text-cream"
              >
                {c.title}
              </a>
            ))}
          </nav>
        </header>

        <div className="mt-14 grid gap-x-16 md:mt-20 md:grid-cols-12">
          {/* Tábua com o prato (fixa ao rolar) */}
          <div className="sticky top-[var(--header-h)] z-10 -mx-[var(--gutter)] bg-linen/95 px-[var(--gutter)] pb-4 pt-3 backdrop-blur-sm md:order-2 md:col-span-5 md:mx-0 md:h-[calc(100svh-var(--header-h))] md:bg-transparent md:p-0 md:backdrop-blur-none">
            <div className="flex items-center gap-5 md:h-full md:flex-col md:justify-center md:gap-8">
              <Board slug={active} turn={turn} small={small} />
              <div className="min-w-0 md:text-center" aria-live="polite">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.45, ease: EASE }}
                  >
                    <p className="font-script text-3xl leading-none text-terracotta md:text-4xl">{category.title}</p>
                    <p className="mt-1 font-display text-2xl leading-tight text-walnut md:text-3xl">{dish.name}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Lista */}
          <div className="md:order-1 md:col-span-7" onMouseLeave={() => (hovering.current = false)}>
            {menu.map((c) => (
              <div key={c.id} id={`menu-${c.id}`} className="menu-group scroll-mt-[calc(var(--header-h)+1rem)] pt-10 first:pt-0 md:pt-16">
                <h3 className="font-script text-[clamp(3rem,6vw,4.75rem)] leading-none text-olive">{c.title}</h3>
                <ul className="mt-6">
                  {c.dishes.map((d) => {
                    const isActive = d.slug === active;
                    return (
                      <li
                        key={d.slug}
                        data-dish={d.slug}
                        onMouseEnter={() => {
                          hovering.current = true;
                          show(d.slug);
                        }}
                        className="menu-row group relative grid cursor-default grid-cols-[1fr_auto] gap-x-6 border-b border-ink/12 py-5 pl-5"
                      >
                        <span
                          aria-hidden
                          className={`absolute bottom-5 left-0 top-5 w-px origin-top bg-terracotta transition-transform duration-500 ease-[var(--ease-out-soft)] ${isActive ? "scale-y-100" : "scale-y-0"}`}
                        />
                        <span className="absolute inset-y-5 left-0 w-px bg-ink/25" aria-hidden />
                        <span>
                          <span className={`block text-[0.95rem] font-semibold uppercase tracking-[0.24em] transition-colors duration-300 md:text-base ${isActive ? "text-terracotta" : "text-walnut"}`}>
                            {d.name}
                          </span>
                          {d.description && <span className="mt-1.5 block max-w-xl text-[0.95rem] font-normal leading-relaxed text-ink/80">{d.description}</span>}
                          {d.note && <span className="mt-1 block text-xs uppercase tracking-[0.2em] text-olive">{d.note}</span>}
                        </span>
                        {d.price !== null && (
                          <span className="pt-0.5 text-[0.95rem] font-semibold tabular-nums tracking-[0.18em] text-olive">{formatPrice(d.price)}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            <div className="mt-14 flex flex-col items-start gap-5 border-t border-ink/15 pt-10 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-sm text-sm leading-relaxed text-ink/70">
                Valores em reais. Alguns pratos dependem da disponibilidade dos ingredientes do dia.
              </p>
              <a
                href={whatsappLink("Olá! Vi o cardápio no site e gostaria de reservar uma mesa no Raízes.")}
                target="_blank"
                rel="noopener"
                data-track="whatsapp-menu"
                className="rounded-full bg-walnut px-6 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-cream transition-colors duration-300 hover:bg-terracotta"
              >
                Reservar mesa
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Tábua de nogueira que gira um pouco a cada prato servido; o prato entra e sai girando. */
function Board({ slug, turn, small }: { slug: string; turn: number; small: boolean }) {
  return (
    <div className="relative aspect-square w-32 shrink-0 sm:w-40 md:w-[min(34vw,32rem)]">
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full shadow-[0_30px_60px_-20px_rgba(43,26,18,.55)]"
        animate={{ rotate: turn * -24 }}
        transition={{ duration: 1.2, ease: EASE }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/textures/lazy-susan.webp" alt="" className="h-full w-full" />
      </motion.div>
      <div className="absolute inset-[11%]">
        <AnimatePresence initial={false}>
          <motion.img
            key={slug}
            src={plateSrc(slug, small)}
            alt={`${dishBySlug[slug].name}, visto de cima`}
            className="absolute inset-0 h-full w-full rounded-full shadow-[0_0_34px_4px_rgba(0,0,0,.45)]"
            initial={{ opacity: 0, rotate: 70, x: "38%", scale: 0.82 }}
            animate={{ opacity: 1, rotate: 0, x: "0%", scale: 1 }}
            exit={{ opacity: 0, rotate: -70, x: "-38%", scale: 0.82 }}
            transition={{ duration: 0.9, ease: EASE }}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
