// Guarda o histórico de cada contato e os leads em arquivos JSON na pasta "dados".
// Simples de propósito: para poucos milhares de conversas é suficiente.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const PASTA_DADOS = path.join(aqui, "..", "dados");
const PASTA_CONVERSAS = path.join(PASTA_DADOS, "conversas");
const ARQUIVO_LEADS = path.join(PASTA_DADOS, "leads-whatsapp.json");

function arquivoDoContato(telefone) {
  return path.join(PASTA_CONVERSAS, `${telefone.replace(/\D/g, "")}.json`);
}

async function lerJson(arquivo, padrao) {
  try {
    return JSON.parse(await fs.readFile(arquivo, "utf8"));
  } catch (erro) {
    if (erro.code === "ENOENT") return padrao;
    throw erro;
  }
}

async function salvarJson(arquivo, dados) {
  await fs.mkdir(path.dirname(arquivo), { recursive: true });
  const temporario = `${arquivo}.tmp`;
  await fs.writeFile(temporario, JSON.stringify(dados, null, 2));
  await fs.rename(temporario, arquivo);
}

export async function carregarConversa(telefone) {
  return lerJson(arquivoDoContato(telefone), {
    telefone,
    nome: "",
    pausadoAte: null,
    mensagens: [],
  });
}

export async function salvarConversa(conversa) {
  await salvarJson(arquivoDoContato(conversa.telefone), conversa);
}

export function estaPausada(conversa) {
  return Boolean(conversa.pausadoAte && new Date(conversa.pausadoAte) > new Date());
}

export async function registrarLead(lead) {
  const leads = await lerJson(ARQUIVO_LEADS, []);
  const existente = leads.findIndex((l) => l.telefone === lead.telefone);
  const registro = { ...lead, atualizadoEm: new Date().toISOString() };
  if (existente >= 0) leads[existente] = { ...leads[existente], ...registro };
  else leads.push({ ...registro, criadoEm: registro.atualizadoEm });
  await salvarJson(ARQUIVO_LEADS, leads);
}
