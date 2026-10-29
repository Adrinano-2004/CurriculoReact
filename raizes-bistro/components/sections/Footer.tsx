import { BigTitle } from "@/components/motion/BigTitle";
import { openingHours, site, whatsappLink } from "@/lib/site";

const col = "flex flex-col items-center gap-3 text-center";
const colTitle = "font-display text-3xl text-cream";
const link = "text-[0.78rem] uppercase tracking-[0.18em] text-cream/70 transition-colors hover:text-candle";

/** Rodapé "fale com a gente": título gigante, três colunas (contato, horários, redes) e linha de copyright. */
export function Footer() {
  return (
    <footer id="contato" className="grain relative bg-espresso pt-24 text-cream md:pt-32">
      <div className="container-x flex flex-col items-center text-center">
        <BigTitle>
          Fale <em className="italic text-candle">com a gente</em>
        </BigTitle>
        <p className="mt-8 max-w-lg leading-relaxed text-cream/70">
          Dúvidas sobre o cardápio, eventos, grupos ou como chegar? Chame no WhatsApp que a equipe responde.
        </p>
      </div>

      <div className="container-x mt-16 grid gap-12 md:mt-24 md:grid-cols-3">
        <div className={col}>
          <h3 className={colTitle}>Contato</h3>
          <a href={site.mapsUrl} target="_blank" rel="noopener" className={link}>
            {site.address.street}
            <br />
            {site.address.district} · {site.address.city} · {site.address.region}
          </a>
          <a href={whatsappLink("Olá, Raízes!")} target="_blank" rel="noopener" className={link}>
            WhatsApp {site.whatsappDisplay}
          </a>
          <a href={`tel:${site.phone}`} className={link}>
            Tel. {site.phoneDisplay}
          </a>
        </div>
        <div className={col}>
          <h3 className={colTitle}>Horários</h3>
          {openingHours.map((h) => (
            <p key={h.label} className="text-[0.78rem] uppercase tracking-[0.18em] text-cream/70">
              {h.label}
            </p>
          ))}
          <p className="text-[0.78rem] uppercase tracking-[0.18em] text-cream/40">Segunda e terça · fechado</p>
        </div>
        <div className={col}>
          <h3 className={colTitle}>Redes</h3>
          <a href={site.instagram} target="_blank" rel="noopener" className={link}>
            Instagram
          </a>
          <a href={site.emporioInstagram} target="_blank" rel="noopener" className={link}>
            Raízes Empório
          </a>
        </div>
      </div>

      <div className="container-x mt-20 flex flex-col items-center gap-3 border-t border-cream/15 py-7 text-xs text-cream/45 sm:flex-row sm:justify-between">
        <p>
          © {new Date().getFullYear()} {site.name} · CNPJ {site.cnpj}
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-light-sm.webp" alt="" className="h-10 w-auto opacity-70" loading="lazy" />
      </div>
    </footer>
  );
}
