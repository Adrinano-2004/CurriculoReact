import { describe, expect, it } from "vitest";
import { criarDemo } from "./seed";

describe("demo", () => {
  it("gera dados consistentes", () => {
    const d = criarDemo(new Date(2026, 9, 5, 15, 0).getTime());
    const abertos = d.tickets.filter((t) => t.status === "aberto");
    expect(abertos.length).toBeGreaterThan(10);
    expect(abertos.length).toBeLessThanOrEqual(d.config.vagas);
    expect(d.caixas.filter((c) => !c.fechamento)).toHaveLength(1);
    const numeros = new Set(d.tickets.map((t) => t.numero));
    expect(numeros.size).toBe(d.tickets.length);
    expect(d.proximoTicket).toBe(Math.max(...numeros) + 1);
    for (const t of d.tickets.filter((t) => t.status === "pago")) {
      expect(t.saida! >= t.entrada).toBe(true);
      expect(t.valor).toBeGreaterThanOrEqual(0);
    }
    const json = JSON.stringify(d);
    expect(json.length).toBeLessThan(2_500_000);
  });
});
