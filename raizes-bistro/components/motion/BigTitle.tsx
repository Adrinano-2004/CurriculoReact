"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, prefersReducedMotion, SplitText, useGSAP } from "@/lib/gsap";

type Props = { as?: ElementType; id?: string; className?: string; children: ReactNode };

/** Título gigante centralizado; as linhas sobem de dentro de uma máscara ao entrar na tela. */
export function BigTitle({ as: Tag = "h2", id, className = "", children }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const split = SplitText.create(ref.current, { type: "lines", mask: "lines", linesClass: "split-line" });
      gsap.from(split.lines, {
        yPercent: 105,
        stagger: 0.09,
        duration: 1.25,
        ease: "power4.out",
        scrollTrigger: { trigger: ref.current, start: "top 88%" },
      });
      return () => split.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} className={`font-display text-[clamp(3.4rem,11.5vw,11rem)] font-normal leading-[0.86] tracking-[-0.025em] ${className}`}>
      {children}
    </Tag>
  );
}
