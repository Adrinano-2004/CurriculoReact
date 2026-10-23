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

export async function enviarTexto(para, texto) {
  for (const parte of dividirTexto(texto)) {
    await chamarGraph({
      to: para,
      type: "text",
      text: { body: parte, preview_url: true },
    });
  }
}

// Mostra os "dois tracinhos azuis" para o cliente.
export async function marcarComoLida(idMensagem) {
  await chamarGraph({ status: "read", message_id: idMensagem });
}
