import { describe, expect, it } from "vitest";
import { calcular, horasCobradas, valorPorHoras } from "./pricing";
import type { Cliente, Promocao, Tarifa } from "./types";

const carro: Tarifa = {
  id: "carro",
  nome: "Carro",
  toleranciaInicialMin: 10,
  toleranciaFracaoMin: 0,
  valorHoras: [10, 5, 5],
  meiaDiaria: 30,
  diaria: 45,
  diariaLancada: 40,
};

const base = new Date(2026, 9, 5, 10, 40).getTime(); // segunda 10:40
const min = (m: number) => base + m * 60000;

describe("horas e frações", () => {
  it("cobra hora iniciada quando não há tolerância de fração", () => {
    expect(horasCobradas(65, 0)).toBe(2);
    expect(horasCobradas(60, 0)).toBe(1);
    expect(horasCobradas(5, 0)).toBe(1);
  });
  it("respeita a tolerância de fração", () => {
    expect(horasCobradas(65, 10)).toBe(1);
    expect(horasCobradas(71, 10)).toBe(2);
  });
  it("soma horas escalonadas", () => {
    expect(valorPorHoras(carro, 1)).toBe(10);
    expect(valorPorHoras(carro, 4)).toBe(25);
  });
});

describe("calcular", () => {
  it("reproduz o caso real: Onix 10:40 → 11:45 = R$ 15,00", () => {
    expect(calcular({ tarifa: carro, entrada: base, saida: min(65) }).total).toBe(15);
  });
  it("não cobra dentro da tolerância inicial", () => {
    expect(calcular({ tarifa: carro, entrada: base, saida: min(8) }).total).toBe(0);
  });
  it("limita à meia diária até 12h", () => {
    expect(calcular({ tarifa: carro, entrada: base, saida: min(8 * 60) }).total).toBe(30);
  });
  it("limita à diária entre 12h e 24h", () => {
    expect(calcular({ tarifa: carro, entrada: base, saida: min(13 * 60) }).total).toBe(45);
  });
  it("cobra dias completos mais o restante", () => {
    // 1 dia + 2h05 = 45 + (10 + 5 + 5)
    expect(calcular({ tarifa: carro, entrada: base, saida: min(24 * 60 + 125) }).total).toBe(65);
  });
  it("diária lançada usa valor fixo", () => {
    expect(calcular({ tarifa: carro, entrada: base, saida: min(30), diaria: true }).total).toBe(40);
  });
  it("mensalista em dia não paga; em atraso paga", () => {
    const m: Cliente = { id: "m", tipo: "mensalista", nome: "M", telefone: "", placas: [], pagoAte: "2026-10", criadoEm: 0 };
    expect(calcular({ tarifa: carro, entrada: base, saida: min(120), cliente: m, mesReferencia: "2026-10" }).total).toBe(0);
    expect(calcular({ tarifa: carro, entrada: base, saida: min(120), cliente: { ...m, pagoAte: "2026-09" }, mesReferencia: "2026-10" }).total).toBe(15);
  });
  it("aplica desconto VIP", () => {
    const vip: Cliente = { id: "v", tipo: "vip", nome: "V", telefone: "", placas: [], descontoPct: 20, criadoEm: 0 };
    const c = calcular({ tarifa: carro, entrada: base, saida: min(65), cliente: vip });
    expect(c.total).toBe(12);
    expect(c.desconto).toBe(3);
  });
  it("aplica promoção de preço fixo no dia e horário certos", () => {
    const promo: Promocao = { id: "p", nome: "Segunda", ativa: true, dias: [1], aPartirDe: "10:00", tipo: "fixo", valor: 12 };
    expect(calcular({ tarifa: carro, entrada: base, saida: min(5 * 60), promocoes: [promo] }).total).toBe(12);
    const fora = { ...promo, aPartirDe: "14:00" };
    expect(calcular({ tarifa: carro, entrada: base, saida: min(5 * 60), promocoes: [fora] }).total).toBe(30);
  });
});
