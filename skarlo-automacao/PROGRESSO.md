# Progresso: bot da Skarlo

Última atualização: 24/10/2026

## ✅ Já feito
- [x] Node.js instalado (v24)
- [x] Pasta do bot em `C:\skarlo-bot` (atalho "skarlo-bot" na Área de Trabalho) + `npm install` + arquivo `.env` criado
- [x] Decidido: começar **sem pagar** (bot no modo grátis + prospecção com modelos + mensagens personalizadas no chat do Claude Code)
- [x] **9.1** Portfólio empresarial **Skarlo** criado na Meta (página "Nano" NÃO adicionada, de propósito)

## 👉 PAREI AQUI: Passo 9.2 (conta de desenvolvedor da Meta)
**Problema:** a tela de developers.facebook.com mostra o e-mail antigo (Yahoo) e não aceita outro.
**Solução (escolha uma):**
- Consegue entrar no Yahoo? → clique em **Confirmar email**, use o código que chegar no Yahoo e siga.
- Não consegue? → Facebook → Configurações → **Central de Contas** → Informações pessoais → Informações de contato → adicione o e-mail que você usa, deixe como **principal**, apague o Yahoo → volte em developers.facebook.com.

## ⬜ Próximos passos (nesta ordem)
- [ ] **Passo 0:** atualizar a pasta, se ainda não fez (comandos abaixo)
- [ ] **9.2** Terminar o cadastro de desenvolvedor (e-mail → "About you": escolha **Desenvolvedor**)
- [ ] **9.3** Meus apps → Criar app → nome `Skarlo Bot` → caso de uso "Conectar-se com clientes pelo WhatsApp" → portfólio **Skarlo**
- [ ] **9.4** WhatsApp → Configuração da API → **Gerar token** (`EAA...`) + copiar a **Identificação do número de telefone**
- [ ] **9.5** Campo "Para" → adicionar o **seu WhatsApp pessoal** (+55 DDD número) → código
- [ ] **9.6** Enviar mensagem → chega "Hello World" → salvar o número como **Skarlo Teste**
- [ ] **9.7** Configurações do app → Básico → **Chave secreta** → Mostrar → copiar
- [ ] **9.8** Preencher o `.env` (`ANTHROPIC_API_KEY` vazio, `WHATSAPP_VERIFY_TOKEN=skarlo-senha-123`, `DONO_WHATSAPP=55...`) → Ctrl+S
- [ ] **10.1** VS Code → Terminal → `npm run bot` (deve aparecer "Modo: GRÁTIS")
- [ ] **10.2** Segundo terminal (`+`) → `npx cloudflared tunnel --url http://localhost:3000` → copiar o endereço `https://...trycloudflare.com`
- [ ] **10.3** Meta → WhatsApp → **Configuração** → Webhook → URL = endereço + `/webhook`, token = `skarlo-senha-123` → Verificar e salvar → assinar **messages**
- [ ] **10.4** Mandar "Oi, preciso de um site" para o **Skarlo Teste** → o bot responde 🎉

### Comandos do Passo 0 (no cmd, um por vez)
```
cd C:\
git clone -b claude/brave-edison-sumdn9 https://github.com/adrinano-2004/CurriculoReact.git C:\skarlo-temp
xcopy C:\skarlo-temp\skarlo-automacao\whatsapp-bot C:\skarlo-bot\whatsapp-bot /E /Y
xcopy C:\skarlo-temp\skarlo-automacao\prospeccao C:\skarlo-bot\prospeccao /E /Y
copy /Y C:\skarlo-temp\skarlo-automacao\README.md C:\skarlo-bot\
copy /Y C:\skarlo-temp\skarlo-automacao\PROGRESSO.md C:\skarlo-bot\
rmdir /s /q C:\skarlo-temp
```
Confere: dentro de `C:\skarlo-bot\whatsapp-bot` tem o `roteiro.js`, e dentro de `C:\skarlo-bot\prospeccao` tem o `alvos-juiz-de-fora.json`.

## 🔜 Depois que o bot responder (mais pra frente)
- [ ] Preencher o `empresa.js`: preços "a partir de", prazos, seu nome, e-mail, link de agendamento (cal.com ou calendly, grátis)
- [ ] Perfil do WhatsApp Business: logo, descrição, site, catálogo com prints dos seus sites; **desligar** a saudação e a mensagem de ausência
- [ ] Chave do Google Maps (Places API New) com **trava de cota diária** → `npm run leads -- alvos-juiz-de-fora.json` → `npm run abordagens`
- [ ] Prospecção diária: 20 e-mails + 20 DMs no Instagram + ligações em Juiz de Fora; colar as 10 melhores abordagens no chat do Claude para personalizar
- [ ] Perfil da Empresa no Google (Skarlo, Juiz de Fora), Instagram da Skarlo, 99Freelas/Workana/Upwork/Fiverr
- [ ] Quando pagar o **Número e SIM**: conectar o número americano por **coexistência**, gerar o **token permanente** e preencher `whatsapp:` no `empresa.js`
- [ ] Deixar o bot ligado 24h com endereço fixo (domínio skarlo.co + Cloudflare)
- [ ] Quando fechar o primeiro cliente: US$ 5 no Claude → o bot vira modo IA

## ⚠️ Lembretes
- O token do 9.4 **vale 24h**. Se o bot parar de responder, gere outro e troque no `.env`.
- O endereço do túnel **muda** sempre que você fecha o terminal → refazer 10.2 e 10.3.
- **Nunca** mande print do `.env` nem do token para ninguém.
- Para retomar com o Claude: abra a mesma conversa e diga **"voltei, parei no 9.2"**.
