# Landing page · Dra. Alice Werneck

Site estático (HTML + CSS + JS), sem build. Para publicar na Hostinger, envie **o conteúdo desta pasta** para `public_html`.

## Antes de publicar
1. **WhatsApp:** troque `WHATSAPP_NUMBER` no topo de `js/main.js`.
2. **Foto da doutora:** `assets/dra-alice.jpg` (vertical, ~900x1200).
3. **Fotos dos tratamentos** (opcional): `assets/servicos/amigdala.jpg`, `teste-alergia.jpg`, `audiometria.jpg`, `sono.jpg`, `tontura.jpg`, `exames.jpg`. Sem a foto, o card usa a cor da marca com um ícone.
4. **Fonte Miamo:** `fonts/Miamo-Thin.woff2` (e `.woff`). Sem o arquivo, o site usa Cormorant Garamond.
5. **Rodapé:** CRM/RQE e link do Instagram em `index.html`.

## Animações
GSAP + ScrollTrigger + Lenis já estão em `js/vendor/`, sem CDN. No celular, o efeito de hover dos cards
acontece quando o card passa pelo centro da tela. Com "reduzir movimento" ativado no sistema, as animações são desligadas.
