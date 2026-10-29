"use client";

import { useState } from "react";
import { BigTitle } from "@/components/motion/BigTitle";
import { PhotoStrip } from "@/components/motion/PhotoStrip";
import { OutlineButton } from "@/components/ui/OutlineButton";
import { Overlay } from "@/components/ui/Overlay";
import { photos } from "@/lib/photos";
import { StoryContent } from "./StoryContent";

const STRIP = [photos.mesaVelas, photos.maos, photos.risoto, photos.vinho, photos.casquinha, photos.raclette, photos.pratoTinto, photos.drink, photos.carpaccio, photos.mesaIntima];

/** Sobre: título gigante, faixa de fotos que corre com o scroll e a história completa numa gaveta. */
export function About() {
  const [open, setOpen] = useState(false);

  return (
    <section id="sobre" aria-labelledby="sobre-title" className="relative overflow-hidden bg-linen pt-24 text-walnut md:pt-36">
      <div className="container-x text-center">
        <p className="font-script text-4xl text-terracotta md:text-5xl">Desde 2017</p>
        <BigTitle id="sobre-title" className="mt-2">
          Feito de sabor <em className="italic text-terracotta">e afeto</em>
        </BigTitle>
      </div>

      <PhotoStrip photos={STRIP} className="mt-12 md:mt-16" />

      <div className="container-x flex flex-col items-center pb-24 pt-14 text-center md:pb-32 md:pt-20">
        <p className="max-w-xl text-[1.05rem] leading-relaxed text-ink/85">
          Tudo começou num sítio cercado de mata, com massas e petiscos feitos à mão. Em 2021 a Chef Weruska Fonseca abriu o bistrô para
          receber as pessoas à mesa: comfort food que resgata memórias, com o carinho das cozinhas de casa.
        </p>
        <OutlineButton tone="dark" className="mt-9" onClick={() => setOpen(true)}>
          Ler nossa história
        </OutlineButton>
      </div>

      <Overlay open={open} onClose={() => setOpen(false)} label="Nossa história" variant="drawer">
        <StoryContent />
      </Overlay>
    </section>
  );
}
