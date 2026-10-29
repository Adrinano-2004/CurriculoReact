import { Hero } from "@/components/hero/Hero";
import { Marquee } from "@/components/motion/Marquee";
import { Preloader } from "@/components/motion/Preloader";
import { Ambiance } from "@/components/sections/Ambiance";
import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/sections/Header";
import { Manifesto } from "@/components/sections/Manifesto";
import { Menu } from "@/components/sections/Menu";
import { Reservation } from "@/components/sections/Reservation";
import { Reviews } from "@/components/sections/Reviews";
import { Story } from "@/components/sections/Story";
import { FloatingWhatsApp } from "@/components/ui/FloatingWhatsApp";

// Hero e Cardápio seguem a referência PALAZZO (mesa giratória e pratos vistos de cima).
// As demais seções são provisórias até chegar a base estrutural de referência.
export default function Home() {
  return (
    <>
      <Preloader />
      <Header />
      <main>
        <Hero />
        <Manifesto />
        <Menu />
        <Marquee
          items={["Massas artesanais", "Comfort food", "Molhos autorais", "Carta de vinhos", "Juiz de Fora"]}
          className="bg-terracotta py-6 font-display text-[clamp(2rem,4.5vw,4rem)] italic text-cream"
        />
        <Story />
        <Ambiance />
        <Reviews />
        <Reservation />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
