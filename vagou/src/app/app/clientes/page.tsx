"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { I } from "@/components/icons";
import { Avatar, Empty, Field, Modal, Money, MoneyInput, PageTitle, Plate, Segmented, toast } from "@/components/ui";
import { useNow } from "@/lib/hooks";
import { brl } from "@/lib/pricing";
import { caixaAberto, rotuloTipoCliente, useApp } from "@/lib/store";
import { candidatosMensalista, DIA_MS, mensalistasStatus, statusMensalista } from "@/lib/stats";
import type { Cliente, FormaPagamento, TipoCliente } from "@/lib/types";
import { cx, iniciais, linkWhatsApp, mesRef, nomeMes, normalizarPlaca } from "@/lib/util";

type Filtro = "todos" | TipoCliente;

export default function ClientesPage() {
  return (
    <Suspense>
      <Clientes />
    </Suspense>
  );
}

function Clientes() {
  const s = useApp();
  const agora = useNow(60000);
  const params = useSearchParams();
  const [filtro, setFiltro] = useState<Filtro>((params.get("tipo") as Filtro) ?? "todos");
  const [busca, setBusca] = useState("");
  const [editar, setEditar] = useState<Partial<Cliente> | null>(null);
  const [ver, setVer] = useState<string | null>(null);

  const ms = useMemo(() => mensalistasStatus(s, agora), [s, agora]);
  const candidatos = useMemo(() => candidatosMensalista(s, agora - 30 * DIA_MS, agora, 5), [s, agora]);
  const lista = useMemo(
    () =>
      s.clientes
        .filter((c) => filtro === "todos" || c.tipo === filtro)
        .filter((c) => !busca || c.nome.toLowerCase().includes(busca.toLowerCase()) || c.placas.some((p) => p.includes(normalizarPlaca(busca))))
        .sort((a, b) => a.nome.localeCompare(b.nome)),
    [s.clientes, filtro, busca],
  );
  const ticketsConvenioMes = (id: string) => s.tickets.filter((t) => t.convenioId === id && t.saida && mesRef(t.saida) === mesRef(agora)).length;

  const statusPill = (c: Cliente) => {
    if (c.tipo === "mensalista") {
      const st = statusMensalista(s, c.id, agora);
      return <span className={cx("pill min-w-[110px] justify-center", st === "em_dia" ? "pill-ok" : st === "atrasado" ? "pill-alert" : "pill-n")}>{st === "em_dia" ? "Em dia" : st === "atrasado" ? "Em atraso" : "A vencer"}</span>;
    }
    if (c.tipo === "lista_negra") return <span className="pill pill-alert min-w-[110px] justify-center">Bloqueada</span>;
    if (c.tipo === "convenio") return <span className="pill pill-n min-w-[110px] justify-center">{ticketsConvenioMes(c.id)} tickets no mês</span>;
    return <span className="pill pill-warn min-w-[110px] justify-center">Desconto {c.descontoPct ?? 0}%</span>;
  };

  const sel = s.clientes.find((c) => c.id === ver);
  const contagem = (t: Filtro) => (t === "todos" ? s.clientes.length : s.clientes.filter((c) => c.tipo === t).length);

  return (
    <div className="mx-auto max-w-[1280px]">
      <PageTitle sec="Clientes" title="Mensalistas e clientes especiais," muted="todos num só lugar.">
        <button className="btn btn-dark" onClick={() => setEditar({ tipo: filtro === "todos" ? "mensalista" : filtro, placas: [] })}>
          <I.plus size={16} /> Novo cliente
        </button>
      </PageTitle>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <section className="glass p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <Segmented
              value={filtro}
              onChange={setFiltro}
              options={(["todos", "mensalista", "vip", "especial", "convenio", "lista_negra"] as Filtro[]).map((t) => ({
                value: t,
                label: (
                  <>
                    {t === "todos" ? "Todos" : rotuloTipoCliente[t]} <span className="ml-1 opacity-50">{contagem(t)}</span>
                  </>
                ),
              }))}
            />
            <div className="relative">
              <I.search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input className="input !w-[200px] !py-1.5 !pl-8 text-[13px]" placeholder="Nome ou placa" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
          </div>
          {lista.length === 0 && <Empty title="Nenhum cliente aqui" text="Cadastre mensalistas, clientes VIP, convênios com lojas parceiras ou placas bloqueadas." icon={<I.users />} />}
          {lista.map((c) => (
            <button key={c.id} onClick={() => setVer(c.id)} className="row w-full text-left text-[14px] hover:bg-tile/80">
              <span className="flex min-w-0 items-center gap-3">
                <Avatar text={c.tipo === "lista_negra" ? "—" : iniciais(c.nome)} className="size-9" />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{c.nome}</span>
                  <span className="block truncate text-[12px] text-muted">{c.placas.length ? c.placas.join(", ") : c.observacao || c.telefone || "—"}</span>
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="pill pill-n hidden sm:inline-flex">{rotuloTipoCliente[c.tipo]}</span>
                {statusPill(c)}
              </span>
            </button>
          ))}
        </section>

        <div className="space-y-4">
          <section className="glass p-6">
            <div className="label">Mensalidades de {nomeMes(mesRef(agora))}</div>
            <Money value={ms.receitaPrevista} className="mt-1 block text-[40px] leading-tight" />
            <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-tile">
              <i className="bg-ok" style={{ flex: ms.emDia.length }} />
              <i className="bg-alert" style={{ flex: ms.atrasados.length }} />
              <i className="bg-[#d8d8d5]" style={{ flex: ms.aVencer.length }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-[13px] text-ink-2">
              <span>
                <b className="text-ok">●</b> {ms.emDia.length} em dia
              </span>
              <span>
                <b className="text-alert">●</b> {ms.atrasados.length} em atraso
              </span>
              <span>
                <b className="text-muted-2">●</b> {ms.aVencer.length} a vencer
              </span>
            </div>
            {ms.atrasados.length > 0 && (
              <button className="btn btn-light btn-sm mt-4" onClick={() => setFiltro("mensalista")}>
                Ver quem está em atraso
              </button>
            )}
          </section>

          <section className="glass bg-dark p-6 text-white" style={{ background: "#2A2A29", borderColor: "#2A2A29" }}>
            <div className="text-[13px] text-white/60">Aviso automático no WhatsApp</div>
            <div className="mt-3 rounded-[16px_16px_16px_4px] bg-white px-4 py-3 text-[14px] leading-relaxed text-ink">
              Olá, {ms.atrasados[0]?.nome.split(" ")[0] ?? "Marcos"}! Sua mensalidade do {s.config.empresa.nome} venceu. Pague pelo PIX: <b>toque aqui</b>.
            </div>
            <p className="mt-3 text-[12px] text-white/55">Em cada mensalista atrasado, o botão “Cobrar no WhatsApp” abre a mensagem pronta.</p>
          </section>

          <section className="card p-5">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-[14px] font-medium">Candidatos a mensalista</h2>
              <span className="label">últimos 30 dias</span>
            </div>
            {candidatos.length === 0 && <div className="py-4 text-[13px] text-muted">Ainda sem clientes frequentes.</div>}
            {candidatos.map((c) => (
              <div key={c.placa} className="row text-[13px]">
                <span className="flex items-center gap-2.5">
                  <Plate placa={c.placa} /> {c.modelo}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-muted">{c.visitas} visitas · {brl(c.gasto)}</span>
                  <button className="btn btn-light btn-sm" onClick={() => setEditar({ tipo: "mensalista", placas: [c.placa], mensalidade: 150, vencimentoDia: 10 })}>
                    Cadastrar
                  </button>
                </span>
              </div>
            ))}
          </section>
        </div>
      </div>

      {sel && <DetalheCliente cliente={sel} onClose={() => setVer(null)} onEditar={() => { setEditar(sel); setVer(null); }} />}
      {editar && <ClienteForm inicial={editar} onClose={() => setEditar(null)} />}
    </div>
  );
}

function DetalheCliente({ cliente, onClose, onEditar }: { cliente: Cliente; onClose: () => void; onEditar: () => void }) {
  const s = useApp();
  const receber = useApp((x) => x.receberMensalidade);
  const agora = useNow(60000);
  const [forma, setForma] = useState<FormaPagamento>("pix");
  const st = cliente.tipo === "mensalista" ? statusMensalista(s, cliente.id, agora) : null;
  const visitas = s.tickets.filter((t) => cliente.placas.includes(t.placa) || t.convenioId === cliente.id).sort((a, b) => b.entrada - a.entrada);
  const msg =
    cliente.tipo === "mensalista"
      ? `Olá, ${cliente.nome.split(" ")[0]}! Sua mensalidade do ${s.config.empresa.nome} (${brl(cliente.mensalidade ?? 0)}) vence dia ${cliente.vencimentoDia}. Chave PIX: ${s.config.empresa.chavePix}. Obrigado!`
      : `Olá, ${cliente.nome.split(" ")[0]}! Aqui é do ${s.config.empresa.nome}.`;

  return (
    <Modal
      open
      onClose={onClose}
      title={cliente.nome}
      width={620}
      footer={
        <>
          <button className="btn btn-light" onClick={onEditar}>
            <I.edit size={15} /> Editar
          </button>
          {cliente.telefone && (
            <a className="btn btn-light" href={linkWhatsApp(cliente.telefone, msg)} target="_blank" rel="noreferrer">
              <I.chat size={15} /> {cliente.tipo === "mensalista" ? "Cobrar no WhatsApp" : "WhatsApp"}
            </a>
          )}
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="pill pill-n">{rotuloTipoCliente[cliente.tipo]}</span>
        {cliente.placas.map((p) => (
          <Plate key={p} placa={p} />
        ))}
        {cliente.telefone && <span className="text-[13px] text-muted">{cliente.telefone}</span>}
      </div>
      {cliente.observacao && <p className="mt-3 text-[14px] text-ink-2">{cliente.observacao}</p>}

      {cliente.tipo === "mensalista" && (
        <div className="tile mt-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="label">Mensalidade · vence dia {cliente.vencimentoDia}</div>
              <Money value={cliente.mensalidade ?? 0} className="text-[28px]" />
            </div>
            <span className={cx("pill !px-3 !py-1.5", st === "em_dia" ? "pill-ok" : st === "atrasado" ? "pill-alert" : "pill-n")}>
              {st === "em_dia" ? "Em dia" : st === "atrasado" ? "Em atraso" : "A vencer"} · pago até {cliente.pagoAte ? nomeMes(cliente.pagoAte) : "—"}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Segmented
              value={forma}
              onChange={setForma}
              options={(["pix", "dinheiro", "debito", "credito"] as FormaPagamento[]).map((f) => ({ value: f, label: f === "pix" ? "PIX" : f === "dinheiro" ? "Dinheiro" : f === "debito" ? "Débito" : "Crédito" }))}
            />
            <button
              className="btn btn-dark btn-sm"
              disabled={!caixaAberto(s)}
              title={!caixaAberto(s) ? "Abra o caixa primeiro" : undefined}
              onClick={() => {
                receber(cliente.id, forma);
                toast("Mensalidade recebida");
              }}
            >
              Receber mensalidade
            </button>
          </div>
        </div>
      )}
      {cliente.descontoPct ? (
        <div className="tile mt-4 flex items-center justify-between p-4 text-[14px]">
          <span className="text-muted">Desconto aplicado automaticamente</span>
          <span className="num text-[24px]">{cliente.descontoPct}%</span>
        </div>
      ) : null}

      <div className="mt-5 text-[13px] font-medium">Últimas visitas</div>
      {visitas.length === 0 && <div className="py-3 text-[13px] text-muted">Nenhuma visita registrada.</div>}
      {visitas.slice(0, 6).map((t) => (
        <div key={t.id} className="row text-[13px]">
          <span className="flex items-center gap-2.5">
            <Plate placa={t.placa} /> {new Date(t.entrada).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
          </span>
          <span>{t.status === "aberto" ? <span className="pill pill-n">No pátio</span> : t.status === "cancelado" ? <span className="pill pill-alert">Cancelado</span> : brl(t.valor ?? 0)}</span>
        </div>
      ))}
    </Modal>
  );
}

function ClienteForm({ inicial, onClose }: { inicial: Partial<Cliente>; onClose: () => void }) {
  const salvar = useApp((x) => x.salvarCliente);
  const remover = useApp((x) => x.removerCliente);
  const [c, setC] = useState<Partial<Cliente>>({ tipo: "mensalista", placas: [], nome: "", telefone: "", ...inicial });
  const [placas, setPlacas] = useState((inicial.placas ?? []).join(", "));
  const up = (p: Partial<Cliente>) => setC((x) => ({ ...x, ...p }));
  const ok = () => {
    const lista = placas.split(/[,\s]+/).map(normalizarPlaca).filter(Boolean);
    const tipo = c.tipo as TipoCliente;
    salvar({
      id: c.id,
      tipo,
      nome: c.nome?.trim() || (tipo === "lista_negra" ? `Placa ${lista[0] ?? ""}` : "Sem nome"),
      telefone: c.telefone ?? "",
      placas: lista,
      mensalidade: tipo === "mensalista" ? c.mensalidade ?? 150 : undefined,
      vencimentoDia: tipo === "mensalista" ? c.vencimentoDia ?? 10 : undefined,
      pagoAte: tipo === "mensalista" ? c.pagoAte : undefined,
      descontoPct: ["vip", "especial", "convenio"].includes(tipo) ? c.descontoPct ?? 10 : undefined,
      observacao: c.observacao,
    });
    toast(c.id ? "Cliente atualizado" : "Cliente cadastrado");
    onClose();
  };
  const tipo = c.tipo as TipoCliente;
  const precisaPlaca = tipo === "mensalista" || tipo === "vip" || tipo === "lista_negra";
  return (
    <Modal
      open
      onClose={onClose}
      title={c.id ? "Editar cliente" : "Novo cliente"}
      width={560}
      footer={
        <>
          {c.id && (
            <button
              className="btn btn-danger mr-auto"
              onClick={() => {
                if (confirm("Remover este cliente?")) {
                  remover(c.id!);
                  onClose();
                }
              }}
            >
              <I.trash size={15} /> Remover
            </button>
          )}
          <button className="btn btn-light" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-dark" onClick={ok} disabled={(tipo !== "lista_negra" && !c.nome?.trim()) || (precisaPlaca && !placas.trim())}>
            Salvar
          </button>
        </>
      }
    >
      <Segmented value={tipo} onChange={(t) => up({ tipo: t })} options={(["mensalista", "vip", "especial", "convenio", "lista_negra"] as TipoCliente[]).map((t) => ({ value: t, label: rotuloTipoCliente[t] }))} />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label={tipo === "convenio" ? "Empresa parceira" : "Nome"}>
          <input className="input" value={c.nome ?? ""} onChange={(e) => up({ nome: e.target.value })} data-autofocus />
        </Field>
        <Field label="WhatsApp / telefone">
          <input className="input" value={c.telefone ?? ""} onChange={(e) => up({ telefone: e.target.value })} placeholder="(32) 99999-0000" />
        </Field>
        {tipo !== "convenio" && (
          <Field label="Placas (separe por vírgula)" className="sm:col-span-2">
            <input className="input uppercase tracking-[0.06em]" value={placas} onChange={(e) => setPlacas(e.target.value.toUpperCase())} placeholder="ABC1D23, XYZ9K88" />
          </Field>
        )}
        {tipo === "mensalista" && (
          <>
            <Field label="Mensalidade">
              <MoneyInput value={c.mensalidade ?? 150} onChange={(v) => up({ mensalidade: v })} />
            </Field>
            <Field label="Dia do vencimento">
              <input className="input" inputMode="numeric" value={c.vencimentoDia ?? 10} onChange={(e) => up({ vencimentoDia: Math.min(28, Math.max(1, Number(e.target.value.replace(/\D/g, "")) || 1)) })} />
            </Field>
          </>
        )}
        {["vip", "especial", "convenio"].includes(tipo) && (
          <Field label="Desconto (%)" hint={tipo === "convenio" ? "Aplicado quando o caixa valida o convênio na saída." : "Aplicado automaticamente na saída."}>
            <input className="input" inputMode="numeric" value={c.descontoPct ?? 10} onChange={(e) => up({ descontoPct: Math.min(100, Number(e.target.value.replace(/\D/g, "")) || 0) })} />
          </Field>
        )}
        <Field label={tipo === "lista_negra" ? "Motivo do bloqueio" : "Observação"} className="sm:col-span-2">
          <input className="input" value={c.observacao ?? ""} onChange={(e) => up({ observacao: e.target.value })} />
        </Field>
      </div>
    </Modal>
  );
}
