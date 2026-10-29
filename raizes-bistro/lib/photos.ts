// Fotos complementares do Instagram já otimizadas (scripts/process_images.py).
export type Photo = { src: string; width: number; height: number; alt: string };

const p = (name: string, width: number, height: number, alt: string): Photo => ({
  src: `/images/site/${name}.webp`,
  width,
  height,
  alt,
});

export const photos = {
  chef: p("imagem-chef", 1163, 1135, "Chef Weruska Fonseca de dólmã no salão do Raízes"),
  fachada: p("imagem-ambiente", 1158, 1280, "Fachada do Raízes ao entardecer, entre árvores e luzes"),
  entrada: p("imagem-ambiente2", 1179, 1301, "Entrada do bistrô com a placa do Raízes iluminada"),
  salao: p("imagem-ambiente4", 948, 1600, "Salão com adega e luminárias pendentes"),
  mesaVelas: p("imagem-mesa-taca", 1144, 1280, "Mesas postas à luz de velas"),
  mesaIntima: p("imagem-mesa-taca2", 1179, 1365, "Mesa para dois com taças e flores"),
  mesaPosta: p("imagem-mesa-taca3", 1179, 1526, "Mesa posta com tábua de frios e pratos de cerâmica"),
  vinho: p("imagem-vinho", 1137, 1280, "Vinho sendo servido na taça"),
  drink: p("imagem-bebida", 1095, 1087, "Drink da casa servido à mesa"),
  raclette: p("imagem-qeuijo", 1101, 1103, "Queijo raclette derretido servido sobre pão"),
  comemoracao: p("imagem-mesa-pessoas", 1179, 771, "Grupo comemorando em uma mesa longa"),
  pratoVinho: p("imagem-mesa-taca-vinho", 1179, 1546, "Prato de massa com taças de vinho tinto"),
  carpaccio: p("foto-carpaccio", 1170, 1458, "Carpaccio servido com pão e azeite"),
  maos: p("midia-fundo", 1179, 1449, "Mãos servindo carpaccio à mesa"),
  casquinha: p("imagem-exemplo6", 1179, 1519, "Casquinha de siri gratinada com limão"),
  risoto: p("imagem-exemplo3", 1179, 1454, "Risoto de camarão com crocante de parmesão"),
  pratoTinto: p("imagem-exemplo7", 1179, 1419, "Prato principal com vinho tinto e flores"),
} satisfies Record<string, Photo>;
