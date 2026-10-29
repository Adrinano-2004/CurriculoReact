"use client";

import { useRef, useState } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { menu, plateSrc } from "@/lib/menu";
import { markReady } from "@/lib/ready";

const tableSlugs = [...new Set(menu.flatMap((c) => c.table))];
const MIN_TIME = 1.8;

function load(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });
}

/** Logo da casa enquanto a mesa e os pratos carregam; sai com uma cortina revelando o hero. */
export function Preloader() {
  const ref = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useGSAP(
    () => {
      const reduce = prefersReducedMotion();
      const small = window.innerWidth < 768;
      const CRITICAL = ["/images/textures/lazy-susan.webp", ...tableSlugs.map((s) => plateSrc(s, small))];
      const html = document.documentElement;
      html.style.overflow = "hidden";
      const progress = { value: 0 };
      const counter = ref.current!.querySelector<HTMLElement>(".pl-count")!;
      const bar = ref.current!.querySelector<HTMLElement>(".pl-bar")!;
      let loaded = 0;
      const render = () => {
        counter.textContent = String(Math.round(progress.value)).padStart(3, "0");
        bar.style.transform = `scaleX(${progress.value / 100})`;
      };

      gsap.from(".pl-logo", { autoAlpha: 0, scale: 0.92, duration: 1.4, ease: "power2.out" });

      const assets = Promise.all([
        ...CRITICAL.map((src) =>
          load(src).then(() => {
            loaded++;
            gsap.to(progress, { value: (loaded / CRITICAL.length) * 100, duration: 0.6, ease: "power1.out", onUpdate: render, overwrite: true });
          }),
        ),
        document.fonts?.ready,
      ]);
      const minTime = new Promise((r) => setTimeout(r, reduce ? 0 : MIN_TIME * 1000));

      Promise.all([assets, minTime]).then(() => {
        gsap.to(progress, { value: 100, duration: 0.4, onUpdate: render });
        const tl = gsap.timeline({
          delay: 0.45,
          onComplete: () => {
            html.style.overflow = "";
            setDone(true);
          },
        });
        tl.to(".pl-logo, .pl-meta", { autoAlpha: 0, y: -16, duration: 0.7, ease: "power2.in", stagger: 0.05 })
          .add(markReady, "-=0.15")
          .to(ref.current, { clipPath: "inset(0% 0% 100% 0%)", duration: reduce ? 0.01 : 1.15, ease: "power4.inOut" }, "-=0.2");
      });
    },
    { scope: ref },
  );

  if (done) return null;

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-[100] grid place-items-center bg-espresso"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo-light.webp" alt="" className="pl-logo w-[min(56vw,15rem)]" />
      <div className="pl-meta absolute inset-x-0 bottom-10 flex flex-col items-center gap-3">
        <span className="pl-count font-display text-2xl tabular-nums text-cream/80">000</span>
        <span className="block h-px w-40 bg-cream/15">
          <span className="pl-bar block h-full origin-left scale-x-0 bg-candle" />
        </span>
      </div>
    </div>
  );
}
