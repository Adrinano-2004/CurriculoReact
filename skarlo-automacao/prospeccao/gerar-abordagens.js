// Escreve uma abordagem personalizada para cada lead encontrado.
//   - Com ANTHROPIC_API_KEY no .env: o Claude escreve cada mensagem (modo IA).
//   - Sem a chave: preenche modelos prontos com os dados reais da empresa (modo grátis).
//
// Uso:
//   npm run abordagens            -> modo IA: os 30 melhores leads sem abordagem; modo grátis: todos
//   npm run abordagens -- 100     -> escreve para os 100 melhores
//
// Resultado: dados/abordagens.csv (assunto, e-mail, mensagem curta para Instagram/LinkedIn, follow-up).
// Você revisa e envia. Nada é enviado automaticamente.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { empresa } from "../empresa.js";
import { paraCsv } from "./csv.js";
import { escreverComModelo } from "./modelos.js";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const ARQUIVO_LEADS = path.join(aqui, "..", "dados", "leads.json");
const ARQUIVO_CSV = path.join(aqui, "..", "dados", "abordagens.csv");

const MODELO = "claude-opus-5-5";
const EM_PARALELO = 3;

const chaveClaude = process.env.ANTHROPIC_API_KEY ?? "";
const MODO_IA = chaveClaude.startsWith("sk-ant-") && !chaveClaude.includes("...");
let client; // só é criado no modo IA

const ESQUEMA = {
  type: "object",
  properties: {
    idioma: { type: "string", description: "Idioma usado, de acordo com o país da empresa" },
    canal_recomendado: {
      type: "string",
      enum: ["email", "instagram", "linkedin", "ligacao", "visita"],
    },
    gancho: { type: "string", description: "A observação específica sobre a empresa usada na abordagem" },
    assunto_email: { type: "string" },
    email: { type: "string", description: "Corpo do e-mail, 60 a 120 palavras" },
    mensagem_curta: { type: "string", description: "Mensagem para DM do Instagram/LinkedIn, até 300 caracteres" },
    follow_up: { type: "string", description: "Mensagem de acompanhamento para mandar 3 a 4 dias depois, até 300 caracteres" },
  },
  required: ["idioma", "canal_recomendado", "gancho", "assunto_email", "email", "mensagem_curta", "follow_up"],
  additionalProperties: false,
};

const SISTEMA = `Você escreve mensagens de prospecção B2B para a ${empresa.nome} (${empresa.site}), que cria sites profissionais com automações (agendamento online, chat com IA 24h, integração com WhatsApp, captura de leads) para empresas do mundo todo.

Regras:
- Escreva no idioma local da empresa (EUA/Reino Unido -> inglês; Brasil/Portugal -> português do país; América Latina/Espanha -> espanhol; outros -> inglês).
- Comece com uma observação específica e verdadeira sobre a empresa (nota no Google, número de avaliações, ramo, problema real do site). Use SOMENTE os dados fornecidos; nunca invente fatos.
- Mostre 1 benefício concreto para o ramo dela (ex: dentista -> pacientes agendando sozinhos à noite).
- Tom de pessoa para pessoa: curto, educado, sem exageros, sem "esperamos que esteja bem", sem promessas de resultado garantido, sem preço.
- Termine com uma pergunta simples de sim/não e convide para conversar no WhatsApp ou e-mail. Assine como ${empresa.responsavel.startsWith("PREENCHER") ? "a equipe" : empresa.responsavel} da ${empresa.nome}.
- No e-mail, inclua no final uma linha curta dizendo que a pessoa pode responder "não" para não receber mais mensagens.
- canal_recomendado: "email" se houver e-mail; senão "instagram" para negócios de varejo/serviços locais, "linkedin" para empresas B2B/escritórios, "ligacao" se só houver telefone.`;

function descreverLead(lead) {
  return [
    `Empresa: ${lead.nome}`,
    `Ramo (busca usada): ${lead.busca}`,
    `Endereço: ${lead.endereco}`,
    `Nota no Google: ${lead.nota} (${lead.avaliacoes} avaliações)`,
    `Site: ${lead.site || "não tem"}`,
    `Situação do site: ${lead.statusSite}`,
    `Problemas encontrados: ${lead.problemas.join("; ") || "nenhum"}`,
    `E-mails encontrados: ${lead.emails?.join(", ") || "nenhum"}`,
    `Telefone: ${lead.telefone || "não tem"}`,
  ].join("\n");
}

async function escreverComClaude(lead) {
  client ??= new Anthropic();
  const resposta = await client.beta.messages.create({
    model: MODELO,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium", format: { type: "json_schema", schema: ESQUEMA } },
    system: SISTEMA,
    messages: [{ role: "user", content: descreverLead(lead) }],
  });
  if (resposta.stop_reason === "refusal") throw new Error("o modelo recusou este lead");
  const texto = resposta.content.find((b) => b.type === "text")?.text;
  if (!texto) throw new Error(`resposta sem texto (stop_reason: ${resposta.stop_reason})`);
  return { origem: "ia", ...JSON.parse(texto) };
}

async function main() {
  const limite = Number(process.argv[2]) || (MODO_IA ? 30 : Infinity); // grátis: todos
  const leads = JSON.parse(await fs.readFile(ARQUIVO_LEADS, "utf8"));

  const pendentes = leads
    // no modo IA, também reescreve as que foram feitas com modelo
    .filter((l) => l.statusSite !== "site_ok" && (!l.abordagem || (MODO_IA && l.abordagem.origem !== "ia")))
    .sort((a, b) => b.pontuacao - a.pontuacao)
    .slice(0, limite);
  console.log(
    `✍️  Escrevendo ${pendentes.length} abordagens (${MODO_IA ? "modo IA, com Claude" : "modo grátis, com modelos"})...`,
  );
  const escrever = MODO_IA ? escreverComClaude : escreverComModelo;

  let feitos = 0;
  const fila = [...pendentes];
  async function trabalhador() {
    for (let lead = fila.shift(); lead; lead = fila.shift()) {
      try {
        lead.abordagem = await escrever(lead);
        console.log(`   [${++feitos}/${pendentes.length}] ${lead.nome}`);
      } catch (erro) {
        console.error(`   ✗ ${lead.nome}: ${erro.message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: EM_PARALELO }, trabalhador));

  // salva no leads.json para não gastar de novo com quem já tem abordagem
  await fs.writeFile(ARQUIVO_LEADS, JSON.stringify(leads, null, 2));

  const linhas = leads
    .filter((l) => l.abordagem)
    .sort((a, b) => b.pontuacao - a.pontuacao)
    .map((l) => ({
      pontuacao: l.pontuacao,
      nome: l.nome,
      canal: l.abordagem.canal_recomendado,
      emails: l.emails,
      telefone: l.telefone,
      site: l.site,
      googleMaps: l.googleMaps,
      idioma: l.abordagem.idioma,
      gancho: l.abordagem.gancho,
      assunto: l.abordagem.assunto_email,
      email: l.abordagem.email,
      mensagem_curta: l.abordagem.mensagem_curta,
      follow_up: l.abordagem.follow_up,
      status: l.status,
    }));
  await fs.writeFile(ARQUIVO_CSV, paraCsv(linhas, Object.keys(linhas[0] ?? { nome: "" })));
  console.log(`\n✅ ${linhas.length} abordagens em dados/abordagens.csv`);
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
