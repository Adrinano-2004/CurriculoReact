export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

/** Normaliza para letras maiúsculas e números, sem traço. */
export function normalizarPlaca(v: string): string {
  return v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
}

/** Aceita placa antiga (ABC1234) e Mercosul (ABC1D23). */
export function placaValida(p: string): boolean {
  return /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(p);
}

export function hora(ts: number): string {
  return new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function data(ts: number): string {
  return new Date(ts).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function dataHora(ts: number): string {
  return `${data(ts)} ${hora(ts)}`;
}

export function dataLonga(ts: number): string {
  const s = new Date(ts).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function duracao(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}min` : `${m}min`;
}

export function inicioDoDia(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function mesRef(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function proximoMes(ref: string): string {
  const [y, m] = ref.split("-").map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
}

export function nomeMes(ref: string): string {
  const [y, m] = ref.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("pt-BR", { month: "long" });
}

export function iniciais(nome: string): string {
  return nome
    .replace(/^(Dr|Dra|Sr|Sra)\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function soDigitos(v: string): string {
  return v.replace(/\D/g, "");
}

export function linkWhatsApp(telefone: string, texto: string): string {
  let n = soDigitos(telefone);
  if (n.length <= 11) n = "55" + n;
  return `https://wa.me/${n}?text=${encodeURIComponent(texto)}`;
}

export function cx(...c: (string | false | null | undefined)[]): string {
  return c.filter(Boolean).join(" ");
}

export function baixarArquivo(nome: string, conteudo: string, tipo = "text/plain") {
  const blob = new Blob([conteudo], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}

export function csv(linhas: (string | number)[][]): string {
  return linhas
    .map((l) => l.map((c) => (typeof c === "string" && /[;"\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : String(c))).join(";"))
    .join("\n");
}
