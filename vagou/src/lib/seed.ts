import { calcular } from "./pricing";
import type { Dados } from "./store";
import type {
  Auditoria,
  Caixa,
  Cliente,
  Configuracoes,
  FormaPagamento,
  MovimentoCaixa,
  ServicoLavaJato,
  Ticket,
  Usuario,
  Veiculo,
} from "./types";
import { mesRef } from "./util";

/** Gerador pseudoaleatório com semente, para a demonstração ser sempre igual. */
function prng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export const configPadrao = (): Configuracoes => ({
  empresa: {
    nome: "Estacionamento Exemplo",
    cidade: "Juiz de Fora",
    documento: "00.000.000/0001-00",
    telefone: "(32) 3200-0000",
    chavePix: "pix@estacionamentoexemplo.com.br",
    regulamento:
      "Não nos responsabilizamos por objetos deixados no veículo. A perda do ticket implica cobrança de diária. Tolerância de 10 minutos.",
  },
  vagas: 40,
  tarifaPadraoId: "carro",
  tarifas: [
    { id: "carro", nome: "Carro", toleranciaInicialMin: 10, toleranciaFracaoMin: 0, valorHoras: [10, 5, 5], meiaDiaria: 30, diaria: 45, diariaLancada: 40 },
    { id: "moto", nome: "Moto", toleranciaInicialMin: 10, toleranciaFracaoMin: 0, valorHoras: [6, 3, 3], meiaDiaria: 18, diaria: 25, diariaLancada: 22 },
    { id: "utilitario", nome: "Utilitário", toleranciaInicialMin: 10, toleranciaFracaoMin: 0, valorHoras: [14, 7, 7], meiaDiaria: 40, diaria: 60, diariaLancada: 55 },
  ],
  promocoes: [{ id: "sabado", nome: "Sábado à tarde", ativa: true, dias: [6], aPartirDe: "14:00", tipo: "fixo", valor: 15 }],
  servicos: [
    { id: "simples", nome: "Lavagem simples", valor: 40 },
    { id: "completa", nome: "Lavagem completa", valor: 70 },
    { id: "polimento", nome: "Polimento", valor: 150 },
    { id: "higienizacao", nome: "Higienização interna", valor: 120 },
  ],
  alertaHoras: 5,
  imprimirAutomatico: false,
});

export const usuariosPadrao = (): Usuario[] => [
  { id: "u-carlos", nome: "Carlos", papel: "operador", pin: "1111" },
  { id: "u-juliana", nome: "Juliana", papel: "operador", pin: "2222" },
  { id: "u-gerencia", nome: "Gerência", papel: "dono", pin: "1234" },
];

const MODELOS: [string, string][] = [
  ["Onix", "carro"], ["HB20", "carro"], ["Gol", "carro"], ["Corolla", "carro"], ["Kicks", "carro"], ["Compass", "carro"],
  ["Strada", "utilitario"], ["Renegade", "carro"], ["Argo", "carro"], ["Mobi", "carro"], ["Polo", "carro"], ["T-Cross", "carro"],
  ["Creta", "carro"], ["Sandero", "carro"], ["Kwid", "carro"], ["Civic", "carro"], ["Hilux", "utilitario"], ["Tracker", "carro"],
  ["Ka", "carro"], ["Versa", "carro"], ["Sentra", "carro"], ["CG 160", "moto"], ["Biz", "moto"], ["Fiorino", "utilitario"],
];
const CORES = ["prata", "branco", "preto", "cinza", "vermelho", "azul", "prata", "branco", "preto"];
const LETRAS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function criarDemo(agora: number): Dados {
  const r = prng(20261005);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)]!;
  const placa = () =>
    pick(["R", "S", "Q", "P"]) + pick([...LETRAS]) + pick([...LETRAS]) + Math.floor(r() * 10) + pick([...LETRAS]) + String(Math.floor(r() * 100)).padStart(2, "0");

  const config = configPadrao();
  const usuarios = usuariosPadrao();
  const mesAtual = mesRef(agora);
  const mesAnterior = mesRef(new Date(new Date(agora).getFullYear(), new Date(agora).getMonth() - 1, 1).getTime());

  // ---------- frota recorrente ----------
  const frota: Veiculo[] = Array.from({ length: 140 }, () => {
    const [modelo, tarifaId] = pick(MODELOS);
    return { placa: placa(), modelo, cor: pick(CORES), tarifaId, visitas: 0, ultimaVisita: 0 };
  });

  // ---------- clientes ----------
  const nomes = [
    "Marcos Silva", "Ana Paula Costa", "João Mendes", "Fernanda Rocha", "Paulo Henrique Dias", "Luciana Martins",
    "Rafael Teixeira", "Beatriz Almeida", "Sérgio Ramos", "Camila Duarte", "Eduardo Pires", "Patrícia Nunes",
  ];
  const clientes: Cliente[] = nomes.map((nome, i) => ({
    id: `c-${i}`,
    tipo: "mensalista",
    nome,
    telefone: `(32) 9${String(8800 + i * 37).padStart(4, "0")}-${String(1000 + i * 211).slice(0, 4)}`,
    placas: [frota[i]!.placa],
    mensalidade: i % 4 === 0 ? 180 : 150,
    vencimentoDia: i === 1 || i === 7 ? Math.max(1, new Date(agora).getDate() - 2) : [5, 10, 15, 20][i % 4],
    pagoAte: i === 1 || i === 7 || i === 10 ? mesAnterior : mesAtual,
    criadoEm: agora - 1000 * 60 * 60 * 24 * (200 - i * 9),
  }));
  clientes.push(
    { id: "c-vip1", tipo: "vip", nome: "Dr. Ricardo Lima", telefone: "(32) 99901-2233", placas: [frota[20]!.placa], descontoPct: 20, criadoEm: agora - 9e9 },
    { id: "c-vip2", tipo: "vip", nome: "Helena Castro", telefone: "(32) 99877-1020", placas: [frota[21]!.placa], descontoPct: 15, criadoEm: agora - 8e9 },
    { id: "c-esp1", tipo: "especial", nome: "Igreja Matriz (eventos)", telefone: "(32) 3215-0000", placas: [], descontoPct: 30, observacao: "Desconto em dias de evento", criadoEm: agora - 7e9 },
    { id: "c-conv1", tipo: "convenio", nome: "Loja Fátima Modas", telefone: "(32) 3216-4455", placas: [], descontoPct: 50, observacao: "Cliente com compra acima de R$ 100", criadoEm: agora - 6e9 },
    { id: "c-conv2", tipo: "convenio", nome: "Clínica Bem Estar", telefone: "(32) 3217-8899", placas: [], descontoPct: 100, observacao: "Paciente em consulta: 1ª hora grátis", criadoEm: agora - 5e9 },
    { id: "c-ln1", tipo: "lista_negra", nome: "Placa com pendência", telefone: "", placas: ["PXK9D11"], observacao: "Saiu sem pagar em 12/09", criadoEm: agora - 2e9 },
  );

  const tickets: Ticket[] = [];
  const caixas: Caixa[] = [];
  const movimentos: MovimentoCaixa[] = [];
  const auditoria: Auditoria[] = [];
  const veiculos: Record<string, Veiculo> = {};
  let numero = 1;

  const formaAleatoria = (): FormaPagamento => {
    const x = r();
    return x < 0.48 ? "pix" : x < 0.81 ? "dinheiro" : x < 0.93 ? "debito" : "credito";
  };
  const horaEntrada = () => {
    // picos às 8h, 12h e 17h
    const x = r();
    const centro = x < 0.38 ? 8.3 : x < 0.72 ? 12.2 : 16.8;
    return Math.min(19.5, Math.max(7, centro + (r() + r() + r() - 1.5) * 1.6));
  };
  const duracaoMin = () => {
    const x = r();
    if (x < 0.08) return 5 + Math.floor(r() * 6);
    if (x < 0.7) return 25 + Math.floor(r() * 120);
    if (x < 0.92) return 150 + Math.floor(r() * 180);
    return 420 + Math.floor(r() * 300);
  };

  const carroDoDia = (): Veiculo => (r() < 0.55 ? pick(frota) : (() => {
    const [modelo, tarifaId] = pick(MODELOS);
    return { placa: placa(), modelo, cor: pick(CORES), tarifaId, visitas: 0, ultimaVisita: 0 };
  })());

  const registrar = (v: Veiculo, entrada: number) => {
    const atual = veiculos[v.placa];
    veiculos[v.placa] = { ...v, visitas: (atual?.visitas ?? 0) + 1, ultimaVisita: Math.max(atual?.ultimaVisita ?? 0, entrada) };
  };

  const fechar = (t: Ticket, saida: number, cx: Caixa, operador: string) => {
    const tarifa = config.tarifas.find((x) => x.id === t.tarifaId)!;
    const cliente = clientes.find((c) => c.placas.includes(t.placa) && c.tipo !== "convenio");
    const convenio = r() < 0.05 ? clientes.find((c) => c.id === (r() < 0.5 ? "c-conv1" : "c-conv2")) : undefined;
    const c = calcular({ tarifa, entrada: t.entrada, saida, cliente, convenio, promocoes: config.promocoes, mesReferencia: mesRef(saida) });
    const forma: FormaPagamento = c.total === 0 ? (cliente?.tipo === "mensalista" ? "mensalista" : "isento") : formaAleatoria();
    Object.assign(t, {
      saida, status: "pago", valorBruto: c.bruto, desconto: c.desconto, valorServicos: 0, valor: c.total, pagamento: forma,
      clienteId: cliente?.id, convenioId: convenio?.id, operadorSaida: operador, caixaId: cx.id, promocaoId: c.promocao?.id,
    } satisfies Partial<Ticket>);
    if (c.total > 0) movimentos.push({ id: `m-${t.id}`, caixaId: cx.id, tipo: "ticket", forma, valor: c.total, descricao: `Ticket ${t.numero} · ${t.placa}`, em: saida, refId: t.id });
  };

  // ---------- dias anteriores ----------
  const DIAS = 35;
  for (let d = DIAS; d >= 1; d--) {
    const dia = new Date(agora);
    dia.setDate(dia.getDate() - d);
    dia.setHours(0, 0, 0, 0);
    const base = dia.getTime();
    const semana = dia.getDay();
    if (semana === 0) continue; // fechado aos domingos
    const at = (h: number) => base + h * 3600000;
    const manha: Caixa = { id: `cx-${d}-m`, operador: "u-carlos", abertura: at(7), trocoInicial: 100, fechamento: at(13) };
    const tarde: Caixa = { id: `cx-${d}-t`, operador: "u-juliana", abertura: at(13), trocoInicial: 100, fechamento: at(20.2) };
    const n = semana === 6 ? 46 + Math.floor(r() * 10) : 66 + Math.floor(r() * 22);
    const entradas = Array.from({ length: n }, horaEntrada).sort((a, b) => a - b);
    for (const h of entradas) {
      const v = carroDoDia();
      const entrada = at(h);
      const saida = Math.min(at(20), entrada + duracaoMin() * 60000);
      const op = h < 13 ? "u-carlos" : "u-juliana";
      const t: Ticket = { id: `t-${d}-${numero}`, numero: numero++, placa: v.placa, modelo: v.modelo, cor: v.cor, tarifaId: v.tarifaId, entrada, status: "aberto", operadorEntrada: op };
      registrar(v, entrada);
      const sh = (saida - base) / 3600000;
      const cx = sh < 13 ? manha : tarde;
      if (r() < 0.012) {
        t.status = "cancelado";
        t.saida = entrada + 3 * 60000;
        t.cancelamento = { motivo: pick(["Cliente desistiu na entrada", "Ticket emitido em duplicidade", "Erro de digitação da placa"]), por: op, autorizadoPor: "u-gerencia", em: t.saida };
        auditoria.push({ id: `a-${t.id}`, em: t.saida, tipo: "cancelamento", operador: op, descricao: `Cancelamento · ticket ${t.numero} · ${t.placa} · R$ 10,00`, motivo: t.cancelamento.motivo, autorizadoPor: "u-gerencia", severidade: "atencao" });
      } else {
        fechar(t, saida, cx, sh < 13 ? "u-carlos" : "u-juliana");
      }
      tickets.push(t);
    }
    // mensalidades pagas no dia do vencimento
    const mesDia = mesRef(base);
    for (const c of clientes.filter((c) => c.tipo === "mensalista" && c.vencimentoDia === dia.getDate() && (mesDia < mesAtual || c.pagoAte === mesAtual))) {
      movimentos.push({ id: `mm-${c.id}-${d}`, caixaId: manha.id, tipo: "mensalidade", forma: r() < 0.7 ? "pix" : "dinheiro", valor: c.mensalidade!, descricao: `Mensalidade ${mesDia} · ${c.nome}`, em: at(9.2), refId: c.id });
    }
    // sangria e fechamento
    const somaDinheiro = (cx: Caixa) => movimentos.filter((m) => m.caixaId === cx.id && m.forma === "dinheiro").reduce((a, m) => a + m.valor, 0);
    const sangria = Math.floor(somaDinheiro(manha) / 100) * 100;
    if (sangria > 0) movimentos.push({ id: `sg-${d}`, caixaId: manha.id, tipo: "sangria", forma: "dinheiro", valor: -sangria, descricao: "Depósito no cofre", em: at(12.5) });
    for (const cx of [manha, tarde]) {
      const esperado = cx.trocoInicial + movimentos.filter((m) => m.caixaId === cx.id && m.forma === "dinheiro").reduce((a, m) => a + m.valor, 0);
      const dif = r() < 0.08 ? -(5 + Math.floor(r() * 3) * 5) : 0;
      cx.contado = Math.round((esperado + dif) * 100) / 100;
      if (dif) cx.observacao = "Diferença conferida com a gerência";
      caixas.push(cx);
    }
  }

  // ---------- hoje ----------
  const inicioHoje = agora - 10 * 3600000;
  const caixaHoje: Caixa = { id: "cx-hoje", operador: "u-carlos", abertura: inicioHoje, trocoInicial: 100 };
  caixas.push(caixaHoje);
  const nHoje = 74;
  const offsets = Array.from({ length: nHoje }, () => r() * 10 * 3600000).sort((a, b) => a - b);
  const abertos: Ticket[] = [];
  offsets.forEach((o, i) => {
    const v = carroDoDia();
    const entrada = inicioHoje + o;
    const t: Ticket = { id: `t-h-${numero}`, numero: numero++, placa: v.placa, modelo: v.modelo, cor: v.cor, tarifaId: v.tarifaId, entrada, status: "aberto", operadorEntrada: "u-carlos" };
    registrar(v, entrada);
    const saida = entrada + duracaoMin() * 60000;
    const recente = i >= nHoje - 22;
    if (saida < agora - 60000 && !recente) fechar(t, saida, caixaHoje, "u-carlos");
    else abertos.push(t);
    tickets.push(t);
  });
  // casos especiais no pátio agora
  const especiais: [string, string, string, string, number][] = [
    [frota[0]!.placa, frota[0]!.modelo, frota[0]!.cor, frota[0]!.tarifaId, 95],
    [frota[20]!.placa, frota[20]!.modelo, frota[20]!.cor, frota[20]!.tarifaId, 48],
    ["QQA5H19", "Gol", "branco", "carro", 352],
    ["SYX3I13", "Onix", "prata", "carro", 61],
  ];
  for (const [p, modelo, cor, tarifaId, minAtras] of especiais) {
    if (tickets.some((t) => t.placa === p && t.status === "aberto")) continue;
    const entrada = agora - minAtras * 60000;
    const t: Ticket = { id: `t-e-${numero}`, numero: numero++, placa: p, modelo, cor, tarifaId, entrada, status: "aberto", operadorEntrada: "u-carlos", clienteId: clientes.find((c) => c.placas.includes(p))?.id };
    registrar({ placa: p, modelo, cor, tarifaId, visitas: 0, ultimaVisita: 0 }, entrada);
    tickets.push(t);
  }
  tickets.sort((a, b) => a.numero - b.numero);

  // um cancelamento e uma correção hoje, para o histórico
  const cancelado = abertos[2];
  if (cancelado) {
    cancelado.status = "cancelado";
    cancelado.saida = cancelado.entrada + 4 * 60000;
    cancelado.cancelamento = { motivo: "Cliente desistiu na entrada", por: "u-carlos", autorizadoPor: "u-gerencia", em: cancelado.saida };
    auditoria.push({ id: "a-hoje-1", em: cancelado.saida, tipo: "cancelamento", operador: "u-carlos", descricao: `Cancelamento · ticket ${cancelado.numero} · ${cancelado.placa} · R$ 10,00`, motivo: "Cliente desistiu na entrada", autorizadoPor: "u-gerencia", severidade: "atencao" });
  }
  auditoria.push(
    { id: "a-hoje-2", em: agora - 3.2 * 3600000, tipo: "correcao_placa", operador: "u-carlos", descricao: "Placa corrigida · QPA1C23 → QPA1C28", motivo: "Erro de digitação", severidade: "info" },
    { id: "a-hoje-3", em: agora - 2.1 * 3600000, tipo: "lista_negra", operador: "u-carlos", descricao: "Placa PXK9D11 (lista negra) tentou entrar · entrada bloqueada", severidade: "alerta" },
    { id: "a-hoje-4", em: agora - 26 * 3600000, tipo: "tarifa", operador: "u-gerencia", descricao: "Tabela de preços alterada · Carro · diária R$ 40 → R$ 45", motivo: "Reajuste do mês", severidade: "atencao" },
  );

  // ---------- lava-jato ----------
  const servicos: ServicoLavaJato[] = [];
  const statusLj: ServicoLavaJato["status"][] = ["fila", "fila", "lavando", "pronto", "entregue"];
  abertos.slice(-9, -4).forEach((t, i) => {
    const cat = config.servicos[i % config.servicos.length]!;
    const pago = statusLj[i] === "entregue";
    servicos.push({
      id: `lj-${i}`, placa: t.placa, modelo: t.modelo, servicoId: cat.id, nome: cat.nome, valor: cat.valor, status: statusLj[i]!,
      telefone: i % 2 ? "(32) 99911-0000" : undefined, pago, criadoEm: t.entrada + 5 * 60000, atualizadoEm: agora - (5 - i) * 15 * 60000,
    });
    if (pago) movimentos.push({ id: `mlj-${i}`, caixaId: caixaHoje.id, tipo: "lavajato", forma: "pix", valor: cat.valor, descricao: `${cat.nome} · ${t.placa}`, em: agora - 40 * 60000, refId: `lj-${i}` });
  });

  auditoria.sort((a, b) => b.em - a.em);
  movimentos.sort((a, b) => a.em - b.em);

  return {
    versao: 1,
    config,
    usuarios,
    operadorId: "u-carlos",
    tickets,
    veiculos,
    clientes,
    caixas,
    movimentos,
    servicos,
    auditoria,
    proximoTicket: numero,
  };
}
