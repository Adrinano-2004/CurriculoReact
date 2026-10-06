# Vagou — sistema de gestão para estacionamentos

> Nome provisório.

Sistema completo para estacionamentos: entrada e saída por placa, PIX com QR code, caixa por turno, mensalistas, convênios, lava-jato, relatórios, estatísticas e painel para o dono acompanhar pelo celular.

Funciona direto no navegador e **sem internet**: os dados ficam salvos no próprio computador, com backup em arquivo.

## Como rodar

Requer Node.js 20 ou mais novo.

```bash
cd vagou
npm install
npm run dev        # http://localhost:3000
```

- `/` — site do produto (landing page)
- `/app` — o sistema (vem com dados de demonstração)

Outros comandos:

```bash
npm test           # testes do cálculo de tarifas, PIX e dados de exemplo
npm run typecheck  # checagem de tipos
npm run build      # versão de produção
npm start          # roda a versão de produção
```

### Acessos da demonstração

| Pessoa   | Função   | PIN  |
|----------|----------|------|
| Carlos   | Operador | 1111 |
| Juliana  | Operador | 2222 |
| Gerência | Dono     | 1234 |

O PIN da gerência autoriza cancelamentos, entrada de placa da lista negra e libera a tela de Ajustes.

## O que tem no sistema

| Tela | Atalho | O que faz |
|---|---|---|
| **Início** | — | Recebido hoje, ocupação, movimento por hora, últimas movimentações e alertas |
| **Pátio** | F1 | Digita a placa (ou o nº do ticket) e aperta Enter: o sistema descobre se é entrada ou saída. Reconhece o carro, avisa mensalista/VIP/lista negra, calcula o valor, gera o QR code do PIX, corrige placa, lança diária, cancela com PIN |
| **Caixa** | F2 | Abertura com troco, sangria, suprimento, fechamento com conferência (total ou contando nota por nota), histórico de fechamentos, resumo no WhatsApp |
| **Lava-jato** | F3 | Fila em colunas (fila → lavando → pronto → entregue), aviso de carro pronto no WhatsApp, cobrança junto com o ticket |
| **Clientes** | F4 | Mensalistas (em dia / atraso / a vencer, receber mensalidade, cobrar no WhatsApp), VIP, especiais, convênios e lista negra. Sugere candidatos a mensalista |
| **Relatórios** | F7 | Movimento, financeiro, caixas, histórico de alterações, mensalistas, convênios e lava-jato. Exporta para planilha (CSV) |
| **Estatísticas** | F8 | Recebido por dia, mapa de movimento (dia × hora), ticket médio, tempo médio, giro por vaga, clientes que mais voltam, cancelamentos por operador |
| **Ajustes** | F9 | Tabela de preços com simulador, promoções, dados da empresa e do ticket, equipe e PINs, serviços de lava-jato, backup |

Impressão em impressora térmica de 80 mm: ticket de entrada (com QR code), recibo de saída e fechamento de caixa.

### Regras de cobrança

Seguem o cadastro de "Automóveis" do sistema antigo, por categoria (carro, moto, utilitário):

- valor da 1ª hora, da 2ª hora e da 3ª hora em diante;
- tolerância na entrada e tolerância por hora;
- meia diária (teto até 12h), diária (teto de 12h a 24h, e valor de cada dia completo);
- diária lançada (valor fixo);
- promoções por dia da semana e horário;
- desconto automático para VIP e convênios; mensalista em dia não paga.

O caso real usado como referência (Onix, 10:40 → 11:45, R$ 15,00) está nos testes em `src/lib/pricing.test.ts`.

## Design system

Visual inspirado na referência ZIXO (Behance):

- fundo cinza-claro `#F2F2F1` com brilhos suaves; cartões brancos foscos com cantos de 22px;
- títulos leves com a segunda parte em cinza; números em serifa (Newsreader) com centavos em cinza;
- texto em Hanken Grotesk; botões em pílula preto `#2A2A29` / branco;
- gráficos em "código de barras" com o destaque em preto;
- cor apenas para estado: verde `#38BC37` (ok) e vermelho `#F44336` (alerta).

Tokens e componentes em `src/app/globals.css` e `src/components/ui.tsx`.

## Estrutura

```
src/
  app/
    page.tsx              site do produto
    app/                  o sistema (painel, pátio, caixa, clientes, ...)
    imprimir/[tipo]/[id]  ticket, recibo e fechamento para impressão
  components/             design system, modais de entrada/saída, maquetes
  lib/
    pricing.ts            cálculo de tarifas (testado)
    pix.ts                PIX copia e cola / QR code (padrão BR Code)
    store.ts              dados e ações (salvos no navegador)
    stats.ts              números para painel, relatórios e estatísticas
    seed.ts               dados de demonstração
```

## Próximos passos

- Servidor na nuvem (ex.: Supabase) para o dono acompanhar de outro aparelho em tempo real e para várias unidades.
- Confirmação automática do PIX via API de um banco/PSP.
- Envio automático pelo WhatsApp (API oficial); hoje o sistema abre a mensagem pronta.
- Importação dos arquivos `.DBF` do sistema antigo.
- Leitura de placa por câmera.
