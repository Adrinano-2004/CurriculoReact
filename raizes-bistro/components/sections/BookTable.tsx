"use client";

import Image from "next/image";
import { useRef } from "react";
import { BigTitle } from "@/components/motion/BigTitle";
import { useReservation } from "@/components/reservation/ReservationProvider";
import { OutlineButton } from "@/components/ui/OutlineButton";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { photos } from "@/lib/photos";
import { rating } from "@/lib/site";

/** Faixa de reserva: foto de fundo com parallax, título gigante e CTA que abre o modal. */
export function BookTable() {
  const ref = useRef<HTMLElement>(null);
  const { openReservation } = useReservation();

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(".book-bg", { yPercent: -12 }, { yPercent: 12, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true } });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="reservas" aria-labelledby="reservas-title" className="relative overflow-hidden bg-espresso text-cream">
      <div className="book-bg absolute -inset-y-[14%] inset-x-0">
        <Image src={photos.mesaVelas.src} alt="" fill sizes="100vw" className="object-cover" />
      </div>
      <div className="absolute inset-0 bg-espresso/70" />
      <div className="container-x relative flex min-h-[100svh] flex-col items-center justify-center py-28 text-center">
        <BigTitle id="reservas-title">
          Reserve <em className="italic text-candle">sua mesa</em>
        </BigTitle>
        <p className="mt-8 max-w-lg text-[1.05rem] leading-relaxed text-cream/80">
          Um jantar a dois, o almoço de domingo em família ou uma comemoração: escolha o dia e a gente prepara a mesa para você.
        </p>
        <OutlineButton className="mt-9" onClick={() => openReservation()}>
          Fazer a reserva
        </OutlineButton>
        <p className="eyebrow mt-12 text-cream/60">
          {rating.score} de 5 no {rating.source} · {rating.count} avaliações
        </p>
      </div>
    </section>
  );
}
