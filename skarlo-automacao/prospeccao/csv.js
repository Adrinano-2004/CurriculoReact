// CSV que abre direto no Excel em português (separador ";") e no Google Planilhas, com acentos corretos.

const SEPARADOR = ";";

function celula(valor) {
  const texto = Array.isArray(valor) ? valor.join(" | ") : String(valor ?? "");
  return /[";,\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

export function paraCsv(linhas, colunas) {
  const cabecalho = colunas.map(celula).join(SEPARADOR);
  const corpo = linhas.map((linha) => colunas.map((c) => celula(linha[c])).join(SEPARADOR));
  return "﻿" + [cabecalho, ...corpo].join("\r\n");
}

// Lê um CSV (salvo por este programa, pelo Excel ou pelo Google Planilhas) como lista de objetos.
export function lerCsv(texto) {
  texto = texto.replace(/^﻿/, "");
  const primeiraLinha = texto.slice(0, texto.search(/\r?\n|$/));
  const sep = (primeiraLinha.match(/;/g) ?? []).length >= (primeiraLinha.match(/,/g) ?? []).length ? ";" : ",";

  const linhas = [];
  let linha = [];
  let campo = "";
  let aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (aspas) {
      if (c === '"' && texto[i + 1] === '"') (campo += '"'), i++;
      else if (c === '"') aspas = false;
      else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === sep) linha.push(campo), (campo = "");
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      linha.push(campo), linhas.push(linha), (linha = []), (campo = "");
    } else campo += c;
  }
  if (campo || linha.length) linha.push(campo), linhas.push(linha);

  const [cabecalho = [], ...dados] = linhas;
  return dados
    .filter((l) => l.some((v) => v.trim()))
    .map((l) => Object.fromEntries(cabecalho.map((nome, i) => [nome.trim(), l[i] ?? ""])));
}
