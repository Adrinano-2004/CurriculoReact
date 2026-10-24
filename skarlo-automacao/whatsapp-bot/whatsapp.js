// Envio de mensagens pela WhatsApp Cloud API (API oficial da Meta).

const LIMITE_CARACTERES = 4000; // o WhatsApp aceita até 4096 por mensagem

function urlMensagens() {
  const versao = process.env.WHATSAPP_GRAPH_VERSION || "v23.0";
  return `https://graph.facebook.com/${versao}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
}

async function chamarGraph(corpo) {
  const resposta = await fetch(urlMensagens(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messaging_product: "whatsapp", ...corpo }),
  });
  if (!resposta.ok) {
    throw new Error(`WhatsApp API ${resposta.status}: ${await resposta.text()}`);
  }
  return resposta.json();
}

// Quebra textos longos em partes, preferindo cortar em quebras de linha.
function dividirTexto(texto) {
  const partes = [];
  let resto = texto.trim();
  while (resto.length > LIMITE_CARACTERES) {
    let corte = resto.lastIndexOf("\n", LIMITE_CARACTERES);
    if (corte < LIMITE_CARACTERES / 2) corte = LIMITE_CARACTERES;
    partes.push(resto.slice(0, corte).trim());
    resto = resto.slice(corte).trim();
  }
  if (resto) partes.push(resto);
  return partes;
}

// Celular brasileiro: o WhatsApp às vezes informa o número SEM o 9 (55 32 8888-7777)
// e às vezes COM o 9 (55 32 9 8888-7777). Devolve as duas formas.
export function formasDoNumero(numero) {
  const n = String(numero).replace(/\D/g, "");
  if (n.startsWith("55") && n.length === 12 && /[6-9]/.test(n[4])) return [n, `${n.slice(0, 4)}9${n.slice(4)}`];
  if (n.startsWith("55") && n.length === 13 && n[4] === "9") return [n, `${n.slice(0, 4)}${n.slice(5)}`];
  return [n];
}

export function mesmoNumero(a, b) {
  const formasDeB = formasDoNumero(b);
  return formasDoNumero(a).some((forma) => formasDeB.includes(forma));
}

// Lembra qual forma do número funcionou, para não errar de novo.
const formaQueFunciona = new Map();

export async function enviarTexto(para, texto) {
  for (const parte of dividirTexto(texto)) {
    const corpo = { type: "text", text: { body: parte, preview_url: true } };
    const formas = formasDoNumero(para);
    const primeira = formaQueFunciona.get(formas[0]) ?? formas[0];
    try {
      await chamarGraph({ to: primeira, ...corpo });
    } catch (erro) {
      // 131030 = número fora da lista de teste (acontece com a forma sem/com o 9)
      const outra = formas.find((f) => f !== primeira);
      if (!outra || !String(erro.message).includes("131030")) throw erro;
      await chamarGraph({ to: outra, ...corpo });
      formaQueFunciona.set(formas[0], outra);
    }
  }
}

// Mostra os "dois tracinhos azuis" para o cliente.
export async function marcarComoLida(idMensagem) {
  await chamarGraph({ status: "read", message_id: idMensagem });
}
