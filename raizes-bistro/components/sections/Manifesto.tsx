"use client";

import { useRef } from "react";
import { RevealImage } from "@/components/motion/RevealImage";
import { gsap, prefersReducedMotion, SplitText, useGSAP } from "@/lib/gsap";
import { photos } from "@/lib/photos";

// Texto do próprio Raízes (post "A gastronomia do Raízes Bistrô é feita de sabor e afeto").
const LEAD = "A gastronomia do Raízes Bistrô é feita de sabor e afeto.";
const BODY =
  "A base da cozinha nasce das memórias e referências da Chef Weruska: os produtos frescos, as receitas de família, as técnicas aprendidas na Le Cordon Bleu, o olhar apurado sobre clássicos e as criações autorais. O resultado é uma cozinha contemporânea e afetiva.";

/** Manifesto: as palavras acendem conforme o scroll. */
export function Manifesto() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const split = SplitText.create(".manifesto-text", { type: "words" });
      gsap.fromTo(
        split.words,
        { opacity: 0.16 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: "none",
          scrollTrigger: { trigger: ".manifesto-text", start: "top 78%", end: "bottom 45%", scrub: true },
        },
      );
      return () => split.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} aria-label="Nossa cozinha" className="grain relative overflow-hidden bg-espresso py-28 md:py-44">
      <div className="container-x relative grid gap-14 md:grid-cols-12 md:items-center">
        <div className="md:col-span-8">
          <p className="font-script text-4xl text-candle md:text-5xl">Raízes</p>
          <p className="manifesto-text mt-4 font-display text-[clamp(1.9rem,3.7vw,3.6rem)] leading-[1.12] text-cream">
            <span className="italic text-candle">{LEAD}</span> {BODY}
          </p>
        </div>
        <div className="relative hidden md:col-span-4 md:block">
          <RevealImage photo={photos.maos} sizes="30vw" className="aspect-[3/4] rounded-[999px_999px_0_0]" />
          <RevealImage photo={photos.casquinha} sizes="16vw" parallax={6} className="absolute -bottom-16 -left-24 aspect-square w-48 rounded-full border-8 border-espresso" />
        </div>
      </div>
    </section>
  );
}
