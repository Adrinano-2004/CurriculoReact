"use client";

import { useRef } from "react";
import { BigTitle } from "@/components/motion/BigTitle";
import { useReservation } from "@/components/reservation/ReservationProvider";
import { OutlineButton } from "@/components/ui/OutlineButton";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { formatPrice, menu, plateSrc } from "@/lib/menu";

const DISHES = menu.find((c) => c.id === "sugestoes")!.dishes;
// Inclinação alternada dos cards, como na base de referência
const TILT = [3, -2, 3, -2];

/**
 * Sugestões da Chef: cards inclinados que ficam presos no topo e se empilham conforme o scroll.
 * Cada card tem o nome gigante correndo ao fundo e o prato visto de cima girando.
 */
export function ChefSelection() {
  const ref = useRef<HTMLElement>(null);
  const { openReservation } = useReservation();

  useGSAP(
    () => {
      const reduce = prefersReducedMotion();
      const cards = gsap.utils.toArray<HTMLElement>(".chef-card");

      cards.forEach((card, i) => {
        const tilt = TILT[i % TILT.length];
        const wrap = card.parentElement!;
        if (reduce) {
          gsap.set(card, { rotate: tilt });
          return;
        }
        // Entra mais inclinado e assenta no ângulo final
        gsap.fromTo(
          card,
          { rotate: tilt * 2.4, yPercent: 12 },
          { rotate: tilt, yPercent: 0, ease: "none", scrollTrigger: { trigger: wrap, start: "top bottom", end: "top 15%", scrub: 0.6 } },
        );
        // Quando o próximo card cobre este, ele recua um pouco
        const next = cards[i + 1]?.parentElement;
        if (next) {
          gsap.to(card, {
            scale: 0.94,
            ease: "none",
            scrollTrigger: { trigger: next, start: "top bottom", end: "top 15%", scrub: true },
          });
        }
        gsap.to(card.querySelector(".chef-plate"), {
          rotate: 70,
          ease: "none",
          scrollTrigger: { trigger: wrap, start: "top bottom", end: "bottom top", scrub: true },
        });
        // Nome gigante correndo ao fundo
        gsap.to(card.querySelector(".chef-ticker"), { xPercent: -50, duration: 26, ease: "none", repeat: -1 });
      });
      ScrollTrigger.refresh();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="sugestoes" aria-labelledby="sugestoes-title" className="relative bg-linen pb-24 text-walnut md:pb-40">
      <div className="container-x flex flex-col items-center pt-24 text-center md:pt-32">
        <BigTitle id="sugestoes-title">
          Sugestões <em className="italic text-terracotta">da Chef</em>
        </BigTitle>
        <p className="mt-8 max-w-xl text-[1.05rem] leading-relaxed text-ink/85">
          Pratos feitos com massas artesanais e molhos criativos: clássicos revisitados pela Chef Weruska e criações autorais da casa.
        </p>
      </div>

      <ul className="container-x mt-14 md:mt-20">
        {DISHES.map((dish, i) => {
          const dark = i % 2 === 0;
          return (
            <li key={dish.slug} className="sticky top-[calc(var(--header-h)+1rem)] pb-[12svh] md:top-[10svh]" style={{ zIndex: i + 1 }}>
              <article
                className={`chef-card relative mx-auto grid min-h-[min(40rem,78svh)] max-w-6xl overflow-hidden rounded-sm shadow-[0_40px_80px_-30px_rgba(20,12,8,.55)] will-change-transform md:grid-cols-2 ${
                  dark ? "bg-espresso text-cream" : "bg-cream text-walnut ring-1 ring-walnut/10"
                }`}
              >
                {/* Nome gigante ao fundo */}
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden">
                  <p className={`chef-ticker flex w-max whitespace-nowrap font-display text-[clamp(6rem,14vw,13rem)] uppercase leading-[0.85] ${dark ? "text-cream/[0.07]" : "text-walnut/[0.07]"}`}>
                    <span className="pr-12">{dish.name}</span>
                    <span className="pr-12">{dish.name}</span>
                  </p>
                </div>

                <div className="relative z-10 order-2 flex flex-col justify-end gap-5 p-7 md:order-1 md:p-12">
                  {dish.price !== null && (
                    <span className={`grid size-16 place-items-center rounded-full text-xs font-semibold tracking-[0.12em] ${dark ? "bg-cream text-espresso" : "bg-espresso text-cream"}`}>
                      R$ {formatPrice(dish.price).replace(",00", "")}
                    </span>
                  )}
                  <h3 className="font-display text-[clamp(2.2rem,4vw,3.6rem)] leading-[0.95]">{dish.name}</h3>
                  {dish.description && <p className={`max-w-sm leading-relaxed ${dark ? "text-cream/75" : "text-ink/80"}`}>{dish.description}</p>}
                  {dish.note && <p className="eyebrow text-candle">{dish.note}</p>}
                  <OutlineButton tone={dark ? "light" : "dark"} className="mt-2 self-start" onClick={() => openReservation(dish.name)}>
                    Reservar e provar
                  </OutlineButton>
                </div>

                <div className="relative z-10 order-1 grid place-items-center px-10 pt-10 md:order-2 md:p-10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={plateSrc(dish.slug)}
                    alt={`${dish.name}, visto de cima`}
                    loading="lazy"
                    className="chef-plate aspect-square w-[min(70vw,30rem)] rounded-full shadow-[0_0_50px_8px_rgba(0,0,0,.45)]"
                  />
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
