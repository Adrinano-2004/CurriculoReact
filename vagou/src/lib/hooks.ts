"use client";

import { useEffect, useState } from "react";
import { useApp } from "./store";

/** Relógio que atualiza a cada N ms — usado para tempos no pátio. */
export function useNow(intervalo = 30000): number {
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), intervalo);
    return () => clearInterval(id);
  }, [intervalo]);
  return agora;
}

/** Carrega os dados salvos no navegador antes de mostrar o sistema. */
export function useHydrated(): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const p = useApp.persist;
    const unsub = p.onFinishHydration(() => {
      try {
        if (!localStorage.getItem(p.getOptions().name!)) useApp.setState({});
      } catch {
        /* armazenamento indisponível: segue só em memória */
      }
      setOk(true);
    });
    if (p.hasHydrated()) setOk(true);
    else void p.rehydrate();
    return unsub;
  }, []);
  return ok;
}

export function useOnline(): boolean {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const up = () => setOn(navigator.onLine);
    up();
    window.addEventListener("online", up);
    window.addEventListener("offline", up);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", up);
    };
  }, []);
  return on;
}
