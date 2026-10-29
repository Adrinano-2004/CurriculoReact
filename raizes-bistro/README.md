# Raízes Bistrô e Massas · site

Proposta de site para o Raízes Bistrô e Massas (Juiz de Fora/MG). Next.js (App Router) + Tailwind v4 + GSAP (ScrollTrigger, SplitText, Draggable, Inertia) + Lenis + Motion.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Estrutura

| Pasta | O que tem |
|---|---|
| `app/` | layout (fontes, SEO, JSON-LD `Restaurant`), página, sitemap e robots |
| `components/hero/` | mesa giratória do hero (`RotatingTable`) e o modelo que decide qual prato vai em cada lugar (`table-model.ts`) |
| `components/sections/` | Header, Sobre (+ gaveta da história), Sugestões da Chef, Cardápio, Salão, Sobremesas, Reserva, Galeria, Footer |
| `components/reservation/` | modal de reserva (abre por qualquer CTA) que monta a mensagem para o WhatsApp |
| `components/motion/` | Lenis, preloader, títulos gigantes, faixa de fotos, marquee |
| `lib/` | dados do restaurante (`site.ts`), cardápio (`menu.ts`), fotos, horários |
| `scripts/process_images.py` | gera os pratos recortados em círculo, as fotos otimizadas, o logo sem fundo e a textura da mesa |
| `docs/briefing.md` | briefing com fontes |

## Como o conteúdo é editado

- **Cardápio:** `lib/menu.ts`. Cada prato tem `slug` (nome do arquivo em `public/images/pratos/`), nome, descrição e preço (`null` esconde o preço).
  A lista `table` de cada categoria define quais pratos giram na mesa do hero.
- **Horários, endereço, WhatsApp, avaliações:** `lib/site.ts`.
- **Fotos novas de pratos:** colocar a foto vista de cima com o nome do prato na pasta da categoria e rodar
  `python3 -I scripts/process_images.py "<pasta pratos_raízes>" public` (precisa de `pillow numpy opencv-python-headless`).

## Estrutura da página

Segue a base de referência (Grillify), com hero e cardápio da referência PALAZZO:

1. Hero: mesa giratória
2. Sobre: título gigante, faixa de fotos que corre com o scroll e gaveta "Ler nossa história"
3. Marquee escuro
4. Sugestões da Chef: cards inclinados que se empilham no scroll
5. Cardápio: lista com o prato visto de cima servido no hover
6. Salão: cortina de fotos que abre no scroll
7. Sobremesas: carrossel infinito de cards coloridos
8. Reserva: foto de fundo com parallax e CTA para o modal
9. Galeria em faixa (Instagram)
10. Rodapé "Fale com a gente"

## Mesa giratória (hero)

8 lugares a 45°. O prato de cada lugar depende da posição virtual dele (`table-model.ts`), então a troca de prato
acontece sempre na parte de trás da mesa, fora da tela. Trocar de categoria gira 5 lugares e traz os pratos novos,
que já estavam servidos atrás. Arrastar (mouse), setas (teclado e celular), abas, clique no prato, giro automático a cada ~4s
e giro ligado ao scroll. Com `prefers-reduced-motion` o giro automático e o scroll suave ficam desligados.

## Pendências

- [ ] Conferir a animação da referência PALAZZO no Framer (o link do editor não abre sem login).
- [ ] Preços e descrições que faltam no cardápio (`price: null`).
- [ ] Confirmar o telefone fixo oficial e o domínio final (`lib/site.ts`).
