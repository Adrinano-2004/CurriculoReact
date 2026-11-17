/* =========================================================
   Dra. Alice Werneck · animações e interações
   GSAP + ScrollTrigger + Lenis (scroll suave)
   ========================================================= */

// >>> TROQUE AQUI pelo número real (somente dígitos, com 55 + DDD)
const WHATSAPP_NUMBER = "5532999999999";

(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none)").matches;
  const hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  /* ---------- WhatsApp: todos os botões com mensagem pronta ---------- */
  document.querySelectorAll(".js-whats").forEach((el) => {
    const msg = el.dataset.msg || "Olá! Gostaria de agendar uma consulta.";
    el.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    el.target = "_blank";
    el.rel = "noopener";
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Menu mobile ---------- */
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));

  /* ---------- Toque nos botões (equivalente ao hover no celular) ---------- */
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("touchstart", () => {
      btn.classList.add("is-touch-active");
      setTimeout(() => btn.classList.remove("is-touch-active"), 700);
    }, { passive: true });
  });

  /* ---------- Scroll suave ---------- */
  let lenis = null;
  if (!reduceMotion && typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    if (hasGSAP) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  // Links âncora (descontando a altura do header)
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      setMenu(false);
      const offset = id === "#inicio" ? 0 : -60;
      if (lenis) lenis.scrollTo(target, { offset, duration: 1.4 });
      else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY + offset, behavior: "smooth" });
    });
  });

  /* ---------- Header: transparente → vidro; some ao descer, volta ao subir ---------- */
  const header = document.getElementById("header");
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 24);
    const goingDown = y > lastY && y > window.innerHeight * 0.8;
    if (!nav.classList.contains("is-open")) header.classList.toggle("is-hidden", goingDown);
    lastY = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Quebra títulos em palavras (sem perder os &nbsp;) ---------- */
  document.querySelectorAll(".split-words").forEach((el) => {
    const words = el.textContent.trim().split(/ +/);
    el.innerHTML = words.map((w) => `<span class="w"><span>${w}</span></span>`).join(" ");
  });

  /* ---------- Sem GSAP ou com movimento reduzido: mostra tudo e para ---------- */
  if (!hasGSAP || reduceMotion) {
    document.querySelectorAll(".reveal-up, .reveal-fade").forEach((el) => (el.style.opacity = 1));
    document.querySelectorAll(".js-count").forEach((el) => (el.textContent = el.dataset.to));
    document.querySelectorAll(".steps__progress span").forEach((el) => (el.style.transform = "scaleX(1)"));
    document.querySelectorAll(".step").forEach((el) => el.classList.add("is-on"));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const EASE = "expo.out";

  /* ---------- HERO: entrada ---------- */
  const heroTl = gsap.timeline({ defaults: { ease: EASE } });
  heroTl
    .from(".hero__title .line > span", { yPercent: 115, duration: 1.4, stagger: 0.12 }, 0.15)
    .fromTo(".arch--hero", { clipPath: "inset(100% 0% 0% 0% round 999px 999px 18px 18px)" },
      { clipPath: "inset(0% 0% 0% 0% round 999px 999px 18px 18px)", duration: 1.6, ease: "expo.inOut" }, 0)
    .from(".arch--hero img, .arch__monogram", { scale: 1.25, duration: 2 }, 0.2)
    .to(".hero .reveal-fade", { opacity: 1, duration: 1 }, 0.7)
    .from(".hero .reveal-fade", { y: 18, duration: 1.2, stagger: 0.08 }, 0.7)
    .from(".header__inner", { y: -16, opacity: 0, duration: 1.1 }, 0.4);

  // Parallax suave da foto
  gsap.to("[data-parallax]", {
    yPercent: -10, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to(".hero__text", {
    yPercent: 12, opacity: 0.25, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  /* ---------- Títulos palavra por palavra ---------- */
  document.querySelectorAll(".split-words").forEach((el) => {
    if (el.closest(".hero")) return;
    gsap.from(el.querySelectorAll(".w > span"), {
      yPercent: 110, duration: 1.2, ease: EASE, stagger: 0.035,
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
  });

  /* ---------- Parágrafos e blocos ---------- */
  gsap.utils.toArray(".reveal-up").forEach((el) => {
    gsap.fromTo(el, { opacity: 0, y: 30 }, {
      opacity: 1, y: 0, duration: 1.2, ease: EASE,
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });

  /* ---------- STATS: contador + letras "decodificando" ---------- */
  const stats = document.querySelector(".stats");
  ScrollTrigger.create({
    trigger: stats, start: "top 80%", once: true,
    onEnter: () => {
      document.querySelectorAll(".js-count").forEach((el) => {
        const obj = { v: 0 };
        gsap.to(obj, { v: +el.dataset.to, duration: 1.8, ease: "power2.out", onUpdate: () => (el.textContent = Math.round(obj.v)) });
      });
      document.querySelectorAll(".js-scramble").forEach((el, i) => scramble(el, el.dataset.text, 0.15 * i));
    },
  });
  gsap.from(".stat", {
    y: 24, opacity: 0, duration: 1.1, ease: EASE, stagger: 0.1,
    scrollTrigger: { trigger: stats, start: "top 85%", once: true },
  });

  function scramble(el, finalText, delay) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const total = 26; // frames
    let frame = 0;
    setTimeout(() => {
      const tick = () => {
        const progress = frame / total;
        el.textContent = finalText.split("").map((c, i) => {
          if (c === " " || c === "-") return c;
          return i < progress * finalText.length ? c : chars[Math.floor(Math.random() * chars.length)];
        }).join("");
        if (frame++ < total) requestAnimationFrame(() => setTimeout(tick, 28));
        else el.textContent = finalText;
      };
      tick();
    }, delay * 1000);
  }

  /* ---------- Cards: entrada em sequência ---------- */
  [".audience__grid", ".services__grid"].forEach((sel) => {
    const grid = document.querySelector(sel);
    gsap.from(grid.children, {
      y: 60, opacity: 0, duration: 1.2, ease: EASE, stagger: 0.09,
      scrollTrigger: { trigger: grid, start: "top 85%", once: true },
      clearProps: "transform,opacity", // devolve o controle do hover ao CSS
    });
  });

  /* ---------- Celular: o "hover" acontece quando o card passa pelo centro da tela ---------- */
  if (isTouch) {
    document.querySelectorAll(".hover-card").forEach((card) => {
      ScrollTrigger.create({
        trigger: card, start: "top 62%", end: "bottom 38%",
        toggleClass: { targets: card, className: "is-active" },
      });
    });
  }

  /* ---------- Como funciona: linha de progresso ---------- */
  const steps = gsap.utils.toArray(".step");
  gsap.to(".steps__progress span", {
    scaleX: 1, ease: "none",
    scrollTrigger: {
      trigger: ".steps", start: "top 70%", end: "bottom 60%", scrub: 0.6,
      onUpdate: (self) => steps.forEach((s, i) => s.classList.toggle("is-on", self.progress >= (i + 0.35) / steps.length)),
    },
  });
  gsap.from(steps, {
    y: 30, opacity: 0, duration: 1.1, ease: EASE, stagger: 0.12,
    scrollTrigger: { trigger: ".steps__list", start: "top 85%", once: true },
  });

  /* ---------- Contato ---------- */
  gsap.from(".contact", {
    borderRadius: "80px 80px 0 0", ease: "none",
    scrollTrigger: { trigger: ".contact", start: "top bottom", end: "top 40%", scrub: true },
  });

  /* ---------- Link do menu ativo ---------- */
  document.querySelectorAll(".nav__link").forEach((link) => {
    const section = document.querySelector(link.getAttribute("href"));
    if (!section) return;
    ScrollTrigger.create({
      trigger: section, start: "top 50%", end: "bottom 50%",
      onToggle: (self) => link.classList.toggle("is-active", self.isActive),
    });
  });

  // Recalcula depois que fontes e imagens carregam
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
