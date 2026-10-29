"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, SplitText, useGSAP } from "@/lib/gsap";
import { useReady } from "@/lib/ready";
import { RotatingTable } from "./RotatingTable";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const ready = useReady();

  useGSAP(
    () => {
      if (!ready) return;
      const reduce = prefersReducedMotion();
      const split = SplitText.create(".hero-title", { type: "lines", mask: "lines", linesClass: "split-line" });
      const tl = gsap.timeline({ delay: 0.15 });
      tl.from(".hero-script", { autoAlpha: 0, y: 20, duration: 1.2, ease: "power2.out" })
        .from(split.lines, { yPercent: 110, duration: reduce ? 0.01 : 1.3, stagger: 0.12, ease: "power4.out" }, 0.1)
        .from(".hero-meta", { autoAlpha: 0, y: 12, stagger: 0.1, duration: 1 }, 0.6);

      if (!reduce) {
        gsap.to(copyRef.current, {
          yPercent: -35,
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "60% top", scrub: true },
        });
      }
      return () => split.revert();
    },
    { dependencies: [ready], scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="inicio"
      aria-label="Apresentação"
      className="grain relative h-svh min-h-[38rem] overflow-hidden bg-espresso"
    >
      {/* Luz de vela */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 0%, rgba(217,163,91,.16), transparent 70%), radial-gradient(45% 40% at 12% 85%, rgba(163,72,42,.18), transparent 70%), radial-gradient(40% 35% at 90% 75%, rgba(217,163,91,.08), transparent 70%)",
        }}
      />

      <div ref={copyRef} className="container-x relative z-10 flex flex-col items-center pt-[calc(var(--header-h)+1.25rem)] text-center md:pt-[calc(var(--header-h)+0.5rem)]">
        <p className="hero-script font-script text-[clamp(2rem,3.4vw,3.2rem)] leading-none text-candle">
          Bistrô &amp; Massas
        </p>
        <h1 className="hero-title title-xl mt-1 max-w-[16ch] text-cream md:max-w-none">
          Comfort food <em className="font-display italic text-candle/95">com memória</em>
        </h1>
        <p className="hero-meta mt-4 max-w-md text-[0.95rem] leading-relaxed text-cream/70 md:hidden">
          Massas artesanais e cozinha afetiva em Juiz de Fora.
        </p>
      </div>

      {/* Laterais (desktop) */}
      <p className="hero-meta eyebrow absolute left-[var(--gutter)] top-[42%] z-20 hidden max-w-[14rem] leading-relaxed text-cream/55 lg:block">
        Qua a sáb · 19h às 23h
        <br />
        Dom · 12h às 16h
      </p>
      <p className="hero-meta eyebrow absolute right-[var(--gutter)] top-[42%] z-20 hidden text-right leading-relaxed text-cream/55 lg:block">
        Juiz de Fora · MG
        <br />
        Desde 2017
      </p>

      <RotatingTable sectionRef={sectionRef} />
    </section>
  );
}
