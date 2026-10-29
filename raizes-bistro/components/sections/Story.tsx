"use client";

import { useRef } from "react";
import { RevealImage } from "@/components/motion/RevealImage";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { photos } from "@/lib/photos";
import { site } from "@/lib/site";

const TIMELINE = [
  {
    year: "2017",
    title: "Um sítio, a mata e as primeiras massas",
    text: "Weruska deixa a cozinha japonesa e começa a produzir massas e petiscos artesanais em um sítio cercado de mata, unindo modernidade e memória afetiva.",
  },
  {
    year: "2021",
    title: "O bistrô abre as portas",
    text: "Em vez de virar delivery na pandemia, ela esperou para receber as pessoas no salão. Assim nasce o Raízes Bistrô e Massas.",
  },
  {
    year: "Hoje",
    title: "Grupo Raízes",
    text: "O bistrô, a linha artesanal para levar e o Raízes Empório (@raizesemporiojf).",
  },
];

export function Story() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const split = SplitText.create(".story-title", { type: "lines", mask: "lines", linesClass: "split-line" });
      gsap.from(split.lines, { yPercent: 110, stagger: 0.1, duration: 1.2, ease: "power4.out", scrollTrigger: { trigger: ".story-title", start: "top 85%" } });
      gsap.utils.toArray<HTMLElement>(".story-step").forEach((el) => {
        gsap.from(el, { autoAlpha: 0, y: 30, duration: 1, scrollTrigger: { trigger: el, start: "top 85%" } });
        gsap.from(el.querySelector(".story-line"), { scaleX: 0, transformOrigin: "left", duration: 1.4, ease: "power3.inOut", scrollTrigger: { trigger: el, start: "top 85%" } });
      });
      return () => split.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="historia" aria-labelledby="historia-title" className="grain relative bg-walnut py-28 md:py-40">
      <div className="container-x grid gap-16 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-[calc(var(--header-h)+2rem)]">
            <RevealImage photo={photos.chef} sizes="(min-width: 768px) 40vw, 100vw" className="aspect-[4/5] rounded-t-[999px]" />
            <p className="mt-5 text-sm text-cream/60">{site.chef}, chef e fundadora</p>
          </div>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <p className="eyebrow text-candle">Nossa história</p>
          <h2 id="historia-title" className="story-title title-lg mt-5 text-cream">
            Das memórias da Chef Weruska para a sua mesa.
          </h2>
          <blockquote className="mt-10 border-l border-candle/60 pl-6">
            <p className="font-display text-2xl italic leading-snug text-cream/90 md:text-[1.9rem]">
              “Eu gosto de pegar esses tradicionais e modernizar de alguma forma.”
            </p>
            <footer className="eyebrow mt-4 text-cream/50">Weruska Fonseca · Tribuna de Minas</footer>
          </blockquote>

          <ol className="mt-16 space-y-12">
            {TIMELINE.map((step) => (
              <li key={step.year} className="story-step">
                <div className="flex items-baseline gap-5">
                  <span className="font-script text-5xl leading-none text-candle">{step.year}</span>
                  <span className="story-line h-px flex-1 bg-cream/20" />
                </div>
                <h3 className="mt-4 font-display text-3xl text-cream">{step.title}</h3>
                <p className="mt-3 max-w-xl leading-relaxed text-cream/70">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
