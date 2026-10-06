import type { Dados } from "./store";
import type { FormaPagamento, MovimentoCaixa, Ticket } from "./types";
import { arred } from "./pricing";
import { inicioDoDia, mesRef } from "./util";

export const DIA_MS = 86400000;

export function receitas(s: Dados, de: number, ate: number): MovimentoCaixa[] {
  return s.movimentos.filter((m) => m.em >= de && m.em < ate && m.tipo !== "sangria" && m.tipo !== "suprimento");
}

export function soma(movs: MovimentoCaixa[]): number {
  return arred(movs.reduce((a, m) => a + m.valor, 0));
}

export function ticketsSaidos(s: Dados, de: number, ate: number): Ticket[] {
  return s.tickets.filter((t) => t.status === "pago" && t.saida! >= de && t.saida! < ate);
}

export function ticketsEntrados(s: Dados, de: number, ate: number): Ticket[] {
  return s.tickets.filter((t) => t.entrada >= de && t.entrada < ate);
}

export function noPatio(s: Dados): Ticket[] {
  return s.tickets.filter((t) => t.status === "aberto").sort((a, b) => b.entrada - a.entrada);
}

/** Entradas por hora (0–23) num dia. */
export function entradasPorHora(s: Dados, dia: number): number[] {
  const ini = inicioDoDia(dia);
  const h = Array(24).fill(0) as number[];
  for (const t of ticketsEntrados(s, ini, ini + DIA_MS)) h[new Date(t.entrada).getHours()]!++;
  return h;
}

/** Receita por dia nos últimos N dias (inclui hoje). */
export function receitaPorDia(s: Dados, agora: number, dias: number): { dia: number; valor: number }[] {
  const hoje = inicioDoDia(agora);
  return Array.from({ length: dias }, (_, i) => {
    const d = hoje - (dias - 1 - i) * DIA_MS;
    return { dia: d, valor: soma(receitas(s, d, d + DIA_MS)) };
  });
}

/** Mapa de calor: [diaSemana][hora] = média de entradas. */
export function mapaDeCalor(s: Dados, de: number, ate: number): number[][] {
  const m = Array.from({ length: 7 }, () => Array(24).fill(0) as number[]);
  const diasContados = Array(7).fill(0) as number[];
  for (let d = inicioDoDia(de); d < ate; d += DIA_MS) diasContados[new Date(d).getDay()]!++;
  for (const t of ticketsEntrados(s, de, ate)) {
    const d = new Date(t.entrada);
    m[d.getDay()]![d.getHours()]!++;
  }
  return m.map((linha, dia) => linha.map((v) => (diasContados[dia] ? v / diasContados[dia]! : 0)));
}

export function porForma(movs: MovimentoCaixa[]): Partial<Record<FormaPagamento, number>> {
  const r: Partial<Record<FormaPagamento, number>> = {};
  for (const m of movs) r[m.forma] = arred((r[m.forma] ?? 0) + m.valor);
  return r;
}

export function mediaPermanencia(ts: Ticket[]): number {
  const v = ts.filter((t) => t.saida);
  if (!v.length) return 0;
  return Math.round(v.reduce((a, t) => a + (t.saida! - t.entrada) / 60000, 0) / v.length);
}

export function ticketMedio(ts: Ticket[]): number {
  const v = ts.filter((t) => (t.valor ?? 0) > 0);
  if (!v.length) return 0;
  return arred(v.reduce((a, t) => a + (t.valor ?? 0), 0) / v.length);
}

export function variacao(atual: number, anterior: number): number {
  if (!anterior) return NaN;
  return ((atual - anterior) / anterior) * 100;
}

export function mensalistasStatus(s: Dados, agora: number) {
  const ref = mesRef(agora);
  const dia = new Date(agora).getDate();
  const ms = s.clientes.filter((c) => c.tipo === "mensalista");
  const emDia = ms.filter((c) => c.pagoAte && c.pagoAte >= ref);
  const atrasados = ms.filter((c) => !c.pagoAte || (c.pagoAte < ref && dia > (c.vencimentoDia ?? 10)));
  const aVencer = ms.filter((c) => !emDia.includes(c) && !atrasados.includes(c));
  return { todos: ms, emDia, atrasados, aVencer, receitaPrevista: arred(ms.reduce((a, c) => a + (c.mensalidade ?? 0), 0)) };
}

export function statusMensalista(s: Dados, clienteId: string, agora: number): "em_dia" | "atrasado" | "a_vencer" {
  const st = mensalistasStatus(s, agora);
  if (st.emDia.some((c) => c.id === clienteId)) return "em_dia";
  if (st.atrasados.some((c) => c.id === clienteId)) return "atrasado";
  return "a_vencer";
}

/** Placas que mais voltaram e ainda não são mensalistas. */
export function candidatosMensalista(s: Dados, de: number, ate: number, n = 8) {
  const mensalistas = new Set(s.clientes.filter((c) => c.tipo === "mensalista").flatMap((c) => c.placas));
  const cont = new Map<string, { visitas: number; gasto: number; modelo: string }>();
  for (const t of ticketsEntrados(s, de, ate)) {
    if (mensalistas.has(t.placa)) continue;
    const c = cont.get(t.placa) ?? { visitas: 0, gasto: 0, modelo: t.modelo };
    c.visitas++;
    c.gasto += t.valor ?? 0;
    cont.set(t.placa, c);
  }
  return [...cont.entries()]
    .map(([placa, v]) => ({ placa, ...v, gasto: arred(v.gasto) }))
    .filter((x) => x.visitas >= 3)
    .sort((a, b) => b.visitas - a.visitas || b.gasto - a.gasto)
    .slice(0, n);
}

export function desempenhoOperadores(s: Dados, de: number, ate: number) {
  return s.usuarios.map((u) => {
    const saidas = s.tickets.filter((t) => t.operadorSaida === u.id && t.saida! >= de && t.saida! < ate && t.status === "pago");
    const entradas = s.tickets.filter((t) => t.operadorEntrada === u.id && t.entrada >= de && t.entrada < ate);
    const cancel = s.tickets.filter((t) => t.cancelamento?.por === u.id && t.cancelamento.em >= de && t.cancelamento.em < ate);
    const caixas = s.caixas.filter((c) => c.operador === u.id && c.abertura >= de && c.abertura < ate && c.fechamento);
    return {
      usuario: u,
      atendimentos: entradas.length + saidas.length,
      recebido: arred(saidas.reduce((a, t) => a + (t.valor ?? 0), 0)),
      cancelamentos: cancel.length,
      taxaCancelamento: entradas.length ? (cancel.length / entradas.length) * 100 : 0,
      caixas: caixas.length,
    };
  });
}
