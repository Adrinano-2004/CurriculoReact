"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar, Bars, Delta, Kpi, Money, PageTitle, Plate, Segmented } from "@/components/ui";
import { useNow } from "@/lib/hooks";
import { brl } from "@/lib/pricing";
import { rotuloForma, useApp } from "@/lib/store";
import {
  candidatosMensalista,
  DIA_MS,
  desempenhoOperadores,
  mapaDeCalor,
  mediaPermanencia,
  porForma,
  receitaPorDia,
  receitas,
  soma,
  ticketMedio,
  ticketsSaidos,
  variacao,
} from "@/lib/stats";
import { cx, duracao, iniciais, inicioDoDia } from "@/lib/util";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const HORAS = Array.from({ length: 15 }, (_, i) => i + 7); // 7h às 21h

export default function EstatisticasPage() {
  const s = useApp();
  const agora = useNow(60000);
  const [dias, setDias] = useState<"7" | "14" | "28">("28");
  const n = Number(dias);

  const d = useMemo(() => {
    const fim = inicioDoDia(agora) + DIA_MS;
    const ini = fim - n * DIA_MS;
    const iniAnt = ini - n * DIA_MS;
    const primeiro = s.tickets.reduce((m, t) => Math.min(m, t.entrada), Infinity);
    const comparar = primeiro <= iniAnt + DIA_MS;
    const rec = receitas(s, ini, fim);
    const recAnt = receitas(s, iniAnt, ini);
    const saidos = ticketsSaidos(s, ini, fim);
    const saidosAnt = ticketsSaidos(s, iniAnt, ini);
    const porDia = receitaPorDia(s, agora, n);
    const calor = mapaDeCalor(s, ini, fim);
    const maxCalor = Math.max(...calor.flatMap((l) => HORAS.map((h) => l[h] ?? 0)));
    const buckets = [
      ["até 30min", 0, 30],
      ["30min–1h", 30, 60],
      ["1–2h", 60, 120],
      ["2–4h", 120, 240],
      ["4–8h", 240, 480],
      ["mais de 8h", 480, 1e9],
    ] as const;
    const perm = buckets.map(([l, a, b]) => ({ l, n: saidos.filter((t) => (t.saida! - t.entrada) / 60000 >= a && (t.saida! - t.entrada) / 60000 < b).length }));
    const diasAbertos = new Set(saidos.map((t) => inicioDoDia(t.entrada))).size || 1;
    return {
      total: soma(rec),
      varTotal: comparar ? variacao(soma(rec), soma(recAnt)) : NaN,
      ticketMedio: ticketMedio(saidos),
      varTicket: comparar ? variacao(ticketMedio(saidos), ticketMedio(saidosAnt)) : NaN,
      tempo: mediaPermanencia(saidos),
      giro: saidos.length / diasAbertos / s.config.vagas,
      porDia,
      calor,
      maxCalor,
      perm,
      mix: {
        Avulso: soma(rec.filter((m) => m.tipo === "ticket")),
        Mensalidades: soma(rec.filter((m) => m.tipo === "mensalidade")),
        "Lava-jato": soma(rec.filter((m) => m.tipo === "lavajato")),
      },
      formas: porForma(rec),
      candidatos: candidatosMensalista(s, ini, fim, 6),
      equipe: desempenhoOperadores(s, ini, fim).filter((x) => x.atendimentos > 0),
    };
  }, [s, agora, n]);

  const maxDia = d.porDia.reduce((m, x, i, a) => (x.valor > a[m]!.valor ? i : m), 0);
  const totalMix = Object.values(d.mix).reduce((a, b) => a + b, 0) || 1;
  const mediaTaxa = d.equipe.length ? d.equipe.reduce((a, x) => a + x.taxaCancelamento, 0) / d.equipe.length : 0;

  return (
    <div className="mx-auto max-w-[1280px]">
      <PageTitle sec="Estatísticas" title="Entenda o seu movimento," muted="decida com números.">
        <Segmented
          value={dias}
          onChange={setDias}
          options={[
            { value: "7", label: "7 dias" },
            { value: "14", label: "14 dias" },
            { value: "28", label: "28 dias" },
          ]}
        />
      </PageTitle>

      <div className="card mb-3 grid grid-cols-2 divide-line md:grid-cols-4 md:divide-x">
        <Kpi label={`Recebido em ${n} dias`} value={<Money value={d.total} cents={false} />} extra={<Delta value={d.varTotal} />} spark={d.porDia.map((x) => x.valor)} />
        <Kpi label="Ticket médio" value={<Money value={d.ticketMedio} />} extra={<Delta value={d.varTicket} />} />
        <Kpi label="Tempo médio no pátio" value={duracao(d.tempo)} />
        <Kpi label="Giro por vaga / dia" value={d.giro.toFixed(1).replace(".", ",")} extra={<span className="text-[11px] text-muted">carros</span>} />
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.4fr_1fr]">
        <section className="card flex flex-col p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-medium">Recebido por dia</h2>
            <span className="chip">{n} dias</span>
          </div>
          <div className="my-3 text-center">
            <div className="label">Melhor dia</div>
            <div className="num text-[26px]">
              {new Date(d.porDia[maxDia]!.dia).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" })} · <span className="text-muted-2">{brl(d.porDia[maxDia]!.valor)}</span>
            </div>
          </div>
          <div className="min-h-[200px] flex-1">
            <Bars values={d.porDia.map((x) => x.valor)} highlight={[maxDia]} labels={d.porDia.map((x) => new Date(x.dia).toLocaleDateString("pt-BR"))} />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-muted">
            <span>{new Date(d.porDia[0]!.dia).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</span>
            <span>hoje</span>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="mb-1 text-[14px] font-medium">De onde vem o dinheiro</h2>
          <div className="my-3 flex h-3 overflow-hidden rounded-full bg-tile">
            {Object.entries(d.mix).map(([k, v], i) => (
              <i key={k} style={{ flex: v, background: ["#2A2A29", "#9c9c99", "#d8d8d5"][i] }} />
            ))}
          </div>
          {Object.entries(d.mix).map(([k, v], i) => (
            <div key={k} className="row text-[13.5px]">
              <span className="flex items-center gap-2">
                <i className="size-2.5 rounded-full" style={{ background: ["#2A2A29", "#9c9c99", "#d8d8d5"][i] }} />
                {k}
              </span>
              <span className="flex items-center gap-3">
                <span className="text-[11.5px] text-muted">{Math.round((v / totalMix) * 100)}%</span>
                <Money value={v} className="text-[16px]" cents={false} />
              </span>
            </div>
          ))}
          <h2 className="mb-1 mt-5 text-[14px] font-medium">Formas de pagamento</h2>
          {Object.entries(d.formas)
            .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
            .map(([f, v]) => (
              <div key={f} className="row text-[13.5px]">
                <span>{rotuloForma[f as keyof typeof rotuloForma]}</span>
                <Money value={v ?? 0} className="text-[16px]" cents={false} />
              </div>
            ))}
        </section>
      </div>

      <section className="card mt-3 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-[14px] font-medium">Mapa de movimento</h2>
            <p className="text-[12.5px] text-muted">Média de entradas por hora em cada dia da semana. Use para planejar a escala e as promoções em horários vazios.</p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted">
            menos
            {[0.08, 0.3, 0.55, 0.8, 1].map((o) => (
              <i key={o} className="size-3 rounded-[3px]" style={{ background: `rgba(42,42,41,${o})` }} />
            ))}
            mais
          </div>
        </div>
        <div className="overflow-x-auto scroll-soft">
          <div className="grid min-w-[640px] gap-1" style={{ gridTemplateColumns: `44px repeat(${HORAS.length}, 1fr)` }}>
            <span />
            {HORAS.map((h) => (
              <span key={h} className="text-center text-[10.5px] text-muted">
                {h}h
              </span>
            ))}
            {[1, 2, 3, 4, 5, 6, 0].map((dia) => (
              <div key={dia} className="contents">
                <span className="self-center text-[12px] text-muted">{DIAS_SEMANA[dia]}</span>
                {HORAS.map((h) => {
                  const v = d.calor[dia]![h] ?? 0;
                  const o = d.maxCalor ? v / d.maxCalor : 0;
                  return <span key={h} title={`${DIAS_SEMANA[dia]} ${h}h: ${v.toFixed(1)} entradas`} className="h-8 rounded-[6px]" style={{ background: o < 0.02 ? "#efefed" : `rgba(42,42,41,${0.08 + o * 0.92})` }} />;
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <section className="card flex flex-col p-5">
          <h2 className="mb-3 text-[14px] font-medium">Quanto tempo os carros ficam</h2>
          <div className="flex flex-1 items-end gap-3">
            {d.perm.map((p, i) => {
              const max = Math.max(...d.perm.map((x) => x.n)) || 1;
              return (
                <div key={p.l} className="flex flex-1 flex-col items-center gap-2">
                  <span className="num text-[15px]">{p.n}</span>
                  <i className={cx("w-full rounded-[6px]", i === d.perm.findIndex((x) => x.n === max) ? "bg-dark" : "bg-[#d8d8d5]")} style={{ height: `${Math.max(6, (p.n / max) * 140)}px` }} />
                  <span className="text-center text-[10.5px] leading-tight text-muted">{p.l}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card p-5">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-[14px] font-medium">Clientes que mais voltam</h2>
            <Link href="/app/clientes" className="chip">
              Oferecer mensal
            </Link>
          </div>
          <p className="mb-2 text-[12px] text-muted">Avulsos frequentes: bons candidatos a mensalista.</p>
          {d.candidatos.map((c) => (
            <div key={c.placa} className="row text-[13px]">
              <span className="flex items-center gap-2.5">
                <Plate placa={c.placa} /> {c.modelo}
              </span>
              <span className="text-muted">
                {c.visitas}× · {brl(c.gasto)}
              </span>
            </div>
          ))}
        </section>

        <section className="card p-5">
          <h2 className="mb-1 text-[14px] font-medium">Equipe</h2>
          <p className="mb-2 text-[12px] text-muted">Taxa de cancelamento muito acima da média merece atenção.</p>
          {d.equipe.map((x) => {
            const fora = x.taxaCancelamento > Math.max(2, mediaTaxa * 2);
            return (
              <div key={x.usuario.id} className="row text-[13px]">
                <span className="flex items-center gap-2.5">
                  <Avatar text={iniciais(x.usuario.nome)} />
                  <span>
                    <span className="block font-medium">{x.usuario.nome}</span>
                    <span className="block text-[11.5px] text-muted">
                      {x.atendimentos} atendimentos · {brl(x.recebido)}
                    </span>
                  </span>
                </span>
                <span className={cx("pill", fora ? "pill-alert" : "pill-n")}>{x.taxaCancelamento.toFixed(1).replace(".", ",")}% canc.</span>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
