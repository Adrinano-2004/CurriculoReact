"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import type { Photo } from "@/lib/photos";

type Props = {
  photo: Photo;
  className?: string;
  sizes: string;
  /** Deslocamento do parallax interno em % (0 desliga). */
  parallax?: number;
  priority?: boolean;
};

/** Imagem revelada por máscara (clip-path) ao entrar na tela, com leve parallax interno. */
export function RevealImage({ photo, className = "", sizes, parallax = 10, priority }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const img = ref.current!.querySelector("img");
      gsap.fromTo(
        ref.current,
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "power3.inOut", scrollTrigger: { trigger: ref.current, start: "top 85%" } },
      );
      if (parallax && img) {
        gsap.fromTo(
          img,
          { yPercent: -parallax, scale: 1 + parallax / 50 },
          { yPercent: parallax, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true } },
        );
      }
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes={sizes} priority={priority} className="h-full w-full object-cover" />
    </div>
  );
}
