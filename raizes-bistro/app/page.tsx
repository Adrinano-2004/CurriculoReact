import { Hero } from "@/components/hero/Hero";
import { Marquee } from "@/components/motion/Marquee";
import { Preloader } from "@/components/motion/Preloader";
import { ReservationProvider } from "@/components/reservation/ReservationProvider";
import { About } from "@/components/sections/About";
import { BookTable } from "@/components/sections/BookTable";
import { ChefSelection } from "@/components/sections/ChefSelection";
import { Desserts } from "@/components/sections/Desserts";
import { Footer } from "@/components/sections/Footer";
import { Gallery } from "@/components/sections/Gallery";
import { Header } from "@/components/sections/Header";
import { Menu } from "@/components/sections/Menu";
import { Salon } from "@/components/sections/Salon";
import { FloatingWhatsApp } from "@/components/ui/FloatingWhatsApp";

// Estrutura e animações seguem a base de referência (Grillify): sobre com faixa de fotos, marquee,
// cards empilhados, cortina, carrossel, faixa de reserva, galeria e rodapé "fale com a gente".
// Hero (mesa giratória) e Cardápio (pratos vistos de cima) seguem a referência PALAZZO.
export default function Home() {
  return (
    <ReservationProvider>
      <Preloader />
      <Header />
      <main>
        <Hero />
        <About />
        <Marquee
          items={["Sugestões da Chef", "Massas artesanais", "Molhos autorais", "Comfort food"]}
          separator="/"
          className="bg-espresso py-3 text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-cream"
        />
        <ChefSelection />
        <Menu />
        <Salon />
        <Desserts />
        <BookTable />
        <Gallery />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </ReservationProvider>
  );
}
