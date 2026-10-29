"use client";

import { motion } from "motion/react";
import Image from "next/image";
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

const item = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.35 + i * 0.08, duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } }),
};

/** Conteúdo da gaveta "Ler nossa história". Textos do próprio Raízes e da Tribuna de Minas (2022). */
export function StoryContent() {
  let i = 0;
  return (
    <article className="px-6 pb-16 pt-6 md:px-14 md:pt-14">
      <motion.p variants={item} initial="hidden" animate="show" custom={i++} className="eyebrow text-candle">
        Nossa história
      </motion.p>
      <motion.h2 variants={item} initial="hidden" animate="show" custom={i++} className="mt-4 font-display text-[clamp(2.6rem,5vw,4.2rem)] leading-[0.95] text-cream">
        Das memórias da Chef Weruska para a sua mesa.
      </motion.h2>

      <motion.div variants={item} initial="hidden" animate="show" custom={i++} className="mt-10 grid gap-8 sm:grid-cols-[14rem_1fr] sm:items-end">
        <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px]">
          <Image src={photos.chef.src} alt={photos.chef.alt} fill sizes="14rem" className="object-cover" />
        </div>
        <blockquote className="border-l border-candle/60 pl-6">
          <p className="font-display text-2xl italic leading-snug text-cream/90">“Eu gosto de pegar esses tradicionais e modernizar de alguma forma.”</p>
          <footer className="eyebrow mt-4 text-cream/50">{site.chef} · Tribuna de Minas</footer>
        </blockquote>
      </motion.div>

      <motion.p variants={item} initial="hidden" animate="show" custom={i++} className="mt-12 max-w-2xl text-[1.05rem] leading-relaxed text-cream/75">
        A gastronomia do Raízes Bistrô é feita de sabor e afeto. A base da cozinha nasce das memórias e referências da Chef Weruska: os
        produtos frescos, as receitas de família, as técnicas aprendidas na Le Cordon Bleu, o olhar apurado sobre clássicos e as criações
        autorais. O resultado é uma cozinha contemporânea e afetiva.
      </motion.p>

      <ol className="mt-14 space-y-10">
        {TIMELINE.map((step) => (
          <motion.li key={step.year} variants={item} initial="hidden" animate="show" custom={i++}>
            <div className="flex items-baseline gap-5">
              <span className="font-script text-5xl leading-none text-candle">{step.year}</span>
              <span className="h-px flex-1 bg-cream/20" />
            </div>
            <h3 className="mt-3 font-display text-3xl text-cream">{step.title}</h3>
            <p className="mt-2 max-w-xl leading-relaxed text-cream/70">{step.text}</p>
          </motion.li>
        ))}
      </ol>
    </article>
  );
}
