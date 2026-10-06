"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { I } from "@/components/icons";
import { Field, Money, MoneyInput, PageTitle, PinInput, Segmented, toast } from "@/components/ui";
import { calcular } from "@/lib/pricing";
import { useApp, type Dados } from "@/lib/store";
import type { DiaSemana, Empresa, Papel, Promocao, ServicoCatalogo, Tarifa, Usuario } from "@/lib/types";
import { baixarArquivo, cx, duracao, uid } from "@/lib/util";

type Aba = "precos" | "promocoes" | "empresa" | "equipe" | "lavajato" | "dados";

export default function AjustesPage() {
  const operador = useApp((s) => s.usuarios.find((u) => u.id === s.operadorId));
  const autorizar = useApp((s) => s.autorizar);
  const [liberado, setLiberado] = useState(false);
  const [pin, setPin] = useState("");
  const [aba, setAba] = useState<Aba>("precos");
  const gerente = operador?.papel === "gerente" || operador?.papel === "dono";

  if (!gerente && !liberado) {
    return (
      <div className="mx-auto max-w-[1280px]">
        <PageTitle sec="Ajustes" title="Área da" muted="gerência." />
        <form
          className="glass max-w-md p-7"
          onSubmit={(e) => {
            e.preventDefault();
            if (autorizar(pin)) setLiberado(true);
            else toast("PIN incorreto", "alert");
          }}
        >
          <span className="inline-flex size-11 items-center justify-center rounded-full bg-paper shadow-[0_3px_12px_rgba(0,0,0,0.06)]">
            <I.lock />
          </span>
          <p className="mb-4 mt-4 text-[15px] text-ink-2">Preços, equipe e dados só podem ser alterados com o PIN do gerente.</p>
          <PinInput value={pin} onChange={setPin} />
          <button className="btn btn-dark mt-4 w-full" disabled={pin.length < 4}>
            Liberar
          </button>
          <p className="mt-3 text-[12px] text-muted">Demonstração: PIN 1234</p>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px]">
      <PageTitle sec="Ajustes" title="Você define as regras." muted="O sistema faz as contas." />
      <div className="mb-4">
        <Segmented
          value={aba}
          onChange={setAba}
          options={[
            { value: "precos", label: "Tabela de preços" },
            { value: "promocoes", label: "Promoções" },
            { value: "empresa", label: "Empresa e ticket" },
            { value: "equipe", label: "Equipe" },
            { value: "lavajato", label: "Serviços de lava-jato" },
            { value: "dados", label: "Dados e backup" },
          ]}
        />
      </div>
      {aba === "precos" && <Precos />}
      {aba === "promocoes" && <Promocoes />}
      {aba === "empresa" && <EmpresaForm />}
      {aba === "equipe" && <Equipe />}
      {aba === "lavajato" && <Servicos />}
      {aba === "dados" && <DadosBackup />}
    </div>
  );
}

/* ------------------------------- preços ------------------------------- */

function Precos() {
  const tarifas = useApp((s) => s.config.tarifas);
  const promocoes = useApp((s) => s.config.promocoes);
  const salvar = useApp((s) => s.salvarTarifa);
  const remover = useApp((s) => s.removerTarifa);
  const padrao = useApp((s) => s.config.tarifaPadraoId);
  const [selId, setSelId] = useState(tarifas[0]?.id ?? "");
  const original = tarifas.find((t) => t.id === selId);
  const [t, setT] = useState<Tarifa | undefined>(original);
  const [entrada, setEntrada] = useState("08:10");
  const [tempo, setTempo] = useState("03:20");

  useEffect(() => setT(tarifas.find((x) => x.id === selId)), [selId, tarifas]);

  const sim = useMemo(() => {
    if (!t) return null;
    const [h, m] = entrada.split(":").map(Number);
    const [th, tm] = tempo.split(":").map(Number);
    const ini = new Date();
    ini.setHours(h || 0, m || 0, 0, 0);
    const fim = ini.getTime() + ((th || 0) * 60 + (tm || 0)) * 60000;
    return calcular({ tarifa: t, entrada: ini.getTime(), saida: fim, promocoes });
  }, [t, entrada, tempo, promocoes]);

  if (!t) return null;
  const up = (p: Partial<Tarifa>) => setT({ ...t, ...p });
  const mudou = JSON.stringify(t) !== JSON.stringify(original);

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_400px]">
      <section className="glass p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <Segmented value={selId} onChange={setSelId} options={tarifas.map((x) => ({ value: x.id, label: x.nome }))} />
          <button
            className="btn btn-light btn-sm"
            onClick={() => {
              const nova: Tarifa = { ...t, id: uid(), nome: "Nova categoria" };
              salvar(nova);
              setSelId(nova.id);
            }}
          >
            <I.plus size={14} /> Categoria
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Nome da categoria" className="sm:col-span-3">
            <input className="input" value={t.nome} onChange={(e) => up({ nome: e.target.value })} />
          </Field>
          <Field label="1ª hora">
            <MoneyInput value={t.valorHoras[0]} onChange={(v) => up({ valorHoras: [v, t.valorHoras[1], t.valorHoras[2]] })} />
          </Field>
          <Field label="2ª hora">
            <MoneyInput value={t.valorHoras[1]} onChange={(v) => up({ valorHoras: [t.valorHoras[0], v, t.valorHoras[2]] })} />
          </Field>
          <Field label="3ª hora em diante">
            <MoneyInput value={t.valorHoras[2]} onChange={(v) => up({ valorHoras: [t.valorHoras[0], t.valorHoras[1], v] })} />
          </Field>
          <Field label="Meia diária (até 12h)" hint="Valor máximo para quem fica até 12 horas.">
            <MoneyInput value={t.meiaDiaria} onChange={(v) => up({ meiaDiaria: v })} />
          </Field>
          <Field label="Diária (até 24h)" hint="Valor máximo por dia.">
            <MoneyInput value={t.diaria} onChange={(v) => up({ diaria: v })} />
          </Field>
          <Field label="Diária lançada" hint="Cobrança fixa de diária.">
            <MoneyInput value={t.diariaLancada} onChange={(v) => up({ diariaLancada: v })} />
          </Field>
          <Field label="Tolerância na entrada (min)" hint="Quem sai antes disso não paga.">
            <input className="input" inputMode="numeric" value={t.toleranciaInicialMin} onChange={(e) => up({ toleranciaInicialMin: Number(e.target.value.replace(/\D/g, "")) || 0 })} />
          </Field>
          <Field label="Tolerância por hora (min)" hint="Minutos extras antes de cobrar nova hora.">
            <input className="input" inputMode="numeric" value={t.toleranciaFracaoMin} onChange={(e) => up({ toleranciaFracaoMin: Number(e.target.value.replace(/\D/g, "")) || 0 })} />
          </Field>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            className="btn btn-dark"
            disabled={!mudou}
            onClick={() => {
              salvar(t);
              toast("Tabela de preços salva");
            }}
          >
            Salvar alterações
          </button>
          {mudou && (
            <button className="btn btn-light" onClick={() => setT(original)}>
              Desfazer
            </button>
          )}
          {tarifas.length > 1 && t.id !== padrao && (
            <button
              className="btn btn-danger ml-auto"
              onClick={() => {
                if (confirm(`Remover a categoria ${t.nome}?`)) {
                  remover(t.id);
                  setSelId(tarifas[0]!.id);
                }
              }}
            >
              <I.trash size={14} /> Remover
            </button>
          )}
        </div>
        <p className="mt-3 flex items-center gap-2 text-[12px] text-muted">
          <I.lock size={13} /> Toda alteração de preço fica registrada no histórico.
        </p>
      </section>

      <section className="glass p-6">
        <div className="label">Simulador</div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label="Entrada">
            <input type="time" className="input" value={entrada} onChange={(e) => setEntrada(e.target.value)} />
          </Field>
          <Field label="Tempo (hh:mm)">
            <input className="input" value={tempo} onChange={(e) => setTempo(e.target.value.replace(/[^\d:]/g, ""))} />
          </Field>
        </div>
        {sim && (
          <>
            <div className="mt-5 text-[13px] text-muted">
              {duracao(sim.minutos)} · {t.nome}
            </div>
            <Money value={sim.total} className="block text-[52px] leading-tight" />
            <div className="mt-2">
              {sim.detalhe.map((d) => (
                <div key={d} className="row text-[13px] text-ink-2">
                  {d}
                </div>
              ))}
            </div>
          </>
        )}
        <div className="mt-5 flex flex-wrap gap-1.5">
          {["00:08", "01:05", "02:30", "05:00", "13:00", "26:00"].map((x) => (
            <button key={x} className="chip" data-on={tempo === x} onClick={() => setTempo(x)}>
              {x.replace(":", "h")}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ------------------------------ promoções ------------------------------ */

const DIAS: { d: DiaSemana; l: string }[] = [
  { d: 1, l: "Seg" },
  { d: 2, l: "Ter" },
  { d: 3, l: "Qua" },
  { d: 4, l: "Qui" },
  { d: 5, l: "Sex" },
  { d: 6, l: "Sáb" },
  { d: 0, l: "Dom" },
];

function Promocoes() {
  const promocoes = useApp((s) => s.config.promocoes);
  const salvarConfig = useApp((s) => s.salvarConfig);
  const set = (lista: Promocao[], desc: string) => salvarConfig({ promocoes: lista }, desc);
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {promocoes.map((p) => (
        <section key={p.id} className={cx("glass p-5", p.ativa && "!bg-[linear-gradient(135deg,#fbe3d6,#f7f1ec)]")}>
          <div className="flex items-center justify-between gap-2">
            <input className="input !bg-transparent !border-transparent !px-0 text-[18px] font-medium" value={p.nome} onChange={(e) => set(promocoes.map((x) => (x.id === p.id ? { ...x, nome: e.target.value } : x)), "")} />
            <label className="flex items-center gap-2 text-[13px]">
              <input type="checkbox" className="size-4 accent-[#2A2A29]" checked={p.ativa} onChange={(e) => set(promocoes.map((x) => (x.id === p.id ? { ...x, ativa: e.target.checked } : x)), `Promoção ${e.target.checked ? "ativada" : "desativada"} · ${p.nome}`)} />
              Ativa
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {DIAS.map(({ d, l }) => (
              <button key={d} className="chip" data-on={p.dias.includes(d)} onClick={() => set(promocoes.map((x) => (x.id === p.id ? { ...x, dias: x.dias.includes(d) ? x.dias.filter((y) => y !== d) : [...x.dias, d] } : x)), "")}>
                {l}
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <Field label="Entradas a partir de">
              <input type="time" className="input" value={p.aPartirDe} onChange={(e) => set(promocoes.map((x) => (x.id === p.id ? { ...x, aPartirDe: e.target.value } : x)), "")} />
            </Field>
            <Field label="Tipo">
              <select className="input" value={p.tipo} onChange={(e) => set(promocoes.map((x) => (x.id === p.id ? { ...x, tipo: e.target.value as Promocao["tipo"] } : x)), "")}>
                <option value="fixo">Preço fixo</option>
                <option value="desconto">Desconto %</option>
              </select>
            </Field>
            <Field label={p.tipo === "fixo" ? "Valor" : "Desconto (%)"}>
              <input className="input" inputMode="decimal" value={p.valor} onChange={(e) => set(promocoes.map((x) => (x.id === p.id ? { ...x, valor: Number(e.target.value.replace(",", ".")) || 0 } : x)), "")} />
            </Field>
          </div>
          <button className="btn btn-ghost btn-sm mt-3 text-alert-ink" onClick={() => set(promocoes.filter((x) => x.id !== p.id), `Promoção removida · ${p.nome}`)}>
            <I.trash size={13} /> Remover
          </button>
        </section>
      ))}
      <button
        className="glass flex min-h-[200px] flex-col items-center justify-center gap-2 border-dashed text-[14px] text-muted hover:text-ink"
        onClick={() => set([...promocoes, { id: uid(), nome: "Nova promoção", ativa: false, dias: [1, 2, 3, 4, 5], aPartirDe: "18:00", tipo: "desconto", valor: 20 }], "Promoção criada")}
      >
        <I.plus /> Nova promoção
      </button>
    </div>
  );
}

/* ------------------------------- empresa ------------------------------- */

function EmpresaForm() {
  const config = useApp((s) => s.config);
  const salvarConfig = useApp((s) => s.salvarConfig);
  const [e, setE] = useState<Empresa>(config.empresa);
  const [vagas, setVagas] = useState(config.vagas);
  const [alerta, setAlerta] = useState(config.alertaHoras);
  const [auto, setAuto] = useState(!!config.imprimirAutomatico);
  const up = (p: Partial<Empresa>) => setE({ ...e, ...p });
  return (
    <section className="glass max-w-3xl p-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nome do estacionamento">
          <input className="input" value={e.nome} onChange={(x) => up({ nome: x.target.value })} />
        </Field>
        <Field label="Cidade">
          <input className="input" value={e.cidade} onChange={(x) => up({ cidade: x.target.value })} />
        </Field>
        <Field label="CNPJ / CPF">
          <input className="input" value={e.documento} onChange={(x) => up({ documento: x.target.value })} />
        </Field>
        <Field label="WhatsApp da gerência" hint="Recebe o resumo do fechamento de caixa.">
          <input className="input" value={e.telefone} onChange={(x) => up({ telefone: x.target.value })} />
        </Field>
        <Field label="Chave PIX" className="sm:col-span-2" hint="Usada no QR code da saída e do ticket.">
          <input className="input" value={e.chavePix} onChange={(x) => up({ chavePix: x.target.value })} />
        </Field>
        <Field label="Regulamento (sai impresso no ticket)" className="sm:col-span-2">
          <textarea className="input min-h-[90px]" value={e.regulamento} onChange={(x) => up({ regulamento: x.target.value })} />
        </Field>
        <Field label="Total de vagas">
          <input className="input" inputMode="numeric" value={vagas} onChange={(x) => setVagas(Number(x.target.value.replace(/\D/g, "")) || 0)} />
        </Field>
        <Field label="Alertar carro parado há mais de (horas)">
          <input className="input" inputMode="numeric" value={alerta} onChange={(x) => setAlerta(Number(x.target.value.replace(/\D/g, "")) || 1)} />
        </Field>
        <label className="flex items-center gap-2 text-[14px] sm:col-span-2">
          <input type="checkbox" className="size-4 accent-[#2A2A29]" checked={auto} onChange={(x) => setAuto(x.target.checked)} />
          Abrir a impressão do ticket automaticamente na entrada
        </label>
      </div>
      <button
        className="btn btn-dark mt-5"
        onClick={() => {
          salvarConfig({ empresa: e, vagas, alertaHoras: alerta, imprimirAutomatico: auto }, "Dados da empresa atualizados");
          toast("Dados salvos");
        }}
      >
        Salvar
      </button>
    </section>
  );
}

/* -------------------------------- equipe -------------------------------- */

function Equipe() {
  const usuarios = useApp((s) => s.usuarios);
  const salvar = useApp((s) => s.salvarUsuario);
  const remover = useApp((s) => s.removerUsuario);
  const operadorId = useApp((s) => s.operadorId);
  const [edit, setEdit] = useState<Usuario | null>(null);
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
      <section className="glass p-5">
        {usuarios.map((u) => (
          <div key={u.id} className="row text-[14px]">
            <span>
              <span className="block font-medium">{u.nome}</span>
              <span className="block text-[12px] capitalize text-muted">{u.papel}</span>
            </span>
            <span className="flex gap-1.5">
              <button className="btn btn-light btn-sm" onClick={() => setEdit(u)}>
                <I.edit size={13} /> Editar
              </button>
              {u.id !== operadorId && (
                <button className="btn btn-ghost btn-sm !px-2" aria-label="Remover" onClick={() => confirm(`Remover ${u.nome}?`) && remover(u.id)}>
                  <I.trash size={13} />
                </button>
              )}
            </span>
          </div>
        ))}
        <button className="btn btn-dark btn-sm mt-4" onClick={() => setEdit({ id: uid(), nome: "", papel: "operador", pin: "" })}>
          <I.plus size={14} /> Adicionar pessoa
        </button>
      </section>
      {edit && (
        <section className="glass p-5">
          <Field label="Nome">
            <input className="input" value={edit.nome} onChange={(e) => setEdit({ ...edit, nome: e.target.value })} autoFocus />
          </Field>
          <div className="label mb-1.5 mt-3">Função</div>
          <Segmented
            value={edit.papel}
            onChange={(p: Papel) => setEdit({ ...edit, papel: p })}
            options={[
              { value: "operador", label: "Operador" },
              { value: "gerente", label: "Gerente" },
              { value: "dono", label: "Dono" },
            ]}
          />
          <Field label="PIN (4 a 6 números)" className="mt-3">
            <input className="input tracking-[0.4em]" inputMode="numeric" maxLength={6} value={edit.pin} onChange={(e) => setEdit({ ...edit, pin: e.target.value.replace(/\D/g, "") })} />
          </Field>
          <p className="mt-2 text-[12px] text-muted">Gerente e dono podem autorizar cancelamentos e alterar preços.</p>
          <div className="mt-4 flex gap-2">
            <button
              className="btn btn-dark"
              disabled={!edit.nome.trim() || edit.pin.length < 4 || usuarios.some((u) => u.pin === edit.pin && u.id !== edit.id)}
              onClick={() => {
                salvar(edit);
                setEdit(null);
                toast("Equipe atualizada");
              }}
            >
              Salvar
            </button>
            <button className="btn btn-light" onClick={() => setEdit(null)}>
              Cancelar
            </button>
          </div>
          {usuarios.some((u) => u.pin === edit.pin && u.id !== edit.id) && <p className="mt-2 text-[12px] text-alert-ink">Esse PIN já está em uso.</p>}
        </section>
      )}
    </div>
  );
}

/* ------------------------------- serviços ------------------------------- */

function Servicos() {
  const servicos = useApp((s) => s.config.servicos);
  const salvarConfig = useApp((s) => s.salvarConfig);
  const [lista, setLista] = useState<ServicoCatalogo[]>(servicos);
  return (
    <section className="glass max-w-2xl p-6">
      {lista.map((v, i) => (
        <div key={v.id} className="mb-2 grid grid-cols-[1fr_150px_40px] items-center gap-2">
          <input className="input" value={v.nome} onChange={(e) => setLista(lista.map((x, j) => (j === i ? { ...x, nome: e.target.value } : x)))} />
          <MoneyInput value={v.valor} onChange={(n) => setLista(lista.map((x, j) => (j === i ? { ...x, valor: n } : x)))} />
          <button className="btn btn-ghost !px-2" aria-label="Remover" onClick={() => setLista(lista.filter((_, j) => j !== i))}>
            <I.trash size={14} />
          </button>
        </div>
      ))}
      <div className="mt-4 flex gap-2">
        <button className="btn btn-light btn-sm" onClick={() => setLista([...lista, { id: uid(), nome: "Novo serviço", valor: 50 }])}>
          <I.plus size={14} /> Serviço
        </button>
        <button
          className="btn btn-dark btn-sm"
          onClick={() => {
            salvarConfig({ servicos: lista }, "Serviços de lava-jato atualizados");
            toast("Serviços salvos");
          }}
        >
          Salvar
        </button>
      </div>
    </section>
  );
}

/* --------------------------------- dados --------------------------------- */

function DadosBackup() {
  const restaurar = useApp((s) => s.restaurar);
  const resetarDemo = useApp((s) => s.resetarDemo);
  const limparTudo = useApp((s) => s.limparTudo);
  const ref = useRef<HTMLInputElement>(null);
  const exportar = () => {
    const s = useApp.getState();
    const d: Dados = {
      versao: s.versao,
      config: s.config,
      usuarios: s.usuarios,
      operadorId: s.operadorId,
      tickets: s.tickets,
      veiculos: s.veiculos,
      clientes: s.clientes,
      caixas: s.caixas,
      movimentos: s.movimentos,
      servicos: s.servicos,
      auditoria: s.auditoria,
      proximoTicket: s.proximoTicket,
    };
    baixarArquivo(`vagou-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(d), "application/json");
    toast("Backup baixado");
  };
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <section className="glass p-6">
        <span className="inline-flex size-11 items-center justify-center rounded-full bg-paper shadow-[0_3px_12px_rgba(0,0,0,0.06)]">
          <I.backup />
        </span>
        <div className="mt-4 text-[18px] font-medium">Cópia de segurança</div>
        <p className="mt-1 text-[14px] text-muted">Os dados ficam salvos neste computador e o sistema funciona mesmo sem internet. Baixe uma cópia com frequência.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn btn-dark" onClick={exportar}>
            <I.download size={15} /> Baixar backup
          </button>
          <button className="btn btn-light" onClick={() => ref.current?.click()}>
            <I.upload size={15} /> Restaurar backup
          </button>
          <input
            ref={ref}
            type="file"
            accept="application/json"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                const d = JSON.parse(await f.text()) as Dados;
                if (!d.config || !Array.isArray(d.tickets)) throw new Error();
                if (confirm("Substituir os dados atuais pelo backup?")) {
                  restaurar(d);
                  toast("Backup restaurado");
                }
              } catch {
                toast("Arquivo de backup inválido", "alert");
              }
              e.target.value = "";
            }}
          />
        </div>
      </section>
      <section className="glass p-6">
        <span className="inline-flex size-11 items-center justify-center rounded-full bg-paper shadow-[0_3px_12px_rgba(0,0,0,0.06)]">
          <I.alert />
        </span>
        <div className="mt-4 text-[18px] font-medium">Demonstração</div>
        <p className="mt-1 text-[14px] text-muted">O sistema vem com dados de exemplo. Quando for usar de verdade, comece do zero (as configurações e a equipe são mantidas como modelo).</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn btn-light" onClick={() => confirm("Recarregar os dados de demonstração?") && (resetarDemo(), toast("Demonstração recarregada"))}>
            Recarregar demonstração
          </button>
          <button className="btn btn-danger" onClick={() => confirm("Apagar todo o movimento e começar do zero?") && (limparTudo(), toast("Tudo pronto para começar"))}>
            Começar do zero
          </button>
        </div>
      </section>
    </div>
  );
}
