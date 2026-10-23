// Servidor que recebe as mensagens do WhatsApp (webhook da Meta) e responde com o Claude.

import crypto from "node:crypto";
import express from "express";
import { empresa } from "../empresa.js";
import { responder } from "./claude.js";
import { enviarTexto, marcarComoLida } from "./whatsapp.js";
import {
  carregarConversa,
  salvarConversa,
  estaPausada,
  registrarLead,
} from "./conversas.js";

const HORAS_PAUSA_APOS_TRANSFERIR = 24;
const DONO = (process.env.DONO_WHATSAPP || "").replace(/\D/g, "");

for (const variavel of ["ANTHROPIC_API_KEY", "WHATSAPP_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_VERIFY_TOKEN"]) {
  if (!process.env[variavel]) {
    console.error(`Falta a variável ${variavel} no arquivo .env`);
    process.exit(1);
  }
}
if (!process.env.WHATSAPP_APP_SECRET) {
  console.warn("AVISO: WHATSAPP_APP_SECRET vazio - a assinatura das mensagens da Meta não será verificada.");
}

const app = express();
app.use(express.json({ verify: (req, _res, buffer) => (req.corpoBruto = buffer) }));

// Garante que a mensagem veio mesmo da Meta (e não de alguém tentando usar seu bot).
function assinaturaValida(req) {
  const segredo = process.env.WHATSAPP_APP_SECRET;
  if (!segredo) return true;
  const recebida = req.get("x-hub-signature-256") || "";
  const esperada = "sha256=" + crypto.createHmac("sha256", segredo).update(req.corpoBruto).digest("hex");
  return (
    recebida.length === esperada.length &&
    crypto.timingSafeEqual(Buffer.from(recebida), Buffer.from(esperada))
  );
}

// A Meta chama este endereço uma vez para confirmar que o webhook é seu.
app.get("/webhook", (req, res) => {
  if (
    req.query["hub.mode"] === "subscribe" &&
    req.query["hub.verify_token"] === process.env.WHATSAPP_VERIFY_TOKEN
  ) {
    return res.status(200).send(req.query["hub.challenge"]);
  }
  res.sendStatus(403);
});

app.post("/webhook", (req, res) => {
  if (!assinaturaValida(req)) return res.sendStatus(401);
  res.sendStatus(200); // responde já: se demorar, a Meta reenvia a mesma mensagem
  for (const entrada of req.body.entry ?? []) {
    for (const mudanca of entrada.changes ?? []) {
      const valor = mudanca.value ?? {};
      const nomes = Object.fromEntries((valor.contacts ?? []).map((c) => [c.wa_id, c.profile?.name]));
      for (const mensagem of valor.messages ?? []) {
        enfileirar(mensagem.from, () => tratarMensagem(mensagem, nomes[mensagem.from] || ""));
      }
    }
  }
});

app.get("/", (_req, res) => res.send(`Bot da ${empresa.nome} no ar.`));

// --- Fila por contato: mensagens do mesmo cliente são respondidas uma de cada vez ---
const filas = new Map();
function enfileirar(telefone, tarefa) {
  const anterior = filas.get(telefone) ?? Promise.resolve();
  const proxima = anterior
    .then(tarefa)
    .catch((erro) => console.error(`[${telefone}]`, erro))
    .finally(() => {
      if (filas.get(telefone) === proxima) filas.delete(telefone);
    });
  filas.set(telefone, proxima);
}

// --- Evita responder duas vezes a mesma mensagem (a Meta às vezes reenvia) ---
const jaVistas = new Set();
function jaFoiTratada(id) {
  if (jaVistas.has(id)) return true;
  jaVistas.add(id);
  if (jaVistas.size > 5000) jaVistas.delete(jaVistas.values().next().value);
  return false;
}

function textoDaMensagem(mensagem) {
  switch (mensagem.type) {
    case "text":
      return mensagem.text.body;
    case "button":
      return mensagem.button.text;
    case "interactive":
      return mensagem.interactive.button_reply?.title ?? mensagem.interactive.list_reply?.title ?? "";
    case "audio":
      return "[O cliente enviou um áudio, que o assistente não consegue ouvir]";
    case "image":
    case "video":
    case "document":
    case "sticker":
      return `[O cliente enviou ${mensagem.type === "image" ? "uma imagem" : "um arquivo"}${
        mensagem[mensagem.type]?.caption ? ` com a legenda: "${mensagem[mensagem.type].caption}"` : ""
      }]`;
    default:
      return null; // reações, localização etc.: ignorar
  }
}

async function avisarDono(texto) {
  const tarefas = [];
  if (DONO) tarefas.push(enviarTexto(DONO, texto));
  if (process.env.NOTIFICACAO_WEBHOOK_URL) {
    tarefas.push(
      fetch(process.env.NOTIFICACAO_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: texto }),
      }),
    );
  }
  // O aviso por WhatsApp só chega se você mandou mensagem para o bot nas últimas 24h
  // (regra da Meta). Por isso vale configurar também o NOTIFICACAO_WEBHOOK_URL.
  for (const resultado of await Promise.allSettled(tarefas)) {
    if (resultado.status === "rejected") console.error("[aviso ao dono]", resultado.reason.message);
  }
}

// Comandos que só o dono pode mandar para o número do bot:
//   /bot pausar 5511988887777   -> o bot para de responder esse contato (você assume)
//   /bot ativar 5511988887777   -> o bot volta a responder esse contato
async function tratarComandoDoDono(texto) {
  const [, acao, numero] = texto.trim().split(/\s+/);
  const telefone = (numero || "").replace(/\D/g, "");
  if (!["pausar", "ativar"].includes(acao) || !telefone) {
    return enviarTexto(DONO, "Comandos: /bot pausar <número> ou /bot ativar <número>");
  }
  const conversa = await carregarConversa(telefone);
  conversa.pausadoAte =
    acao === "pausar" ? new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString() : null;
  await salvarConversa(conversa);
  await enviarTexto(DONO, `Bot ${acao === "pausar" ? "pausado" : "ativado"} para ${telefone}.`);
}

async function tratarMensagem(mensagem, nomeNoPerfil) {
  if (jaFoiTratada(mensagem.id)) return;
  const texto = textoDaMensagem(mensagem);
  if (texto === null) return;

  if (mensagem.from === DONO && texto.trim().toLowerCase().startsWith("/bot")) {
    return tratarComandoDoDono(texto);
  }

  const conversa = await carregarConversa(mensagem.from);
  if (nomeNoPerfil) conversa.nome = nomeNoPerfil;
  if (estaPausada(conversa)) return; // um humano está cuidando desta conversa

  await marcarComoLida(mensagem.id).catch(() => {});

  const resposta = await responder(conversa, texto, {
    registrarLead: async (dados) => {
      const lead = { telefone: mensagem.from, nomeNoWhatsApp: conversa.nome, ...dados };
      await registrarLead(lead);
      await avisarDono(
        `🔔 Lead ${dados.temperatura.toUpperCase()} - ${dados.nome} (${dados.empresa})\n` +
          `Ramo: ${dados.ramo} | ${dados.pais_cidade}\n` +
          `Quer: ${dados.necessidade}\nOrçamento: ${dados.orcamento} | Prazo: ${dados.prazo}\n` +
          `${dados.resumo}\nWhatsApp: https://wa.me/${mensagem.from}`,
      );
    },
    transferirParaHumano: async (motivo) => {
      conversa.pausadoAte = new Date(
        Date.now() + HORAS_PAUSA_APOS_TRANSFERIR * 3600 * 1000,
      ).toISOString();
      await avisarDono(
        `🙋 ${conversa.nome || mensagem.from} quer falar com você.\nMotivo: ${motivo}\n` +
          `Responda pelo app: https://wa.me/${mensagem.from}\n` +
          `(o bot fica pausado nessa conversa por ${HORAS_PAUSA_APOS_TRANSFERIR}h; para reativar: /bot ativar ${mensagem.from})`,
      );
    },
  });

  await salvarConversa(conversa);
  if (resposta) await enviarTexto(mensagem.from, resposta);
}

const porta = Number(process.env.PORT) || 3000;
app.listen(porta, () => console.log(`Bot da ${empresa.nome} ouvindo na porta ${porta} (webhook: /webhook)`));
