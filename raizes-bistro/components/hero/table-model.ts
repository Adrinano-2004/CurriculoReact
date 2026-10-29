// Modelo da mesa giratória (lazy Susan).
//
// A mesa tem SLOTS lugares fixos, a 360/SLOTS graus um do outro. O "passo" contínuo `step`
// vale -rotação/STEP_DEG: cada vez que a mesa gira um lugar no sentido anti-horário, step + 1.
//
// Cada lugar i ocupa a posição virtual n (inteiro ≡ i mod SLOTS mais próximo de step).
// O prato servido num lugar depende só de n, então a troca de prato acontece sozinha
// quando o lugar passa pela parte de trás da mesa (fora da tela), e a mesa pode girar
// para sempre mostrando os pratos da categoria em sequência.
//
// Trocar de categoria cria um novo "segmento" de posições virtuais que começa logo depois
// dos lugares visíveis: os pratos atuais continuam na frente enquanto a mesa gira
// e traz os pratos da nova categoria, que já estavam servidos atrás.

export const SLOTS = 8;
export const STEP_DEG = 360 / SLOTS;
/** Lugares com |posição relativa| menor que isso aparecem (inteiros ou em parte) na tela. */
export const VISIBLE_RANGE = 3;
/** Quantos passos uma troca de categoria gira: o bastante para nenhum prato visível ficar na frente. */
export const SWITCH_STEPS = 5;

export type Segment = {
  category: number;
  /** Posição virtual que mostra o primeiro prato da categoria. */
  anchor: number;
  min: number;
  max: number;
};

export const initialSegments = (category = 0): Segment[] => [
  { category, anchor: 0, min: -Infinity, max: Infinity },
];

export const stepFromRotation = (rotation: number) => -rotation / STEP_DEG;
export const rotationFromStep = (step: number) => -step * STEP_DEG;

/** Posição virtual do lugar i quando a mesa está no passo `step`. */
export function virtualIndex(slot: number, step: number) {
  return slot + SLOTS * Math.round((step - slot) / SLOTS);
}

export function segmentAt(segments: Segment[], n: number) {
  for (let i = segments.length - 1; i >= 0; i--) {
    const s = segments[i];
    if (n >= s.min && n <= s.max) return s;
  }
  return segments[0];
}

export function dishAt(segments: Segment[], n: number, tables: string[][]) {
  const seg = segmentAt(segments, n);
  const list = tables[seg.category];
  const k = (((n - seg.anchor) % list.length) + list.length) % list.length;
  return { category: seg.category, slug: list[k] };
}

/**
 * Prepara a troca de categoria a partir do passo atual.
 * Retorna os segmentos novos e o passo de destino (SWITCH_STEPS para frente ou para trás).
 */
export function planSwitch(segments: Segment[], step: number, category: number, forward: boolean) {
  const target = forward ? Math.ceil(step - 1e-6) + SWITCH_STEPS : Math.floor(step + 1e-6) - SWITCH_STEPS;
  const next = segments.map((s) => ({ ...s }));
  // Só troca pratos de lugares que estão fora da tela agora (também no meio de um giro).
  if (forward) {
    const from = Math.ceil(step + VISIBLE_RANGE - 1e-6);
    next.forEach((s) => (s.max = Math.min(s.max, from - 1)));
    next.push({ category, anchor: target, min: from, max: Infinity });
  } else {
    const to = Math.floor(step - VISIBLE_RANGE + 1e-6);
    next.forEach((s) => (s.min = Math.max(s.min, to + 1)));
    next.push({ category, anchor: target, min: -Infinity, max: to });
  }
  return { segments: next, target };
}

/** Depois do giro, a categoria nova passa a valer para a mesa inteira (os lugares de trás trocam escondidos). */
export function settle(segments: Segment[], step: number): Segment[] {
  const seg = segmentAt(segments, Math.round(step));
  return [{ ...seg, min: -Infinity, max: Infinity }];
}
