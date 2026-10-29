"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Overlay } from "@/components/ui/Overlay";
import { ReservationPanel } from "./ReservationPanel";

type Ctx = { openReservation: (dish?: string) => void };
const ReservationContext = createContext<Ctx>({ openReservation: () => {} });

/** Qualquer CTA "Reservar" abre o mesmo modal; `dish` já preenche a observação com o prato escolhido. */
export function ReservationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ open: boolean; dish?: string }>({ open: false });
  const openReservation = useCallback((dish?: string) => setState({ open: true, dish }), []);
  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);

  return (
    <ReservationContext.Provider value={{ openReservation }}>
      {children}
      <Overlay open={state.open} onClose={close} label="Reservar mesa">
        <ReservationPanel key={state.dish ?? "geral"} dish={state.dish} />
      </Overlay>
    </ReservationContext.Provider>
  );
}

export const useReservation = () => useContext(ReservationContext);
