"use client";

import { useMemo, useState } from "react";
import { I } from "@/components/icons";
import { Field, Modal, Money, PageTitle, Plate, Segmented, toast } from "@/components/ui";
import { useNow } from "@/lib/hooks";
import { brl } from "@/lib/pricing";
import { caixaAberto, useApp } from "@/lib/store";
import { DIA_MS, noPatio, receitas, soma } from "@/lib/stats";
import type { FormaPagamento, ServicoLavaJato, StatusServico } from "@/lib/types";
import { cx, duracao, inicioDoDia, linkWhatsApp, normalizarPlaca, placaValida } from "@/lib/util";

const COLUNAS: { status: StatusServico; titulo: string }[] = [
  { status: "fila", titulo: "Na fila" },
  { status: "lavando", titulo: "Lavando" },
  { status: "pronto", titulo: "Pronto" },
  { status: "entregue", titulo: "Entregue hoje" },
];
const PROXIMO: Record<StatusServico, StatusServico | null> = { fila: "lavando", lavando: "pronto", pronto: "entregue", entregue: null };

export default function LavaJatoPage() {
  const s = useApp();
  const agora = useNow(30000);
  const hoje = inicioDoDia(agora);
  const [novo, setNovo] = useState(false);
  const [receber, setReceber] = useState<ServicoLavaJato | null>(null);
  const mover = useApp((x) => x.moverServico);
  const remover = useApp((x) => x.removerServico);

  const visiveis = useMemo(() => s.servicos.filter((v) => v.status !== "entregue" || v.atualizadoEm >= hoje), [s.servicos, hoje]);
  const fat = soma(receitas(s, hoje, hoje + DIA_MS).filter((m) => m.tipo === "lavajato")) + s.tickets.filter((t) => t.saida && t.saida >= hoje).reduce((a, t) => a + (t.valorServicos ?? 0), 0);
  const placasPatio = new Set(noPatio(s).map((t) => t.placa));

  return (
    <div className="mx-auto max-w-[1280px]">
      <PageTitle sec="Lava-jato" title="Fila de serviços," muted="do pedido à entrega.">
        <button className="btn btn-dark" onClick={() => setNovo(true)}>
          <I.plus size={16} /> Novo serviço
        </button>
      </PageTitle>

      <div className="card mb-4 grid grid-cols-3 divide-x divide-line">
        <div className="px-5 py-4">
          <div className="label">Na fila agora</div>
          <div className="num text-[26px]">{visiveis.filter((v) => v.status === "fila").length}</div>
        </div>
        <div className="px-5 py-4">
          <div className="label">Serviços hoje</div>
          <div className="num text-[26px]">{s.servicos.filter((v) => v.criadoEm >= hoje).length}</div>
        </div>
        <div className="px-5 py-4">
          <div className="label">Faturado hoje</div>
          <Money value={fat} className="text-[26px]" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {COLUNAS.map((col) => {
          const itens = visiveis.filter((v) => v.status === col.status).sort((a, b) => a.criadoEm - b.criadoEm);
          return (
            <section key={col.status} className="glass min-h-[300px] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className={cx("tag", col.status === "pronto" || col.status === "entregue" ? "ok" : col.status === "lavando" ? "dark" : "")}>{col.titulo}</span>
                <span className="text-[13px] text-muted">{itens.length}</span>
              </div>
              <div className="space-y-2">
                {itens.map((v) => {
                  const prox = PROXIMO[v.status];
                  return (
                    <div key={v.id} className="rounded-[16px] bg-paper p-3.5 shadow-[0_4px_14px_rgba(0,0,0,0.04)]">
                      <div className="flex items-center justify-between gap-2">
                        <Plate placa={v.placa} />
                        <Money value={v.valor} className="text-[16px]" />
                      </div>
                      <div className="mt-2 text-[14px] font-medium">{v.nome}</div>
                      <div className="text-[12px] text-muted">
                        {v.modelo || "Veículo"} · há {duracao(Math.floor((agora - v.criadoEm) / 60000))}
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {v.pago ? <span className="pill pill-ok">Pago</span> : placasPatio.has(v.placa) ? <span className="pill pill-n">Cobra na saída</span> : <span className="pill pill-warn">A receber</span>}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {prox && (
                          <button className="btn btn-dark btn-sm" onClick={() => mover(v.id, prox)}>
                            {prox === "lavando" ? "Começar" : prox === "pronto" ? "Marcar pronto" : "Entregar"}
                          </button>
                        )}
                        {v.status === "pronto" && v.telefone && (
                          <a className="btn btn-light btn-sm" target="_blank" rel="noreferrer" href={linkWhatsApp(v.telefone, `Olá! Seu ${v.modelo || "veículo"} (${v.placa}) está pronto para retirada no ${s.config.empresa.nome}. 🚗✨`)}>
                            <I.chat size={13} /> Avisar
                          </a>
                        )}
                        {!v.pago && !placasPatio.has(v.placa) && (
                          <button className="btn btn-light btn-sm" onClick={() => setReceber(v)}>
                            Receber
                          </button>
                        )}
                        {v.status === "fila" && (
                          <button className="btn btn-ghost btn-sm !px-2" aria-label="Remover" onClick={() => remover(v.id)}>
                            <I.trash size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {itens.length === 0 && <div className="rounded-[16px] border border-dashed border-line py-8 text-center text-[12.5px] text-muted">Vazio</div>}
              </div>
            </section>
          );
        })}
      </div>

      {novo && <NovoServico onClose={() => setNovo(false)} />}
      {receber && <ReceberServico servico={receber} onClose={() => setReceber(null)} />}
    </div>
  );
}

function NovoServico({ onClose }: { onClose: () => void }) {
  const s = useApp();
  const adicionar = useApp((x) => x.adicionarServico);
  const [placa, setPlaca] = useState("");
  const [servicoId, setServicoId] = useState(s.config.servicos[0]?.id ?? "");
  const [telefone, setTelefone] = useState("");
  const patio = noPatio(s);
  const p = normalizarPlaca(placa);
  const cliente = s.clientes.find((c) => c.placas.includes(p));
  return (
    <Modal
      open
      onClose={onClose}
      title="Novo serviço"
      width={520}
      footer={
        <>
          <button className="btn btn-light" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-dark"
            disabled={!placaValida(p) || !servicoId}
            onClick={() => {
              adicionar(p, servicoId, telefone || cliente?.telefone);
              toast("Serviço adicionado à fila");
              onClose();
            }}
          >
            Adicionar à fila
          </button>
        </>
      }
    >
      <Field label="Placa">
        <input className="input text-[18px] font-semibold uppercase tracking-[0.1em]" value={placa} onChange={(e) => setPlaca(normalizarPlaca(e.target.value))} data-autofocus placeholder="ABC1D23" />
      </Field>
      {patio.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {patio.slice(0, 8).map((t) => (
            <button key={t.id} className="chip" data-on={p === t.placa} onClick={() => setPlaca(t.placa)}>
              {t.placa} · {t.modelo}
            </button>
          ))}
        </div>
      )}
      <div className="label mb-1.5 mt-4">Serviço</div>
      <Segmented value={servicoId} onChange={setServicoId} options={s.config.servicos.map((x) => ({ value: x.id, label: `${x.nome} · ${brl(x.valor)}` }))} />
      <Field label="WhatsApp para avisar quando ficar pronto" className="mt-4">
        <input className="input" value={telefone || cliente?.telefone || ""} onChange={(e) => setTelefone(e.target.value)} placeholder="(32) 99999-0000" />
      </Field>
    </Modal>
  );
}

function ReceberServico({ servico, onClose }: { servico: ServicoLavaJato; onClose: () => void }) {
  const s = useApp();
  const receber = useApp((x) => x.receberServico);
  const abrir = useApp((x) => x.abrirCaixa);
  const [forma, setForma] = useState<FormaPagamento>("pix");
  const cx_ = caixaAberto(s);
  return (
    <Modal
      open
      onClose={onClose}
      title="Receber serviço"
      width={460}
      footer={
        <>
          <button className="btn btn-light" onClick={onClose}>
            Cancelar
          </button>
          {cx_ ? (
            <button
              className="btn btn-dark"
              onClick={() => {
                receber(servico.id, forma);
                toast("Serviço recebido");
                onClose();
              }}
            >
              Confirmar
            </button>
          ) : (
            <button className="btn btn-dark" onClick={() => abrir(100)}>
              Abrir caixa
            </button>
          )}
        </>
      }
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2.5 text-[14px]">
          <Plate placa={servico.placa} /> {servico.nome}
        </span>
        <Money value={servico.valor} className="text-[28px]" />
      </div>
      <div className="mt-4">
        <Segmented value={forma} onChange={setForma} options={(["pix", "dinheiro", "debito", "credito"] as FormaPagamento[]).map((f) => ({ value: f, label: f === "pix" ? "PIX" : f === "dinheiro" ? "Dinheiro" : f === "debito" ? "Débito" : "Crédito" }))} />
      </div>
    </Modal>
  );
}
