import { PhotoStrip } from "@/components/motion/PhotoStrip";
import { photos } from "@/lib/photos";
import { site } from "@/lib/site";

const GALLERY = [photos.fachada, photos.pratoVinho, photos.mesaPosta, photos.comemoracao, photos.risoto, photos.salao, photos.drink, photos.maos, photos.entrada, photos.pratoTinto];

/** Galeria em faixa (padrão da base) com link para o Instagram. */
export function Gallery() {
  return (
    <section aria-label="Galeria" className="bg-linen py-3">
      <a href={site.instagram} target="_blank" rel="noopener" className="group block" aria-label={`Ver mais fotos no Instagram ${site.instagramHandle}`}>
        <PhotoStrip photos={GALLERY} direction={1} />
        <p className="eyebrow py-5 text-center text-walnut/70 transition-colors group-hover:text-terracotta">{site.instagramHandle}</p>
      </a>
    </section>
  );
}
