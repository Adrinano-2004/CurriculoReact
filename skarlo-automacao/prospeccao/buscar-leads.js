// Busca empresas no Google Maps (Places API) e descobre quais NÃO têm site ou têm site fraco.
//
// Uso:
//   npm run leads                                   -> usa a lista prospeccao/alvos.json
//   npm run leads -- "dentist" "Miami, FL, USA"     -> uma busca só
//
// Resultado: dados/leads.json e dados/leads.csv (abre no Excel / Google Planilhas).
// Rodar de novo não duplica: empresas já encontradas são atualizadas.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { paraCsv } from "./csv.js";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const PASTA_DADOS = path.join(aqui, "..", "dados");
const ARQUIVO_JSON = path.join(PASTA_DADOS, "leads.json");
const ARQUIVO_CSV = path.join(PASTA_DADOS, "leads.csv");

const PAGINAS_POR_BUSCA = 3; // 20 empresas por página -> até 60 por busca

const CAMPOS = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.googleMapsUri",
  "places.businessStatus",
  "nextPageToken",
].join(",");

// "Sites" que na verdade são só rede social ou link de bio: cliente ótimo para vender site próprio.
const NAO_E_SITE_PROPRIO =
  /(instagram\.com|facebook\.com|fb\.com|linktr\.ee|wa\.me|whatsapp\.com|tiktok\.com|linkedin\.com|business\.site|sites\.google\.com)/i;

if (!process.env.GOOGLE_PLACES_API_KEY) {
  console.error("Falta GOOGLE_PLACES_API_KEY no arquivo .env");
  process.exit(1);
}

async function buscarNoMaps(busca, local) {
  const empresas = [];
  let pageToken;
  for (let pagina = 0; pagina < PAGINAS_POR_BUSCA; pagina++) {
    const resposta = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": CAMPOS,
      },
      body: JSON.stringify({ textQuery: `${busca} in ${local}`, pageSize: 20, pageToken }),
    });
    if (!resposta.ok) throw new Error(`Places API ${resposta.status}: ${await resposta.text()}`);
    const dados = await resposta.json();
    empresas.push(...(dados.places ?? []));
    pageToken = dados.nextPageToken;
    if (!pageToken) break;
  }
  return empresas.filter((e) => e.businessStatus !== "CLOSED_PERMANENTLY");
}

// Abre o site da empresa e procura problemas que justificam vender um site novo.
async function analisarSite(url) {
  if (!url) return { statusSite: "sem_site", problemas: ["não tem site"], emails: [] };
  if (NAO_E_SITE_PROPRIO.test(url)) {
    return { statusSite: "sem_site", problemas: [`usa só rede social/link (${new URL(url).hostname})`], emails: [] };
  }

  let resposta;
  try {
    resposta = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SkarloSiteCheck/1.0)" },
    });
  } catch {
    return { statusSite: "site_fora_do_ar", problemas: ["site não abre"], emails: [] };
  }
  if (!resposta.ok) {
    return { statusSite: "site_fora_do_ar", problemas: [`site retorna erro ${resposta.status}`], emails: [] };
  }

  const html = (await resposta.text()).slice(0, 500_000);
  const problemas = [];
  if (!resposta.url.startsWith("https://")) problemas.push("sem HTTPS (navegador mostra 'não seguro')");
  if (!/<meta[^>]+name=["']?viewport/i.test(html)) problemas.push("não é adaptado para celular");
  if (!/(wa\.me|api\.whatsapp|whatsapp)/i.test(html)) problemas.push("sem botão de WhatsApp");
  if (!/(calendly|cal\.com|booking|book now|schedule|agend|reserv|appointment|cita)/i.test(html)) {
    problemas.push("sem agendamento/reserva online");
  }
  if (!/<form/i.test(html)) problemas.push("sem formulário de contato");
  const ano = html.match(/(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?(\d{4})/i)?.[1];
  if (ano && Number(ano) < new Date().getFullYear() - 2) problemas.push(`site parece desatualizado (© ${ano})`);

  const emails = [
    ...new Set(
      (html.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? []).filter(
        (e) => !/\.(png|jpe?g|gif|webp|svg)$/i.test(e) && !/(sentry|wixpress|example)/i.test(e),
      ),
    ),
  ].slice(0, 3);

  return { statusSite: problemas.length >= 2 ? "site_fraco" : "site_ok", problemas, emails };
}

// Quanto maior, melhor o lead: sem site + bem avaliado = empresa ativa que está perdendo clientes.
function pontuar(lead) {
  const base = { sem_site: 50, site_fora_do_ar: 45, site_fraco: 30, site_ok: 0 }[lead.statusSite];
  const reputacao = Math.min(lead.avaliacoes, 200) / 10 + (lead.nota >= 4.3 ? 10 : 0);
  return Math.round(base + reputacao + lead.problemas.length * 2);
}

async function lerLeadsExistentes() {
  try {
    return JSON.parse(await fs.readFile(ARQUIVO_JSON, "utf8"));
  } catch {
    return [];
  }
}

async function main() {
  const [buscaArg, localArg] = process.argv.slice(2);
  const alvos = buscaArg
    ? [{ busca: buscaArg, local: localArg || "" }]
    : JSON.parse(await fs.readFile(path.join(aqui, "alvos.json"), "utf8"));

  const porId = new Map((await lerLeadsExistentes()).map((l) => [l.id, l]));

  for (const { busca, local } of alvos) {
    console.log(`\n🔎 ${busca} - ${local}`);
    const empresas = await buscarNoMaps(busca, local);
    let novos = 0;
    for (const empresa of empresas) {
      const analise = await analisarSite(empresa.websiteUri);
      const lead = {
        id: empresa.id,
        nome: empresa.displayName?.text ?? "",
        endereco: empresa.formattedAddress ?? "",
        telefone: empresa.internationalPhoneNumber ?? "",
        site: empresa.websiteUri ?? "",
        nota: empresa.rating ?? 0,
        avaliacoes: empresa.userRatingCount ?? 0,
        googleMaps: empresa.googleMapsUri ?? "",
        busca,
        local,
        ...analise,
        // mantém o andamento que você anotou à mão na planilha
        status: porId.get(empresa.id)?.status ?? "novo",
      };
      lead.pontuacao = pontuar(lead);
      if (!porId.has(lead.id)) novos++;
      porId.set(lead.id, { ...porId.get(lead.id), ...lead });
    }
    console.log(`   ${empresas.length} empresas, ${novos} novas`);
  }

  const leads = [...porId.values()].sort((a, b) => b.pontuacao - a.pontuacao);
  await fs.mkdir(PASTA_DADOS, { recursive: true });
  await fs.writeFile(ARQUIVO_JSON, JSON.stringify(leads, null, 2));
  await fs.writeFile(
    ARQUIVO_CSV,
    paraCsv(leads, [
      "pontuacao", "statusSite", "nome", "busca", "local", "telefone", "emails", "site",
      "problemas", "nota", "avaliacoes", "endereco", "googleMaps", "status",
    ]),
  );

  const resumo = leads.reduce((c, l) => ({ ...c, [l.statusSite]: (c[l.statusSite] ?? 0) + 1 }), {});
  console.log(`\n✅ ${leads.length} leads salvos em dados/leads.csv`, resumo);
  console.log("Próximo passo: npm run abordagens");
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
