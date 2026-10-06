"use client";

import { useMemo, useState, type ReactNode } from "react";
import { I } from "@/components/icons";
import { Avatar, Empty, Money, PageTitle, Plate, Segmented } from "@/components/ui";
import { useNow } from "@/lib/hooks";
import { arred, brl } from "@/lib/pricing";
import { nomeUsuario, resumoCaixa, rotuloAuditoria, rotuloForma, rotuloTipoCliente, useApp } from "@/lib/store";
import { DIA_MS, mensalistasStatus, porForma, receitas, soma, statusMensalista } from "@/lib/stats";
import type { TipoAuditoria } from "@/lib/types";
import { baixarArquivo, csv, cx, data, dataHora, duracao, hora, iniciais, inicioDoDia, nomeMes } from "@/lib/util";

type Periodo = "hoje" | "ontem" | "7d" | "30d" | "mes" | "custom";
type Aba = "movimento" | "financeiro" | "caixas" | "historico" | "mensalistas" | "convenios" | "lavajato";

interface Coluna<T> {
  t: string;
  v: (r: T) => string | number;
  r?: (r: T) => ReactNode;
  right?: boolean;
}

function Tabela<T>({ cols, rows, vazio = "Nada neste período." }: { cols: Coluna<T>[]; rows: T[]; vazio?: string }) {
  if (rows.length === 0) return <Empty title={vazio} icon={<I.report />} />;
  return (
    <div className="overflow-x-auto scroll-soft">
      <table className="w-full min-w-[720px] border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-line text-left text-[11.5px] text-muted">
            {cols.map((c) => (
              <th key={c.t} className={cx("py-2 pr-3 font-normal", c.right && "text-right")}>
                {c.t}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 500).map((r, i) => (
            <tr key={i} className="border-b border-[#f0f0ee] last:border-0">
              {cols.map((c) => (
                <td key={c.t} className={cx("py-2.5 pr-3 align-middle", c.right && "text-right")}>
                  {c.r ? c.r(r) : c.v(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 500 && <div className="py-3 text-center text-[12px] text-muted">Mostrando 500 de {rows.length}. Exporte para ver tudo.</div>}
    </div>
  );
}

export default function RelatoriosPage() {
  const s = useApp();
  const agora = useNow(60000);
  const [periodo, setPeriodo] = useState<Periodo>("hoje");
  const [aba, setAba] = useState<Aba>("movimento");
  const [de, setDe] = useState(() => new Date(agora - 7 * DIA_MS).toISOString().slice(0, 10));
  const [ate, setAte] = useState(() => new Date(agora).toISOString().slice(0, 10));
  const [tipoHist, setTipoHist] = useState<"todos" | TipoAuditoria>("todos");

  const [ini, fim] = useMemo((): [number, number] => {
    const hoje = inicioDoDia(agora);
    switch (periodo) {
      case "hoje":
        return [hoje, hoje + DIA_MS];
      case "ontem":
        return [hoje - DIA_MS, hoje];
      case "7d":
        return [hoje - 6 * DIA_MS, hoje + DIA_MS];
      case "30d":
        return [hoje - 29 * DIA_MS, hoje + DIA_MS];
      case "mes": {
        const d = new Date(agora);
        return [new Date(d.getFullYear(), d.getMonth(), 1).getTime(), hoje + DIA_MS];
      }
      case "custom":
        return [new Date(de + "T00:00").getTime(), new Date(ate + "T00:00").getTime() + DIA_MS];
    }
  }, [periodo, agora, de, ate]);

  const tickets = useMemo(() => s.tickets.filter((t) => (t.saida ?? t.entrada) >= ini && (t.saida ?? t.entrada) < fim).sort((a, b) => (b.saida ?? b.entrada) - (a.saida ?? a.entrada)), [s.tickets, ini, fim]);
  const recs = useMemo(() => receitas(s, ini, fim), [s, ini, fim]);

  const resumo = {
    total: soma(recs),
    tickets: tickets.filter((t) => t.status === "pago").length,
    cancelados: tickets.filter((t) => t.status === "cancelado").length,
    descontos: arred(tickets.reduce((a, t) => a + (t.desconto ?? 0), 0)),
  };

  // ---------- conteúdo por aba ----------
  let titulo = "";
  let conteudo: ReactNode = null;
  let exportar: (() => (string | number)[][]) | null = null;

  if (aba === "movimento") {
    titulo = "Movimento";
    const cols: Coluna<(typeof tickets)[number]>[] = [
      { t: "Nº", v: (t) => t.numero },
      { t: "Placa", v: (t) => t.placa, r: (t) => <Plate placa={t.placa} /> },
      { t: "Veículo", v: (t) => t.modelo },
      { t: "Entrada", v: (t) => dataHora(t.entrada) },
      { t: "Saída", v: (t) => (t.saida ? hora(t.saida) : "—") },
      { t: "Tempo", v: (t) => (t.saida ? duracao(Math.floor((t.saida - t.entrada) / 60000)) : "no pátio") },
      { t: "Pagamento", v: (t) => (t.pagamento ? rotuloForma[t.pagamento] : "—") },
      {
        t: "Situação",
        v: (t) => t.status,
        r: (t) => <span className={cx("pill", t.status === "pago" ? "pill-ok" : t.status === "cancelado" ? "pill-alert" : "pill-n")}>{t.status === "pago" ? "Pago" : t.status === "cancelado" ? "Cancelado" : "No pátio"}</span>,
      },
      { t: "Valor", v: (t) => (t.valor ?? 0).toFixed(2).replace(".", ","), r: (t) => <Money value={t.valor ?? 0} className="text-[15px]" />, right: true },
    ];
    conteudo = <Tabela cols={cols} rows={tickets} />;
    exportar = () => [cols.map((c) => c.t), ...tickets.map((t) => cols.map((c) => c.v(t)))];
  }

  if (aba === "financeiro") {
    titulo = "Financeiro";
    const formas = porForma(recs);
    const porTipo = { Estacionamento: soma(recs.filter((m) => m.tipo === "ticket")), Mensalidades: soma(recs.filter((m) => m.tipo === "mensalidade")), "Lava-jato": soma(recs.filter((m) => m.tipo === "lavajato")) };
    const dias: { dia: number; valor: number }[] = [];
    for (let d = ini; d < Math.min(fim, inicioDoDia(agora) + DIA_MS); d += DIA_MS) dias.push({ dia: d, valor: soma(recs.filter((m) => m.em >= d && m.em < d + DIA_MS)) });
    conteudo = (
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="tile p-4">
          <div className="mb-1 text-[13px] font-medium">Por forma de pagamento</div>
          {Object.entries(formas).map(([f, v]) => (
            <div key={f} className="row text-[14px]">
              <span>{rotuloForma[f as keyof typeof rotuloForma]}</span>
              <Money value={v ?? 0} className="text-[17px]" />
            </div>
          ))}
        </div>
        <div className="tile p-4">
          <div className="mb-1 text-[13px] font-medium">Por origem</div>
          {Object.entries(porTipo).map(([k, v]) => (
            <div key={k} className="row text-[14px]">
              <span>{k}</span>
              <Money value={v} className="text-[17px]" />
            </div>
          ))}
          <div className="row text-[14px]">
            <span className="text-muted">Descontos concedidos</span>
            <span className="text-alert-ink">−{brl(resumo.descontos)}</span>
          </div>
        </div>
        <div className="tile p-4 lg:col-span-2">
          <div className="mb-1 text-[13px] font-medium">Por dia</div>
          {dias.map((d) => (
            <div key={d.dia} className="row text-[14px]">
              <span>{new Date(d.dia).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })}</span>
              <Money value={d.valor} className="text-[17px]" />
            </div>
          ))}
        </div>
      </div>
    );
    exportar = () => [["Data", "Valor"], ...dias.map((d) => [data(d.dia), d.valor.toFixed(2).replace(".", ",")])];
  }

  if (aba === "caixas") {
    titulo = "Fechamentos de caixa";
    const caixas = s.caixas.filter((c) => c.abertura >= ini && c.abertura < fim).sort((a, b) => b.abertura - a.abertura);
    const linhas = caixas.map((c) => {
      const r = resumoCaixa(s, c.id);
      return { c, r, dif: c.contado !== undefined ? arred(c.contado - r.esperadoDinheiro) : null };
    });
    const cols: Coluna<(typeof linhas)[number]>[] = [
      { t: "Abertura", v: (x) => dataHora(x.c.abertura) },
      { t: "Fechamento", v: (x) => (x.c.fechamento ? hora(x.c.fechamento) : "aberto") },
      { t: "Operador", v: (x) => nomeUsuario(s, x.c.operador) },
      { t: "Recebido", v: (x) => x.r.entradas.toFixed(2).replace(".", ","), r: (x) => <Money value={x.r.entradas} className="text-[15px]" /> },
      { t: "Esperado em dinheiro", v: (x) => x.r.esperadoDinheiro.toFixed(2).replace(".", ",") },
      { t: "Cancelamentos", v: (x) => x.r.cancelamentos },
      {
        t: "Diferença",
        v: (x) => (x.dif === null ? "—" : x.dif.toFixed(2).replace(".", ",")),
        r: (x) => (x.dif === null ? <span className="pill pill-n">Em andamento</span> : <span className={cx("pill", x.dif === 0 ? "pill-ok" : "pill-alert")}>{x.dif === 0 ? "Sem diferença" : brl(x.dif)}</span>),
        right: true,
      },
    ];
    conteudo = <Tabela cols={cols} rows={linhas} />;
    exportar = () => [cols.map((c) => c.t), ...linhas.map((l) => cols.map((c) => c.v(l)))];
  }

  if (aba === "historico") {
    titulo = "Histórico de alterações";
    const itens = s.auditoria.filter((a) => a.em >= ini && a.em < fim && (tipoHist === "todos" || a.tipo === tipoHist));
    conteudo = (
      <>
        <div className="mb-3">
          <Segmented
            value={tipoHist}
            onChange={setTipoHist}
            options={[{ value: "todos" as const, label: "Tudo" }, ...(["cancelamento", "correcao_placa", "desconto", "lista_negra", "tarifa", "caixa"] as TipoAuditoria[]).map((t) => ({ value: t, label: rotuloAuditoria[t] }))]}
          />
        </div>
        {itens.length === 0 && <Empty title="Nenhuma alteração neste período." icon={<I.shield />} />}
        {itens.slice(0, 300).map((a) => (
          <div key={a.id} className="row text-[13.5px]">
            <span className="flex min-w-0 items-center gap-3">
              <Avatar text={iniciais(nomeUsuario(s, a.operador))} />
              <span className="min-w-0">
                <span className="block font-medium">{a.descricao}</span>
                <span className="block text-[12px] text-muted">
                  {dataHora(a.em)} · {nomeUsuario(s, a.operador)}
                  {a.motivo && ` · “${a.motivo}”`}
                  {a.autorizadoPor && ` · autorizado por ${nomeUsuario(s, a.autorizadoPor)}`}
                </span>
              </span>
            </span>
            <span className={cx("pill shrink-0", a.severidade === "alerta" ? "pill-alert" : a.severidade === "atencao" ? "pill-warn" : "pill-n")}>{rotuloAuditoria[a.tipo]}</span>
          </div>
        ))}
      </>
    );
    exportar = () => [["Data", "Tipo", "Descrição", "Motivo", "Operador", "Autorizado por"], ...itens.map((a) => [dataHora(a.em), rotuloAuditoria[a.tipo], a.descricao, a.motivo ?? "", nomeUsuario(s, a.operador), a.autorizadoPor ? nomeUsuario(s, a.autorizadoPor) : ""])];
  }

  if (aba === "mensalistas") {
    titulo = "Mensalistas";
    const ms = mensalistasStatus(s, agora).todos;
    const cols: Coluna<(typeof ms)[number]>[] = [
      { t: "Nome", v: (c) => c.nome },
      { t: "Placas", v: (c) => c.placas.join(", ") },
      { t: "Telefone", v: (c) => c.telefone },
      { t: "Vencimento", v: (c) => `dia ${c.vencimentoDia}` },
      { t: "Pago até", v: (c) => (c.pagoAte ? nomeMes(c.pagoAte) : "—") },
      {
        t: "Situação",
        v: (c) => statusMensalista(s, c.id, agora),
        r: (c) => {
          const st = statusMensalista(s, c.id, agora);
          return <span className={cx("pill", st === "em_dia" ? "pill-ok" : st === "atrasado" ? "pill-alert" : "pill-n")}>{st === "em_dia" ? "Em dia" : st === "atrasado" ? "Em atraso" : "A vencer"}</span>;
        },
      },
      { t: "Mensalidade", v: (c) => (c.mensalidade ?? 0).toFixed(2).replace(".", ","), r: (c) => <Money value={c.mensalidade ?? 0} className="text-[15px]" />, right: true },
    ];
    conteudo = <Tabela cols={cols} rows={ms} vazio="Nenhum mensalista cadastrado." />;
    exportar = () => [cols.map((c) => c.t), ...ms.map((m) => cols.map((c) => c.v(m)))];
  }

  if (aba === "convenios") {
    titulo = "Convênios";
    const convs = s.clientes.filter((c) => c.tipo === "convenio").map((c) => {
      const ts = tickets.filter((t) => t.convenioId === c.id && t.status === "pago");
      return { c, n: ts.length, desconto: arred(ts.reduce((a, t) => a + (t.desconto ?? 0), 0)), pago: arred(ts.reduce((a, t) => a + (t.valor ?? 0), 0)) };
    });
    const cols: Coluna<(typeof convs)[number]>[] = [
      { t: "Parceiro", v: (x) => x.c.nome },
      { t: "Desconto", v: (x) => `${x.c.descontoPct}%` },
      { t: "Tickets validados", v: (x) => x.n },
      { t: "Pago pelo cliente", v: (x) => x.pago.toFixed(2).replace(".", ",") },
      { t: "Valor a cobrar do parceiro", v: (x) => x.desconto.toFixed(2).replace(".", ","), r: (x) => <Money value={x.desconto} className="text-[15px]" />, right: true },
    ];
    conteudo = <Tabela cols={cols} rows={convs} vazio="Nenhum convênio cadastrado." />;
    exportar = () => [cols.map((c) => c.t), ...convs.map((x) => cols.map((c) => c.v(x)))];
  }

  if (aba === "lavajato") {
    titulo = "Lava-jato";
    const sv = s.servicos.filter((v) => v.criadoEm >= ini && v.criadoEm < fim);
    const cols: Coluna<(typeof sv)[number]>[] = [
      { t: "Data", v: (v) => dataHora(v.criadoEm) },
      { t: "Placa", v: (v) => v.placa, r: (v) => <Plate placa={v.placa} /> },
      { t: "Serviço", v: (v) => v.nome },
      { t: "Situação", v: (v) => v.status },
      { t: "Pago", v: (v) => (v.pago ? "sim" : "não") },
      { t: "Valor", v: (v) => v.valor.toFixed(2).replace(".", ","), r: (v) => <Money value={v.valor} className="text-[15px]" />, right: true },
    ];
    conteudo = <Tabela cols={cols} rows={sv} />;
    exportar = () => [cols.map((c) => c.t), ...sv.map((v) => cols.map((c) => c.v(v)))];
  }

  const ABAS: { v: Aba; l: string }[] = [
    { v: "movimento", l: "Movimento" },
    { v: "financeiro", l: "Financeiro" },
    { v: "caixas", l: "Caixas" },
    { v: "historico", l: "Histórico de alterações" },
    { v: "mensalistas", l: rotuloTipoCliente.mensalista + "s" },
    { v: "convenios", l: "Convênios" },
    { v: "lavajato", l: "Lava-jato" },
  ];

  return (
    <div className="mx-auto max-w-[1280px]">
      <PageTitle sec="Relatórios" title="Tudo registrado," muted="nada some sem explicação.">
        {exportar && (
          <button className="btn btn-light no-print" onClick={() => baixarArquivo(`vagou-${aba}-${data(ini).replace("/", "-")}.csv`, "﻿" + csv(exportar!()), "text/csv;charset=utf-8")}>
            <I.download size={15} /> Exportar planilha
          </button>
        )}
        <button className="btn btn-light no-print" onClick={() => window.print()}>
          <I.printer size={15} /> Imprimir
        </button>
      </PageTitle>

      <div className="no-print mb-4 flex flex-wrap items-center gap-3">
        <Segmented
          value={periodo}
          onChange={setPeriodo}
          options={[
            { value: "hoje", label: "Hoje" },
            { value: "ontem", label: "Ontem" },
            { value: "7d", label: "7 dias" },
            { value: "30d", label: "30 dias" },
            { value: "mes", label: "Este mês" },
            { value: "custom", label: "Escolher datas" },
          ]}
        />
        {periodo === "custom" && (
          <span className="flex items-center gap-2 text-[13px]">
            <input type="date" className="input !w-auto !py-1.5" value={de} onChange={(e) => setDe(e.target.value)} />
            até
            <input type="date" className="input !w-auto !py-1.5" value={ate} onChange={(e) => setAte(e.target.value)} />
          </span>
        )}
      </div>

      <div className="card mb-4 grid grid-cols-2 divide-line md:grid-cols-4 md:divide-x">
        <div className="px-5 py-4">
          <div className="label">Recebido</div>
          <Money value={resumo.total} className="text-[26px]" />
        </div>
        <div className="px-5 py-4">
          <div className="label">Tickets pagos</div>
          <div className="num text-[26px]">{resumo.tickets}</div>
        </div>
        <div className="px-5 py-4">
          <div className="label">Cancelamentos</div>
          <div className={cx("num text-[26px]", resumo.cancelados > 0 && "text-alert-ink")}>{resumo.cancelados}</div>
        </div>
        <div className="px-5 py-4">
          <div className="label">Descontos concedidos</div>
          <Money value={resumo.descontos} className="text-[26px]" />
        </div>
      </div>

      <section className="glass p-5">
        <div className="no-print mb-4 flex flex-wrap gap-1.5 border-b border-line pb-4">
          {ABAS.map((a) => (
            <button key={a.v} className="chip" data-on={aba === a.v} onClick={() => setAba(a.v)}>
              {a.l}
            </button>
          ))}
        </div>
        <h2 className="num mb-3 text-[24px]">{titulo}</h2>
        {conteudo}
      </section>
    </div>
  );
}
