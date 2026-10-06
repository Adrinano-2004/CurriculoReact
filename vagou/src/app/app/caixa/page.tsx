"use client";

import { useMemo, useState } from "react";
import { I } from "@/components/icons";
import { Bars, Field, Modal, Money, MoneyInput, PageTitle, Segmented, toast } from "@/components/ui";
import { arred, brl } from "@/lib/pricing";
import { caixaAberto, nomeUsuario, resumoCaixa, rotuloForma, useApp } from "@/lib/store";
import type { Caixa } from "@/lib/types";
import { cx, data, dataHora, hora, linkWhatsApp } from "@/lib/util";

export default function CaixaPage() {
  const s = useApp();
  const abrir = useApp((x) => x.abrirCaixa);
  const atual = caixaAberto(s);
  const [troco, setTroco] = useState(100);
  const [ver, setVer] = useState<string | null>(null);
  const historico = useMemo(() => s.caixas.filter((c) => c.fechamento).sort((a, b) => b.abertura - a.abertura).slice(0, 30), [s.caixas]);

  return (
    <div className="mx-auto max-w-[1280px]">
      <PageTitle sec="Caixa" title="O caixa fecha" muted="sem susto." />
      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        {atual ? (
          <CaixaDetalhe caixa={atual} />
        ) : (
          <div className="glass flex flex-col items-start gap-4 p-8">
            <span className="tag">Caixa fechado</span>
            <div className="num text-[30px]">Abrir caixa</div>
            <p className="max-w-md text-[15px] text-muted">Informe o troco que está na gaveta. Cada turno tem seu próprio fechamento, separado por funcionário.</p>
            <div className="w-full max-w-[240px]">
              <Field label="Troco inicial">
                <MoneyInput value={troco} onChange={setTroco} autoFocus />
              </Field>
            </div>
            <button
              className="btn btn-dark btn-lg"
              onClick={() => {
                abrir(troco);
                toast("Caixa aberto");
              }}
            >
              Abrir caixa · {nomeUsuario(s, s.operadorId)}
            </button>
          </div>
        )}

        <section className="card p-5">
          <h2 className="num mb-2 text-[22px]">Fechamentos anteriores</h2>
          <div className="max-h-[720px] overflow-y-auto scroll-soft">
            {historico.map((c) => {
              const r = resumoCaixa(s, c.id);
              const dif = arred((c.contado ?? 0) - r.esperadoDinheiro);
              return (
                <button key={c.id} onClick={() => setVer(c.id)} className="row w-full text-left text-[13px] hover:bg-tile">
                  <span>
                    <span className="block font-medium">
                      {data(c.abertura)} · {hora(c.abertura)}–{hora(c.fechamento!)}
                    </span>
                    <span className="text-[12px] text-muted">{nomeUsuario(s, c.operador)}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Money value={r.entradas} className="text-[15px]" />
                    <span className={cx("pill", dif === 0 ? "pill-ok" : "pill-alert")}>{dif === 0 ? "OK" : brl(dif)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <Modal open={!!ver} onClose={() => setVer(null)} title="Fechamento" width={820}>
        {ver && <CaixaDetalhe caixa={s.caixas.find((c) => c.id === ver)!} embutido />}
      </Modal>
    </div>
  );
}

function CaixaDetalhe({ caixa, embutido }: { caixa: Caixa; embutido?: boolean }) {
  const s = useApp();
  const r = useMemo(() => resumoCaixa(s, caixa.id), [s, caixa.id]);
  const [mov, setMov] = useState<null | "sangria" | "suprimento">(null);
  const [fechar, setFechar] = useState(false);
  const aberto = !caixa.fechamento;
  const fim = caixa.fechamento ?? Date.now();

  // recebimentos a cada 15 min
  const n = Math.max(8, Math.ceil((fim - caixa.abertura) / (15 * 60000)));
  const bins = Array(n).fill(0) as number[];
  for (const m of r.movs) if (m.valor > 0 && m.tipo !== "suprimento") bins[Math.min(n - 1, Math.floor((m.em - caixa.abertura) / (15 * 60000)))]! += m.valor;
  const pico = bins.indexOf(Math.max(...bins));
  const formas = (["dinheiro", "pix", "debito", "credito"] as const).map((f) => ({ f, v: r.porForma[f] ?? 0 }));
  const dif = caixa.contado !== undefined ? arred(caixa.contado - r.esperadoDinheiro) : 0;

  const resumoTexto = `Fechamento de caixa · ${s.config.empresa.nome}\n${dataHora(caixa.abertura)} – ${hora(fim)} · ${nomeUsuario(s, caixa.operador)}\nTotal recebido: ${brl(r.entradas)}\n${formas.map((x) => `${rotuloForma[x.f]}: ${brl(x.v)}`).join("\n")}\nCancelamentos: ${r.cancelamentos}${caixa.contado !== undefined ? `\n${dif === 0 ? "Caixa sem diferença ✓" : `Diferença: ${brl(dif)}`}` : ""}`;

  return (
    <div className={cx(!embutido && "glass p-6")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="num text-[28px] leading-tight">{aberto ? "Caixa aberto" : "Caixa fechado"}</div>
          <div className="text-[13px] text-muted">
            {dataHora(caixa.abertura)} {caixa.fechamento ? `às ${hora(caixa.fechamento)}` : "· em andamento"} · Operador: {nomeUsuario(s, caixa.operador)}
          </div>
        </div>
        {caixa.contado !== undefined ? (
          <span className={cx("pill !px-3 !py-1.5 !text-[12px]", dif === 0 ? "pill-ok" : "pill-alert")}>{dif === 0 ? "Sem diferença" : `Diferença ${brl(dif)}`}</span>
        ) : (
          <span className="pill pill-ok !px-3 !py-1.5 !text-[12px]">Em andamento</span>
        )}
      </div>

      <div className="tile mt-5 grid grid-cols-2 sm:grid-cols-5">
        {formas.map(({ f, v }) => (
          <div key={f} className="border-line px-4 py-3 sm:border-r">
            <div className="label">{rotuloForma[f]}</div>
            <Money value={v} className="text-[22px]" />
          </div>
        ))}
        <div className="px-4 py-3">
          <div className="label">Total</div>
          <Money value={r.entradas} className="text-[22px]" />
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="tile flex h-[230px] flex-col p-4">
          <div className="mb-2 text-[13px] font-medium">Recebimentos ao longo do turno</div>
          <div className="flex-1">
            <Bars values={bins} highlight={[pico]} />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-muted">
            <span>{hora(caixa.abertura)}</span>
            <span>{hora(fim)}</span>
          </div>
        </div>
        <div className="tile p-4 text-[13.5px]">
          <div className="mb-1 text-[13px] font-medium">Conferência do dinheiro</div>
          <div className="row">
            <span className="text-muted">Troco inicial</span>
            <span>{brl(caixa.trocoInicial)}</span>
          </div>
          <div className="row">
            <span className="text-muted">Recebido em dinheiro</span>
            <span>{brl(r.porForma.dinheiro ?? 0)}</span>
          </div>
          <div className="row">
            <span className="text-muted">Sangrias / suprimentos</span>
            <span>
              −{brl(r.sangrias)} / +{brl(r.suprimentos)}
            </span>
          </div>
          <div className="row font-medium">
            <span>Esperado na gaveta</span>
            <span>{brl(r.esperadoDinheiro)}</span>
          </div>
          {caixa.contado !== undefined && (
            <div className="row">
              <span className="text-muted">Contado</span>
              <span>{brl(caixa.contado)}</span>
            </div>
          )}
          <div className="row">
            <span className="text-muted">Cancelamentos</span>
            <span className={cx(r.cancelamentos > 0 && "text-alert-ink")}>{r.cancelamentos}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {aberto && (
          <>
            <button className="btn btn-dark" onClick={() => setFechar(true)}>
              Fechar caixa
            </button>
            <button className="btn btn-light" onClick={() => setMov("sangria")}>
              Sangria
            </button>
            <button className="btn btn-light" onClick={() => setMov("suprimento")}>
              Suprimento
            </button>
          </>
        )}
        <button className="btn btn-light" onClick={() => window.open(`/imprimir/caixa/${caixa.id}`, "_blank", "width=420,height=720")}>
          <I.printer size={16} /> Imprimir
        </button>
        <a className="btn btn-light" href={linkWhatsApp(s.config.empresa.telefone, resumoTexto)} target="_blank" rel="noreferrer">
          <I.chat size={16} /> Enviar resumo
        </a>
      </div>

      <div className="mt-5">
        <div className="mb-1 text-[13px] font-medium">Movimentos ({r.movs.length})</div>
        <div className="max-h-[300px] overflow-y-auto scroll-soft">
          {[...r.movs].sort((a, b) => b.em - a.em).map((m) => (
            <div key={m.id} className="row text-[13px]">
              <span className="flex min-w-0 items-center gap-3">
                <span className="w-11 shrink-0 text-muted">{hora(m.em)}</span>
                <span className="truncate">{m.descricao}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="pill pill-n">{m.tipo === "sangria" ? "Sangria" : m.tipo === "suprimento" ? "Suprimento" : rotuloForma[m.forma]}</span>
                <span className={cx("w-24 text-right", m.valor < 0 && "text-alert-ink")}>{brl(m.valor)}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {mov && <MovimentoModal tipo={mov} onClose={() => setMov(null)} />}
      {fechar && <FecharModal esperado={r.esperadoDinheiro} onClose={() => setFechar(false)} />}
    </div>
  );
}

function MovimentoModal({ tipo, onClose }: { tipo: "sangria" | "suprimento"; onClose: () => void }) {
  const movimentar = useApp((x) => x.movimentarCaixa);
  const [valor, setValor] = useState(0);
  const [desc, setDesc] = useState(tipo === "sangria" ? "Depósito no cofre" : "Reforço de troco");
  return (
    <Modal
      open
      onClose={onClose}
      title={tipo === "sangria" ? "Sangria" : "Suprimento"}
      width={420}
      footer={
        <>
          <button className="btn btn-light" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-dark"
            disabled={valor <= 0}
            onClick={() => {
              movimentar(tipo, valor, desc);
              toast(`${tipo === "sangria" ? "Sangria" : "Suprimento"} registrado`);
              onClose();
            }}
          >
            Registrar
          </button>
        </>
      }
    >
      <Field label="Valor">
        <MoneyInput value={valor} onChange={setValor} autoFocus />
      </Field>
      <Field label="Descrição" className="mt-3">
        <input className="input" value={desc} onChange={(e) => setDesc(e.target.value)} />
      </Field>
    </Modal>
  );
}

function FecharModal({ esperado, onClose }: { esperado: number; onClose: () => void }) {
  const fechar = useApp((x) => x.fecharCaixa);
  const [contado, setContado] = useState(0);
  const [obs, setObs] = useState("");
  const [modo, setModo] = useState<"total" | "notas">("total");
  const [notas, setNotas] = useState<Record<string, number>>({});
  const cedulas = [200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.25, 0.1, 0.05];
  const totalNotas = arred(cedulas.reduce((a, c) => a + c * (notas[c] ?? 0), 0));
  const valor = modo === "total" ? contado : totalNotas;
  const dif = arred(valor - esperado);
  return (
    <Modal
      open
      onClose={onClose}
      title="Fechar caixa"
      width={520}
      footer={
        <>
          <button className="btn btn-light" onClick={onClose}>
            Voltar
          </button>
          <button
            className="btn btn-dark"
            disabled={dif !== 0 && obs.trim().length < 3}
            onClick={() => {
              fechar(valor, obs);
              toast(dif === 0 ? "Caixa fechado sem diferença" : "Caixa fechado com diferença registrada", dif === 0 ? "ok" : "alert");
              onClose();
            }}
          >
            Fechar caixa
          </button>
        </>
      }
    >
      <p className="mb-4 text-[14px] text-muted">Conte o dinheiro da gaveta. O sistema compara com o valor esperado.</p>
      <Segmented
        value={modo}
        onChange={setModo}
        options={[
          { value: "total", label: "Informar total" },
          { value: "notas", label: "Contar por nota" },
        ]}
      />
      <div className="mt-4">
        {modo === "total" ? (
          <Field label="Dinheiro contado">
            <MoneyInput value={contado} onChange={setContado} autoFocus />
          </Field>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {cedulas.map((c) => (
              <label key={c} className="tile flex items-center justify-between gap-2 px-3 py-2 text-[13px]">
                <span className="text-muted">{brl(c)}</span>
                <input className="w-12 rounded-md border border-line bg-paper px-1.5 py-1 text-right" inputMode="numeric" value={notas[c] ?? ""} onChange={(e) => setNotas({ ...notas, [c]: Number(e.target.value.replace(/\D/g, "")) || 0 })} />
              </label>
            ))}
          </div>
        )}
      </div>
      <div className="tile mt-4 grid grid-cols-3 text-center">
        <div className="py-3">
          <div className="label">Esperado</div>
          <Money value={esperado} className="text-[20px]" />
        </div>
        <div className="py-3">
          <div className="label">Contado</div>
          <Money value={valor} className="text-[20px]" />
        </div>
        <div className="py-3">
          <div className="label">Diferença</div>
          <span className={cx("num text-[20px]", dif === 0 ? "text-ok-ink" : "text-alert-ink")}>{brl(dif)}</span>
        </div>
      </div>
      {dif !== 0 && (
        <Field label="Observação (obrigatória quando há diferença)" className="mt-3">
          <input className="input" value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ex.: troco dado a mais" />
        </Field>
      )}
    </Modal>
  );
}
