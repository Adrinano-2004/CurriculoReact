"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { I } from "@/components/icons";
import { abrirImpressao, EntradaModal, SaidaModal } from "@/components/ticket-modals";
import { Money, PageTitle, Plate, Segmented, toast } from "@/components/ui";
import { useNow } from "@/lib/hooks";
import { calcularSaida, clientePorPlaca, rotuloTipoCliente, useApp } from "@/lib/store";
import { noPatio } from "@/lib/stats";
import { cx, duracao, hora, normalizarPlaca, placaValida } from "@/lib/util";

export default function PatioPage() {
  return (
    <Suspense>
      <Patio />
    </Suspense>
  );
}

function Patio() {
  const s = useApp();
  const agora = useNow(30000);
  const params = useSearchParams();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [valor, setValor] = useState("");
  const [entrada, setEntrada] = useState<string | null>(null);
  const [saida, setSaida] = useState<string | null>(null);
  const [filtro, setFiltro] = useState("");
  const [ordem, setOrdem] = useState<"recentes" | "antigos">("recentes");

  const patio = useMemo(() => {
    const lista = noPatio(s).filter((t) => !filtro || t.placa.includes(normalizarPlaca(filtro)) || t.modelo.toLowerCase().includes(filtro.toLowerCase()));
    return ordem === "recentes" ? lista : [...lista].reverse();
  }, [s, filtro, ordem]);

  const focar = () => setTimeout(() => inputRef.current?.focus(), 30);

  const processar = (bruto: string) => {
    const v = bruto.trim();
    if (!v) return;
    if (/^\d{1,6}$/.test(v)) {
      const t = s.tickets.find((x) => x.numero === Number(v));
      if (!t) return toast(`Ticket nº ${v} não encontrado`, "alert");
      setSaida(t.id);
      setValor("");
      return;
    }
    const placa = normalizarPlaca(v);
    if (!placaValida(placa)) return toast("Placa inválida. Use o formato ABC1D23 ou ABC1234.", "alert");
    const aberto = s.tickets.find((t) => t.placa === placa && t.status === "aberto");
    if (aberto) setSaida(aberto.id);
    else setEntrada(placa);
    setValor("");
  };

  useEffect(() => {
    const p = params.get("placa");
    if (p) {
      processar(p);
      router.replace("/app/patio");
    } else focar();
    const f = () => focar();
    window.addEventListener("vagou:foco-placa", f);
    return () => window.removeEventListener("vagou:foco-placa", f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const ocupadas = noPatio(s).length;
  const pct = Math.min(100, (ocupadas / s.config.vagas) * 100);
  const sugestao = normalizarPlaca(valor);
  const reconhecido = sugestao.length >= 3 ? Object.values(s.veiculos).filter((v) => v.placa.startsWith(sugestao)).slice(0, 4) : [];

  return (
    <div className="mx-auto max-w-[1280px]">
      <PageTitle sec="Pátio" title="Digitou a placa," muted="pronto.">
        <span className="pill pill-n !text-[12.5px] !px-3 !py-1.5">
          {ocupadas} / {s.config.vagas} ocupadas
        </span>
      </PageTitle>

      <div className="grid gap-4 xl:grid-cols-[440px_1fr]">
        <div className="space-y-4">
          <form
            className="glass p-6"
            onSubmit={(e) => {
              e.preventDefault();
              processar(valor);
            }}
          >
            <div className="flex items-center justify-between">
              <div className="num text-[24px]">Entrada ou saída</div>
              <span className="kbd">F1</span>
            </div>
            <p className="mt-1 text-[13px] text-muted">Digite a placa ou o número do ticket e aperte Enter. O sistema descobre se o carro está entrando ou saindo.</p>
            <div className="mt-5 overflow-hidden rounded-[16px] border-2 border-dark bg-paper">
              <div className="bg-[#1f47a0] py-1 text-center text-[9px] font-semibold tracking-[0.3em] text-white">BRASIL</div>
              <input
                ref={inputRef}
                value={valor}
                onChange={(e) => setValor(e.target.value.toUpperCase())}
                className="w-full bg-transparent px-4 py-4 text-center text-[38px] font-semibold uppercase tracking-[0.12em] outline-none placeholder:text-muted-2"
                placeholder="ABC1D23"
                aria-label="Placa ou número do ticket"
                autoComplete="off"
                spellCheck={false}
                maxLength={8}
              />
            </div>
            {reconhecido.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {reconhecido.map((v) => (
                  <button key={v.placa} type="button" className="chip gap-1.5" onClick={() => processar(v.placa)}>
                    <b className="font-semibold tracking-[0.06em]">{v.placa}</b> {v.modelo}
                  </button>
                ))}
              </div>
            )}
            <button className="btn btn-dark btn-lg mt-4 w-full">
              Continuar <span className="opacity-60">⏎</span>
            </button>
          </form>

          <div className="card p-5">
            <div className="mb-2 flex items-center justify-between text-[13px]">
              <span className="font-medium">Ocupação</span>
              <span className="text-muted">{Math.round(pct)}%</span>
            </div>
            <div className="flex h-[54px] items-end gap-[3px]">
              {Array.from({ length: s.config.vagas }, (_, i) => (
                <i key={i} className={cx("flex-1 rounded-[2px]", i < ocupadas ? "bg-dark" : "bg-[#dcdcd9]")} style={{ height: i < ocupadas ? "100%" : "45%" }} />
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="tile py-3">
                <div className="label">Ocupadas</div>
                <div className="num text-[22px]">{ocupadas}</div>
              </div>
              <div className="tile py-3">
                <div className="label">Livres</div>
                <div className="num text-[22px]">{Math.max(0, s.config.vagas - ocupadas)}</div>
              </div>
              <div className="tile py-3">
                <div className="label">Há mais de {s.config.alertaHoras}h</div>
                <div className="num text-[22px]">{noPatio(s).filter((t) => agora - t.entrada > s.config.alertaHoras * 3600000).length}</div>
              </div>
            </div>
          </div>
        </div>

        <section className="card p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="num text-[24px]">No pátio agora</h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <I.search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input className="input !w-[180px] !py-1.5 !pl-8 text-[13px]" placeholder="Filtrar" value={filtro} onChange={(e) => setFiltro(e.target.value)} />
              </div>
              <Segmented
                value={ordem}
                onChange={setOrdem}
                options={[
                  { value: "recentes", label: "Recentes" },
                  { value: "antigos", label: "Mais tempo" },
                ]}
              />
            </div>
          </div>
          <div className="hidden grid-cols-[112px_1fr_60px_96px_100px_32px] gap-3 border-b border-line pb-2 text-[11.5px] text-muted md:grid">
            <span>Placa</span>
            <span>Veículo</span>
            <span>Entrada</span>
            <span>Tempo</span>
            <span className="text-right">Valor agora</span>
            <span />
          </div>
          <div className="max-h-[640px] overflow-y-auto scroll-soft">
            {patio.length === 0 && <div className="py-16 text-center text-[14px] text-muted">Nenhum veículo encontrado.</div>}
            {patio.map((t) => {
              const min = Math.floor((agora - t.entrada) / 60000);
              const c = calcularSaida(s, t, agora);
              const cli = t.clienteId ? s.clientes.find((x) => x.id === t.clienteId) : clientePorPlaca(s, t.placa);
              const longo = min > s.config.alertaHoras * 60;
              const lj = s.servicos.some((v) => v.placa === t.placa && !v.pago);
              return (
                <div key={t.id} role="button" tabIndex={0} onClick={() => setSaida(t.id)} onKeyDown={(e) => e.key === "Enter" && setSaida(t.id)} className="grid cursor-pointer grid-cols-[1fr_auto] items-center gap-3 border-b border-[#f0f0ee] px-1 py-2.5 text-[13.5px] transition last:border-0 hover:bg-tile md:grid-cols-[112px_1fr_60px_96px_100px_32px]">
                  <span>
                    <Plate placa={t.placa} />
                  </span>
                  <span className="hidden min-w-0 flex-wrap items-center gap-x-2 gap-y-1 md:flex">
                    <span className="whitespace-nowrap">
                      {t.modelo} <span className="text-muted">· {t.cor}</span>
                    </span>
                    {cli && <span className={cx("pill", cli.tipo === "lista_negra" ? "pill-alert" : cli.tipo === "mensalista" ? "pill-n" : "pill-warn")}>{rotuloTipoCliente[cli.tipo]}</span>}
                    {t.diaria && <span className="pill pill-warn">Diária</span>}
                    {lj && <span className="pill pill-n">Lava-jato</span>}
                  </span>
                  <span className="hidden text-muted md:block">{hora(t.entrada)}</span>
                  <span className={cx("pill w-fit", longo ? "pill-alert" : "pill-n")}>{duracao(min)}</span>
                  <span className="hidden text-right md:block">
                    <Money value={c.totalGeral} className="text-[16px]" />
                  </span>
                  <button
                    className="hidden size-8 items-center justify-center rounded-full text-muted hover:bg-paper hover:text-ink md:flex"
                    onClick={(e) => {
                      e.stopPropagation();
                      abrirImpressao("ticket", t.id);
                    }}
                    aria-label="Reimprimir ticket"
                    title="Reimprimir ticket"
                  >
                    <I.printer size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <EntradaModal
        key={entrada ?? "nenhuma"}
        placa={entrada}
        onClose={() => {
          setEntrada(null);
          focar();
        }}
      />
      <SaidaModal
        key={saida ?? "nenhum"}
        ticketId={saida}
        onClose={() => {
          setSaida(null);
          focar();
        }}
      />
    </div>
  );
}
