# Skarlo: bot de WhatsApp com Claude + prospecção de clientes

Duas ferramentas:

1. **`whatsapp-bot/`**: atende seu WhatsApp Business 24h com o Claude. Responde no idioma do cliente, entende o negócio dele, sugere automações, registra o lead, avisa você e passa a conversa para você quando o cliente quer fechar.
2. **`prospeccao/`**: procura empresas no Google Maps do mundo todo, descobre quais **não têm site** ou têm **site fraco**, e o Claude escreve uma abordagem personalizada para cada uma (e-mail, DM, follow-up).

```
Google Maps ──► buscar-leads ──► leads.csv ──► gerar-abordagens ──► abordagens.csv
                                                                        │ você envia (e-mail / Instagram / LinkedIn)
                                                                        ▼
            cliente interessado chama no WhatsApp ──► BOT (Claude) ──► aviso para você ──► você fecha
```

> ⚠️ O bot usa a **API oficial do WhatsApp (Cloud API)**. Ele **responde** quem te chama e não dispara mensagens em massa. É isso que evita o banimento do número. O primeiro contato com quem nunca falou com você é feito por e-mail, Instagram ou LinkedIn, com os textos gerados aqui.

---

## Parte 0: O que instalar no seu computador

1. **Node.js 20 ou mais novo**: https://nodejs.org (baixe a versão "LTS").
2. Abra o terminal nesta pasta (`skarlo-automacao`) e rode:
   ```bash
   npm install
   cp .env.example .env
   ```
3. Abra o `empresa.js` e preencha tudo que diz **PREENCHER** (preços "a partir de", prazos, link de agendamento, seu nome). O bot só fala o que está nesse arquivo.

---

## Parte 1: Bot do WhatsApp

### 1.1 Modo grátis ou modo com IA
O bot tem **dois modos**, e ele escolhe sozinho pelo `.env`:

| | Modo grátis (sem chave) | Modo IA (com chave do Claude) |
|---|---|---|
| Custo | US$ 0 | cerca de US$ 0,01 a 0,03 por resposta |
| Como conversa | roteiro fixo: nome → empresa → cidade → site atual → o que precisa (menu 1 a 4) → prazo → orçamento | conversa livre, tira dúvidas, sugere automações para o ramo |
| Idiomas | português, inglês, espanhol (pelo DDI e pelas palavras do cliente) | qualquer idioma |
| Registra lead e te avisa | ✅ | ✅ |
| "Falar com uma pessoa" / parar mensagens | ✅ | ✅ |

Para usar o **modo grátis**, deixe `ANTHROPIC_API_KEY=` vazio no `.env`. Ao ligar, o terminal mostra `Modo: GRÁTIS`.
Para passar para o **modo IA**, coloque a chave (passo abaixo) e reinicie o bot. As conversas continuam de onde pararam.

**Chave do Claude (só para o modo IA):**
1. Crie uma conta em https://platform.claude.com
2. Em **Billing**, adicione créditos (US$ 5 já dá para testar bastante).
3. Em **API Keys**, crie uma chave e cole no `.env` em `ANTHROPIC_API_KEY`.

### 1.2 Conectar seu número na API oficial da Meta
1. Acesse https://business.facebook.com, crie (ou use) o **Portfólio empresarial "Skarlo"** e, se puder, verifique a empresa (Configurações → Central de Segurança → Verificação).
2. Acesse https://developers.facebook.com → **Meus apps → Criar app** → tipo **Empresa (Business)** → ligue ao portfólio Skarlo.
3. No app, adicione o produto **WhatsApp** → **Configuração da API (API Setup)**.
4. Clique em **Adicionar número de telefone** e use seu número americano do **Número e SIM**:
   - Se ele já está no app **WhatsApp Business** e você quer continuar usando o app no celular, escolha a opção de **conectar um número existente do WhatsApp Business app (coexistência)** e siga o QR code. Assim o app e o bot funcionam juntos.
   - Se não aparecer essa opção, o número precisa sair do app antes de ser registrado na API (no app: Configurações → Conta → Apagar conta). Faça isso **só se você aceitar perder o uso pelo app**.
   - A verificação vem por SMS ou ligação. Deixe o app Número e SIM aberto.
5. Copie o **Phone number ID** (Identificação do número) para `WHATSAPP_PHONE_NUMBER_ID` no `.env`.
6. **Token permanente** (o token temporário da tela expira em 24h):
   Business Manager → Configurações → **Usuários do sistema** → Adicionar (Admin) → **Atribuir ativos** (o app e a conta do WhatsApp, com controle total) → **Gerar token** com as permissões `whatsapp_business_messaging` e `whatsapp_business_management`, validade "Nunca". Cole em `WHATSAPP_TOKEN`.
7. App → Configurações do app → **Básico** → copie a **Chave secreta do aplicativo** para `WHATSAPP_APP_SECRET`.
8. Invente uma senha qualquer e coloque em `WHATSAPP_VERIFY_TOKEN`.
9. Coloque seu WhatsApp **pessoal** em `DONO_WHATSAPP` (só números com DDI, ex: `5511988887777`).
10. Em Configurações → Pagamento da conta do WhatsApp, cadastre um cartão. Responder clientes que te chamaram é barato ou gratuito, mas a Meta exige o cartão.

### 1.3 Colocar o bot no ar
O bot precisa de um endereço público na internet para a Meta mandar as mensagens.

**Para testar no seu PC (rápido):**
```bash
npm run bot
# em outro terminal:
npx cloudflared tunnel --url http://localhost:3000
```
Copie o endereço `https://xxxx.trycloudflare.com` que aparecer.

**Para deixar 24h ligado (recomendado):** suba esta pasta num servidor como **Railway** (https://railway.app) ou **Render** (https://render.com):
- Comando de início: `npm run bot` (ou `node whatsapp-bot/server.js`, colocando as variáveis do `.env` na tela "Variables" do serviço).
- Ative um **volume/disco persistente** montado em `skarlo-automacao/dados`, senão as conversas somem a cada deploy.

### 1.4 Ligar o webhook
1. No app da Meta → WhatsApp → **Configuração** → **Webhook** → Editar:
   - URL de retorno: `https://SEU-ENDERECO/webhook`
   - Token de verificação: o mesmo `WHATSAPP_VERIFY_TOKEN`
2. Em **Campos do webhook**, assine **messages**.
3. Mande um "oi" do seu celular pessoal para o número americano. O bot deve responder. 🎉

### 1.5 Usando no dia a dia
- **Quando chega um lead**, você recebe no seu WhatsApp pessoal um resumo (nome, ramo, país, o que quer, orçamento).
  - A Meta só deixa o bot te mandar mensagem se **você falou com ele nas últimas 24h**. Mande um "oi" para o bot todo dia de manhã, ou configure também `NOTIFICACAO_WEBHOOK_URL` com um webhook do Discord (canal → Editar → Integrações → Webhooks → Copiar URL), que funciona sempre.
- **Quando o cliente quer fechar ou pede um humano**, o bot avisa você e **se cala nessa conversa por 24h**. Responda pelo app WhatsApp Business (coexistência).
- **Comandos** (mande do seu WhatsApp pessoal para o número do bot):
  - `/bot pausar 13055551234`: o bot para de responder esse contato (você assume).
  - `/bot ativar 13055551234`: o bot volta a responder esse contato.
- Tudo fica salvo em `dados/`: `conversas/` (histórico de cada contato) e `leads-whatsapp.json`.

**Custo estimado:** no modo grátis, zero. No modo IA, cada resposta do bot custa em média US$ 0,01 a 0,03 no Claude. Cem conversas de 10 mensagens dão uns US$ 10 a 30 por mês.

---

## Parte 2: Prospecção mundial

### 2.1 Chave do Google Maps (grátis dentro da cota)
1. https://console.cloud.google.com → crie um projeto "Skarlo".
2. **APIs e serviços → Biblioteca** → ative **Places API (New)**.
3. **Credenciais → Criar credencial → Chave de API** → cole em `GOOGLE_PLACES_API_KEY` no `.env`.
4. O Google pede um cartão no faturamento, mas dá uma **cota mensal gratuita**. Confira o valor atual na página de preços da Places API.
5. **Trava para nunca ser cobrado:** em **APIs e serviços → Places API (New) → Cotas**, limite as solicitações de *Text Search* **por dia** (ex: 30). Quando a cota do dia acaba, o programa avisa e para. No dia seguinte, rode o mesmo comando, que ele **continua de onde parou**.

### 2.2 Onde procurar: listas prontas
| Arquivo | Região | Idioma das mensagens |
|---|---|---|
| `alvos-juiz-de-fora.json` | Juiz de Fora, 41 ramos | português |
| `alvos-brasil.json` | 15 cidades do Brasil, 10 ramos | português |
| `alvos-america-latina.json` | 15 cidades de 12 países | espanhol |
| `alvos-eua.json` | 12 cidades dos EUA | inglês |
| `alvos.json` | lista mista de exemplo | conforme o país |

Para editar, abra o arquivo e acrescente ou tire ramos e cidades. Escreva o ramo no idioma local.
`"paginas": 1` traz até 20 empresas por busca, `2` até 40 e `3` até 60.

### 2.3 Buscar os leads
```bash
npm run leads -- alvos-juiz-de-fora.json
npm run leads -- alvos-brasil.json
npm run leads -- "barbershop" "Austin, TX, USA"   # uma busca avulsa
```
Todas as regiões vão para a **mesma planilha**, `dados/leads.csv`. Ela abre direto no Excel em português, separada por `;`, já ordenada pela **pontuação**:
- `sem_site`: não tem site, ou só tem Instagram/Facebook/Linktree. **Melhor tipo de lead.**
- `site_fora_do_ar`: o site não abre.
- `site_fraco`: sem HTTPS, sem versão de celular, sem WhatsApp, sem agendamento, desatualizado...
- `site_ok`: provavelmente não precisa de você agora.

Use a coluna **`status`** para anotar o andamento: `enviado`, `respondeu`, `reuniao`, `fechou`, `nao`. Rodar de novo **mantém** o que você anotou. Só **feche o arquivo no Excel antes de rodar**.

### 2.4 Gerar as abordagens
```bash
npm run abordagens
```
- **Modo grátis** (sem chave do Claude): preenche modelos prontos com os dados reais de cada empresa (nome, nota no Google, problemas do site), em português, inglês ou espanhol, conforme o país. Escreve para **todos** os leads.
- **Modo IA** (com chave): o Claude escreve cada mensagem do zero. Escreve para os 30 melhores, ou `npm run abordagens -- 100`. Também reescreve as que foram feitas no modo grátis.

O resultado fica em `dados/abordagens.csv`, com canal recomendado, assunto, e-mail, mensagem curta para DM e follow-up. **Nada é enviado sozinho**: você revisa e envia.
Para o seu número sair nas mensagens, preencha `whatsapp:` no `empresa.js`.

### 2.5 Enviar (rotina sugerida, 1h por dia)
| Canal | Como | Quantos por dia |
|---|---|---|
| **E-mail** (quando tem e-mail no CSV) | Crie um domínio só para prospecção (ex: `skarlo-studio.com`) com e-mail próprio, para não sujar o `skarlo.co`. Envie manualmente ou por uma ferramenta de envio (Instantly, Smartlead, Lemlist), com aquecimento de 2 semanas. | 20 a 40 |
| **Instagram** | Abra o perfil da empresa e mande a `mensagem_curta`, ajustando um detalhe do perfil. | 20 a 30 |
| **LinkedIn** | Para escritórios e empresas B2B: convite + `mensagem_curta`. | 15 a 20 |
| **Ligação** | Roteiro em `modelos-de-abordagem.md`. Ao final, peça permissão para mandar exemplo no WhatsApp. | à vontade |

Todo contato leva o link **`https://wa.me/1SEUNUMERO`**, e quem clicar cai no bot.
Anote na coluna `status` do `leads.csv` (ex: `enviado`, `respondeu`, `reuniao`, `fechou`). Rodar `npm run leads` de novo **mantém** o que você anotou.

> Mandar WhatsApp frio pelo seu número (mesmo à mão) para quem não pediu é o que mais causa denúncia e banimento. Use o WhatsApp para quem respondeu, ligou ou clicou no seu link.
> Na Europa (GDPR), e-mail frio para empresas é mais restrito em alguns países (ex: Alemanha). Comece por EUA, Brasil e América Latina.

---

## Estrutura
```
skarlo-automacao/
├── empresa.js               ← dados da Skarlo (PREENCHER)
├── .env.example             ← modelo das chaves (copie para .env)
├── modelos-de-abordagem.md  ← textos prontos em PT / EN / ES
├── whatsapp-bot/
│   ├── server.js            ← recebe mensagens da Meta, fila, comandos /bot
│   ├── claude.js            ← prompt do atendente + ferramentas (registrar lead, chamar humano)
│   ├── whatsapp.js          ← envio de mensagens pela Cloud API
│   └── conversas.js         ← salva histórico e leads em dados/
├── prospeccao/
│   ├── alvos.json           ← ramos e cidades para buscar
│   ├── buscar-leads.js      ← Google Maps + análise do site
│   └── gerar-abordagens.js  ← Claude escreve as mensagens
└── dados/                   ← resultados (não vai para o GitHub)
```

## Problemas comuns
- **A Meta não verifica o webhook:** confira se o bot está rodando, se a URL termina em `/webhook` e se o token de verificação é igual ao do `.env`.
- **O bot não responde:** veja o terminal ou os logs do servidor. Erro `401` da Meta = token expirado (gere o token permanente, passo 1.2.6). Erro `authentication_error` = chave do Claude errada ou sem créditos.
- **Não recebo o aviso de lead no meu WhatsApp:** regra das 24h (veja 1.5). Use também o webhook do Discord.
- **Places API dá erro 403:** a "Places API (New)" não está ativada ou o faturamento não foi configurado.
