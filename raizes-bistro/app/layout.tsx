import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Josefin_Sans, Mrs_Saint_Delafield } from "next/font/google";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { openingHours, site } from "@/lib/site";
import "./globals.css";

// Josefin Sans é a fonte das artes de cardápio do Raízes; Cormorant para títulos; script para as assinaturas.
const josefin = Josefin_Sans({ subsets: ["latin"], weight: ["300", "400", "600"], variable: "--font-josefin", display: "swap" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"], variable: "--font-cormorant", display: "swap" });
const delafield = Mrs_Saint_Delafield({ subsets: ["latin"], weight: "400", variable: "--font-delafield", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} · Juiz de Fora`, template: `%s · ${site.shortName}` },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: site.name,
    title: `${site.name} · ${site.tagline}`,
    description: site.description,
    images: [{ url: "/images/site/imagem-mesa-taca-vinho.webp", width: 1179, height: 1546 }],
  },
  icons: { icon: "/brand/logo-dark-sm.webp" },
};

export const viewport: Viewport = { themeColor: "#140c08" };

const DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const time = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: site.name,
  description: site.description,
  url: site.url,
  image: `${site.url}/images/site/imagem-ambiente.webp`,
  logo: `${site.url}/brand/logo-dark.png`,
  telephone: site.phone,
  servesCuisine: ["Massas artesanais", "Comfort food", "Contemporânea"],
  priceRange: "$$$",
  acceptsReservations: true,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    addressLocality: site.address.city,
    addressRegion: site.address.region,
    postalCode: site.address.postalCode,
    addressCountry: site.address.country,
  },
  openingHoursSpecification: openingHours.map((h) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: h.days.map((d) => DAY[d]),
    opens: time(h.open),
    closes: time(h.close),
  })),
  sameAs: [site.instagram],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${josefin.variable} ${cormorant.variable} ${delafield.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
