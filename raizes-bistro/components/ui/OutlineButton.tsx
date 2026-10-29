import type { ComponentProps, ReactNode } from "react";

type Tone = "light" | "dark";

const base =
  "group relative inline-flex items-center justify-center overflow-hidden rounded-full border px-6 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] transition-colors duration-500 ease-[var(--ease-out-soft)]";
const tones: Record<Tone, { root: string; fill: string }> = {
  light: { root: "border-cream/70 text-cream hover:text-espresso", fill: "bg-cream" },
  dark: { root: "border-walnut/70 text-walnut hover:text-cream", fill: "bg-walnut" },
};

function Inner({ children, tone }: { children: ReactNode; tone: Tone }) {
  return (
    <>
      <span
        aria-hidden
        className={`absolute inset-0 origin-bottom scale-y-0 rounded-full transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-y-100 ${tones[tone].fill}`}
      />
      <span className="relative">{children}</span>
    </>
  );
}

/** Botão de contorno em pílula (padrão da base de referência); preenche de baixo para cima no hover. */
export function OutlineButton({ tone = "light", className = "", children, ...props }: ComponentProps<"button"> & { tone?: Tone }) {
  return (
    <button type="button" className={`${base} ${tones[tone].root} ${className}`} {...props}>
      <Inner tone={tone}>{children}</Inner>
    </button>
  );
}

export function OutlineLink({ tone = "light", className = "", children, ...props }: ComponentProps<"a"> & { tone?: Tone }) {
  return (
    <a className={`${base} ${tones[tone].root} ${className}`} {...props}>
      <Inner tone={tone}>{children}</Inner>
    </a>
  );
}
