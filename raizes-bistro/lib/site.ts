// Dados do restaurante. Fonte: docs/briefing.md (confirmar itens marcados com TODO antes de publicar).

export const site = {
  name: "Raízes Bistrô e Massas",
  shortName: "Raízes",
  tagline: "Comfort food com memória",
  description:
    "Bistrô de massas artesanais e comfort food em Juiz de Fora. Cozinha contemporânea e afetiva da Chef Weruska Fonseca.",
  url: "https://raizesbistro.com", // TODO: domínio final
  chef: "Weruska Fonseca",
  instagram: "https://www.instagram.com/raizesbistroemassas/",
  instagramHandle: "@raizesbistroemassas",
  emporioInstagram: "https://www.instagram.com/raizesemporiojf/",
  whatsapp: "5532998237333",
  whatsappDisplay: "(32) 99823-7333",
  phone: "+553239377331", // TODO: confirmar qual fixo é o oficial (3937-7331 ou 3321-2488)
  phoneDisplay: "(32) 3937-7331",
  address: {
    street: "Estrada Engenheiro Gentil Forn, 1700",
    district: "Jardins Imperiais",
    city: "Juiz de Fora",
    region: "MG",
    postalCode: "36036-425",
    country: "BR",
  },
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Ra%C3%ADzes+Bistr%C3%B4+e+Massas+Estrada+Engenheiro+Gentil+Forn+1700+Juiz+de+Fora",
  cnpj: "44.073.744/0001-01",
  timezone: "America/Sao_Paulo",
} as const;

/** Dias: 0 = domingo … 6 = sábado. Horas em minutos desde 00:00. */
export const openingHours: { days: number[]; open: number; close: number; label: string }[] = [
  { days: [3, 4, 5, 6], open: 19 * 60, close: 23 * 60, label: "Quarta a sábado · 19h às 23h" },
  { days: [0], open: 12 * 60, close: 16 * 60, label: "Domingo · 12h às 16h" },
];

export const reviews = [
  {
    title: "Espetacular!",
    meta: "dez. 2025 · Família",
    text: "A comida estava perfeita. O Raízes é lindo e os atendentes são super atenciosos. Um almoço perfeito em família. Amamos tudo.",
  },
  {
    title: "Vale muito a pena",
    meta: "set. 2025 · Casal",
    text: "Garçons muito educados e atenciosos. Serviço excelente. Pedimos o menu três tempos, tudo delicioso. Recomendo e voltaremos!",
  },
  {
    title: "Comemoração de aniversário!",
    meta: "jul. 2025 · Casal",
    text: "Amei a experiência! Ambiente, atendimento e comida! Quero voltar para experimentar outros pratos… comida muito saborosa.",
  },
  {
    title: "Melhor restaurante",
    meta: "jun. 2025 · Casal",
    text: "Ótimo ambiente, atendimento excelente e comida muito boa. A localização também é excelente, recomendo para comemorações especiais.",
  },
];

export const rating = { score: "4,8", source: "Tripadvisor", count: 88 };

export function whatsappLink(message: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}
