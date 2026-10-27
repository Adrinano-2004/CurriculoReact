import type { ReactNode } from "react";
import { Bars, Money, Plate } from "./ui";
import { Wordmark, WORD_RATIO } from "./brand";
import { cx } from "@/lib/util";

/** Valores determinísticos para gráficos ilustrativos. */
export function serie(n: number, seed: number, picos: number[] = [0.42, 0.8]): number[] {
  let s = seed;
  const r = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  return Array.from({ length: n }, (_, i) => {
    const x = i / (n - 1);
    return 18 + picos.reduce((a, p, k) => a + (k === 0 ? 55 : 32) * Math.exp(-Math.pow((x - p) / 0.13, 2)), 0) + r() * 16;
  });
}

export function Phone({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("relative h-[600px] w-[292px] rounded-[52px] bg-gradient-to-br from-[#e8e5e1] via-[#bdb9b4] to-[#e3e0dc] p-[10px] shadow-[0_40px_80px_rgba(0,0,0,0.2)]", className)}>
      <div className="h-full w-full rounded-[43px] bg-[#111] p-[3px]">
        <div className="relative h-full w-full overflow-hidden rounded-[40px] bg-gradient-to-b from-[#f6f6f5] to-[#ececea]">
          <div className="absolute left-1/2 top-[11px] z-10 h-[26px] w-[92px] -translate-x-1/2 rounded-full bg-[#0b0b0b]" />
          <div className="flex justify-between px-7 pt-[15px] text-[12px] font-semibold">
            <span>9:41</span>
            <span>●●● ▮</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function PhonePainel() {
  return (
    <Phone>
      <div className="px-[18px] pt-5 text-center">
        <Wordmark className="mx-auto text-ink" style={{ height: 16, width: 16 * WORD_RATIO }} />
        <span className="chip mt-3 !text-[10.5px]">Hoje · ao vivo</span>
        <div className="mt-3 text-[11px] text-muted">Recebido hoje</div>
        <Money value={1240} className="text-[38px] leading-tight" />
      </div>
      <div className="grid grid-cols-2 gap-2 px-3.5 pt-3">
        <div className="card !rounded-[16px] p-3">
          <div className="text-[10px] text-muted">No pátio</div>
          <div className="num text-[22px]">
            32<span className="text-[14px] text-muted-2"> / 40</span>
          </div>
        </div>
        <div className="card !rounded-[16px] p-3">
          <div className="text-[10px] text-muted">Atendidos</div>
          <div className="num text-[22px]">87</div>
        </div>
      </div>
      <div className="card mx-3.5 mt-2 !rounded-[16px] p-3">
        <div className="mb-1.5 text-[10px] text-muted">Movimento por hora</div>
        <div className="h-[78px]">
          <Bars values={serie(36, 7)} highlight={[15]} />
        </div>
      </div>
      <div className="mx-3.5 mt-2 rounded-[16px] bg-dark px-3.5 py-3 text-[11px] leading-snug text-white">
        <span className="font-semibold text-ok">● Caixa fechado</span>
        <br />
        Manhã: R$ 640,00 · sem diferença
      </div>
    </Phone>
  );
}

export function PhonePatio() {
  const itens: [string, string, string, string][] = [
    ["RTA4B21", "HB20", "12min", "pill-n"],
    ["SYX3I13", "Onix", "1h 05min", "pill-n"],
    ["RKE2F45", "Corolla", "Mensalista", "pill-ok"],
    ["QPB7A10", "Kicks", "2h 40min", "pill-n"],
    ["SBC1D88", "Compass", "VIP", "pill-warn"],
    ["QQA5H19", "Gol", "5h 10min", "pill-alert"],
    ["RHT0B33", "Renegade", "48min", "pill-n"],
  ];
  return (
    <Phone>
      <div className="flex items-end justify-between px-[18px] pb-2 pt-5">
        <div className="num text-[26px]">Pátio agora</div>
        <span className="chip !text-[10.5px]">32 / 40</span>
      </div>
      <div className="space-y-1.5 px-3.5">
        {itens.map(([p, m, t, c]) => (
          <div key={p} className="card flex items-center justify-between !rounded-[14px] px-3 py-2.5">
            <span className="flex items-center gap-2 text-[11px]">
              <Plate placa={p} /> {m}
            </span>
            <span className={cx("pill !text-[10px]", c)}>{t}</span>
          </div>
        ))}
      </div>
    </Phone>
  );
}

export function TelaSaida({ className }: { className?: string }) {
  return (
    <div className={cx("glass bg-white/90 p-6", className)}>
      <div className="flex items-center justify-between">
        <Plate placa="SYX3I13" size="md" />
        <span className="pill pill-n">Saída</span>
      </div>
      <div className="mt-3 text-[17px] font-medium">Chevrolet Onix · prata</div>
      <div className="mt-2 text-[14px]">
        {[
          ["Entrada", "10:40"],
          ["Saída", "11:45"],
          ["Tempo", "1h 05min"],
        ].map(([a, b]) => (
          <div key={a} className="row">
            <span className="text-muted">{a}</span>
            <span>{b}</span>
          </div>
        ))}
      </div>
      <div className="tile mt-3 flex items-center justify-between px-5 py-4">
        <span className="text-[13px] text-muted">Total a pagar</span>
        <Money value={15} className="text-[48px] leading-none" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <span className="btn btn-light">Dinheiro</span>
        <span className="btn btn-dark">PIX</span>
        <span className="btn btn-light">Cartão</span>
      </div>
    </div>
  );
}

export function TelaSistema() {
  const linhas: [string, string, string, string][] = [
    ["RTA4B21", "HB20", "Entrada", "pill-n"],
    ["SYX3I13", "Onix", "Saída · R$ 15,00", "pill-ok"],
    ["RKE2F45", "Corolla", "Mensalista", "pill-n"],
    ["QPB7A10", "Kicks", "Saída · R$ 20,00", "pill-ok"],
    ["SBC1D88", "Compass", "VIP · −20%", "pill-warn"],
    ["PXK9D11", "Gol", "Lista negra", "pill-alert"],
  ];
  const nav = ["Início", "Pátio", "Caixa", "Lava-jato", "Clientes", "Relatórios"];
  return (
    <div className="relative mx-auto w-full max-w-[1040px] rounded-[24px] bg-[#1b1b1b] p-3 shadow-[0_40px_80px_rgba(0,0,0,0.18)]">
      <div className="grid overflow-hidden rounded-[14px] bg-bg text-[12px] md:grid-cols-[190px_1fr]">
        <div className="hidden border-r border-line bg-white/55 p-4 md:block">
          <div className="mb-4 flex items-center gap-2 font-semibold">
            <Wordmark className="text-ink" style={{ height: 18, width: 18 * WORD_RATIO }} />
          </div>
          <div className="mb-3 rounded-[10px] border border-line bg-paper px-2.5 py-2 text-[11px] text-muted">Buscar placa…</div>
          <div className="grid grid-cols-2 gap-1.5">
            {nav.map((n, i) => (
              <div key={n} className={cx("flex h-[52px] items-center justify-center rounded-[12px] text-[10.5px]", i === 0 ? "bg-dark text-white" : "bg-paper text-ink-2")}>
                {n}
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 text-[11px] text-ink-2">
            {["F1 · Entrada e saída", "F2 · Caixa", "F4 · Clientes", "F7 · Relatórios"].map((x) => (
              <div key={x}>{x}</div>
            ))}
          </div>
        </div>
        <div className="p-4 md:p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <div className="num text-[22px]">Bom dia, Carlos</div>
              <div className="text-[11px] text-muted">Segunda-feira · Estacionamento Exemplo</div>
            </div>
            <div className="hidden gap-1.5 sm:flex">
              <span className="btn btn-dark btn-sm">+ Nova entrada</span>
              <span className="btn btn-light btn-sm">Fechar caixa</span>
            </div>
          </div>
          <div className="card mb-2.5 grid grid-cols-2 !rounded-[14px] sm:grid-cols-4">
            {[
              ["Recebido hoje", <Money key="a" value={1240} />],
              ["No pátio", "32 / 40"],
              ["Atendidos", "87"],
              ["Mensalistas", "42"],
            ].map(([l, v]) => (
              <div key={String(l)} className="border-line px-3.5 py-2.5 sm:border-r last:border-0">
                <div className="text-[10px] text-muted">{l}</div>
                <div className="num text-[19px]">{v}</div>
              </div>
            ))}
          </div>
          <div className="grid gap-2.5 sm:grid-cols-[1.2fr_1fr]">
            <div className="card flex h-[250px] flex-col !rounded-[14px] p-3.5">
              <div className="text-[11.5px] font-medium">Movimento de hoje</div>
              <div className="my-1 text-center">
                <div className="text-[10px] text-muted">Pico às 12h</div>
                <div className="num text-[19px]">
                  14 entradas<span className="text-muted-2">/h</span>
                </div>
              </div>
              <div className="flex-1">
                <Bars values={serie(48, 11)} highlight={[19, 20, 21]} />
              </div>
            </div>
            <div className="card hidden !rounded-[14px] p-3.5 sm:block">
              <div className="mb-1 text-[11.5px] font-medium">Últimas movimentações</div>
              {linhas.map(([p, m, t, c]) => (
                <div key={p} className="row !py-[7px] text-[11px]">
                  <span className="flex items-center gap-2">
                    <Plate placa={p} /> {m}
                  </span>
                  <span className={cx("pill !text-[9.5px]", c)}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
