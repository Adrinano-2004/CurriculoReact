// Cardápio. Nomes vindos das fotos enviadas pelo cliente; preços e descrições confirmados
// apenas onde havia fonte (site atual / artes do Instagram). `price: null` = TODO: confirmar com o restaurante.

export type Dish = {
  slug: string;
  name: string;
  description?: string;
  price: number | null;
  note?: string;
};

export type MenuCategory = {
  id: "entradas" | "sugestoes" | "principais" | "sobremesas";
  title: string;
  /** Título curto usado nas abas da mesa giratória. */
  short: string;
  dishes: Dish[];
  /** Pratos com prato redondo e foto limpa, usados na mesa giratória do hero. */
  table: string[];
};

export const menu: MenuCategory[] = [
  {
    id: "entradas",
    title: "Entradas",
    short: "Entradas",
    table: ["croquete-de-carne", "bruschetta-caprese", "casquinha-de-siri", "le-rechaud-do-raizes", "carpaccio-de-lagarto", "risoles-de-camarao"],
    dishes: [
      { slug: "couvert", name: "Couvert", price: null },
      { slug: "bruschetta-caprese", name: "Bruschetta Caprese", price: null },
      { slug: "bruschetta-tradicional", name: "Bruschetta Tradicional", price: null },
      { slug: "carpaccio-de-lagarto", name: "Carpaccio de Lagarto", price: null },
      { slug: "casquinha-de-siri", name: "Casquinha de Siri", description: "Receita tradicional com siri desfiado e gratinado", price: 35 },
      { slug: "croquete-de-carne", name: "Croquete de Carne", description: "Receita da casa, acompanha molho de mostarda holandesa", price: 55 },
      { slug: "risoles-de-camarao", name: "Risoles de Camarão", description: "Massa fina e crocante, recheio de camarão com Catupiry® e molho agridoce", price: 59 },
      { slug: "bolinho-de-bacalhau", name: "Bolinho de Bacalhau", price: 62 },
      { slug: "kafta", name: "Kafta", description: "Carne selecionada com especiarias", price: 58 },
      { slug: "grilled-de-file", name: "Grilled de Filé", price: null },
      { slug: "le-rechaud-do-raizes", name: "Le Rechaud do Raízes", price: null },
    ],
  },
  {
    id: "sugestoes",
    title: "Sugestões da Chef",
    short: "Da Chef",
    table: ["sinfonia-luiza", "steak-de-mignon-a-la-parmegiana", "lagostim-a-thermidor", "escalope-de-mignon-ao-molho-mostarda"],
    dishes: [
      { slug: "steak-de-mignon-a-la-parmegiana", name: "Steak de Mignon à la Parmegiana", description: "Fettuccine artesanal na manteiga de ervas sobre pomodoro da casa", price: 98 },
      { slug: "escalope-de-mignon-ao-molho-mostarda", name: "Escalope de Mignon", description: "Ao molho mostarda", price: 105 },
      { slug: "sinfonia-luiza", name: "Sinfonia Luiza", description: "Polvo, lula e camarão flambados no vinho branco, linguine ao molho de tinta de lula e pesto de rúcula", price: 155 },
      { slug: "lagostim-a-thermidor", name: "Lagostim à Thermidor", description: "Na manteiga de ervas, com linguine ao bisque de frutos do mar", price: 165, note: "Verificar disponibilidade" },
    ],
  },
  {
    id: "principais",
    title: "Principais",
    short: "Principais",
    table: ["ravioli-caprese", "carre-de-cordeiro", "risoto-de-camarao-com-aspargos-frescos", "magret-de-pato", "fettuccine-mare-monti", "medalhas-de-salmao", "gnocchi-artesanal-a-fonduta-de-queijos-sobre-cama-de-paillard-trufado", "file-de-saint-peter-a-belle-meuniere"],
    dishes: [
      { slug: "ravioli-caprese", name: "Ravioli Caprese", price: null },
      { slug: "ravioli-de-shitake", name: "Ravioli de Shitake", price: null },
      { slug: "gnocchi-artesanal-a-fonduta-de-queijos-sobre-cama-de-paillard-trufado", name: "Gnocchi Artesanal", description: "À fonduta de queijos sobre cama de paillard trufado", price: null },
      { slug: "fettuccine-mare-monti", name: "Fettuccine Mare Monti", price: null },
      { slug: "fettuccine-ao-molho-a-arrabiata-com-ragu-de-cordeiro", name: "Fettuccine Arrabiata", description: "Ao molho à arrabiata com ragu de cordeiro", price: null },
      { slug: "fettuccine-ao-molho-bechamel-com-cogumelos-funghi-com-grilled-file", name: "Fettuccine ao Bechamel", description: "Com cogumelos funghi e grilled de filé", price: null },
      { slug: "lasagna-de-bacalhau", name: "Lasagna de Bacalhau", price: null },
      { slug: "risoto-de-camarao-com-aspargos-frescos", name: "Risoto de Camarão", description: "Com aspargos frescos", price: null },
      { slug: "carre-de-cordeiro", name: "Carré de Cordeiro", price: null },
      { slug: "magret-de-pato", name: "Magret de Pato", price: null },
      { slug: "bombom-de-filet", name: "Bombom de Filet", price: 98 },
      { slug: "gratin-de-mignon", name: "Gratin de Mignon", price: null },
      { slug: "beef-chorizo-com-batatas-rusticas-regadas-de-fonduta-de-queijos", name: "Beef Chorizo", description: "Batatas rústicas regadas de fonduta de queijos", price: null },
      { slug: "medalhas-de-salmao", name: "Medalhas de Salmão", price: null },
      { slug: "file-de-saint-peter-a-belle-meuniere", name: "Filé de Saint Peter à Belle Meunière", price: null },
      { slug: "file-de-linguado-la-bonne-femme", name: "Filé de Linguado La Bonne Femme", price: null },
    ],
  },
  {
    id: "sobremesas",
    title: "Sobremesas",
    short: "Sobremesas",
    table: ["pudim-de-leite-condensado", "brownie-da-julia", "tiramissu", "torta-duo-mousse", "cafe-expresso"],
    dishes: [
      { slug: "tiramissu", name: "Tiramisù", price: 30 },
      { slug: "brownie-da-julia", name: "Brownie da Júlia", price: null },
      { slug: "pudim-de-leite-condensado", name: "Pudim de Leite Condensado", price: null },
      { slug: "torta-duo-mousse", name: "Torta Duo Mousse", price: null },
      { slug: "profiterolis", name: "Profiterolis", price: null },
      { slug: "trifle-de-banana", name: "Trifle de Banana", price: null },
      { slug: "cafe-expresso", name: "Café Expresso", price: null },
    ],
  },
];

export const dishBySlug = Object.fromEntries(menu.flatMap((c) => c.dishes.map((d) => [d.slug, d]))) as Record<string, Dish>;

/** Prato recortado visto de cima; `small` = versão de 360px para telas pequenas. */
export const plateSrc = (slug: string, small = false) => `/images/pratos/${small ? "sm/" : ""}${slug}.webp`;

export const formatPrice = (price: number) => price.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
