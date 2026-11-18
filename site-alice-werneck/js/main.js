/* =========================================================
   Dra. Alice Werneck · animações e interações
   GSAP + ScrollTrigger + Lenis (scroll suave)
   ========================================================= */

const WHATSAPP_NUMBER = "5532998217781"; // (32) 99821-7781
const WHATSAPP_MSG = "Olá! Gostaria de agendar uma consulta com a Dra. Alice Werneck.";

(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none)").matches;
  const hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const animate = hasGSAP && !reduceMotion;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- WhatsApp ---------- */
  $$(".js-whats").forEach((el) => {
    el.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(el.dataset.msg || WHATSAPP_MSG)}`;
    el.target = "_blank";
    el.rel = "noopener";
  });
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Scroll suave ---------- */
  let lenis = null;
  if (!reduceMotion && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    if (hasGSAP) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  /* ---------- Menu mobile ---------- */
  const burger = $("#burger");
  const nav = $("#nav");
  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));

  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = id.length > 1 && $(id);
      if (!target) return;
      e.preventDefault();
      setMenu(false);
      const offset = id === "#inicio" ? 0 : -70;
      if (lenis) lenis.scrollTo(target, { offset, duration: 1.4 });
      else window.scrollTo({ top: target.getBoundingClientRect().top + scrollY + offset, behavior: "smooth" });
    });
  });

  /* ---------- Header + barra de progresso ---------- */
  const header = $("#header");
  const bar = $("#progress");
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle("is-scrolled", y > 24);
    if (!nav.classList.contains("is-open")) header.classList.toggle("is-hidden", y > lastY && y > innerHeight * 0.9);
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    lastY = y;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Botões: o preenchimento nasce de onde o mouse/dedo entra ---------- */
  $$(".btn").forEach((btn) => {
    const setOrigin = (x, y) => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty("--mx", `${x - r.left}px`);
      btn.style.setProperty("--my", `${y - r.top}px`);
    };
    btn.addEventListener("pointerenter", (e) => setOrigin(e.clientX, e.clientY));
    btn.addEventListener("pointerleave", (e) => setOrigin(e.clientX, e.clientY));
    btn.addEventListener("touchstart", (e) => {
      const t = e.touches[0];
      setOrigin(t.clientX, t.clientY);
      btn.classList.add("is-touch");
      setTimeout(() => btn.classList.remove("is-touch"), 650);
    }, { passive: true });
  });

  /* ---------- FAQ: abre e fecha com altura animada ---------- */
  $$(".qa").forEach((qa) => {
    const ans = $(".qa__a", qa);
    $("summary", qa).addEventListener("click", (e) => {
      if (!animate) return;
      e.preventDefault();
      if (qa.open) {
        gsap.to(ans, { height: 0, duration: 0.5, ease: "power3.inOut", onComplete: () => { qa.open = false; ans.style.height = ""; } });
      } else {
        qa.open = true;
        gsap.fromTo(ans, { height: 0 }, { height: "auto", duration: 0.6, ease: "power3.out", clearProps: "height" });
      }
    });
  });

  /* ---------- Lista de atendimentos: hover troca a foto (ref. ApexCare) ---------- */
  const rows = $$(".row");
  const imgA = $("#svcImg"), imgB = $("#svcImg2");
  let front = imgA;
  imgB.classList.add("is-out");
  const showRow = (row) => {
    rows.forEach((r) => r.classList.toggle("is-on", r === row));
    const src = row.dataset.img;
    if (!src || front.getAttribute("src") === src) return;
    const back = front === imgA ? imgB : imgA;
    back.src = src;
    back.classList.remove("is-out");
    front.classList.add("is-out");
    front = back;
  };
  rows.forEach((r) => {
    r.addEventListener("mouseenter", () => showRow(r));
    r.addEventListener("focus", () => showRow(r));
  });
  if (rows[0] && !isTouch) showRow(rows[0]);

  /* ---------- Divide títulos em palavras e o nome do rodapé em letras ---------- */
  $$(".split-words").forEach((el) => {
    el.innerHTML = el.textContent.trim().split(/ +/).map((w) => `<span class="w"><span>${w}</span></span>`).join(" ");
  });
  $$(".js-letters").forEach((el) => {
    el.innerHTML = [...el.textContent].map((c) => `<span class="ch">${c === " " ? "&nbsp;" : c}</span>`).join("");
  });

  /* ---------- Sem animação: mostra tudo e encerra ---------- */
  if (!animate) {
    $$(".reveal-up, .reveal-fade").forEach((el) => (el.style.opacity = 1));
    $$(".js-count").forEach((el) => (el.textContent = el.dataset.to));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const EASE = "expo.out";

  /* ---------- Entrada do hero ---------- */
  const tl = gsap.timeline({ defaults: { ease: EASE } });
  tl.from(".header__inner", { y: -16, opacity: 0, duration: 1.1 }, 0.3)
    .from(".hero__title .line > span", { yPercent: 115, duration: 1.4, stagger: 0.12 }, 0.15)
    .to(".hero .reveal-fade", { opacity: 1, duration: 1, stagger: 0.08 }, 0.7)
    .from(".hero .reveal-fade", { y: 18, duration: 1.2, stagger: 0.08 }, 0.7);

  // foto inteira: o arco se abre de baixo para cima e a foto assenta (zoom suave)
  tl.fromTo(".hero-photo__frame", { clipPath: "inset(100% 0% 0% 0% round 999px 999px 18px 18px)" },
      { clipPath: "inset(0% 0% 0% 0% round 999px 999px 18px 18px)", duration: 1.6, ease: "expo.inOut" }, 0.1)
    .from(".hero-photo__frame img", { scale: 1.25, duration: 2.2, ease: EASE }, 0.2)
    .from(".hero-photo__outline", { opacity: 0, x: -18, y: -18, duration: 1.4, ease: EASE }, 0.9)
    .from(".hero-photo__chip", { opacity: 0, y: 16, duration: 1, ease: EASE }, 1.2);

  // parallax leve: a foto e o contorno andam em velocidades diferentes
  gsap.fromTo(".hero-photo__frame img", { yPercent: -8 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero-photo__outline", { y: () => (innerWidth < 1020 ? -10 : -50), ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  /* ---------- Faixa de condições: anda com o scroll (para frente e para trás) ---------- */
  gsap.fromTo(".marquee__track", { xPercent: 0 }, {
    xPercent: -35, ease: "none",
    scrollTrigger: { trigger: ".marquee", start: "top bottom", end: "bottom top", scrub: 0.6 },
  });
  gsap.to(".hero__text", { yPercent: 10, opacity: 0.3, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  /* ---------- Manifesto: as palavras "acendem" conforme o scroll ---------- */
  $$(".js-manifesto").forEach((el) => {
    const wrap = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/( +)/).forEach((part) => {
            if (!part) return;
            if (/^ +$/.test(part)) return frag.append(" ");
            const s = document.createElement("span"); s.className = "mw"; s.textContent = part; frag.append(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) wrap(n);
      });
    };
    wrap(el);
    gsap.fromTo($$(".mw", el), { opacity: 0.14 }, {
      opacity: 1, ease: "none", stagger: 0.1,
      scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: 0.5 },
    });
  });

  /* ---------- Títulos palavra por palavra ---------- */
  $$(".split-words").forEach((el) => {
    gsap.from($$(".w > span", el), {
      yPercent: 110, duration: 1.2, ease: EASE, stagger: 0.035,
      scrollTrigger: { trigger: el, start: "top 86%", once: true },
    });
  });

  /* ---------- Textos ---------- */
  $$(".reveal-up").forEach((el) => {
    gsap.fromTo(el, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.2, ease: EASE, scrollTrigger: { trigger: el, start: "top 90%", once: true } });
  });

  /* ---------- Fotos em arco: revelação + parallax ---------- */
  $$(".arch").forEach((arch) => {
    gsap.fromTo(arch, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: arch, start: "top 85%", once: true } });
    gsap.fromTo($("img", arch), { yPercent: -10 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: arch, start: "top bottom", end: "bottom top", scrub: true } });
  });

  /* ---------- Credenciais: letras decodificando ---------- */
  ScrollTrigger.create({
    trigger: ".stats", start: "top 82%", once: true,
    onEnter: () => $$(".js-scramble").forEach((el, i) => scramble(el, el.dataset.text, i * 0.15)),
  });

  /* ---------- Números: o bloco aparece com um fade simples e os números contam ---------- */
  gsap.from(".numbers", { opacity: 0, y: 20, duration: 1, ease: "power2.out", scrollTrigger: { trigger: ".numbers", start: "top 85%", once: true } });
  ScrollTrigger.create({
    trigger: ".numbers", start: "top 85%", once: true,
    onEnter: () => $$(".numbers .js-count").forEach((el) => {
      const o = { v: 0 };
      gsap.to(o, { v: +el.dataset.to, duration: 1.8, ease: "power2.out", onUpdate: () => (el.textContent = Math.round(o.v)) });
    }),
  });
  gsap.from(".stat", { y: 24, opacity: 0, duration: 1.1, ease: EASE, stagger: 0.1, scrollTrigger: { trigger: ".stats", start: "top 86%", once: true } });

  function scramble(el, text, delay) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let frame = 0; const total = 24;
    setTimeout(function tick() {
      const p = frame / total;
      el.textContent = [...text].map((c, i) => (c === "-" || c === " " || i < p * text.length ? c : chars[(Math.random() * 26) | 0])).join("");
      if (frame++ < total) setTimeout(tick, 32); else el.textContent = text;
    }, delay * 1000);
  }

  /* ---------- Cards entrando em sequência ---------- */
  /* ---------- Órbitas girando devagar + ícones flutuando ---------- */
  gsap.to(".orbit ellipse", { rotation: 360, svgOrigin: "100 100", duration: (i) => 60 + i * 25, ease: "none", repeat: -1 });
  gsap.from(".badge", { scale: 0, opacity: 0, duration: 1, ease: "back.out(2)", stagger: 0.15, scrollTrigger: { trigger: ".orbit-wrap", start: "top 75%", once: true } });
  gsap.to(".badge", { y: (i) => [-10, 8, -7][i], duration: (i) => 2.6 + i * 0.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
  gsap.from(".orbit", { scale: 0.85, opacity: 0, duration: 1.6, ease: EASE, scrollTrigger: { trigger: ".orbit-wrap", start: "top 80%", once: true } });

  /* ---------- Lista de atendimentos ---------- */
  gsap.from(".rows li", { y: 24, opacity: 0, duration: 0.9, ease: EASE, stagger: 0.05, scrollTrigger: { trigger: ".rows", start: "top 85%", once: true } });

  [".audience__grid", ".services__grid", ".reviews__grid"].forEach((sel) => {
    const grid = $(sel);
    gsap.from(grid.children, {
      y: 60, opacity: 0, duration: 1.2, ease: EASE, stagger: 0.09, clearProps: "transform,opacity",
      scrollTrigger: { trigger: grid, start: "top 88%", once: true },
    });
  });

  /* ---------- No celular, o "hover" acontece quando o card passa pelo centro da tela ---------- */
  if (isTouch) {
    $$(".hover-card").forEach((card) => {
      ScrollTrigger.create({ trigger: card, start: "top 62%", end: "bottom 38%", toggleClass: { targets: card, className: "is-active" } });
    });
    // linhas da lista abrem quando passam pelo meio da tela
    rows.forEach((r) => {
      ScrollTrigger.create({ trigger: r, start: "top 50%", end: "bottom 50%", toggleClass: { targets: r, className: "is-on" } });
    });
  }

  /* ---------- Para as mães: checklist sendo marcado ---------- */
  gsap.from(".checks li", { x: -24, opacity: 0, duration: 0.9, ease: EASE, stagger: 0.08, scrollTrigger: { trigger: ".checks", start: "top 85%", once: true } });
  gsap.from(".checks path", { strokeDashoffset: 24, duration: 0.6, ease: "power2.out", stagger: 0.08, delay: 0.3, scrollTrigger: { trigger: ".checks", start: "top 85%", once: true } });

  /* ---------- Convênios ---------- */
  gsap.from(".pills span", { scale: 0.6, opacity: 0, duration: 0.7, ease: "back.out(2)", stagger: 0.05, scrollTrigger: { trigger: ".pills", start: "top 90%", once: true } });

  /* ---------- Seções com cantos que se abrem ao entrar ---------- */
  [".final"].forEach((sel) => {
    gsap.from(sel, { borderRadius: "90px", ease: "none", scrollTrigger: { trigger: sel, start: "top bottom", end: "top 40%", scrub: true } });
  });

  /* ---------- Nome gigante no rodapé, letra por letra ---------- */
  gsap.from(".footer__big .ch", { yPercent: 100, opacity: 0, duration: 1.2, ease: EASE, stagger: 0.04, scrollTrigger: { trigger: ".footer__big", start: "top 95%", once: true } });

  /* ---------- Menu: link da seção atual ---------- */
  $$(".nav__link").forEach((link) => {
    const sec = $(link.getAttribute("href"));
    if (sec) ScrollTrigger.create({ trigger: sec, start: "top 50%", end: "bottom 50%", onToggle: (s) => link.classList.toggle("is-active", s.isActive) });
  });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
