"use client";

import { useEffect, useMemo, useState } from "react";
import { I } from "./icons";
import { QrCode } from "./qrcode";
import { Field, Modal, Money, PinInput, Plate, Segmented, toast } from "./ui";
import { useNow } from "@/lib/hooks";
import { pixCopiaECola } from "@/lib/pix";
import { caixaAberto, calcularSaida, clientePorPlaca, rotuloForma, rotuloTipoCliente, servicosPendentes, useApp } from "@/lib/store";
import type { FormaPagamento, Ticket } from "@/lib/types";
import { cx, data, duracao, hora, linkWhatsApp, normalizarPlaca, placaValida } from "@/lib/util";

export function abrirImpressao(tipo: "ticket" | "recibo", id: string) {
  window.open(`/imprimir/${tipo}/${id}`, "_blank", "width=420,height=720");
}

/* =============================== ENTRADA =============================== */

export function EntradaModal({ placa, onClose }: { placa: string | null; onClose: () => void }) {
  const s = useApp();
  const registrarEntrada = useApp((x) => x.registrarEntrada);
  const autorizar = useApp((x) => x.autorizar);
  const registrarAuditoria = useApp((x) => x.registrarAuditoria);
  const v = placa ? s.veiculos[placa] : undefined;
  const cliente = placa ? clientePorPlaca(s, placa) : undefined;
  const [modelo, setModelo] = useState("");
  const [cor, setCor] = useState("");
  const [tarifaId, setTarifaId] = useState(s.config.tarifaPadraoId);
  const [diaria, setDiaria] = useState(false);
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (!placa) return;
    setModelo(v?.modelo ?? "");
    setCor(v?.cor ?? "");
    setTarifaId(v?.tarifaId ?? s.config.tarifaPadraoId);
    setDiaria(false);
    setPin("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placa]);

  if (!placa) return null;
  const listaNegra = cliente?.tipo === "lista_negra";
  const livres = s.config.vagas - s.tickets.filter((t) => t.status === "aberto").length;
  const frequente = v && v.visitas >= 3 && cliente?.tipo !== "mensalista";

  const confirmar = () => {
    let autorizadoPor: string | undefined;
    if (listaNegra) {
      const g = autorizar(pin);
      if (!g) {
        toast("PIN do gerente incorreto", "alert");
        return;
      }
      autorizadoPor = g.id;
    }
    const t = registrarEntrada({ placa, modelo: modelo || "Não informado", cor, tarifaId, diaria, autorizadoPor });
    toast(`Entrada registrada · ticket nº ${t.numero}`);
    if (s.config.imprimirAutomatico) abrirImpressao("ticket", t.id);
    onClose();
  };

  const recusar = () => {
    registrarAuditoria({ tipo: "lista_negra", descricao: `Placa ${placa} (lista negra) tentou entrar · entrada bloqueada`, severidade: "alerta" });
    toast("Entrada recusada e registrada no histórico", "alert");
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Nova entrada"
      width={600}
      footer={
        listaNegra ? (
          <>
            <button className="btn btn-light" onClick={recusar}>
              Recusar entrada
            </button>
            <button className="btn btn-dark" disabled={pin.length < 4} onClick={confirmar}>
              Autorizar e emitir ticket
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-light" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn btn-dark btn-lg" onClick={confirmar} disabled={livres <= 0 && !diaria}>
              Confirmar e emitir ticket <span className="opacity-60">⏎</span>
            </button>
          </>
        )
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!listaNegra || pin.length >= 4) confirmar();
        }}
      >
        <div className="tile flex flex-wrap items-center gap-5 p-5">
          <Plate placa={placa} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="label">{v ? "Veículo reconhecido" : "Primeira visita"}</div>
            <div className="text-[20px] font-medium">{v ? `${v.modelo} · ${v.cor}` : "Novo veículo"}</div>
            {v && (
              <div className="text-[12.5px] text-muted">
                Última visita: {data(v.ultimaVisita)} · {v.visitas} visita{v.visitas > 1 ? "s" : ""} no total
              </div>
            )}
          </div>
          <span className={cx("pill", livres > 5 ? "pill-n" : livres > 0 ? "pill-warn" : "pill-alert")}>{livres > 0 ? `${livres} vagas livres` : "Pátio lotado"}</span>
        </div>

        {cliente && !listaNegra && (
          <div className="mt-3 flex items-center gap-3 rounded-[14px] border border-dashed border-[#d9e9d6] bg-[#f4fbf3] px-4 py-3 text-[13.5px] text-ok-ink">
            <I.star size={16} />
            <span>
              <b className="font-semibold">{rotuloTipoCliente[cliente.tipo]}</b> · {cliente.nome}
              {cliente.descontoPct ? ` · desconto de ${cliente.descontoPct}%` : ""}
            </span>
          </div>
        )}
        {frequente && !cliente && (
          <div className="mt-3 flex items-center gap-3 rounded-[14px] border border-dashed border-[#e0d3b0] bg-[#fffbef] px-4 py-3 text-[13.5px] text-warn-ink">
            <I.star size={16} /> Cliente frequente: ofereça o plano de mensalista.
          </div>
        )}
        {listaNegra && (
          <div className="mt-3 rounded-[14px] bg-alert-soft px-4 py-3 text-[13.5px] text-alert-ink">
            <div className="flex items-center gap-2 font-semibold">
              <I.alert size={16} /> Placa na lista negra
            </div>
            <div className="mt-1">{(cliente?.observacao || "Pendência registrada").replace(/\.?$/, ".")} Para liberar, peça o PIN do gerente.</div>
            <div className="mt-3 max-w-[220px]">
              <PinInput value={pin} onChange={setPin} />
            </div>
          </div>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Modelo">
            <input className="input" value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="Ex.: Onix" data-autofocus={!listaNegra || undefined} list="modelos" />
          </Field>
          <Field label="Cor">
            <input className="input" value={cor} onChange={(e) => setCor(e.target.value)} placeholder="Ex.: prata" />
          </Field>
        </div>
        <datalist id="modelos">
          {[...new Set(Object.values(s.veiculos).map((x) => x.modelo))].sort().map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Segmented value={tarifaId} onChange={setTarifaId} options={s.config.tarifas.map((t) => ({ value: t.id, label: t.nome }))} />
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-2">
            <input type="checkbox" checked={diaria} onChange={(e) => setDiaria(e.target.checked)} className="size-4 accent-[#2A2A29]" />
            Lançar diária ({(s.config.tarifas.find((t) => t.id === tarifaId)?.diariaLancada ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})
          </label>
        </div>
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}

/* =============================== SAÍDA =============================== */

const FORMAS: { f: FormaPagamento; tecla: string }[] = [
  { f: "dinheiro", tecla: "1" },
  { f: "pix", tecla: "2" },
  { f: "debito", tecla: "3" },
  { f: "credito", tecla: "4" },
];

export function SaidaModal({ ticketId, onClose }: { ticketId: string | null; onClose: () => void }) {
  const s = useApp();
  const relogio = useNow(15000);
  const agora = Math.max(relogio, Date.now() - 15000);
  const registrarSaida = useApp((x) => x.registrarSaida);
  const abrirCaixa = useApp((x) => x.abrirCaixa);
  const t = s.tickets.find((x) => x.id === ticketId);
  const [forma, setForma] = useState<FormaPagamento>("dinheiro");
  const [convenioId, setConvenioId] = useState<string>("");
  const [recebido, setRecebido] = useState<string>("");
  const [feito, setFeito] = useState<Ticket | null>(null);
  const [acao, setAcao] = useState<null | "cancelar" | "corrigir">(null);
  const [telefone, setTelefone] = useState("");

  useEffect(() => {
    setForma("dinheiro");
    setConvenioId("");
    setRecebido("");
    setFeito(null);
    setAcao(null);
    setTelefone("");
  }, [ticketId]);

  const calc = useMemo(() => (t && t.status === "aberto" ? calcularSaida(s, t, agora, convenioId || undefined) : null), [s, t, agora, convenioId]);
  const caixa = caixaAberto(s);
  const convenios = s.clientes.filter((c) => c.tipo === "convenio");
  const servicos = t ? servicosPendentes(s, t.placa) : [];
  const cliente = t?.clienteId ? s.clientes.find((c) => c.id === t.clienteId) : undefined;

  useEffect(() => {
    if (!t || feito || acao) return;
    const onKey = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement;
      if (alvo.tagName === "INPUT" || alvo.tagName === "SELECT" || alvo.tagName === "TEXTAREA") return;
      const f = FORMAS.find((x) => x.tecla === e.key);
      if (f) setForma(f.f);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [t, feito, acao]);

  if (!t) return null;

  if (acao === "cancelar") return <CancelarModal ticket={t} onClose={() => setAcao(null)} onDone={onClose} />;
  if (acao === "corrigir") return <CorrigirPlacaModal ticket={t} onClose={() => setAcao(null)} />;

  if (feito) {
    const recibo = `Recibo · ${s.config.empresa.nome}\nPlaca ${feito.placa} · ${feito.modelo}\n${hora(feito.entrada)} → ${hora(feito.saida!)} (${duracao(Math.floor((feito.saida! - feito.entrada) / 60000))})\nTotal: ${(feito.valor ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} · ${rotuloForma[feito.pagamento!]}\nObrigado pela preferência!`;
    return (
      <Modal
        open
        onClose={onClose}
        title="Saída registrada"
        width={480}
        footer={
          <>
            <button className="btn btn-light" onClick={() => abrirImpressao("recibo", feito.id)}>
              <I.printer size={16} /> Imprimir recibo
            </button>
            <button className="btn btn-dark" onClick={onClose} data-autofocus>
              Concluir ⏎
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <span className="inline-flex size-14 items-center justify-center rounded-full bg-ok-soft text-ok-ink">
            <I.check size={26} />
          </span>
          <Money value={feito.valor ?? 0} className="text-[44px]" />
          <div className="text-[14px] text-muted">
            {feito.placa} · {rotuloForma[feito.pagamento!]}
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <input className="input" placeholder="WhatsApp do cliente (opcional)" value={telefone || cliente?.telefone || ""} onChange={(e) => setTelefone(e.target.value)} />
          <a className={cx("btn btn-light", !(telefone || cliente?.telefone) && "pointer-events-none opacity-40")} href={linkWhatsApp(telefone || cliente?.telefone || "", recibo)} target="_blank" rel="noreferrer">
            <I.chat size={16} /> Enviar
          </a>
        </div>
      </Modal>
    );
  }

  if (!calc) {
    return (
      <Modal open onClose={onClose} title={`Ticket nº ${t.numero}`} width={480}>
        <TicketResumo t={t} />
        <div className="mt-4 flex gap-2">
          <button className="btn btn-light" onClick={() => abrirImpressao(t.status === "pago" ? "recibo" : "ticket", t.id)}>
            <I.printer size={16} /> Reimprimir
          </button>
        </div>
      </Modal>
    );
  }

  const total = calc.totalGeral;
  const troco = forma === "dinheiro" && recebido ? Number(recebido.replace(",", ".")) - total : NaN;
  const pix = pixCopiaECola({ chave: s.config.empresa.chavePix, nome: s.config.empresa.nome, cidade: s.config.empresa.cidade, valor: total, txid: `T${t.numero}` });
  const precisaCaixa = total > 0 && !caixa;

  const confirmar = () => {
    if (precisaCaixa) return;
    try {
      const r = registrarSaida(t.id, forma, convenioId || undefined);
      if (r) setFeito(r);
    } catch (e) {
      toast((e as Error).message, "alert");
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={
        <span className="flex items-center gap-3">
          Saída <span className="pill pill-n !text-[12px]">Ticket nº {t.numero}</span>
        </span>
      }
      width={760}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          confirmar();
        }}
        className="grid gap-5 md:grid-cols-[1fr_260px]"
      >
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <Plate placa={t.placa} size="md" />
            <div className="text-[17px] font-medium">
              {t.modelo}
              {t.cor && ` · ${t.cor}`}
            </div>
            {cliente && <span className={cx("pill", cliente.tipo === "lista_negra" ? "pill-alert" : "pill-ok")}>{rotuloTipoCliente[cliente.tipo]}</span>}
            {t.diaria && <span className="pill pill-warn">Diária</span>}
          </div>
          <div className="mt-3">
            <div className="row text-[14px]">
              <span className="text-muted">Entrada</span>
              <span>
                {data(t.entrada)} · {hora(t.entrada)}
              </span>
            </div>
            <div className="row text-[14px]">
              <span className="text-muted">Saída</span>
              <span>{hora(agora)}</span>
            </div>
            <div className="row text-[14px]">
              <span className="text-muted">Tempo</span>
              <span>{duracao(calc.minutos)}</span>
            </div>
            {calc.detalhe.map((d) => (
              <div key={d} className="row text-[12.5px] text-muted">
                <span>{d}</span>
              </div>
            ))}
            {servicos.map((v) => (
              <div key={v.id} className="row text-[13px]">
                <span className="flex items-center gap-2 text-ink-2">
                  <I.drop size={14} /> {v.nome}
                </span>
                <span>{v.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
              </div>
            ))}
          </div>

          {convenios.length > 0 && (
            <div className="mt-3">
              <div className="label mb-1.5">Validação de convênio</div>
              <select className="input" value={convenioId} onChange={(e) => setConvenioId(e.target.value)}>
                <option value="">Sem convênio</option>
                {convenios.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} · {c.descontoPct}% de desconto
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="tile mt-4 flex items-center justify-between px-5 py-4">
            <span className="text-[13px] text-muted">Total a pagar</span>
            <Money value={total} className="text-[46px] leading-none md:text-[54px]" />
          </div>

          {total > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {FORMAS.map(({ f, tecla }) => (
                <button type="button" key={f} onClick={() => setForma(f)} className={cx("btn !py-3", forma === f ? "btn-dark" : "btn-light")}>
                  {rotuloForma[f]} <span className="text-[10px] opacity-50">{tecla}</span>
                </button>
              ))}
            </div>
          )}

          {forma === "dinheiro" && total > 0 && (
            <div className="mt-3 flex items-center gap-3">
              <input className="input max-w-[160px]" inputMode="decimal" placeholder="Valor recebido" value={recebido} onChange={(e) => setRecebido(e.target.value.replace(/[^\d,]/g, ""))} />
              {isFinite(troco) && <span className={cx("text-[14px]", troco < 0 ? "text-alert-ink" : "text-ink-2")}>{troco < 0 ? "Valor insuficiente" : <>Troco: <Money value={troco} className="text-[20px]" /></>}</span>}
            </div>
          )}

          {precisaCaixa && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-[14px] bg-warn-soft px-4 py-3 text-[13px] text-warn-ink">
              O caixa está fechado. Abra o caixa para receber.
              <button type="button" className="btn btn-dark btn-sm" onClick={() => abrirCaixa(100)}>
                Abrir com troco de R$ 100
              </button>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="submit" className="btn btn-dark btn-lg flex-1" disabled={precisaCaixa} data-autofocus>
              {total > 0 ? `Confirmar ${rotuloForma[forma]}` : "Liberar saída"} <span className="opacity-60">⏎</span>
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => abrirImpressao("ticket", t.id)}>
              <I.printer size={14} /> Reimprimir ticket
            </button>
            {!t.diaria && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => useApp.getState().lancarDiaria(t.id)}>
                Lançar diária
              </button>
            )}
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAcao("corrigir")}>
              <I.edit size={14} /> Corrigir placa
            </button>
            <button type="button" className="btn btn-ghost btn-sm text-alert-ink" onClick={() => setAcao("cancelar")}>
              <I.x size={14} /> Cancelar ticket
            </button>
          </div>
        </div>

        <div className={cx("flex flex-col items-center justify-center rounded-[20px] bg-tile p-5 text-center transition", forma !== "pix" || total === 0 ? "opacity-40" : "")}>
          <div className="rounded-[18px] bg-paper p-3 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
            <QrCode text={pix} size={180} />
          </div>
          <div className="num mt-4 text-[22px]">Pague com PIX</div>
          <p className="mt-1 text-[12.5px] text-muted">O cliente aponta a câmera do celular e paga o valor exato.</p>
          <button
            type="button"
            className="btn btn-light btn-sm mt-3"
            onClick={() => {
              void navigator.clipboard?.writeText(pix);
              toast("Código PIX copiado");
            }}
          >
            Copiar código
          </button>
        </div>
      </form>
    </Modal>
  );
}

function TicketResumo({ t }: { t: Ticket }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <Plate placa={t.placa} size="md" />
        <span className="text-[16px] font-medium">{t.modelo}</span>
        <span className={cx("pill", t.status === "pago" ? "pill-ok" : t.status === "cancelado" ? "pill-alert" : "pill-n")}>{t.status === "pago" ? "Pago" : t.status === "cancelado" ? "Cancelado" : "No pátio"}</span>
      </div>
      <div className="mt-3 text-[14px]">
        <div className="row">
          <span className="text-muted">Entrada</span>
          <span>
            {data(t.entrada)} {hora(t.entrada)}
          </span>
        </div>
        {t.saida && (
          <div className="row">
            <span className="text-muted">Saída</span>
            <span>
              {data(t.saida)} {hora(t.saida)}
            </span>
          </div>
        )}
        {t.valor !== undefined && (
          <div className="row">
            <span className="text-muted">Valor</span>
            <Money value={t.valor} className="text-[18px]" />
          </div>
        )}
        {t.cancelamento && (
          <div className="row">
            <span className="text-muted">Motivo</span>
            <span>{t.cancelamento.motivo}</span>
          </div>
        )}
      </div>
    </div>
  );
}

const MOTIVOS = ["Cliente desistiu na entrada", "Ticket emitido em duplicidade", "Erro de digitação", "Veículo de serviço"];

export function CancelarModal({ ticket, onClose, onDone }: { ticket: Ticket; onClose: () => void; onDone?: () => void }) {
  const autorizar = useApp((x) => x.autorizar);
  const cancelar = useApp((x) => x.cancelarTicket);
  const [motivo, setMotivo] = useState("");
  const [pin, setPin] = useState("");
  const ok = () => {
    const g = autorizar(pin);
    if (!g) {
      toast("PIN do gerente incorreto", "alert");
      return;
    }
    cancelar(ticket.id, motivo, g.id);
    toast(`Ticket nº ${ticket.numero} cancelado`, "info");
    onClose();
    onDone?.();
  };
  return (
    <Modal
      open
      onClose={onClose}
      title="Cancelar ticket"
      width={480}
      footer={
        <>
          <button className="btn btn-light" onClick={onClose}>
            Voltar
          </button>
          <button className="btn btn-danger" disabled={motivo.trim().length < 4 || pin.length < 4} onClick={ok}>
            Confirmar cancelamento
          </button>
        </>
      }
    >
      <div className="mb-4 flex items-center gap-3 text-[14px]">
        <Plate placa={ticket.placa} /> Ticket nº {ticket.numero}
      </div>
      <div className="label mb-1.5">Motivo (obrigatório)</div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {MOTIVOS.map((m) => (
          <button key={m} type="button" className="chip" data-on={motivo === m} onClick={() => setMotivo(m)}>
            {m}
          </button>
        ))}
      </div>
      <input className="input" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Descreva o motivo" />
      <div className="label mb-1.5 mt-4">PIN do gerente</div>
      <PinInput value={pin} onChange={setPin} />
      <p className="mt-3 flex items-center gap-2 text-[12px] text-muted">
        <I.lock size={13} /> Fica registrado no histórico quem cancelou, quando e por quê.
      </p>
    </Modal>
  );
}

export function CorrigirPlacaModal({ ticket, onClose }: { ticket: Ticket; onClose: () => void }) {
  const corrigir = useApp((x) => x.corrigirPlaca);
  const [nova, setNova] = useState(ticket.placa);
  const [motivo, setMotivo] = useState("Erro de digitação");
  const valida = placaValida(normalizarPlaca(nova));
  const ok = () => {
    corrigir(ticket.id, nova, motivo);
    toast("Placa corrigida");
    onClose();
  };
  return (
    <Modal
      open
      onClose={onClose}
      title="Corrigir placa"
      width={440}
      footer={
        <>
          <button className="btn btn-light" onClick={onClose}>
            Voltar
          </button>
          <button className="btn btn-dark" disabled={!valida || normalizarPlaca(nova) === ticket.placa || !motivo.trim()} onClick={ok}>
            Salvar correção
          </button>
        </>
      }
    >
      <Field label={`Placa atual: ${ticket.placa}`}>
        <input className="input text-[20px] font-semibold uppercase tracking-[0.1em]" value={nova} onChange={(e) => setNova(normalizarPlaca(e.target.value))} data-autofocus />
      </Field>
      <Field label="Motivo" className="mt-3">
        <input className="input" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
      </Field>
    </Modal>
  );
}
