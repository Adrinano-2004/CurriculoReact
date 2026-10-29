"use client";

import { useEffect, useState } from "react";

// O preloader avisa quando as imagens críticas carregaram; o hero espera esse sinal para a entrada.
const EVENT = "raizes:ready";

export function markReady() {
  document.documentElement.dataset.ready = "true";
  window.dispatchEvent(new Event(EVENT));
}

export function useReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (document.documentElement.dataset.ready === "true") return setReady(true);
    const on = () => setReady(true);
    window.addEventListener(EVENT, on, { once: true });
    return () => window.removeEventListener(EVENT, on);
  }, []);
  return ready;
}
