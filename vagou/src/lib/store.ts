"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { arred, calcular, type Calculo } from "./pricing";
import { criarDemo } from "./seed";
import type {
  Auditoria,
  Caixa,
  Cliente,
  Configuracoes,
  FormaPagamento,
  ID,
  MovimentoCaixa,
  ServicoLavaJato,
  StatusServico,
  Tarifa,
  Ticket,
  TipoAuditoria,
  Usuario,
  Veiculo,
} from "./types";
import { mesRef, normalizarPlaca, proximoMes, uid } from "./util";

export interface Dados {
  versao: number;
  config: Configuracoes;
  usuarios: Usuario[];
  operadorId: ID;
  tickets: Ticket[];
  veiculos: Record<string, Veiculo>;
  clientes: Cliente[];
  caixas: Caixa[];
  movimentos: MovimentoCaixa[];
  servicos: ServicoLavaJato[];
  auditoria: Auditoria[];
  proximoTicket: number;
}

export interface EntradaInput {
  placa: string;
  modelo: string;
  cor: string;
  tarifaId: ID;
  diaria?: boolean;
  autorizadoPor?: ID;
}

interface Acoes {
  setOperador(id: ID): void;
  autorizar(pin: string): Usuario | undefined;

  registrarEntrada(i: EntradaInput): Ticket;
  registrarSaida(ticketId: ID, forma: FormaPagamento, convenioId?: ID): Ticket | undefined;
  cancelarTicket(ticketId: ID, motivo: string, autorizadoPor: ID): void;
  corrigirPlaca(ticketId: ID, nova: string, motivo: string): void;
  lancarDiaria(ticketId: ID): void;

  abrirCaixa(trocoInicial: number): Caixa;
  movimentarCaixa(tipo: "sangria" | "suprimento", valor: number, descricao: string): void;
  fecharCaixa(contado: number, observacao: string): void;

  salvarCliente(c: Omit<Cliente, "id" | "criadoEm"> & { id?: ID }): Cliente;
  removerCliente(id: ID): void;
  receberMensalidade(clienteId: ID, forma: FormaPagamento): void;

  adicionarServico(placa: string, servicoId: ID, telefone?: string): void;
  moverServico(id: ID, status: StatusServico): void;
  receberServico(id: ID, forma: FormaPagamento): void;
  removerServico(id: ID): void;

  salvarConfig(c: Partial<Configuracoes>, descricao?: string): void;
  salvarTarifa(t: Tarifa): void;
  removerTarifa(id: ID): void;
  salvarUsuario(u: Usuario): void;
  removerUsuario(id: ID): void;

  registrarAuditoria(a: Omit<Auditoria, "id" | "em" | "operador"> & { operador?: ID }): void;
  restaurar(d: Dados): void;
  resetarDemo(): void;
  limparTudo(): void;
}

export type Estado = Dados & Acoes;

export function caixaAberto(s: Dados): Caixa | undefined {
  return s.caixas.find((c) => !c.fechamento);
}

export function clientePorPlaca(s: Dados, placa: string): Cliente | undefined {
  return s.clientes.find((c) => c.tipo !== "convenio" && c.placas.includes(placa));
}

export function tarifaDe(s: Dados, id: ID): Tarifa {
  return s.config.tarifas.find((t) => t.id === id) ?? s.config.tarifas[0]!;
}

export function nomeUsuario(s: Dados, id?: ID): string {
  return s.usuarios.find((u) => u.id === id)?.nome ?? "—";
}

export function servicosPendentes(s: Dados, placa: string): ServicoLavaJato[] {
  return s.servicos.filter((v) => v.placa === placa && !v.pago);
}

/** Cálculo da saída de um ticket em aberto no momento informado. */
export function calcularSaida(s: Dados, t: Ticket, agora: number, convenioId?: ID): Calculo & { servicos: number; totalGeral: number } {
  const cliente = t.clienteId ? s.clientes.find((c) => c.id === t.clienteId) : clientePorPlaca(s, t.placa);
  const convenio = convenioId ? s.clientes.find((c) => c.id === convenioId) : undefined;
  const c = calcular({
    tarifa: tarifaDe(s, t.tarifaId),
    entrada: t.entrada,
    saida: agora,
    diaria: t.diaria,
    cliente,
    convenio,
    promocoes: s.config.promocoes,
    mesReferencia: mesRef(agora),
  });
  const servicos = arred(servicosPendentes(s, t.placa).reduce((a, v) => a + v.valor, 0));
  return { ...c, servicos, totalGeral: arred(c.total + servicos) };
}

const demo = () => criarDemo(Date.now());

export const useApp = create<Estado>()(
  persist(
    (set, get) => {
      const audit = (a: Omit<Auditoria, "id" | "em" | "operador"> & { operador?: ID }) =>
        set((s) => ({ auditoria: [{ id: uid(), em: Date.now(), operador: a.operador ?? s.operadorId, ...a }, ...s.auditoria].slice(0, 5000) }));

      const movimento = (m: Omit<MovimentoCaixa, "id" | "em" | "caixaId">) => {
        const cx = caixaAberto(get());
        if (!cx) throw new Error("Abra o caixa antes de receber pagamentos.");
        const mov: MovimentoCaixa = { id: uid(), em: Date.now(), caixaId: cx.id, ...m };
        set((s) => ({ movimentos: [...s.movimentos, mov] }));
        return mov;
      };

      return {
        ...demo(),

        setOperador: (id) => set({ operadorId: id }),
        autorizar: (pin) => get().usuarios.find((u) => u.pin === pin && (u.papel === "gerente" || u.papel === "dono")),

        registrarEntrada: (i) => {
          const s = get();
          const placa = normalizarPlaca(i.placa);
          const cliente = clientePorPlaca(s, placa);
          const t: Ticket = {
            id: uid(),
            numero: s.proximoTicket,
            placa,
            modelo: i.modelo.trim(),
            cor: i.cor.trim(),
            tarifaId: i.tarifaId,
            entrada: Date.now(),
            status: "aberto",
            diaria: i.diaria,
            clienteId: cliente?.id,
            operadorEntrada: s.operadorId,
          };
          const v = s.veiculos[placa];
          set({
            tickets: [...s.tickets, t],
            proximoTicket: s.proximoTicket + 1,
            veiculos: {
              ...s.veiculos,
              [placa]: { placa, modelo: t.modelo, cor: t.cor, tarifaId: t.tarifaId, visitas: (v?.visitas ?? 0) + 1, ultimaVisita: t.entrada },
            },
          });
          if (cliente?.tipo === "lista_negra") {
            audit({
              tipo: "lista_negra",
              descricao: `Entrada autorizada da placa ${placa} (lista negra) · ticket ${t.numero}`,
              autorizadoPor: i.autorizadoPor,
              severidade: "alerta",
            });
          }
          if (i.diaria) audit({ tipo: "diaria", descricao: `Diária lançada na entrada · ${placa} · ticket ${t.numero}`, severidade: "info" });
          return t;
        },

        registrarSaida: (ticketId, forma, convenioId) => {
          const s = get();
          const t = s.tickets.find((x) => x.id === ticketId);
          if (!t || t.status !== "aberto") return;
          const agora = Date.now();
          const c = calcularSaida(s, t, agora, convenioId);
          const pagos = servicosPendentes(s, t.placa);
          const formaFinal: FormaPagamento = c.totalGeral === 0 ? (t.clienteId && c.detalhe[0]?.startsWith("Mensalista") ? "mensalista" : "isento") : forma;
          const mov =
            c.totalGeral > 0
              ? movimento({ tipo: "ticket", forma: formaFinal, valor: c.totalGeral, descricao: `Ticket ${t.numero} · ${t.placa}`, refId: t.id })
              : undefined;
          const atualizado: Ticket = {
            ...t,
            saida: agora,
            status: "pago",
            convenioId,
            valorBruto: c.bruto,
            desconto: c.desconto,
            valorServicos: c.servicos,
            valor: c.totalGeral,
            pagamento: formaFinal,
            promocaoId: c.promocao?.id,
            operadorSaida: s.operadorId,
            caixaId: mov?.caixaId ?? caixaAberto(s)?.id,
          };
          set((st) => ({
            tickets: st.tickets.map((x) => (x.id === t.id ? atualizado : x)),
            servicos: st.servicos.map((v) => (pagos.some((p) => p.id === v.id) ? { ...v, pago: true, ticketId: t.id, status: "entregue", atualizadoEm: agora } : v)),
          }));
          if (c.desconto > 0) {
            audit({ tipo: "desconto", descricao: `Desconto de ${c.desconto.toFixed(2).replace(".", ",")} · ticket ${t.numero} · ${t.placa}`, motivo: c.detalhe.slice(1).join(" · "), severidade: "info" });
          }
          return atualizado;
        },

        cancelarTicket: (ticketId, motivo, autorizadoPor) => {
          const s = get();
          const t = s.tickets.find((x) => x.id === ticketId);
          if (!t || t.status === "cancelado") return;
          const estimado = t.status === "aberto" ? calcularSaida(s, t, Date.now()).totalGeral : t.valor ?? 0;
          if (t.status === "pago" && t.valor && t.pagamento && !["mensalista", "isento"].includes(t.pagamento) && caixaAberto(s)) {
            movimento({ tipo: "ticket", forma: t.pagamento, valor: -t.valor, descricao: `Estorno ticket ${t.numero}`, refId: t.id });
          }
          set((st) => ({
            tickets: st.tickets.map((x) =>
              x.id === ticketId ? { ...x, status: "cancelado", saida: x.saida ?? Date.now(), cancelamento: { motivo, por: s.operadorId, autorizadoPor, em: Date.now() } } : x,
            ),
          }));
          audit({
            tipo: "cancelamento",
            descricao: `Cancelamento · ticket ${t.numero} · ${t.placa} · ${estimado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
            motivo,
            autorizadoPor,
            severidade: "atencao",
          });
        },

        corrigirPlaca: (ticketId, nova, motivo) => {
          const placa = normalizarPlaca(nova);
          const t = get().tickets.find((x) => x.id === ticketId);
          if (!t) return;
          set((s) => ({ tickets: s.tickets.map((x) => (x.id === ticketId ? { ...x, placa, clienteId: clientePorPlaca(s, placa)?.id } : x)) }));
          audit({ tipo: "correcao_placa", descricao: `Placa corrigida · ${t.placa} → ${placa} · ticket ${t.numero}`, motivo, severidade: "info" });
        },

        lancarDiaria: (ticketId) => {
          const t = get().tickets.find((x) => x.id === ticketId);
          if (!t || t.status !== "aberto") return;
          set((s) => ({ tickets: s.tickets.map((x) => (x.id === ticketId ? { ...x, diaria: true } : x)) }));
          audit({ tipo: "diaria", descricao: `Diária lançada · ${t.placa} · ticket ${t.numero}`, severidade: "info" });
        },

        abrirCaixa: (trocoInicial) => {
          const existente = caixaAberto(get());
          if (existente) return existente;
          const c: Caixa = { id: uid(), operador: get().operadorId, abertura: Date.now(), trocoInicial };
          set((s) => ({ caixas: [...s.caixas, c] }));
          audit({ tipo: "caixa", descricao: `Caixa aberto com troco de ${trocoInicial.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`, severidade: "info" });
          return c;
        },

        movimentarCaixa: (tipo, valor, descricao) => {
          movimento({ tipo, forma: "dinheiro", valor: tipo === "sangria" ? -Math.abs(valor) : Math.abs(valor), descricao });
          audit({ tipo: "caixa", descricao: `${tipo === "sangria" ? "Sangria" : "Suprimento"} de ${Math.abs(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`, motivo: descricao, severidade: "info" });
        },

        fecharCaixa: (contado, observacao) => {
          const s = get();
          const cx = caixaAberto(s);
          if (!cx) return;
          const esperado = resumoCaixa(s, cx.id).esperadoDinheiro;
          set((st) => ({ caixas: st.caixas.map((c) => (c.id === cx.id ? { ...c, fechamento: Date.now(), contado, observacao } : c)) }));
          const dif = arred(contado - esperado);
          audit({
            tipo: "caixa",
            descricao: `Caixa fechado · ${dif === 0 ? "sem diferença" : `diferença de ${dif.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`}`,
            motivo: observacao || undefined,
            severidade: dif === 0 ? "info" : "atencao",
          });
        },

        salvarCliente: (c) => {
          const novo: Cliente = { criadoEm: Date.now(), ...c, id: c.id ?? uid(), placas: c.placas.map(normalizarPlaca).filter(Boolean) } as Cliente;
          const existia = get().clientes.some((x) => x.id === novo.id);
          set((s) => ({ clientes: existia ? s.clientes.map((x) => (x.id === novo.id ? { ...x, ...novo } : x)) : [...s.clientes, novo] }));
          audit({ tipo: "cliente", descricao: `${existia ? "Cliente atualizado" : "Cliente cadastrado"} · ${novo.nome}`, severidade: novo.tipo === "lista_negra" ? "atencao" : "info" });
          return novo;
        },

        removerCliente: (id) => {
          const c = get().clientes.find((x) => x.id === id);
          set((s) => ({ clientes: s.clientes.filter((x) => x.id !== id) }));
          if (c) audit({ tipo: "cliente", descricao: `Cliente removido · ${c.nome}`, severidade: "atencao" });
        },

        receberMensalidade: (clienteId, forma) => {
          const c = get().clientes.find((x) => x.id === clienteId);
          if (!c || c.tipo !== "mensalista" || !c.mensalidade) return;
          const atual = mesRef(Date.now());
          const ref = c.pagoAte && c.pagoAte >= atual ? proximoMes(c.pagoAte) : c.pagoAte ? proximoMes(c.pagoAte) : atual;
          movimento({ tipo: "mensalidade", forma, valor: c.mensalidade, descricao: `Mensalidade ${ref} · ${c.nome}`, refId: c.id });
          set((s) => ({ clientes: s.clientes.map((x) => (x.id === clienteId ? { ...x, pagoAte: ref } : x)) }));
        },

        adicionarServico: (placa, servicoId, telefone) => {
          const s = get();
          const p = normalizarPlaca(placa);
          const cat = s.config.servicos.find((x) => x.id === servicoId);
          if (!cat) return;
          const v = s.veiculos[p];
          const agora = Date.now();
          set({
            servicos: [
              ...s.servicos,
              { id: uid(), placa: p, modelo: v?.modelo ?? "", servicoId, nome: cat.nome, valor: cat.valor, status: "fila", telefone, pago: false, criadoEm: agora, atualizadoEm: agora },
            ],
          });
        },

        moverServico: (id, status) => set((s) => ({ servicos: s.servicos.map((v) => (v.id === id ? { ...v, status, atualizadoEm: Date.now() } : v)) })),

        receberServico: (id, forma) => {
          const v = get().servicos.find((x) => x.id === id);
          if (!v || v.pago) return;
          movimento({ tipo: "lavajato", forma, valor: v.valor, descricao: `${v.nome} · ${v.placa}`, refId: v.id });
          set((s) => ({ servicos: s.servicos.map((x) => (x.id === id ? { ...x, pago: true, status: "entregue", atualizadoEm: Date.now() } : x)) }));
        },

        removerServico: (id) => set((s) => ({ servicos: s.servicos.filter((v) => v.id !== id) })),

        salvarConfig: (c, descricao) => {
          set((s) => ({ config: { ...s.config, ...c } }));
          if (descricao) audit({ tipo: "tarifa", descricao, severidade: "info" });
        },

        salvarTarifa: (t) => {
          const antes = get().config.tarifas.find((x) => x.id === t.id);
          set((s) => ({
            config: { ...s.config, tarifas: antes ? s.config.tarifas.map((x) => (x.id === t.id ? t : x)) : [...s.config.tarifas, t] },
          }));
          audit({ tipo: "tarifa", descricao: `Tabela de preços ${antes ? "alterada" : "criada"} · ${t.nome}`, severidade: "atencao" });
        },

        removerTarifa: (id) => set((s) => ({ config: { ...s.config, tarifas: s.config.tarifas.filter((t) => t.id !== id) } })),

        salvarUsuario: (u) =>
          set((s) => ({ usuarios: s.usuarios.some((x) => x.id === u.id) ? s.usuarios.map((x) => (x.id === u.id ? u : x)) : [...s.usuarios, u] })),

        removerUsuario: (id) => set((s) => ({ usuarios: s.usuarios.filter((u) => u.id !== id) })),

        registrarAuditoria: audit,
        restaurar: (d) => set({ ...d }),
        resetarDemo: () => set({ ...demo() }),
        limparTudo: () => {
          const d = demo();
          set({
            ...d,
            tickets: [],
            veiculos: {},
            clientes: [],
            caixas: [],
            movimentos: [],
            servicos: [],
            auditoria: [],
            proximoTicket: 1,
          });
        },
      };
    },
    {
      name: "vagou:v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => {
        const { versao, config, usuarios, operadorId, tickets, veiculos, clientes, caixas, movimentos, servicos, auditoria, proximoTicket } = s;
        return { versao, config, usuarios, operadorId, tickets, veiculos, clientes, caixas, movimentos, servicos, auditoria, proximoTicket };
      },
    },
  ),
);

export function resumoCaixa(s: Dados, caixaId: ID) {
  const cx = s.caixas.find((c) => c.id === caixaId);
  const movs = s.movimentos.filter((m) => m.caixaId === caixaId);
  const porForma: Record<string, number> = {};
  let entradas = 0;
  let sangrias = 0;
  let suprimentos = 0;
  for (const m of movs) {
    if (m.tipo === "sangria") sangrias += -m.valor;
    else if (m.tipo === "suprimento") suprimentos += m.valor;
    else {
      porForma[m.forma] = (porForma[m.forma] ?? 0) + m.valor;
      entradas += m.valor;
    }
  }
  const esperadoDinheiro = arred((cx?.trocoInicial ?? 0) + (porForma.dinheiro ?? 0) + suprimentos - sangrias);
  const cancelamentos = s.tickets.filter((t) => t.cancelamento && cx && t.cancelamento.em >= cx.abertura && (!cx.fechamento || t.cancelamento.em <= cx.fechamento)).length;
  return { movs, porForma, entradas: arred(entradas), sangrias: arred(sangrias), suprimentos: arred(suprimentos), esperadoDinheiro, cancelamentos };
}

export const rotuloForma: Record<FormaPagamento, string> = {
  dinheiro: "Dinheiro",
  pix: "PIX",
  debito: "Débito",
  credito: "Crédito",
  mensalista: "Mensalista",
  convenio: "Convênio",
  isento: "Isento",
};

export const rotuloTipoCliente: Record<Cliente["tipo"], string> = {
  mensalista: "Mensalista",
  vip: "VIP",
  especial: "Especial",
  convenio: "Convênio",
  lista_negra: "Lista negra",
};

export const rotuloAuditoria: Record<TipoAuditoria, string> = {
  cancelamento: "Cancelamento",
  correcao_placa: "Placa corrigida",
  desconto: "Desconto",
  lista_negra: "Lista negra",
  tarifa: "Preços",
  caixa: "Caixa",
  diaria: "Diária",
  cliente: "Cliente",
  sistema: "Sistema",
};
