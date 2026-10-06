import { describe, expect, it } from "vitest";
import { crc16, pixCopiaECola } from "./pix";
import { normalizarPlaca, placaValida } from "./util";

describe("pix", () => {
  it("calcula CRC16-CCITT conhecido", () => {
    expect(crc16("123456789")).toBe("29B1");
  });
  it("monta payload com valor e CRC válido", () => {
    const p = pixCopiaECola({ chave: "contato@vagou.app", nome: "Estacionamento São José", cidade: "Juiz de Fora", valor: 15, txid: "T280" });
    expect(p.startsWith("000201")).toBe(true);
    expect(p).toContain("br.gov.bcb.pix");
    expect(p).toContain("540515.00");
    expect(p).toContain("ESTACIONAMENTO SAO JOSE");
    const corpo = p.slice(0, -4);
    expect(crc16(corpo)).toBe(p.slice(-4));
  });
});

describe("placas", () => {
  it("normaliza e valida formatos antigo e Mercosul", () => {
    expect(normalizarPlaca("syx-3i13")).toBe("SYX3I13");
    expect(placaValida("SYX3I13")).toBe(true);
    expect(placaValida("ABC1234")).toBe(true);
    expect(placaValida("AB12345")).toBe(false);
  });
});
