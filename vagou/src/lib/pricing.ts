import type { Cliente, Promocao, Tarifa } from "./types";

const HORA = 60;
const MEIO_DIA = 12 * HORA;
const DIA = 24 * HORA;

export interface Calculo {
  minutos: number;
  horasCobradas: number;
  diasCompletos: number;
  /** Valor só pelo tempo, antes de descontos e promoções. */
  bruto: number;
  desconto: number;
  total: number;
  detalhe: string[];
  promocao?: Promocao;
}

export function minutosEntre(entrada: number, saida: number): number {
  return Math.max(0, Math.floor((saida - entrada) / 60000));
}

/** Soma das horas escalonadas: 1ª, 2ª e 3ª em diante. */
export function valorPorHoras(tarifa: Tarifa, horas: number): number {
  let total = 0;
  for (let h = 1; h <= horas; h++) total += tarifa.valorHoras[Math.min(h, 3) - 1];
  return total;
}

/** Horas cobradas em um período, respeitando a tolerância de fração. */
export function horasCobradas(minutos: number, toleranciaFracaoMin: number): number {
  if (minutos <= 0) return 0;
  const cheias = Math.floor(minutos / HORA);
  const resto = minutos % HORA;
  if (cheias === 0) return 1;
  return resto > toleranciaFracaoMin ? cheias + 1 : cheias;
}

/**
 * Valor de um período menor que 24h: horas escalonadas, limitadas pela
 * meia diária (até 12h) ou pela diária (de 12h a 24h).
 */
export function valorPeriodo(tarifa: Tarifa, minutos: number): { valor: number; horas: number; teto?: string } {
  const horas = horasCobradas(minutos, tarifa.toleranciaFracaoMin);
  const porHora = valorPorHoras(tarifa, horas);
  if (minutos <= MEIO_DIA && tarifa.meiaDiaria > 0 && porHora > tarifa.meiaDiaria) {
    return { valor: tarifa.meiaDiaria, horas, teto: "meia diária" };
  }
  if (minutos > MEIO_DIA && tarifa.diaria > 0 && porHora > tarifa.diaria) {
    return { valor: tarifa.diaria, horas, teto: "diária" };
  }
  return { valor: porHora, horas };
}

function horaParaMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function promocaoAplicavel(promocoes: Promocao[], entrada: number): Promocao | undefined {
  const d = new Date(entrada);
  const dia = d.getDay();
  const min = d.getHours() * 60 + d.getMinutes();
  return promocoes.find((p) => p.ativa && p.dias.includes(dia as Promocao["dias"][number]) && min >= horaParaMin(p.aPartirDe));
}

export interface OpcoesCalculo {
  tarifa: Tarifa;
  entrada: number;
  saida: number;
  diaria?: boolean;
  cliente?: Cliente;
  convenio?: Cliente;
  promocoes?: Promocao[];
  mesReferencia?: string; // "YYYY-MM" para conferir mensalista em dia
}

export function mensalistaEmDia(cliente: Cliente, mesReferencia: string): boolean {
  return cliente.tipo === "mensalista" && !!cliente.pagoAte && cliente.pagoAte >= mesReferencia;
}

export function calcular(op: OpcoesCalculo): Calculo {
  const { tarifa, entrada, saida } = op;
  const minutos = minutosEntre(entrada, saida);
  const detalhe: string[] = [];

  if (op.diaria) {
    detalhe.push(`Diária lançada: ${brl(tarifa.diariaLancada)}`);
    return { minutos, horasCobradas: 0, diasCompletos: 0, bruto: tarifa.diariaLancada, desconto: 0, total: tarifa.diariaLancada, detalhe };
  }

  if (op.cliente && op.mesReferencia && mensalistaEmDia(op.cliente, op.mesReferencia)) {
    detalhe.push("Mensalista em dia: sem cobrança");
    return { minutos, horasCobradas: 0, diasCompletos: 0, bruto: 0, desconto: 0, total: 0, detalhe };
  }

  if (minutos <= tarifa.toleranciaInicialMin) {
    detalhe.push(`Dentro da tolerância de ${tarifa.toleranciaInicialMin} min`);
    return { minutos, horasCobradas: 0, diasCompletos: 0, bruto: 0, desconto: 0, total: 0, detalhe };
  }

  const diasCompletos = Math.floor(minutos / DIA);
  const resto = minutos % DIA;
  let bruto = diasCompletos * tarifa.diaria;
  if (diasCompletos > 0) detalhe.push(`${diasCompletos} diária(s): ${brl(diasCompletos * tarifa.diaria)}`);

  let horas = 0;
  if (resto > 0) {
    const p = valorPeriodo(tarifa, resto);
    horas = p.horas;
    bruto += p.valor;
    const hs = `${p.horas} hora${p.horas > 1 ? "s" : ""} iniciada${p.horas > 1 ? "s" : ""}`;
    detalhe.push(p.teto ? `${hs}, limitado à ${p.teto}: ${brl(p.valor)}` : `${hs}: ${brl(p.valor)}`);
  }

  let total = bruto;
  let promocao: Promocao | undefined;
  if (op.promocoes) {
    promocao = promocaoAplicavel(op.promocoes, entrada);
    if (promocao) {
      const comPromo = promocao.tipo === "fixo" ? Math.min(total, promocao.valor) : total * (1 - promocao.valor / 100);
      if (comPromo < total) {
        detalhe.push(`Promoção "${promocao.nome}": ${brl(comPromo)}`);
        total = comPromo;
      } else promocao = undefined;
    }
  }

  const pct = Math.max(op.cliente?.descontoPct ?? 0, op.convenio?.descontoPct ?? 0);
  if (pct > 0) {
    const origem = (op.convenio?.descontoPct ?? 0) >= (op.cliente?.descontoPct ?? 0) && op.convenio ? `Convênio ${op.convenio.nome}` : "Cliente VIP";
    const d = total * (pct / 100);
    detalhe.push(`${origem} (${pct}%): −${brl(d)}`);
    total -= d;
  }

  total = arred(total);
  return { minutos, horasCobradas: horas, diasCompletos, bruto: arred(bruto), desconto: arred(bruto - total), total, detalhe, promocao };
}

export function arred(v: number): number {
  return Math.round(v * 100) / 100;
}

export function brl(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
