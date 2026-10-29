"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Draggable, gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { dishBySlug, formatPrice, menu, plateSrc } from "@/lib/menu";
import { useReady } from "@/lib/ready";
import {
  dishAt,
  initialSegments,
  planSwitch,
  rotationFromStep,
  settle,
  SLOTS,
  STEP_DEG,
  stepFromRotation,
  virtualIndex,
  type Segment,
} from "./table-model";

const TABLES = menu.map((c) => c.table);
const AUTO_EVERY = 4.2; // segundos entre um giro automático e outro
const INTRO_STEPS = -3;

type Geometry = { d: number; r: number; p: number; cy: number; mobile: boolean };

function computeGeometry(w: number, h: number): Geometry {
  const mobile = w < 768;
  const d = mobile ? Math.min(w * 1.9, h * 1.05) : Math.min(w * 0.95, h * 1.55, 1500);
  return { d, r: d * 0.345, p: d * 0.24, cy: h + d * (mobile ? -0.06 : 0.05), mobile };
}

type Props = {
  /** Seção que controla o giro ligado ao scroll. */
  sectionRef: React.RefObject<HTMLElement | null>;
};

export function RotatingTable({ sectionRef }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<HTMLDivElement>(null);
  const ready = useReady();

  const [geo, setGeo] = useState<Geometry | null>(null);
  const [segments, setSegments] = useState<Segment[]>(() => initialSegments(0));
  const segmentsRef = useRef(segments);
  segmentsRef.current = segments;
  const [slotsN, setSlotsN] = useState<number[]>(() =>
    Array.from({ length: SLOTS }, (_, i) => virtualIndex(i, INTRO_STEPS)),
  );
  const [topN, setTopN] = useState(INTRO_STEPS);

  const interacting = useRef(false);
  const dragged = useRef(false);
  const inView = useRef(true);
  const lastInteraction = useRef(0);

  // Geometria responsiva
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setGeo(computeGeometry(width, height));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const totalRotation = () =>
    Number(gsap.getProperty(spinRef.current, "rotation")) + Number(gsap.getProperty(scrollRef.current, "rotation"));
  const currentStep = () => stepFromRotation(totalRotation());

  // Sincroniza os pratos com o ângulo da mesa a cada frame (só re-renderiza quando algo muda).
  useEffect(() => {
    let prevKey = "";
    let prevTop = NaN;
    const sync = () => {
      if (!spinRef.current) return;
      const step = currentStep();
      const ns = Array.from({ length: SLOTS }, (_, i) => virtualIndex(i, step));
      const key = ns.join(",");
      if (key !== prevKey) {
        prevKey = key;
        setSlotsN(ns);
      }
      const top = Math.round(step);
      if (top !== prevTop) {
        prevTop = top;
        setTopN(top);
      }
    };
    gsap.ticker.add(sync);
    return () => gsap.ticker.remove(sync);
  }, []);

  /** Gira a mesa até o passo `step` (descontando a rotação que vem do scroll). */
  const spinTo = useCallback((step: number, opts: gsap.TweenVars = {}, byUser = true) => {
    const scrollRot = Number(gsap.getProperty(scrollRef.current, "rotation"));
    if (byUser) lastInteraction.current = performance.now();
    return gsap.to(spinRef.current, {
      rotation: rotationFromStep(step) - scrollRot,
      duration: 1.3,
      ease: "power2.inOut",
      overwrite: true,
      ...opts,
    });
  }, []);

  const nudge = useCallback((dir: 1 | -1) => spinTo(Math.round(currentStep()) + dir), [spinTo]);

  const activeCategory = dishAt(segments, topN, TABLES).category;

  const selectCategory = useCallback(
    (category: number) => {
      const step = currentStep();
      const current = dishAt(segmentsRef.current, Math.round(step), TABLES).category;
      if (category === current) return;
      const plan = planSwitch(segmentsRef.current, step, category, category > current);
      setSegments(plan.segments);
      spinTo(plan.target, {
        duration: prefersReducedMotion() ? 0.01 : 1.9,
        ease: "power3.inOut",
        onComplete: () => setSegments((s) => settle(s, currentStep())),
      });
    },
    [spinTo],
  );

  // Entrada, arrastar, giro automático e giro ligado ao scroll
  useGSAP(
    () => {
      if (!geo || !ready) return;
      const reduce = prefersReducedMotion();
      const spin = spinRef.current!;
      const plates = gsap.utils.toArray<HTMLElement>(".plate-inner", spin);

      // Entrada: a mesa chega girando e os pratos "pousam"
      if (!reduce) {
        gsap.fromTo(spin, { rotation: rotationFromStep(INTRO_STEPS) }, { rotation: 0, duration: 2.6, ease: "power3.out" });
        gsap.fromTo(scrollRef.current, { scale: 0.86, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.8, ease: "power2.out" });
        gsap.fromTo(plates, { scale: 1.25, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.1, stagger: 0.08, delay: 0.5, ease: "power3.out" });
      } else {
        gsap.set(spin, { rotation: 0 });
        gsap.set(scrollRef.current, { autoAlpha: 1 });
      }

      // Arrastar para girar (mouse/trackpad). No toque usamos os botões e as abas para não travar o scroll.
      let drag: Draggable | undefined;
      if (!geo.mobile && window.matchMedia("(pointer: fine)").matches) {
        [drag] = Draggable.create(spin, {
          type: "rotation",
          inertia: true,
          cursor: "grab",
          activeCursor: "grabbing",
          dragClickables: true,
          snap: (value: number) => {
            const scrollRot = Number(gsap.getProperty(scrollRef.current, "rotation"));
            return Math.round((value + scrollRot) / STEP_DEG) * STEP_DEG - scrollRot;
          },
          onPress: () => {
            interacting.current = true;
            dragged.current = false;
            gsap.killTweensOf(spin);
          },
          onDragStart: () => (dragged.current = true),
          onRelease: () => {
            interacting.current = false;
            lastInteraction.current = performance.now();
          },
          onThrowComplete: () => (lastInteraction.current = performance.now()),
        });
      }

      // Giro automático: a mesa vai mostrando o próximo prato da categoria
      const auto = reduce
        ? undefined
        : gsap.delayedCall(AUTO_EVERY, function loop() {
            const idle = performance.now() - lastInteraction.current > AUTO_EVERY * 1000 * 1.4;
            if (idle && !interacting.current && inView.current && !document.hidden) {
              spinTo(Math.round(currentStep()) + 1, { duration: 1.5 }, false);
            }
            auto?.restart(true);
          });

      // Ao rolar a página a mesa continua girando e desce, abrindo espaço para o cardápio
      const section = sectionRef.current;
      let st: ScrollTrigger | undefined;
      if (section) {
        st = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom top",
          onToggle: (self) => (inView.current = self.isActive),
        });
        if (!reduce) {
          gsap.to(scrollRef.current, {
            rotation: -STEP_DEG * 1.5,
            yPercent: 14,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: 0.8 },
          });
        }
      }

      return () => {
        drag?.kill();
        auto?.kill();
        st?.kill();
      };
    },
    { dependencies: [geo?.mobile, ready], scope: stageRef, revertOnUpdate: true },
  );

  // Versão de 360px dos pratos quando a mesa é pequena (celular)
  const small = !!geo && geo.p * (typeof window !== "undefined" ? window.devicePixelRatio : 1) <= 400;

  const topDish = useMemo(() => {
    const { slug } = dishAt(segments, topN, TABLES);
    return dishBySlug[slug];
  }, [segments, topN]);

  const style = geo
    ? ({
        "--d": `${geo.d}px`,
        "--r": `${geo.r}px`,
        "--p": `${geo.p}px`,
        "--cy": `${geo.cy}px`,
      } as React.CSSProperties)
    : undefined;

  return (
    <div ref={stageRef} className="absolute inset-0" style={style}>
      {/* Abas de categoria */}
      <div className="absolute inset-x-0 top-[calc(var(--cy)-var(--d)/2-3.5rem)] z-20 flex justify-center px-4 md:top-auto md:bottom-7">
        <div role="tablist" aria-label="Categorias da mesa" className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-cream/15 bg-espresso/60 p-1 backdrop-blur-md [scrollbar-width:none]">
          {menu.map((c, i) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={activeCategory === i}
              onClick={() => selectCategory(i)}
              className="relative shrink-0 rounded-full px-3.5 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-cream/70 transition-colors duration-500 hover:text-cream aria-selected:text-espresso sm:px-5 sm:text-[0.7rem]"
            >
              {activeCategory === i && (
                <motion.span layoutId="table-tab" className="absolute inset-0 rounded-full bg-candle" transition={{ type: "spring", stiffness: 260, damping: 30 }} />
              )}
              <span className="relative">{c.short}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sombra da mesa (fixa, não gira) */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 rounded-full"
        style={{
          width: "var(--d)",
          height: "var(--d)",
          top: "calc(var(--cy) - var(--d) / 2 + 18px)",
          transform: "translateX(-50%)",
          boxShadow: "0 40px 120px 30px rgba(0,0,0,.75)",
        }}
      />

      {/* Mesa: camada do scroll > camada do giro (arrastar/automático/abas) */}
      <div
        ref={scrollRef}
        className="invisible absolute left-1/2 will-change-transform"
        style={{ width: "var(--d)", height: "var(--d)", top: "calc(var(--cy) - var(--d) / 2)", marginLeft: "calc(var(--d) / -2)" }}
      >
        <div
          ref={spinRef}
          className="relative h-full w-full touch-pan-y select-none rounded-full will-change-transform"
          role="group"
          aria-roledescription="mesa giratória"
          aria-label="Pratos do Raízes. Use as setas ou arraste para girar."
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") nudge(1);
            if (e.key === "ArrowLeft") nudge(-1);
          }}
        >
          {/* <img> simples: os pratos trocam de src durante o giro e já foram pré-carregados pelo preloader */}
          <img src="/images/textures/lazy-susan.webp" alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full" />
          {slotsN.map((n, i) => {
            const { slug } = dishAt(segments, n, TABLES);
            const dish = dishBySlug[slug];
            const visible = Math.abs(n - topN) <= 1;
            return (
              <button
                key={i}
                type="button"
                tabIndex={visible ? 0 : -1}
                aria-hidden={!visible}
                aria-label={`Ver ${dish.name}`}
                onClick={() => !dragged.current && spinTo(n)}
                className="plate group absolute left-1/2 top-1/2 rounded-full"
                style={{
                  width: "var(--p)",
                  height: "var(--p)",
                  transform: `translate(-50%, -50%) rotate(${i * STEP_DEG}deg) translateY(calc(var(--r) * -1))`,
                }}
              >
                <span className="plate-inner block h-full w-full rounded-full shadow-[0_0_38px_6px_rgba(0,0,0,.55)] transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]">
                  <img src={plateSrc(slug, small)} alt="" draggable={false} className="h-full w-full rounded-full" decoding="async" />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cartão do prato em destaque */}
      <div
        className="pointer-events-none absolute inset-x-0 z-10 flex flex-col items-center px-6 text-center"
        style={{ top: geo ? "calc(var(--cy) - var(--r) + var(--p) / 2 + 1.25rem)" : "80%" }}
        aria-live="polite"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={topDish.slug}
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md [text-shadow:0_2px_14px_rgba(20,12,8,.9)]"
          >
            <p className="eyebrow text-candle/90">{menu[activeCategory].title}</p>
            <h2 className="mt-2 font-display text-[clamp(1.6rem,2.6vw,2.4rem)] leading-tight text-cream">{topDish.name}</h2>
            {topDish.price !== null && <p className="mt-1 text-sm tracking-[0.2em] text-cream/70">R$ {formatPrice(topDish.price)}</p>}
          </motion.div>
        </AnimatePresence>
        <div className="pointer-events-auto mt-3 flex items-center gap-3 md:mt-2">
          <span className="md:hidden">
            <ArrowButton label="Prato anterior" onClick={() => nudge(-1)} flip />
          </span>
          <span className="hidden text-[0.62rem] uppercase tracking-[0.32em] text-cream/45 md:inline">Arraste para girar</span>
          <span className="md:hidden">
            <ArrowButton label="Próximo prato" onClick={() => nudge(1)} />
          </span>
        </div>
      </div>
    </div>
  );
}

function ArrowButton({ label, onClick, flip }: { label: string; onClick: () => void; flip?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-10 place-items-center rounded-full border border-cream/25 text-cream/80 backdrop-blur-sm transition-colors duration-300 hover:border-candle hover:bg-candle hover:text-espresso"
    >
      <svg viewBox="0 0 24 24" className={`size-4 ${flip ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </button>
  );
}
