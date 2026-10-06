/**
 * Gera o "PIX copia e cola" estático (BR Code, padrão EMV do Banco Central).
 * O mesmo texto vira o QR code mostrado na saída e no ticket.
 */

function campo(id: string, valor: string): string {
  return id + String(valor.length).padStart(2, "0") + valor;
}

export function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function limpar(v: string, max: number): string {
  return v
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .toUpperCase()
    .slice(0, max)
    .trim();
}

export interface PixOpcoes {
  chave: string;
  nome: string;
  cidade: string;
  valor?: number;
  txid?: string;
}

export function pixCopiaECola({ chave, nome, cidade, valor, txid }: PixOpcoes): string {
  const conta = campo("00", "br.gov.bcb.pix") + campo("01", chave.trim());
  let p =
    campo("00", "01") +
    campo("26", conta) +
    campo("52", "0000") +
    campo("53", "986") +
    (valor && valor > 0 ? campo("54", valor.toFixed(2)) : "") +
    campo("58", "BR") +
    campo("59", limpar(nome, 25) || "ESTACIONAMENTO") +
    campo("60", limpar(cidade, 15) || "BRASIL") +
    campo("62", campo("05", (txid ? limpar(txid, 25).replace(/ /g, "") : "") || "***"));
  p += "6304";
  return p + crc16(p);
}
