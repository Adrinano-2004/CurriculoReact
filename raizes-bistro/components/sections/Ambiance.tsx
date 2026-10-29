"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { photos, type Photo } from "@/lib/photos";

const SLIDES: { photo: Photo; caption: string; tall?: boolean }[] = [
  { photo: photos.fachada, caption: "A casa · Jardins Imperiais" },
  { photo: photos.entrada, caption: "Boas-vindas", tall: true },
  { photo: photos.mesaVelas, caption: "Luz de vela" },
  { photo: photos.salao, caption: "O salão e a adega", tall: true },
  { photo: photos.vinho, caption: "Carta de vinhos" },
  { photo: photos.raclette, caption: "Queijo derretido à mesa", tall: true },
  { photo: photos.drink, caption: "Drinks da casa" },
  { photo: photos.mesaPosta, caption: "Mesa posta", tall: true },
  { photo: photos.comemoracao, caption: "Comemorações e grupos" },
];

/** Galeria horizontal: no desktop a seção fica fixa e as fotos correm de lado; no celular, deslize. */
export function Ambiance() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        if (prefersReducedMotion()) return;
        const track = ref.current!.querySelector<HTMLElement>(".amb-track")!;
        const distance = () => track.scrollWidth - window.innerWidth;
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
        gsap.utils.toArray<HTMLElement>(".amb-img").forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -8 },
            { xPercent: 8, ease: "none", scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: "left right", end: "right left", scrub: true } },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="ambiente" aria-labelledby="ambiente-title" className="grain relative overflow-hidden bg-espresso md:h-svh">
      <div className="amb-track flex h-full flex-col gap-12 py-24 md:w-max md:flex-row md:items-center md:gap-10 md:py-0 md:pl-[var(--gutter)]">
        <header className="container-x shrink-0 md:w-[30rem] md:px-0">
          <p className="eyebrow text-candle">Ambiente</p>
          <h2 id="ambiente-title" className="title-lg mt-5 text-cream">
            Aconchego de casa, <em className="italic text-candle">à luz de vela</em>.
          </h2>
          <p className="mt-6 max-w-sm leading-relaxed text-cream/70">
            Mesas postas com cuidado, luz baixa e uma carta de vinhos para acompanhar. Um bistrô para jantar sem pressa, comemorar e voltar.
          </p>
          <p className="eyebrow mt-10 hidden text-cream/40 md:block">Role para passear →</p>
        </header>

        <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-2 [scrollbar-width:none] md:snap-none md:gap-8 md:overflow-visible md:px-0 md:pr-[var(--gutter)]">
          {SLIDES.map(({ photo, caption, tall }) => (
            <li key={photo.src} className={`shrink-0 snap-center ${tall ? "w-[70vw] md:w-[26vw]" : "w-[82vw] md:w-[34vw]"}`}>
              <div className={`relative overflow-hidden rounded-sm ${tall ? "aspect-[3/4] md:h-[70svh] md:w-full md:aspect-auto" : "aspect-[4/3] md:aspect-[5/4]"}`}>
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 768px) 34vw, 82vw"
                  className="amb-img object-cover md:scale-[1.18]"
                />
              </div>
              <p className="eyebrow mt-4 text-cream/60">{caption}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
