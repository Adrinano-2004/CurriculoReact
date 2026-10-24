// Modo grátis: atendimento roteirizado, sem IA.
// Usado quando não há ANTHROPIC_API_KEY no .env. Mesma interface do claude.js:
// responder(conversa, mensagemDoCliente, acoes) -> texto para enviar.
// O histórico é salvo no mesmo formato, então ao colocar a chave do Claude
// ele continua a conversa de onde parou.

import { empresa } from "../empresa.js";

const preenchido = (valor) => Boolean(valor) && !String(valor).startsWith("PREENCHER");

// ---------- Textos em cada idioma ----------
const TEXTOS = {
  pt: {
    ola: (nome) =>
      `Olá${nome ? `, ${nome}` : ""}! 👋 Aqui é o assistente virtual da *${empresa.nome}*. Criamos sites profissionais com automações (agendamento online, WhatsApp, chat 24h) para empresas do mundo todo.`,
    perguntaNome: "Para começar, qual é o seu nome?",
    perguntaNegocio: "Para começar, qual é o nome da sua empresa e o que ela faz?",
    negocio: (nome) => `Prazer, ${nome}! Qual é o nome da sua empresa e o que ela faz?`,
    local: "Legal! Em qual cidade e país vocês estão?",
    temSite: "Vocês já têm site? Se sim, me manda o link. Se não, é só responder *não*.",
    necessidade:
      "O que você procura? Responda com o número:\n\n*1* - Site institucional / landing page\n*2* - Site com automações (agendamento, WhatsApp, chat 24h)\n*3* - Loja virtual / catálogo\n*4* - Outro (me conta o que precisa)",
    opcoes: ["Site institucional / landing page", "Site com automações", "Loja virtual / catálogo"],
    descrevaOutro: "Me conta em poucas palavras o que você precisa que o site faça.",
    prazo: "Para quando você precisa do site?",
    orcamento: "Você já tem uma faixa de investimento em mente? (se preferir, responda *pular*)",
    precoAPartir: (servico, preco) => `O ${servico} começa a partir de *${preco}*.`,
    final: (nome) =>
      `Perfeito, ${nome}! Já passei tudo para ${preenchido(empresa.responsavel) ? empresa.responsavel : "nossa equipe"}, que vai te chamar por aqui em breve. 🙌`,
    portfolio: (link) => `Enquanto isso, veja alguns trabalhos: ${link}`,
    agendar: (link) => `Se quiser, já agende uma conversa rápida: ${link}`,
    menu:
      "Posso ajudar com mais alguma coisa? Responda com o número:\n\n*1* - Ver portfólio\n*2* - Agendar uma reunião\n*3* - Falar com uma pessoa\n*4* - Começar de novo",
    transferido: "Certo! Já chamei uma pessoa da equipe, que vai te responder por aqui em breve. 🙂",
    semLink: "Esse link ainda não está disponível, mas nossa equipe te envia em breve.",
    soTexto: "Ainda não consigo abrir áudios, imagens ou arquivos. Pode me escrever em texto, por favor? 🙏",
    saiu: "Tudo bem, não vou mais enviar mensagens. Se precisar, é só chamar. Obrigado!",
    naoEntendi: "Não entendi. Responda só com o número da opção, por favor.",
  },
  en: {
    ola: (nome) =>
      `Hi${nome ? ` ${nome}` : ""}! 👋 This is the virtual assistant for *${empresa.nome}*. We build professional websites with automations (online booking, WhatsApp, 24/7 chat) for businesses worldwide.`,
    perguntaNome: "To get started, what's your name?",
    perguntaNegocio: "To get started, what's your business name and what does it do?",
    negocio: (nome) => `Nice to meet you, ${nome}! What's your business name and what does it do?`,
    local: "Great! Which city and country are you in?",
    temSite: "Do you already have a website? If so, send me the link. If not, just reply *no*.",
    necessidade:
      "What are you looking for? Reply with the number:\n\n*1* - Business website / landing page\n*2* - Website with automations (booking, WhatsApp, 24/7 chat)\n*3* - Online store / catalog\n*4* - Something else (tell me what you need)",
    opcoes: ["Business website / landing page", "Website with automations", "Online store / catalog"],
    descrevaOutro: "Tell me in a few words what you need the website to do.",
    prazo: "When do you need the website?",
    orcamento: "Do you have a budget range in mind? (you can reply *skip*)",
    precoAPartir: (servico, preco) => `A ${servico} starts at *${preco}*.`,
    final: (nome) =>
      `Perfect, ${nome}! I've passed everything to ${preenchido(empresa.responsavel) ? empresa.responsavel : "our team"}, who will message you here soon. 🙌`,
    portfolio: (link) => `Meanwhile, check out some of our work: ${link}`,
    agendar: (link) => `If you'd like, book a quick call: ${link}`,
    menu:
      "Anything else I can help with? Reply with the number:\n\n*1* - See portfolio\n*2* - Book a meeting\n*3* - Talk to a person\n*4* - Start over",
    transferido: "Sure! I've called someone from our team, who will reply here soon. 🙂",
    semLink: "That link isn't available yet, but our team will send it to you soon.",
    soTexto: "I can't open audio, images or files yet. Could you type your message, please? 🙏",
    saiu: "No problem, I won't message you again. If you need anything, just reach out. Thank you!",
    naoEntendi: "Sorry, I didn't get that. Please reply with just the option number.",
  },
  es: {
    ola: (nome) =>
      `¡Hola${nome ? `, ${nome}` : ""}! 👋 Soy el asistente virtual de *${empresa.nome}*. Creamos sitios web profesionales con automatizaciones (reservas en línea, WhatsApp, chat 24h) para empresas de todo el mundo.`,
    perguntaNome: "Para empezar, ¿cómo te llamas?",
    perguntaNegocio: "Para empezar, ¿cómo se llama tu empresa y a qué se dedica?",
    negocio: (nome) => `¡Mucho gusto, ${nome}! ¿Cómo se llama tu empresa y a qué se dedica?`,
    local: "¡Genial! ¿En qué ciudad y país están?",
    temSite: "¿Ya tienen sitio web? Si es así, envíame el enlace. Si no, responde *no*.",
    necessidade:
      "¿Qué estás buscando? Responde con el número:\n\n*1* - Sitio institucional / landing page\n*2* - Sitio con automatizaciones (reservas, WhatsApp, chat 24h)\n*3* - Tienda en línea / catálogo\n*4* - Otro (cuéntame qué necesitas)",
    opcoes: ["Sitio institucional / landing page", "Sitio con automatizaciones", "Tienda en línea / catálogo"],
    descrevaOutro: "Cuéntame en pocas palabras qué necesitas que haga el sitio.",
    prazo: "¿Para cuándo necesitas el sitio?",
    orcamento: "¿Tienes un rango de inversión en mente? (puedes responder *saltar*)",
    precoAPartir: (servico, preco) => `El ${servico} empieza desde *${preco}*.`,
    final: (nome) =>
      `¡Perfecto, ${nome}! Ya le pasé todo a ${preenchido(empresa.responsavel) ? empresa.responsavel : "nuestro equipo"}, que te escribirá por aquí pronto. 🙌`,
    portfolio: (link) => `Mientras tanto, mira algunos de nuestros trabajos: ${link}`,
    agendar: (link) => `Si quieres, agenda una llamada rápida: ${link}`,
    menu:
      "¿Te ayudo con algo más? Responde con el número:\n\n*1* - Ver portafolio\n*2* - Agendar una reunión\n*3* - Hablar con una persona\n*4* - Empezar de nuevo",
    transferido: "¡Listo! Ya llamé a alguien del equipo, que te responderá por aquí pronto. 🙂",
    semLink: "Ese enlace aún no está disponible, pero nuestro equipo te lo enviará pronto.",
    soTexto: "Todavía no puedo abrir audios, imágenes o archivos. ¿Me lo escribes en texto, por favor? 🙏",
    saiu: "Está bien, no te enviaré más mensajes. Si necesitas algo, escríbeme. ¡Gracias!",
    naoEntendi: "No entendí. Responde solo con el número de la opción, por favor.",
  },
};

// ---------- Idioma: pelo DDI do telefone, corrigido pelas palavras da mensagem ----------
const DDI_ESPANHOL = ["34", "52", "54", "56", "57", "51", "58", "593", "591", "595", "598", "502", "503", "504", "505", "506", "507", "53", "1809"];
// palavra inteira, funcionando com acentos (o \b do JavaScript não entende "á", "ç"...)
const palavras = (lista) => new RegExp(`(?<!\\p{L})(${lista})(?!\\p{L})`, "iu");

const PALAVRAS = {
  pt: palavras("oi|olá|ola|bom dia|boa tarde|boa noite|você|voce|preciso|quero|obrigad[oa]|não|nao|empresa|orçamento"),
  es: palavras("hola|buenos|buenas|necesito|quiero|gracias|sitio|página|usted|presupuesto|cotización"),
  en: palavras("hi|hello|hey|need|want|website|thanks|please|business|quote"),
};

function detectarIdioma(telefone, texto) {
  for (const idioma of ["pt", "es", "en"]) if (PALAVRAS[idioma].test(texto)) return idioma;
  if (telefone.startsWith("55") || telefone.startsWith("351")) return "pt";
  if (DDI_ESPANHOL.some((ddi) => telefone.startsWith(ddi))) return "es";
  return "en";
}

const QUER_HUMANO = palavras(
  "humano|atendente|falar com (uma pessoa|algu[eé]m)|human|real person|talk to (a person|someone)|representative|hablar con (una persona|alguien)|asesor",
);
const QUER_SAIR = /^(parar|pare|sair|stop|unsubscribe|cancelar|baja|no quiero|não quero|nao quero)\b/i;
const QUER_PULAR = /^(pular|skip|saltar|-)\b/i;
const URGENTE = /(urgente|urgent|asap|j[aá]\b|agora|hoje|essa semana|esta semana|this week|now|ya\b|lo antes posible|o quanto antes)/i;
const MIDIA = /^\[O cliente enviou/;

function ehOpcao(texto, maximo) {
  const numero = Number(texto.trim().replace(/[^\d]/g, ""));
  return Number.isInteger(numero) && numero >= 1 && numero <= maximo && /^\D*\d\D*$/.test(texto.trim()) ? numero : 0;
}

/**
 * Recebe a conversa salva e a nova mensagem do cliente, e devolve o texto a enviar.
 * `acoes` traz as funções do servidor: { registrarLead, transferirParaHumano }.
 * A conversa é alterada no lugar (o chamador salva depois).
 */
export async function responder(conversa, mensagemDoCliente, acoes) {
  const texto = mensagemDoCliente.trim();
  const estado = (conversa.roteiro ??= { etapa: "inicio", idioma: null, dados: {} });
  estado.idioma ??= detectarIdioma(conversa.telefone, texto);
  const t = TEXTOS[estado.idioma];
  const d = estado.dados;

  const resposta = await proximaMensagem();
  conversa.mensagens.push({ role: "user", content: mensagemDoCliente });
  conversa.mensagens.push({ role: "assistant", content: [{ type: "text", text: resposta }] });
  return resposta;

  // Saudação. Se o WhatsApp já informou o nome do perfil, pula a pergunta do nome.
  function comecar(novoEstado) {
    const primeiroNome = (conversa.nome || "").split(/\s+/)[0].replace(/[^\p{L}'-]/gu, "");
    if (primeiroNome) {
      novoEstado.dados.nome = primeiroNome;
      novoEstado.etapa = "negocio";
      return `${t.ola(primeiroNome)}\n\n${t.perguntaNegocio}`;
    }
    novoEstado.etapa = "nome";
    return `${t.ola("")}\n\n${t.perguntaNome}`;
  }

  async function proximaMensagem() {
    if (QUER_SAIR.test(texto)) {
      conversa.pausadoAte = new Date(Date.now() + 10 * 365 * 24 * 3600 * 1000).toISOString();
      return t.saiu;
    }
    if (QUER_HUMANO.test(texto)) {
      await acoes.transferirParaHumano(`Pediu para falar com uma pessoa: "${texto}"`);
      return t.transferido;
    }
    if (MIDIA.test(texto) && estado.etapa !== "inicio") return t.soTexto;

    switch (estado.etapa) {
      case "inicio":
        return comecar(estado);

      case "nome":
        d.nome = texto.slice(0, 80);
        estado.etapa = "negocio";
        return t.negocio(d.nome);

      case "negocio":
        d.negocio = texto;
        estado.etapa = "local";
        return t.local;

      case "local":
        d.local = texto;
        estado.etapa = "temSite";
        return t.temSite;

      case "temSite":
        d.temSite = texto;
        estado.etapa = "necessidade";
        return t.necessidade;

      case "necessidade": {
        const opcao = ehOpcao(texto, 4);
        if (opcao === 4) {
          estado.etapa = "descrevaOutro";
          return t.descrevaOutro;
        }
        if (!opcao) {
          d.necessidade = texto; // o cliente escreveu em vez de escolher: aceita como descrição
        } else {
          d.necessidade = t.opcoes[opcao - 1];
          d.servico = opcao - 1;
        }
        estado.etapa = "prazo";
        return t.prazo;
      }

      case "descrevaOutro":
        d.necessidade = texto;
        estado.etapa = "prazo";
        return t.prazo;

      case "prazo":
        d.prazo = texto;
        estado.etapa = "orcamento";
        return t.orcamento;

      case "orcamento": {
        d.orcamento = QUER_PULAR.test(texto) ? "não informado" : texto;
        estado.etapa = "concluido";
        await acoes.registrarLead({
          nome: d.nome,
          empresa: d.negocio,
          ramo: d.negocio,
          pais_cidade: d.local,
          idioma: { pt: "português", en: "inglês", es: "espanhol" }[estado.idioma],
          tem_site: d.temSite,
          necessidade: d.necessidade,
          orcamento: d.orcamento,
          prazo: d.prazo,
          temperatura: URGENTE.test(d.prazo) ? "quente" : "morno",
          resumo: `(modo grátis) ${d.nome} - ${d.negocio}, ${d.local}. Quer: ${d.necessidade}. Prazo: ${d.prazo}.`,
        });

        const partes = [t.final(d.nome)];
        const servico = empresa.servicos[d.servico];
        if (servico && preenchido(servico.precoAPartirDe)) {
          partes.push(t.precoAPartir(t.opcoes[d.servico].toLowerCase(), servico.precoAPartirDe));
        }
        if (preenchido(empresa.linkPortfolio)) partes.push(t.portfolio(empresa.linkPortfolio));
        if (preenchido(empresa.linkAgendamento)) partes.push(t.agendar(empresa.linkAgendamento));
        return partes.join("\n\n");
      }

      case "concluido":
      default: {
        const opcao = ehOpcao(texto, 4);
        if (opcao === 1) return preenchido(empresa.linkPortfolio) ? t.portfolio(empresa.linkPortfolio) : t.semLink;
        if (opcao === 2) return preenchido(empresa.linkAgendamento) ? t.agendar(empresa.linkAgendamento) : t.semLink;
        if (opcao === 3) {
          await acoes.transferirParaHumano("Escolheu 'Falar com uma pessoa' no menu");
          return t.transferido;
        }
        if (opcao === 4) {
          conversa.roteiro = { etapa: "inicio", idioma: estado.idioma, dados: {} };
          return comecar(conversa.roteiro);
        }
        return estado.menuMostrado ? `${t.naoEntendi}\n\n${t.menu}` : ((estado.menuMostrado = true), t.menu);
      }
    }
  }
}
