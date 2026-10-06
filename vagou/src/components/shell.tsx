"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { I } from "./icons";
import { Avatar, Logo, Modal, PinInput, toast, Toasts } from "./ui";
import { useHydrated, useOnline } from "@/lib/hooks";
import { caixaAberto, useApp } from "@/lib/store";
import { cx, iniciais, normalizarPlaca } from "@/lib/util";

export const NAV = [
  { href: "/app", label: "Início", icon: I.home, key: "" },
  { href: "/app/patio", label: "Pátio", icon: I.car, key: "F1" },
  { href: "/app/caixa", label: "Caixa", icon: I.wallet, key: "F2" },
  { href: "/app/lava-jato", label: "Lava-jato", icon: I.drop, key: "F3" },
  { href: "/app/clientes", label: "Clientes", icon: I.users, key: "F4" },
  { href: "/app/relatorios", label: "Relatórios", icon: I.report, key: "F7" },
  { href: "/app/estatisticas", label: "Estatísticas", icon: I.chart, key: "F8" },
  { href: "/app/ajustes", label: "Ajustes", icon: I.gear, key: "F9" },
] as const;

function ativo(path: string, href: string) {
  return href === "/app" ? path === "/app" : path.startsWith(href);
}

export function Shell({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const path = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [trocar, setTrocar] = useState(false);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const item = NAV.find((n) => n.key && n.key === e.key);
      if (item) {
        e.preventDefault();
        router.push(item.href + (item.href === "/app/patio" ? "?foco=1" : ""));
        if (item.href === "/app/patio") window.dispatchEvent(new Event("vagou:foco-placa"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  useEffect(() => setMenu(false), [path]);

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted">
          <Logo />
          <span className="text-[13px]">Carregando seus dados…</span>
        </div>
      </div>
    );
  }

  const buscar = (e: React.FormEvent) => {
    e.preventDefault();
    const q = normalizarPlaca(busca);
    if (!q) return;
    router.push(`/app/patio?placa=${q}`);
    setBusca("");
  };

  const sidebar = (
    <aside className="flex h-full flex-col gap-4 overflow-y-auto border-r border-line bg-white/55 p-4 scroll-soft">
      <div className="flex items-center justify-between px-1 pt-1">
        <Link href="/app" aria-label="Início">
          <Logo />
        </Link>
        <Link href="/" className="text-muted hover:text-ink" title="Site do produto">
          <I.sidebar size={18} />
        </Link>
      </div>
      <form onSubmit={buscar} className="relative">
        <I.search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input className="input !rounded-[12px] !py-2 !pl-9 text-[13px]" placeholder="Buscar placa…" value={busca} onChange={(e) => setBusca(e.target.value)} />
      </form>
      <nav className="grid grid-cols-2 gap-2" aria-label="Menu principal">
        {NAV.map((n) => {
          const on = ativo(path, n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cx(
                "flex h-[68px] flex-col items-center justify-center gap-1.5 rounded-[14px] text-[12px] transition",
                on ? "bg-dark text-white" : "bg-paper text-ink-2 hover:bg-white hover:shadow-[0_4px_14px_rgba(0,0,0,0.05)]",
              )}
            >
              <n.icon size={18} />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-1 space-y-0.5 px-1">
        <div className="label mb-1.5">Atalhos do teclado</div>
        {NAV.filter((n) => n.key).map((n) => (
          <div key={n.key} className="flex items-center gap-2.5 py-1 text-[12.5px] text-ink-2">
            <span className="kbd">{n.key}</span>
            {n.label}
          </div>
        ))}
      </div>
      <div className="mt-auto">
        <StatusCaixa />
        <OperadorAtual onTrocar={() => setTrocar(true)} />
      </div>
    </aside>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[232px_1fr]">
      <div className="sticky top-0 hidden h-dvh lg:block">{sidebar}</div>

      {/* topo no celular */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-[rgba(242,242,241,0.88)] px-4 py-3 backdrop-blur lg:hidden no-print">
        <Link href="/app">
          <Logo />
        </Link>
        <button className="btn btn-light btn-sm" onClick={() => setMenu(true)} aria-label="Abrir menu">
          <I.menu size={16} /> Menu
        </button>
      </header>
      {menu && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMenu(false)}>
          <div className="absolute inset-y-0 left-0 w-[260px] bg-bg shadow-[var(--shadow-pop)]" onClick={(e) => e.stopPropagation()}>
            {sidebar}
          </div>
        </div>
      )}

      <main className="min-w-0 px-4 pb-28 pt-5 md:px-8 md:pt-8 lg:pb-12">{children}</main>

      {/* navegação inferior no celular */}
      <nav className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 gap-1 rounded-[22px] bg-dark p-1.5 text-white shadow-[var(--shadow-pop)] lg:hidden no-print" aria-label="Atalhos">
        {NAV.filter((n) => ["/app", "/app/patio", "/app/caixa", "/app/clientes", "/app/estatisticas"].includes(n.href)).map((n) => (
          <Link key={n.href} href={n.href} className={cx("flex flex-col items-center gap-0.5 rounded-[16px] py-2 text-[10.5px]", ativo(path, n.href) ? "bg-white text-ink" : "text-white/75")}>
            <n.icon size={17} />
            {n.label}
          </Link>
        ))}
      </nav>

      <TrocarOperador open={trocar} onClose={() => setTrocar(false)} />
      <Toasts />
    </div>
  );
}

function StatusCaixa() {
  const cx_ = useApp((s) => caixaAberto(s));
  const online = useOnline();
  return (
    <div className="mb-2 space-y-1.5 rounded-[14px] bg-paper p-3 text-[12px]">
      <Link href="/app/caixa" className="flex items-center justify-between">
        <span className="text-muted">Caixa</span>
        <span className={cx("pill", cx_ ? "pill-ok" : "pill-alert")}>{cx_ ? "Aberto" : "Fechado"}</span>
      </Link>
      <div className="flex items-center justify-between">
        <span className="text-muted">Internet</span>
        <span className={cx("pill", online ? "pill-n" : "pill-warn")}>{online ? "Conectado" : "Offline · salvo aqui"}</span>
      </div>
    </div>
  );
}

function OperadorAtual({ onTrocar }: { onTrocar: () => void }) {
  const u = useApp((s) => s.usuarios.find((x) => x.id === s.operadorId));
  return (
    <button onClick={onTrocar} className="flex w-full items-center gap-2.5 rounded-[14px] p-2 text-left hover:bg-white/70">
      <Avatar text={iniciais(u?.nome ?? "?")} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium">{u?.nome}</span>
        <span className="block text-[11px] capitalize text-muted">{u?.papel} · trocar</span>
      </span>
      <I.logout size={15} className="text-muted" />
    </button>
  );
}

function TrocarOperador({ open, onClose }: { open: boolean; onClose: () => void }) {
  const usuarios = useApp((s) => s.usuarios);
  const setOperador = useApp((s) => s.setOperador);
  const [sel, setSel] = useState<string>();
  const [pin, setPin] = useState("");
  const confirmar = () => {
    const u = usuarios.find((x) => x.id === sel);
    if (!u || u.pin !== pin) {
      toast("PIN incorreto", "alert");
      return;
    }
    setOperador(u.id);
    toast(`Olá, ${u.nome}!`);
    setPin("");
    setSel(undefined);
    onClose();
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Quem está no caixa?"
      width={440}
      footer={
        <>
          <button className="btn btn-light" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-dark" disabled={!sel || pin.length < 4} onClick={confirmar}>
            Entrar
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2">
        {usuarios.map((u) => (
          <button key={u.id} onClick={() => setSel(u.id)} className={cx("flex items-center gap-2.5 rounded-[14px] border p-3 text-left", sel === u.id ? "border-dark bg-white" : "border-line bg-tile")}>
            <Avatar text={iniciais(u.nome)} />
            <span>
              <span className="block text-[14px] font-medium">{u.nome}</span>
              <span className="block text-[11px] capitalize text-muted">{u.papel}</span>
            </span>
          </button>
        ))}
      </div>
      {sel && (
        <form
          className="mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            confirmar();
          }}
        >
          <div className="label mb-1.5">PIN</div>
          <PinInput value={pin} onChange={setPin} />
          <p className="mt-2 text-[12px] text-muted">Demonstração: Carlos 1111 · Juliana 2222 · Gerência 1234</p>
        </form>
      )}
    </Modal>
  );
}
