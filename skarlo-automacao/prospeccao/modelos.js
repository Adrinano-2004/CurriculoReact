// Modo grátis do gerador de abordagens: preenche modelos prontos com os dados reais de cada empresa.
// Devolve o mesmo formato que o Claude devolve no modo IA.

import { empresa } from "../empresa.js";

const preenchido = (valor) => Boolean(valor) && !String(valor).startsWith("PREENCHER");

const PAISES_ESPANHOL =
  /(México|Mexico|Argentina|Colombia|Chile|Perú|Peru|Ecuador|Bolivia|Paraguay|Uruguay|Venezuela|Guatemala|Honduras|El Salvador|Nicaragua|Costa Rica|Panamá|Panama|Cuba|República Dominicana|Dominican Republic|Puerto Rico|España|Spain)/i;
const PAISES_PORTUGUES = /(Brasil|Brazil|Portugal|Angola|Moçambique|Mozambique)/i;

function idiomaDoLead(lead) {
  const onde = `${lead.endereco} ${lead.local}`;
  if (PAISES_PORTUGUES.test(onde)) return "pt";
  if (PAISES_ESPANHOL.test(onde)) return "es";
  return "en";
}

// Os problemas vêm em português do buscar-leads.js; aqui viram uma frase no idioma do lead.
const PROBLEMAS = [
  { chave: /HTTPS/, pt: "aparece como \"não seguro\" no navegador", en: "shows up as \"not secure\" in the browser", es: "aparece como \"no seguro\" en el navegador" },
  { chave: /celular/, pt: "não se ajusta bem na tela do celular", en: "doesn't fit well on a phone screen", es: "no se adapta bien a la pantalla del celular" },
  { chave: /agendamento/, pt: "não tem como agendar online", en: "has no way to book online", es: "no permite reservar en línea" },
  { chave: /WhatsApp/, pt: "não tem botão de WhatsApp", en: "has no WhatsApp button", es: "no tiene botón de WhatsApp" },
  { chave: /formulário/, pt: "não tem formulário de contato", en: "has no contact form", es: "no tiene formulario de contacto" },
  { chave: /desatualizado/, pt: "parece desatualizado", en: "looks outdated", es: "parece desactualizado" },
];

function problemasTraduzidos(lead, idioma) {
  return PROBLEMAS.filter((p) => lead.problemas.some((texto) => p.chave.test(texto)))
    .slice(0, 2)
    .map((p) => p[idioma]);
}

const juntar = { pt: " e ", en: " and ", es: " y " };

const TEXTOS = {
  pt: {
    reputacao: (l) => `tem nota ${String(l.nota).replace(".", ",")} no Google com ${l.avaliacoes} avaliações`,
    gancho: {
      redeSocial: (l) =>
        l.nota
          ? `Vi que a ${l.nome} ${TEXTOS.pt.reputacao(l)}, mas usa só a rede social como site`
          : `Vi que a ${l.nome} usa só a rede social como site`,
      semSite: (l) =>
        l.nota
          ? `Vi que a ${l.nome} ${TEXTOS.pt.reputacao(l)}, mas não encontrei um site de vocês`
          : `Procurei a ${l.nome} no Google e não encontrei um site de vocês`,
      foraDoAr: (l) => `Tentei abrir o site da ${l.nome} e ele não carregou`,
      fraco: (l, p) => `Entrei no site da ${l.nome} e notei que ele ${p}`,
    },
    beneficio:
      "Eu crio sites com agendamento online e atendimento automático no WhatsApp, para o cliente encontrar vocês, tirar dúvidas e marcar a qualquer hora, sem ninguém da equipe precisar parar o que está fazendo.",
    pergunta: (l) => `Posso te mandar um exemplo de como ficaria o da ${l.nome}? É sem compromisso.`,
    assunto: (l, tipo) => (tipo === "fraco" || tipo === "foraDoAr" ? `Uma melhoria rápida para o site da ${l.nome}` : `${l.nome}: uma ideia rápida`),
    saudacao: (l) => `Olá, equipe da ${l.nome}!`,
    optout: "Se não tiver interesse, é só responder \"não\" que eu não mando mais mensagens.",
    curta: (gancho) => `Olá! ${gancho}. Eu crio sites com agendamento online e WhatsApp automático. Posso te mostrar um exemplo rápido?`,
    followUp: (l, wa) => `Oi! Só passando para ver se viu minha mensagem sobre o site da ${l.nome}.${wa ? ` Se fizer sentido, me chama no WhatsApp: ${wa}` : ""} Se não, sem problemas!`,
    equipe: "Equipe",
  },
  en: {
    reputacao: (l) => `has a ${l.nota}-star rating on Google from ${l.avaliacoes} reviews`,
    gancho: {
      redeSocial: (l) =>
        l.nota
          ? `I noticed ${l.nome} ${TEXTOS.en.reputacao(l)}, but only uses social media as a website`
          : `I noticed ${l.nome} only uses social media as a website`,
      semSite: (l) =>
        l.nota
          ? `I noticed ${l.nome} ${TEXTOS.en.reputacao(l)}, but I couldn't find a website`
          : `I looked up ${l.nome} on Google and couldn't find a website`,
      foraDoAr: (l) => `I tried to open ${l.nome}'s website and it didn't load`,
      fraco: (l, p) => `I visited ${l.nome}'s website and noticed it ${p}`,
    },
    beneficio:
      "I build websites with online booking and an automatic WhatsApp assistant, so customers can find you, get answers and book at any time, without your team having to stop what they're doing.",
    pergunta: (l) => `Would it be okay if I sent you a free example of what ${l.nome}'s could look like?`,
    assunto: (l, tipo) => (tipo === "fraco" || tipo === "foraDoAr" ? `A quick improvement for ${l.nome}'s website` : `Quick idea for ${l.nome}`),
    saudacao: (l) => `Hi ${l.nome} team,`,
    optout: "Not interested? Just reply \"no\" and I won't follow up.",
    curta: (gancho) => `Hi! ${gancho}. I build websites with online booking and automatic WhatsApp replies. Can I show you a quick example?`,
    followUp: (l, wa) => `Hi! Just checking if you saw my note about a website for ${l.nome}.${wa ? ` If it's useful, message me on WhatsApp: ${wa}` : ""} If not, no worries!`,
    equipe: "Team",
  },
  es: {
    reputacao: (l) => `tiene ${String(l.nota).replace(".", ",")} estrellas en Google con ${l.avaliacoes} reseñas`,
    gancho: {
      redeSocial: (l) =>
        l.nota
          ? `Vi que ${l.nome} ${TEXTOS.es.reputacao(l)}, pero usa solo las redes sociales como sitio web`
          : `Vi que ${l.nome} usa solo las redes sociales como sitio web`,
      semSite: (l) =>
        l.nota
          ? `Vi que ${l.nome} ${TEXTOS.es.reputacao(l)}, pero no encontré su sitio web`
          : `Busqué ${l.nome} en Google y no encontré su sitio web`,
      foraDoAr: (l) => `Intenté abrir el sitio web de ${l.nome} y no cargó`,
      fraco: (l, p) => `Entré al sitio web de ${l.nome} y noté que ${p}`,
    },
    beneficio:
      "Creo sitios web con reservas en línea y un asistente automático de WhatsApp, para que los clientes los encuentren, resuelvan dudas y reserven a cualquier hora, sin que el equipo tenga que dejar lo que está haciendo.",
    pergunta: (l) => `¿Te puedo enviar un ejemplo gratuito de cómo quedaría el de ${l.nome}?`,
    assunto: (l, tipo) => (tipo === "fraco" || tipo === "foraDoAr" ? `Una mejora rápida para el sitio de ${l.nome}` : `Una idea rápida para ${l.nome}`),
    saudacao: (l) => `¡Hola, equipo de ${l.nome}!`,
    optout: "Si no te interesa, responde \"no\" y no volveré a escribir.",
    curta: (gancho) => `¡Hola! ${gancho}. Creo sitios web con reservas en línea y WhatsApp automático. ¿Te muestro un ejemplo rápido?`,
    followUp: (l, wa) => `¡Hola! Solo quería saber si viste mi mensaje sobre el sitio de ${l.nome}.${wa ? ` Si te interesa, escríbeme por WhatsApp: ${wa}` : ""} Si no, ¡sin problema!`,
    equipe: "Equipo",
  },
};

export function escreverComModelo(lead) {
  const idioma = idiomaDoLead(lead);
  const t = TEXTOS[idioma];
  const usaRedeSocial = lead.problemas.some((p) => p.startsWith("usa só rede social"));

  let tipo;
  let gancho;
  if (lead.statusSite === "site_fora_do_ar") (tipo = "foraDoAr"), (gancho = t.gancho.foraDoAr(lead));
  else if (lead.statusSite === "site_fraco") {
    tipo = "fraco";
    gancho = t.gancho.fraco(lead, problemasTraduzidos(lead, idioma).join(juntar[idioma]));
  } else if (usaRedeSocial) (tipo = "redeSocial"), (gancho = t.gancho.redeSocial(lead));
  else (tipo = "semSite"), (gancho = t.gancho.semSite(lead));

  const wa = preenchido(empresa.whatsapp) ? `https://wa.me/${String(empresa.whatsapp).replace(/\D/g, "")}` : "";
  const assinatura = [
    preenchido(empresa.responsavel) ? `${empresa.responsavel} · ${empresa.nome}` : `${t.equipe} ${empresa.nome}`,
    [empresa.site.replace(/^https?:\/\//, ""), wa].filter(Boolean).join(" · "),
  ].join("\n");

  const temEmail = lead.emails?.length > 0;
  const ehB2B = /(advoga|law|abogad|contab|account|contador|engenh|engineer|ingenier|arquitet|architect|arquitect|consult)/i.test(lead.busca);

  return {
    origem: "modelo",
    idioma: { pt: "português", en: "inglês", es: "espanhol" }[idioma],
    canal_recomendado: temEmail ? "email" : usaRedeSocial ? "instagram" : ehB2B ? "linkedin" : lead.telefone ? "ligacao" : "instagram",
    gancho,
    assunto_email: t.assunto(lead, tipo),
    email: [t.saudacao(lead), `${gancho}.`, t.beneficio, t.pergunta(lead), assinatura, t.optout].join("\n\n"),
    mensagem_curta: t.curta(gancho),
    follow_up: t.followUp(lead, wa),
  };
}
