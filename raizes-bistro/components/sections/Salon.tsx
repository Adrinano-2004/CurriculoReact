"use client";

import Image from "next/image";
import { useRef } from "react";
import { useReservation } from "@/components/reservation/ReservationProvider";
import { OutlineButton } from "@/components/ui/OutlineButton";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { photos } from "@/lib/photos";

/**
 * O salão: duas fotos cobrem a tela como uma cortina e se abrem para os lados enquanto a seção
 * fica fixa, revelando o texto no meio (o "speakeasy" da base de referência).
 */
export function Salon() {
  const ref = useRef<HTMLElement>(null);
  const { openReservation } = useReservation();

  useGSAP(
    () => {
      // No celular a cortina abre quase toda para caber o texto
      const open = window.matchMedia("(min-width: 768px)").matches ? 72 : 96;
      if (prefersReducedMotion()) {
        gsap.set(".curtain-left", { xPercent: -open });
        gsap.set(".curtain-right", { xPercent: open });
        return;
      }
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom bottom", scrub: 0.8 },
      });
      tl.to(".curtain-left", { xPercent: -open, ease: "power2.inOut" }, 0)
        .to(".curtain-right", { xPercent: open, ease: "power2.inOut" }, 0)
        .to(".curtain-img", { scale: 1.12, ease: "none" }, 0)
        .fromTo(".salon-content", { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 1, scale: 1, ease: "power2.out", duration: 0.5 }, 0.25)
        .fromTo(".salon-rule", { scaleX: 0 }, { scaleX: 1, ease: "power2.out", duration: 0.5 }, 0.35);
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="salao" aria-labelledby="salao-title" className="relative h-[300svh] bg-espresso">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="salon-content grain absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          <span className="salon-rule block h-px w-full max-w-xl origin-center bg-cream/30" />
          <h2 id="salao-title" className="py-4 font-display text-[clamp(3.4rem,9vw,8.5rem)] leading-[0.9] text-cream">
            À luz <em className="italic text-candle">de vela</em>
          </h2>
          <span className="salon-rule block h-px w-full max-w-xl origin-center bg-cream/30" />
          <p className="mt-8 max-w-md leading-relaxed text-cream/75">
            Mesas postas com cuidado, luz baixa e uma carta de vinhos para acompanhar. Um bistrô para jantar sem pressa, comemorar e voltar.
          </p>
          <OutlineButton className="mt-9" onClick={() => openReservation()}>
            Reservar mesa
          </OutlineButton>
        </div>

        <div className="curtain-left absolute inset-y-0 left-0 w-1/2 overflow-hidden will-change-transform">
          <Image src={photos.entrada.src} alt={photos.entrada.alt} fill sizes="50vw" className="curtain-img object-cover" />
        </div>
        <div className="curtain-right absolute inset-y-0 right-0 w-1/2 overflow-hidden will-change-transform">
          <Image src={photos.salao.src} alt={photos.salao.alt} fill sizes="50vw" className="curtain-img object-cover" />
        </div>
      </div>
    </section>
  );
}
