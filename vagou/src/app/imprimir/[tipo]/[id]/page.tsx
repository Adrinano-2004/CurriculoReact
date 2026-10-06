"use client";

import { useParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { QrCode } from "@/components/qrcode";
import { useHydrated } from "@/lib/hooks";
import { pixCopiaECola } from "@/lib/pix";
import { brl } from "@/lib/pricing";
import { calcularSaida, nomeUsuario, resumoCaixa, rotuloForma, tarifaDe, useApp } from "@/lib/store";
import { dataHora, duracao, hora } from "@/lib/util";

function Linha({ a, b, bold }: { a: ReactNode; b: ReactNode; bold?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 ${bold ? "font-bold" : ""}`}>
      <span>{a}</span>
      <span className="text-right">{b}</span>
    </div>
  );
}

const Sep = () => <div className="my-2 border-t border-dashed border-[#999]" />;

export default function Imprimir() {
  const { tipo, id } = useParams<{ tipo: string; id: string }>();
  const ok = useHydrated();
  const s = useApp();

  useEffect(() => {
    if (!ok) return;
    const t = setTimeout(() => window.print(), 600);
    return () => clearTimeout(t);
  }, [ok]);

  if (!ok) return null;
  const e = s.config.empresa;
  const cabecalho = (
    <>
      <div className="text-center text-[14px] font-bold uppercase">{e.nome}</div>
      <div className="text-center text-[#555]">
        {e.cidade} · {e.documento}
      </div>
      <Sep />
    </>
  );

  let corpo: ReactNode = <div>Documento não encontrado.</div>;

  if (tipo === "ticket" || tipo === "recibo") {
    const t = s.tickets.find((x) => x.id === id);
    if (t) {
      const tarifa = tarifaDe(s, t.tarifaId);
      if (tipo === "ticket") {
        const pix = pixCopiaECola({ chave: e.chavePix, nome: e.nome, cidade: e.cidade, txid: `T${t.numero}` });
        corpo = (
          <>
            {cabecalho}
            <Linha a="TICKET" b={<b>Nº {t.numero}</b>} />
            <Linha a="PLACA" b={<b className="text-[15px] tracking-[0.08em]">{t.placa}</b>} />
            <Linha a="VEÍCULO" b={`${t.modelo} ${t.cor}`.toUpperCase()} />
            <Linha a="ENTRADA" b={dataHora(t.entrada)} />
            {t.diaria && <Linha a="DIÁRIA" b={brl(tarifa.diariaLancada)} />}
            <Sep />
            <div className="my-2 flex justify-center">
              <QrCode text={pix} size={120} />
            </div>
            <div className="text-center text-[#555]">Apresente este ticket na saída ou pague pelo QR code do caixa.</div>
            <Sep />
            <div className="text-center text-[10.5px] text-[#555]">
              1ª hora {brl(tarifa.valorHoras[0])} · demais {brl(tarifa.valorHoras[1])}
              <br />
              {e.regulamento}
            </div>
          </>
        );
      } else {
        const c = t.status === "aberto" ? calcularSaida(s, t, Date.now()) : null;
        corpo = (
          <>
            {cabecalho}
            <div className="text-center font-bold">RECIBO DE PAGAMENTO</div>
            <Sep />
            <Linha a="TICKET" b={`Nº ${t.numero}`} />
            <Linha a="PLACA" b={<b>{t.placa}</b>} />
            <Linha a="ENTRADA" b={dataHora(t.entrada)} />
            {t.saida && <Linha a="SAÍDA" b={dataHora(t.saida)} />}
            {t.saida && <Linha a="PERMANÊNCIA" b={duracao(Math.floor((t.saida - t.entrada) / 60000))} />}
            <Sep />
            {(t.desconto ?? 0) > 0 && <Linha a="DESCONTO" b={`− ${brl(t.desconto!)}`} />}
            {(t.valorServicos ?? 0) > 0 && <Linha a="LAVA-JATO" b={brl(t.valorServicos!)} />}
            <Linha a="TOTAL" b={brl(t.valor ?? c?.totalGeral ?? 0)} bold />
            {t.pagamento && <Linha a="PAGAMENTO" b={rotuloForma[t.pagamento].toUpperCase()} />}
            <Linha a="OPERADOR" b={nomeUsuario(s, t.operadorSaida).toUpperCase()} />
            <Sep />
            <div className="text-center">Obrigado pela preferência!</div>
          </>
        );
      }
    }
  }

  if (tipo === "caixa") {
    const cx = s.caixas.find((c) => c.id === id);
    if (cx) {
      const r = resumoCaixa(s, cx.id);
      corpo = (
        <>
          {cabecalho}
          <div className="text-center font-bold">FECHAMENTO DE CAIXA</div>
          <Sep />
          <Linha a="OPERADOR" b={nomeUsuario(s, cx.operador).toUpperCase()} />
          <Linha a="ABERTURA" b={dataHora(cx.abertura)} />
          <Linha a="FECHAMENTO" b={cx.fechamento ? hora(cx.fechamento) : "EM ABERTO"} />
          <Sep />
          {(["dinheiro", "pix", "debito", "credito"] as const).map((f) => (
            <Linha key={f} a={rotuloForma[f].toUpperCase()} b={brl(r.porForma[f] ?? 0)} />
          ))}
          <Linha a="TOTAL" b={brl(r.entradas)} bold />
          <Sep />
          <Linha a="TROCO INICIAL" b={brl(cx.trocoInicial)} />
          <Linha a="SANGRIAS" b={`− ${brl(r.sangrias)}`} />
          <Linha a="SUPRIMENTOS" b={brl(r.suprimentos)} />
          <Linha a="ESPERADO" b={brl(r.esperadoDinheiro)} bold />
          {cx.contado !== undefined && <Linha a="CONTADO" b={brl(cx.contado)} />}
          {cx.contado !== undefined && <Linha a="DIFERENÇA" b={brl(cx.contado - r.esperadoDinheiro)} bold />}
          <Linha a="CANCELAMENTOS" b={r.cancelamentos} />
          <Sep />
          <div className="mt-6 text-center">______________________________</div>
          <div className="text-center">Assinatura</div>
        </>
      );
    }
  }

  return (
    <div className="min-h-dvh bg-[#e9e9e7] py-6 print:bg-white print:py-0">
      <style>{`@page { size: 80mm auto; margin: 3mm; } body { background: #fff !important; }`}</style>
      <div className="mx-auto w-[302px] bg-white p-4 font-mono text-[11.5px] leading-[1.5] text-[#111] shadow-[0_10px_30px_rgba(0,0,0,0.1)] print:w-full print:p-0 print:shadow-none">{corpo}</div>
      <div className="no-print mt-4 text-center">
        <button className="btn btn-dark btn-sm" onClick={() => window.print()}>
          Imprimir
        </button>
      </div>
    </div>
  );
}
