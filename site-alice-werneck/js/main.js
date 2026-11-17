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

  /* ---------- Divide títulos em palavras e o nome do rodapé em letras ---------- */
  $$(".split-words").forEach((el) => {
    el.innerHTML = el.textContent.trim().split(/ +/).map((w) => `<span class="w"><span>${w}</span></span>`).join(" ");
  });
  $$(".js-letters").forEach((el) => {
    el.innerHTML = [...el.textContent].map((c) => `<span class="ch">${c === " " ? "&nbsp;" : c}</span>`).join("");
  });

  /* ---------- HERO: retrato em barras de "onda sonora" ---------- */
  const wave = $("#wave");
  const waveSrc = $(".wave__fallback", wave).getAttribute("src");
  const SHAPE = [0.56, 0.76, 0.9, 1, 0.92, 0.78, 0.6];
  let bars = [];
  let idleTweens = [];

  function buildWave() {
    $$(".wave__bar", wave).forEach((b) => b.remove());
    idleTweens.forEach((t) => t.kill());
    idleTweens = [];
    const W = wave.clientWidth, H = wave.clientHeight;
    const n = SHAPE.length, gap = Math.max(6, W * 0.022), bw = (W - gap * (n - 1)) / n;
    bars = SHAPE.map((f, i) => {
      const b = document.createElement("div");
      b.className = "wave__bar";
      const left = i * (bw + gap);
      b.style.cssText = `left:${left}px;width:${bw}px;height:${H}px`;
      b.dataset.inset = ((1 - f) * H) / 2;
      const img = document.createElement("img");
      img.src = waveSrc; img.alt = ""; img.setAttribute("aria-hidden", "true");
      img.style.cssText = `width:${W}px;height:${H}px;left:${-left}px;top:0`;
      b.appendChild(img);
      wave.appendChild(b);
      setInset(b, +b.dataset.inset);
      return b;
    });
    wave.classList.add("is-ready");
  }
  function setInset(b, px) { b.style.clipPath = `inset(${px}px 0px ${px}px 0px round 999px)`; }

  function idleWave() {
    // respiração bem sutil das barras, como níveis de áudio
    bars.forEach((b, i) => {
      const base = +b.dataset.inset;
      const o = { v: base };
      idleTweens.push(gsap.to(o, {
        v: base + gsap.utils.random(-14, 14), duration: gsap.utils.random(1.6, 2.6), ease: "sine.inOut",
        yoyo: true, repeat: -1, delay: i * 0.12, onUpdate: () => setInset(b, Math.max(0, o.v)),
      }));
    });
  }

  buildWave();
  let rT;
  addEventListener("resize", () => {
    clearTimeout(rT);
    rT = setTimeout(() => { buildWave(); if (animate) idleWave(); }, 200);
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

  // barras crescem do centro para fora, depois ficam "respirando"
  bars.forEach((b) => setInset(b, wave.clientHeight / 2));
  const waveIn = { p: 0 };
  tl.to(waveIn, {
    p: 1, duration: 1.8, ease: "expo.out",
    onUpdate: () => bars.forEach((b, i) => {
      const H = wave.clientHeight, target = +b.dataset.inset;
      const dist = Math.abs(i - (bars.length - 1) / 2) / bars.length;     // centro primeiro
      const local = gsap.utils.clamp(0, 1, (waveIn.p - dist * 0.6) / 0.7);
      setInset(b, H / 2 - (H / 2 - target) * gsap.parseEase("expo.out")(local));
    }),
    onComplete: idleWave,
  }, 0.1);

  // parallax: cada barra sobe numa velocidade diferente
  ScrollTrigger.create({
    trigger: ".hero", start: "top top", end: "bottom top", scrub: true,
    onUpdate: (self) => bars.forEach((b, i) => {
      const k = [0.6, 1.2, 0.4, 0.9, 0.5, 1.1, 0.7][i % 7];
      b.style.transform = `translateY(${-self.progress * 120 * k}px)`;
    }),
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

  /* ---------- Credenciais: contador + letras decodificando ---------- */
  ScrollTrigger.create({
    trigger: ".stats", start: "top 82%", once: true,
    onEnter: () => {
      $$(".js-count").forEach((el) => {
        const o = { v: 0 };
        gsap.to(o, { v: +el.dataset.to, duration: 1.8, ease: "power2.out", onUpdate: () => (el.textContent = Math.round(o.v)) });
      });
      $$(".js-scramble").forEach((el, i) => scramble(el, el.dataset.text, i * 0.15));
    },
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
  [".audience__grid", ".services__grid", ".also", ".reviews__grid"].forEach((sel) => {
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
  }

  /* ---------- Para as mães: checklist sendo marcado ---------- */
  gsap.from(".checks li", { x: -24, opacity: 0, duration: 0.9, ease: EASE, stagger: 0.08, scrollTrigger: { trigger: ".checks", start: "top 85%", once: true } });
  gsap.from(".checks path", { strokeDashoffset: 24, duration: 0.6, ease: "power2.out", stagger: 0.08, delay: 0.3, scrollTrigger: { trigger: ".checks", start: "top 85%", once: true } });

  /* ---------- Convênios ---------- */
  gsap.from(".pills span", { scale: 0.6, opacity: 0, duration: 0.7, ease: "back.out(2)", stagger: 0.05, scrollTrigger: { trigger: ".pills", start: "top 90%", once: true } });

  /* ---------- Seções com cantos que se abrem ao entrar ---------- */
  [".moms", ".final"].forEach((sel) => {
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
