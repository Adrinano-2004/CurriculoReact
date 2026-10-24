// Dados da empresa usados pelo bot de WhatsApp e pelo gerador de abordagens.
// Preencha tudo que estiver marcado com "PREENCHER" antes de colocar no ar.
// O bot NUNCA inventa informação que não está aqui (preços, prazos, etc.).

export const empresa = {
  nome: "Skarlo",
  site: "https://skarlo.co",
  slogan: "PREENCHER - ex: Sites profissionais com automações que vendem por você",

  // Seu nome (aparece quando o bot passa a conversa para você)
  responsavel: "PREENCHER - seu nome",

  // Link para o cliente agendar uma reunião (Calendly, Cal.com, Google Agenda...)
  linkAgendamento: "PREENCHER - ex: https://cal.com/skarlo/30min",

  // Link de portfólio / cases (pode ser uma seção do site)
  linkPortfolio: "https://skarlo.co",

  // E-mail de contato
  email: "PREENCHER - ex: contato@skarlo.co",

  // Número do WhatsApp da empresa (o americano), só números com DDI. Vai nas mensagens de prospecção.
  whatsapp: "PREENCHER - ex: 13055551234",

  idiomasAtendidos: ["português", "inglês", "espanhol"],

  servicos: [
    {
      nome: "Site institucional / landing page",
      descricao:
        "Site rápido, bonito e adaptado para celular, com botão de WhatsApp, formulário de contato e SEO básico.",
      precoAPartirDe: "PREENCHER - ex: US$ 490 / R$ 1.500",
      prazo: "PREENCHER - ex: 7 a 10 dias úteis",
    },
    {
      nome: "Site com automações",
      descricao:
        "Agendamento online, chat com IA que responde clientes 24h, integração com WhatsApp, captura de leads e e-mails automáticos.",
      precoAPartirDe: "PREENCHER",
      prazo: "PREENCHER",
    },
    {
      nome: "Loja virtual / catálogo",
      descricao: "Catálogo de produtos ou loja com pagamento online.",
      precoAPartirDe: "PREENCHER",
      prazo: "PREENCHER",
    },
    {
      nome: "Manutenção mensal",
      descricao: "Hospedagem, atualizações, backups e pequenas alterações todo mês.",
      precoAPartirDe: "PREENCHER",
      prazo: "contínuo",
    },
  ],

  diferenciais: [
    "Atendemos clientes no mundo todo, em português, inglês e espanhol",
    "Sites com automações: o site trabalha e capta clientes mesmo fora do horário comercial",
    "PREENCHER - ex: Pagamento facilitado / garantia / suporte direto com o desenvolvedor",
  ],

  // Formas de pagamento aceitas
  pagamento: "PREENCHER - ex: Pix, cartão, PayPal, Wise. 50% no início e 50% na entrega.",
};
