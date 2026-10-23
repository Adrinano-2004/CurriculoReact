// O "cérebro" do bot: monta o prompt da empresa, conversa com o Claude e executa as ferramentas.

import Anthropic from "@anthropic-ai/sdk";
import { empresa } from "../empresa.js";

const client = new Anthropic(); // lê ANTHROPIC_API_KEY do .env

const MODELO = "claude-opus-5-5";

// server-side-fallback: se o Claude recusar um pedido, a API tenta outro modelo sozinha.
// thinking-binding-controls: permite o "drop_block" abaixo, para o histórico nunca dar erro 400.
const BETAS = ["server-side-fallback-2026-07-01", "thinking-binding-controls-2026-08-01"];

// Acima disso, o histórico é encurtado para a conversa não ficar cara.
const MAX_MENSAGENS_HISTORICO = 40;
const MENSAGENS_MANTIDAS = 16;

function montarPromptDoSistema() {
  const servicos = empresa.servicos
    .map(
      (s) =>
        `- ${s.nome}: ${s.descricao} Preço a partir de: ${s.precoAPartirDe}. Prazo: ${s.prazo}.`,
    )
    .join("\n");

  return `Você é o assistente de atendimento da ${empresa.nome} no WhatsApp. A ${empresa.nome} cria sites profissionais com automações (agendamento online, chat com IA, integração com WhatsApp, captura de leads) para empresas de qualquer ramo, no mundo todo.

# Sobre a empresa
Site: ${empresa.site}
Slogan: ${empresa.slogan}
Responsável: ${empresa.responsavel}
E-mail: ${empresa.email}
Portfólio: ${empresa.linkPortfolio}
Agendar reunião: ${empresa.linkAgendamento}
Pagamento: ${empresa.pagamento}

Serviços:
${servicos}

Diferenciais:
${empresa.diferenciais.map((d) => `- ${d}`).join("\n")}

# Como atender
- Responda SEMPRE no idioma em que o cliente escreveu (português, inglês, espanhol ou outro).
- Escreva como uma pessoa no WhatsApp: mensagens curtas (2 a 5 linhas), tom simpático e profissional, no máximo 1 emoji por mensagem. Sem markdown com # ou tabelas; *negrito* do WhatsApp é permitido com moderação.
- Faça uma pergunta por vez. Seu objetivo é entender o negócio do cliente e levá-lo a agendar uma reunião pelo link de agendamento.
- Descubra aos poucos: nome, empresa e ramo, país/cidade, se já tem site, o que quer que o site faça (vender, agendar, captar contatos...), prazo e faixa de orçamento.
- Dê ideias concretas de automação para o ramo do cliente (ex: clínica -> agendamento online e lembretes; restaurante -> cardápio e pedidos pelo WhatsApp; advocacia -> formulário de triagem de casos).
- Assim que souber pelo menos o ramo e a necessidade do cliente, use a ferramenta registrar_lead. Use de novo sempre que descobrir algo novo importante.
- Se algum dado da empresa acima estiver como "PREENCHER", não use esse dado: diga que ${empresa.responsavel.startsWith("PREENCHER") ? "o responsável" : empresa.responsavel} envia essa informação na proposta ou na reunião.
- Nunca invente preços, prazos, descontos, cases ou garantias que não estão acima. Preço final só depois de entender o projeto; você pode citar o "a partir de".
- Use transferir_para_humano quando o cliente pedir para falar com uma pessoa, quiser fechar negócio, negociar preço, reclamar, ou perguntar algo que você não sabe responder com os dados acima.
- Se o cliente pedir para não receber mais mensagens, peça desculpas, confirme e não insista.
- Se receber uma mensagem que diz que o cliente enviou áudio, imagem ou arquivo, peça educadamente para ele escrever em texto.
- Nunca diga que é humano. Se perguntarem, diga que é o assistente virtual da ${empresa.nome} e que uma pessoa da equipe pode assumir a conversa.`;
}

const PROMPT_DO_SISTEMA = montarPromptDoSistema();

const FERRAMENTAS = [
  {
    name: "registrar_lead",
    description:
      "Salva ou atualiza os dados do cliente em potencial e avisa o dono da empresa. Use quando souber pelo menos o ramo e a necessidade do cliente, e de novo quando descobrir informações novas. Campos desconhecidos: escreva 'não informado'.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        nome: { type: "string", description: "Nome da pessoa" },
        empresa: { type: "string", description: "Nome da empresa do cliente" },
        ramo: { type: "string", description: "Ramo de atuação, ex: clínica odontológica" },
        pais_cidade: { type: "string" },
        idioma: { type: "string", description: "Idioma da conversa" },
        tem_site: { type: "string", description: "Se já tem site e qual" },
        necessidade: { type: "string", description: "O que o cliente quer que o site faça" },
        orcamento: { type: "string" },
        prazo: { type: "string" },
        temperatura: {
          type: "string",
          enum: ["quente", "morno", "frio"],
          description: "quente = quer fechar logo; morno = interessado; frio = só pesquisando",
        },
        resumo: { type: "string", description: "Resumo de 1 a 3 frases da conversa para o dono" },
      },
      required: [
        "nome",
        "empresa",
        "ramo",
        "pais_cidade",
        "idioma",
        "tem_site",
        "necessidade",
        "orcamento",
        "prazo",
        "temperatura",
        "resumo",
      ],
      additionalProperties: false,
    },
  },
  {
    name: "transferir_para_humano",
    description:
      "Pausa o assistente nesta conversa e chama o dono da empresa para assumir. Depois de usar, avise o cliente que uma pessoa da equipe vai responder em breve.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        motivo: { type: "string", description: "Por que precisa de um humano" },
      },
      required: ["motivo"],
      additionalProperties: false,
    },
  },
];

function textoDaResposta(conteudo) {
  return conteudo
    .filter((bloco) => bloco.type === "text")
    .map((bloco) => bloco.text)
    .join("\n")
    .trim();
}

// Encurta o histórico quando ele fica grande: mantém só as últimas mensagens,
// começando numa mensagem de texto do cliente, e remove os blocos de "pensamento"
// (eles só valem dentro do histórico original).
function encurtarHistorico(mensagens) {
  if (mensagens.length <= MAX_MENSAGENS_HISTORICO) return mensagens;
  let inicio = mensagens.length - MENSAGENS_MANTIDAS;
  while (
    inicio < mensagens.length &&
    !(mensagens[inicio].role === "user" && typeof mensagens[inicio].content === "string")
  ) {
    inicio++;
  }
  return mensagens.slice(inicio).map((m) =>
    Array.isArray(m.content)
      ? { ...m, content: m.content.filter((b) => b.type !== "thinking" && b.type !== "redacted_thinking") }
      : m,
  );
}

/**
 * Recebe a conversa salva e a nova mensagem do cliente, e devolve o texto a enviar.
 * `acoes` traz as funções que as ferramentas chamam: { registrarLead, transferirParaHumano }.
 * A conversa é alterada no lugar (o chamador salva depois).
 */
export async function responder(conversa, mensagemDoCliente, acoes) {
  conversa.mensagens = encurtarHistorico(conversa.mensagens);
  conversa.mensagens.push({ role: "user", content: mensagemDoCliente });

  const textos = [];

  // Laço de ferramentas: o Claude pode chamar registrar_lead/transferir antes de responder.
  for (let rodada = 0; rodada < 5; rodada++) {
    const resposta = await client.beta.messages.create({
      model: MODELO,
      max_tokens: 16000,
      betas: BETAS,
      fallbacks: "default",
      thinking: { type: "adaptive", block_binding: { prefix_mismatch_behavior: "drop_block" } },
      output_config: { effort: "low" }, // conversa de atendimento: rápido e barato
      cache_control: { type: "ephemeral" },
      system: PROMPT_DO_SISTEMA,
      tools: FERRAMENTAS,
      messages: conversa.mensagens,
    });

    if (resposta.stop_reason === "refusal") {
      const desculpa =
        "Desculpe, não consigo ajudar com isso por aqui. Posso te ajudar com algo sobre sites? 🙂";
      conversa.mensagens.push({ role: "assistant", content: [{ type: "text", text: desculpa }] });
      return desculpa;
    }

    // Guarda a resposta inteira (inclusive blocos de pensamento), sem editar.
    conversa.mensagens.push({ role: "assistant", content: resposta.content });

    const texto = textoDaResposta(resposta.content);
    if (texto) textos.push(texto);

    if (resposta.stop_reason !== "tool_use") break;

    const resultados = [];
    for (const bloco of resposta.content) {
      if (bloco.type !== "tool_use") continue;
      try {
        if (bloco.name === "registrar_lead") await acoes.registrarLead(bloco.input);
        else if (bloco.name === "transferir_para_humano")
          await acoes.transferirParaHumano(bloco.input.motivo);
        else throw new Error(`Ferramenta desconhecida: ${bloco.name}`);
        resultados.push({ type: "tool_result", tool_use_id: bloco.id, content: "Feito." });
      } catch (erro) {
        console.error(`[ferramenta ${bloco.name}]`, erro);
        resultados.push({
          type: "tool_result",
          tool_use_id: bloco.id,
          content: `Erro: ${erro.message}`,
          is_error: true,
        });
      }
    }
    conversa.mensagens.push({ role: "user", content: resultados });
  }

  return textos.join("\n\n");
}
