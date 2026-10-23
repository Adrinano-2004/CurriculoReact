// Gera CSV que abre direto no Excel / Google Planilhas (com acentos corretos).

function celula(valor) {
  const texto = Array.isArray(valor) ? valor.join("; ") : String(valor ?? "");
  return /[",\n;]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

export function paraCsv(linhas, colunas) {
  const cabecalho = colunas.map(celula).join(",");
  const corpo = linhas.map((linha) => colunas.map((c) => celula(linha[c])).join(","));
  return "﻿" + [cabecalho, ...corpo].join("\n");
}
