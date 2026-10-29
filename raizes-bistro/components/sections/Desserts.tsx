"use client";

import { useRef } from "react";
import { BigTitle } from "@/components/motion/BigTitle";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { formatPrice, menu, plateSrc } from "@/lib/menu";

const DESSERTS = menu.find((c) => c.id === "sobremesas")!.dishes;
// Cores dos cards em rodízio, tiradas da paleta da casa
const COLORS = ["bg-bark text-cream", "bg-espresso text-cream", "bg-[#b9877a] text-espresso", "bg-sage text-espresso"];

/** Carrossel infinito de sobremesas (a "brewery" da base): corre sozinho e pausa com o mouse. */
export function Desserts() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const track = ref.current!.querySelector<HTMLElement>(".dessert-track")!;
      const loop = gsap.to(track, { xPercent: -50, duration: 48, ease: "none", repeat: -1 });
      const pause = () => gsap.to(loop, { timeScale: 0, duration: 0.6 });
      const play = () => gsap.to(loop, { timeScale: 1, duration: 0.6 });
      track.addEventListener("mouseenter", pause);
      track.addEventListener("mouseleave", play);
      return () => {
        track.removeEventListener("mouseenter", pause);
        track.removeEventListener("mouseleave", play);
      };
    },
    { scope: ref },
  );

  const cards = (hidden: boolean) =>
    DESSERTS.map((d, i) => (
      <li
        key={`${d.slug}-${hidden}`}
        aria-hidden={hidden || undefined}
        className={`flex h-[min(34rem,72svh)] w-[min(72vw,18rem)] shrink-0 flex-col items-center px-6 pb-8 pt-8 text-center md:w-[19rem] ${COLORS[i % COLORS.length]}`}
      >
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] opacity-75">
          Sobremesa{d.price !== null && <> &nbsp;|&nbsp; R$ {formatPrice(d.price)}</>}
        </p>
        <h3 className="mt-4 font-display text-[2.2rem] leading-[0.95]">{d.name}</h3>
        <div className="mt-auto w-[85%]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={plateSrc(d.slug)} alt={hidden ? "" : `${d.name}, visto de cima`} loading="lazy" className="aspect-square w-full rounded-full shadow-[0_18px_40px_-8px_rgba(0,0,0,.55)]" />
        </div>
      </li>
    ));

  return (
    <section ref={ref} id="sobremesas" aria-labelledby="sobremesas-title" className="overflow-hidden bg-linen py-24 text-walnut md:py-36">
      <div className="container-x flex flex-col items-center text-center">
        <BigTitle id="sobremesas-title">
          O final <em className="italic text-terracotta">doce</em>
        </BigTitle>
        <p className="mt-8 max-w-xl text-[1.05rem] leading-relaxed text-ink/85">
          Do tiramisù ao pudim de leite condensado: sobremesas para fechar a noite do jeito que a memória pede.
        </p>
      </div>
      <ul className="dessert-track mt-14 flex w-max gap-3 md:mt-20">
        {cards(false)}
        {cards(true)}
      </ul>
    </section>
  );
}
