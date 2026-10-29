"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import type { Photo } from "@/lib/photos";

type Props = {
  photos: Photo[];
  /** Sentido do deslocamento conforme o scroll. */
  direction?: 1 | -1;
  className?: string;
};

/** Faixa de fotos de ponta a ponta que desliza na horizontal enquanto a página rola (o "ticket" da base). */
export function PhotoStrip({ photos, direction = -1, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const track = ref.current!.querySelector<HTMLElement>(".strip-track")!;
      const travel = () => track.scrollWidth - window.innerWidth;
      gsap.fromTo(
        track,
        { x: () => (direction < 0 ? 0 : -travel()) },
        {
          x: () => (direction < 0 ? -travel() : 0),
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: 0.6, invalidateOnRefresh: true },
        },
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <ul className="strip-track flex w-max gap-2 md:gap-3">
        {photos.map((photo, i) => (
          <li key={`${photo.src}-${i}`} className="relative h-[clamp(11rem,24vw,22rem)] w-[clamp(8.5rem,16vw,15rem)] shrink-0 overflow-hidden">
            <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 768px) 16vw, 40vw" className="object-cover" />
          </li>
        ))}
      </ul>
    </div>
  );
}
