"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { rating, reviews } from "@/lib/site";

export function Reviews() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".review", { autoAlpha: 0, y: 40, stagger: 0.12, duration: 1.1, scrollTrigger: { trigger: ".review-grid", start: "top 80%" } });
      const score = { v: 0 };
      const el = ref.current!.querySelector<HTMLElement>(".score")!;
      gsap.to(score, {
        v: Number(rating.score.replace(",", ".")),
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%" },
        onUpdate: () => (el.textContent = score.v.toFixed(1).replace(".", ",")),
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} aria-labelledby="avaliacoes-title" className="bg-linen py-28 text-ink md:py-40">
      <div className="container-x">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-terracotta">Quem já sentou à mesa</p>
            <h2 id="avaliacoes-title" className="title-lg mt-5 max-w-2xl text-walnut">
              Comida, ambiente e atendimento que viram lembrança.
            </h2>
          </div>
          <div className="flex items-end gap-4">
            <span className="score font-display text-8xl leading-none text-walnut" aria-hidden>
              {rating.score}
            </span>
            <span className="pb-2 text-sm leading-snug text-ink/70">
              <span className="sr-only">Nota {rating.score} de 5 </span>
              de 5 no {rating.source}
              <br />
              {rating.count} avaliações
            </span>
          </div>
        </div>

        <ul className="review-grid mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {reviews.map((r) => (
            <li key={r.title} className="review flex flex-col rounded-sm bg-cream p-7 shadow-[0_20px_50px_-30px_rgba(43,26,18,.35)]">
              <span aria-hidden className="font-display text-6xl leading-[0.6] text-terracotta/70">“</span>
              <h3 className="mt-4 font-display text-2xl text-walnut">{r.title}</h3>
              <p className="mt-3 flex-1 leading-relaxed text-ink/80">{r.text}</p>
              <p className="eyebrow mt-6 text-olive">{r.meta}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
