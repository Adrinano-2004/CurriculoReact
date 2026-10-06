"use client";

import Link from "next/link";
import { useMemo } from "react";
import { I } from "@/components/icons";
import { Bars, Delta, Kpi, Money, Plate } from "@/components/ui";
import { useNow } from "@/lib/hooks";
import { caixaAberto, rotuloForma, useApp } from "@/lib/store";
import { DIA_MS, mensalistasStatus, noPatio, porForma, receitaPorDia, receitas, soma, ticketsEntrados, ticketsSaidos, variacao } from "@/lib/stats";
import { cx, dataLonga, duracao, hora, inicioDoDia } from "@/lib/util";

function saudacao(ts: number) {
  const h = new Date(ts).getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

export default function Painel() {
  const s = useApp();
  const agora = useNow();
  const hoje = inicioDoDia(agora);
  const operador = s.usuarios.find((u) => u.id === s.operadorId);

  const d = useMemo(() => {
    const recHoje = receitas(s, hoje, hoje + DIA_MS);
    const recSemanaPassada = receitas(s, hoje - 7 * DIA_MS, agora - 7 * DIA_MS);
    const entradasHoje = ticketsEntrados(s, hoje, hoje + DIA_MS);
    const entradasSemPass = ticketsEntrados(s, hoje - 7 * DIA_MS, agora - 7 * DIA_MS);
    const patio = noPatio(s);
    const ms = mensalistasStatus(s, agora);

    // entradas a cada 20 minutos, das 6h às 22h
    const ini = hoje + 6 * 3600000;
    const bins = Array(48).fill(0) as number[];
    for (const t of entradasHoje) {
      const i = Math.floor((t.entrada - ini) / (20 * 60000));
      if (i >= 0 && i < 48) bins[i]!++;
    }
    const pico = bins.indexOf(Math.max(...bins));
    const porHora = Array.from({ length: 16 }, (_, h) => bins.slice(h * 3, h * 3 + 3).reduce((a, b) => a + b, 0));
    const horaPico = porHora.indexOf(Math.max(...porHora)) + 6;

    const ultimas = [
      ...entradasHoje.map((t) => ({ t, em: t.entrada, tipo: "entrada" as const })),
      ...ticketsSaidos(s, hoje, hoje + DIA_MS).map((t) => ({ t, em: t.saida!, tipo: "saida" as const })),
      ...s.tickets.filter((t) => t.cancelamento && t.cancelamento.em >= hoje).map((t) => ({ t, em: t.cancelamento!.em, tipo: "cancelado" as const })),
    ]
      .sort((a, b) => b.em - a.em)
      .slice(0, 8);

    const longos = patio.filter((t) => agora - t.entrada > s.config.alertaHoras * 3600000);
    const ljProntos = s.servicos.filter((v) => v.status === "pronto");
    const rec14 = receitaPorDia(s, agora, 14);
    const formas = porForma(recHoje);

    return {
      recHoje: soma(recHoje),
      varRec: variacao(soma(recHoje), soma(recSemanaPassada)),
      atendidos: entradasHoje.length,
      varAtend: variacao(entradasHoje.length, entradasSemPass.length),
      patio,
      ms,
      bins,
      pico,
      horaPico,
      maxHora: Math.max(...porHora),
      ultimas,
      longos,
      ljProntos,
      rec14,
      formas,
      spark: rec14.map((x) => x.valor),
    };
  }, [s, hoje, agora]);

  const caixa = caixaAberto(s);
  const totalFormas = Object.values(d.formas).reduce((a, b) => a + (b ?? 0), 0) || 1;
  const formasOrdem = (["pix", "dinheiro", "debito", "credito"] as const).map((f) => ({ f, v: d.formas[f] ?? 0 }));

  return (
    <div className="mx-auto max-w-[1280px]">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="num text-[32px] leading-tight md:text-[38px]">
            {saudacao(agora)}, {operador?.nome}
          </h1>
          <div className="mt-1 text-[13px] text-muted">{dataLonga(agora)} · {s.config.empresa.nome}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/app/patio?foco=1" className="btn btn-dark">
            <I.plus size={16} /> Nova entrada
          </Link>
          <Link href="/app/patio?foco=1" className="btn btn-light">
            Registrar saída
          </Link>
          <Link href="/app/caixa" className="btn btn-light">
            {caixa ? "Fechar caixa" : "Abrir caixa"}
          </Link>
        </div>
      </div>

      <div className="card mb-3 grid grid-cols-2 divide-line md:grid-cols-4 md:divide-x">
        <Kpi label="Recebido hoje" value={<Money value={d.recHoje} />} extra={<Delta value={d.varRec} />} spark={d.spark} />
        <Kpi
          label="Carros no pátio"
          value={
            <>
              {d.patio.length}
              <span className="text-muted-2"> / {s.config.vagas}</span>
            </>
          }
          extra={<span className="pill pill-n">{Math.max(0, s.config.vagas - d.patio.length)} livres</span>}
        />
        <Kpi label="Atendidos hoje" value={d.atendidos} extra={<Delta value={d.varAtend} />} />
        <Kpi
          label="Mensalistas"
          value={d.ms.todos.length}
          extra={d.ms.atrasados.length ? <span className="text-[11px] font-semibold text-alert-ink">{d.ms.atrasados.length} em atraso</span> : <span className="text-[11px] font-semibold text-ok-ink">todos em dia</span>}
        />
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.3fr_1fr]">
        <section className="card flex min-h-[340px] flex-col p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-medium">Movimento de hoje</h2>
            <span className="chip">A cada 20 min</span>
          </div>
          <div className="my-3 text-center">
            <div className="label">Pico às {String(d.horaPico).padStart(2, "0")}h</div>
            <div className="num text-[28px]">
              {d.maxHora} entradas<span className="text-muted-2">/h</span>
            </div>
          </div>
          <div className="min-h-[170px] flex-1">
            <Bars values={d.bins} highlight={[d.pico]} labels={d.bins.map((_, i) => hora(hoje + 6 * 3600000 + i * 20 * 60000))} />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-muted">
            {["06h", "08h", "10h", "12h", "14h", "16h", "18h", "20h", "22h"].map((h) => (
              <span key={h}>{h}</span>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-[14px] font-medium">Últimas movimentações</h2>
            <Link href="/app/relatorios" className="chip">
              Ver todas
            </Link>
          </div>
          {d.ultimas.map(({ t, em, tipo }) => (
            <div key={t.id + tipo} className="row text-[13px]">
              <span className="flex min-w-0 items-center gap-2.5">
                <Plate placa={t.placa} />
                <span className="truncate">{t.modelo}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                {tipo === "entrada" && <span className="pill pill-n">Entrada</span>}
                {tipo === "saida" &&
                  (t.pagamento === "mensalista" ? (
                    <span className="pill pill-n">Mensalista</span>
                  ) : (
                    <span className={cx("pill", (t.desconto ?? 0) > 0 ? "pill-warn" : "pill-ok")}>
                      Saída · {(t.valor ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  ))}
                {tipo === "cancelado" && <span className="pill pill-alert">Cancelado</span>}
                <span className="w-10 text-right text-[11.5px] text-muted">{hora(em)}</span>
              </span>
            </div>
          ))}
        </section>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[14px] font-medium">Recebido nos últimos 14 dias</h2>
            <Link href="/app/estatisticas" className="text-muted hover:text-ink" aria-label="Ver estatísticas">
              <I.arrowUpRight size={16} />
            </Link>
          </div>
          <div className="h-[120px]">
            <Bars values={d.rec14.map((x) => x.valor)} highlight={[13]} labels={d.rec14.map((x) => new Date(x.dia).toLocaleDateString("pt-BR"))} />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-muted">
            <span>{new Date(d.rec14[0]!.dia).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</span>
            <span>hoje</span>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="mb-3 text-[14px] font-medium">Formas de pagamento hoje</h2>
          <div className="mb-3 flex h-2.5 overflow-hidden rounded-full bg-tile">
            {formasOrdem.map(({ f, v }, i) => (
              <i key={f} style={{ flex: v, background: ["#2A2A29", "#7d7d7a", "#b8b8b5", "#d8d8d5"][i] }} />
            ))}
          </div>
          {formasOrdem.map(({ f, v }, i) => (
            <div key={f} className="row text-[13px]">
              <span className="flex items-center gap-2">
                <i className="size-2.5 rounded-full" style={{ background: ["#2A2A29", "#7d7d7a", "#b8b8b5", "#d8d8d5"][i] }} />
                {rotuloForma[f]}
              </span>
              <span className="flex items-center gap-3">
                <span className="text-[11.5px] text-muted">{Math.round((v / totalFormas) * 100)}%</span>
                <Money value={v} className="text-[16px]" />
              </span>
            </div>
          ))}
        </section>

        <section className="card p-5 md:col-span-2 xl:col-span-1">
          <h2 className="mb-2 text-[14px] font-medium">Atenção agora</h2>
          {d.longos.length === 0 && d.ms.atrasados.length === 0 && d.ljProntos.length === 0 && <div className="py-6 text-center text-[13px] text-muted">Tudo tranquilo por aqui. ✓</div>}
          {d.longos.slice(0, 3).map((t) => (
            <Link key={t.id} href={`/app/patio?placa=${t.placa}`} className="row text-[13px]">
              <span className="flex items-center gap-2.5">
                <Plate placa={t.placa} />
                {t.modelo}
              </span>
              <span className="pill pill-alert">{duracao(Math.floor((agora - t.entrada) / 60000))} no pátio</span>
            </Link>
          ))}
          {d.ms.atrasados.length > 0 && (
            <Link href="/app/clientes?tipo=mensalista" className="row text-[13px]">
              <span>Mensalistas com pagamento atrasado</span>
              <span className="pill pill-alert">{d.ms.atrasados.length}</span>
            </Link>
          )}
          {d.ljProntos.length > 0 && (
            <Link href="/app/lava-jato" className="row text-[13px]">
              <span>Lava-jato: carros prontos para entrega</span>
              <span className="pill pill-ok">{d.ljProntos.length}</span>
            </Link>
          )}
        </section>
      </div>
    </div>
  );
}
