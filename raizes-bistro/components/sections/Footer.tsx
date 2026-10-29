import { openingHours, site, whatsappLink } from "@/lib/site";

export function Footer() {
  return (
    <footer className="grain relative overflow-hidden bg-espresso pt-24 text-cream/75">
      <div className="container-x grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-light.webp" alt={site.name} className="w-44" loading="lazy" />
          <p className="mt-6 max-w-xs leading-relaxed">{site.description}</p>
        </div>
        <div className="md:col-span-3">
          <p className="eyebrow text-candle">Visite</p>
          <p className="mt-4 leading-relaxed">
            {site.address.street}
            <br />
            {site.address.district}, {site.address.city} · {site.address.region}
          </p>
          <a href={site.mapsUrl} target="_blank" rel="noopener" className="mt-3 inline-block text-cream underline decoration-cream/30 underline-offset-4 hover:decoration-candle">
            Abrir no mapa
          </a>
        </div>
        <div className="md:col-span-3">
          <p className="eyebrow text-candle">Horários</p>
          <ul className="mt-4 space-y-1">
            {openingHours.map((h) => (
              <li key={h.label}>{h.label}</li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2">
          <p className="eyebrow text-candle">Contato</p>
          <ul className="mt-4 space-y-1">
            <li>
              <a href={whatsappLink("Olá, Raízes!")} target="_blank" rel="noopener" className="hover:text-cream">
                WhatsApp
              </a>
            </li>
            <li>
              <a href={site.instagram} target="_blank" rel="noopener" className="hover:text-cream">
                Instagram
              </a>
            </li>
            <li>
              <a href={site.emporioInstagram} target="_blank" rel="noopener" className="hover:text-cream">
                Raízes Empório
              </a>
            </li>
          </ul>
        </div>
      </div>

      <p aria-hidden className="pointer-events-none mt-16 select-none text-center font-script text-[clamp(7rem,26vw,24rem)] leading-[0.8] text-cream/[0.06]">
        Raízes
      </p>

      <div className="container-x flex flex-col gap-2 border-t border-cream/10 py-6 text-xs text-cream/45 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} {site.name} · CNPJ {site.cnpj}</p>
        <p>Juiz de Fora · Minas Gerais</p>
      </div>
    </footer>
  );
}
