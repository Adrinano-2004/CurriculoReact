import Link from "next/link";
import type { ReactNode } from "react";
import { I } from "@/components/icons";
import { PhonePainel, PhonePatio, serie, TelaSaida, TelaSistema } from "@/components/mockups";
import { Bars, Logo, Money, Plate } from "@/components/ui";
import { Wordmark } from "@/components/brand";

function Check({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-[15px] leading-snug text-ink-2">
      <span className="mt-0.5 inline-flex size-[22px] shrink-0 items-center justify-center rounded-full bg-paper text-ok shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <I.check size={12} strokeWidth={3} />
      </span>
      <span>{children}</span>
    </li>
  );
}

function Recurso({ icone, titulo, texto, children, className }: { icone: ReactNode; titulo: string; texto: string; children?: ReactNode; className?: string }) {
  return (
    <div className={`glass relative flex min-h-[340px] flex-col overflow-hidden p-6 ${className ?? ""}`}>
      <span className="inline-flex size-11 items-center justify-center rounded-full bg-paper shadow-[0_3px_12px_rgba(0,0,0,0.06)]">{icone}</span>
      <div className="flex flex-1 items-center justify-center py-6">{children}</div>
      <div className="text-[21px] font-medium">• {titulo}</div>
      <p className="mt-1.5 max-w-[340px] text-[14.5px] text-muted">{texto}</p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      {/* ---------------- topo ---------------- */}
      <header className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-6 md:px-8">
        <Logo />
        <nav className="hidden items-center gap-7 text-[14px] text-ink-2 md:flex">
          <a href="#recursos" className="hover:text-ink">
            Recursos
          </a>
          <a href="#seguranca" className="hover:text-ink">
            Segurança
          </a>
          <a href="#precos" className="hover:text-ink">
            Preços
          </a>
          <a href="#como-funciona" className="hover:text-ink">
            Como funciona
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/app" className="hidden px-3 text-[14px] text-ink-2 hover:text-ink sm:block">
            Entrar
          </Link>
          <Link href="/app" className="btn btn-light">
            Ver demonstração
          </Link>
        </div>
      </header>

      {/* ---------------- hero ---------------- */}
      <section className="mx-auto grid max-w-[1240px] items-center gap-10 px-5 pb-20 pt-8 md:px-8 lg:grid-cols-[1.25fr_1fr] lg:pt-16">
        <div>
          <span className="tag">Sistema para estacionamentos</span>
          <h1 className="title mt-6 text-[46px] leading-[1.02] sm:text-[60px] xl:text-[68px]">
            Seu estacionamento, simples e <span className="g">sempre no seu controle.</span>
          </h1>
          <div className="my-8 h-px max-w-[520px] bg-line" />
          <p className="max-w-[520px] text-[19px] font-light leading-relaxed text-ink-2">
            Entrada e saída em segundos, caixa que fecha sem susto e o movimento do dia na palma da sua mão. Feito para a rotina de quem trabalha no pátio.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/app" className="btn btn-dark btn-lg">
              Testar a demonstração <I.arrowUpRight size={16} />
            </Link>
            <a href="#precos" className="btn btn-light btn-lg">
              Ver preços
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-muted">
            <span className="flex items-center gap-2">
              <I.wifiOff size={15} /> Funciona sem internet
            </span>
            <span className="flex items-center gap-2">
              <I.qr size={15} /> PIX com QR code
            </span>
            <span className="flex items-center gap-2">
              <I.bolt size={15} /> Feito para o teclado
            </span>
          </div>
        </div>
        <div className="relative mx-auto h-[640px] w-full max-w-[520px]">
          <div className="absolute left-[8%] top-0 rotate-[-5deg]">
            <PhonePainel />
          </div>
          <div className="glass absolute bottom-10 right-0 w-[230px] p-4 sm:right-2">
            <div className="label">Saída · Onix</div>
            <Money value={15} className="text-[34px]" />
            <div className="mt-1 flex items-center gap-2 text-[12px] font-semibold text-ok-ink">
              <I.check size={14} /> PIX recebido
            </div>
          </div>
          <div className="glass absolute right-0 top-16 hidden w-[210px] p-4 sm:block">
            <div className="text-[14px] font-medium">Tudo pelo celular</div>
            <div className="text-[13px] text-muted">Acompanhe o dia de onde estiver.</div>
          </div>
        </div>
      </section>

      {/* ---------------- sobre ---------------- */}
      <section className="mx-auto max-w-[1000px] px-5 pb-24 md:px-8">
        <div className="mb-5 flex items-center gap-2 text-[13px] font-medium">
          <span className="size-1.5 rounded-full bg-alert" /> Sobre o Vagou
        </div>
        <p className="text-[26px] leading-snug tracking-[-0.01em] md:text-[34px]">
          <span className="font-medium">Vagou</span> nasceu olhando para estacionamentos que ainda usam sistemas antigos, de tela azul e códigos decorados.{" "}
          <span className="text-muted-2">Juntamos entrada, saída, caixa, mensalistas, lava-jato e relatórios em um sistema só, moderno e fácil de aprender.</span>
        </p>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {[
            [<I.clock key="1" size={17} />, "Atendimento em segundos", "Digitou a placa, apertou Enter. O sistema faz as contas."],
            [<I.shield key="2" size={17} />, "Nada some sem explicação", "Cancelamentos com senha e motivo, tudo registrado."],
            [<I.phone key="3" size={17} />, "O dono acompanha de longe", "Faturamento, pátio e fechamento no celular."],
          ].map(([ic, t, d]) => (
            <div key={String(t)}>
              <span className="inline-flex size-9 items-center justify-center rounded-full bg-paper shadow-[0_2px_10px_rgba(0,0,0,0.06)]">{ic}</span>
              <div className="mt-3 text-[15px] font-medium">{t}</div>
              <div className="mt-1 text-[13.5px] text-muted">{d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- recursos ---------------- */}
      <section id="recursos" className="mx-auto max-w-[1240px] px-5 pb-24 md:px-8">
        <span className="tag dark">Recursos</span>
        <h2 className="title mt-5 text-[38px] md:text-[48px]">
          Tudo o que o pátio precisa, <span className="g">em um só lugar.</span>
        </h2>
        <p className="mt-3 max-w-[560px] text-[16px] text-muted">As mesmas funções que você já usa hoje, mais as que faltavam: PIX, celular, WhatsApp e controle de verdade.</p>

        <div className="mt-10 grid gap-4 md:grid-cols-[1.25fr_1fr]">
          <Recurso icone={<I.car size={18} />} titulo="Entrada e saída em segundos" texto="O sistema reconhece o carro que já veio, avisa se é mensalista, VIP ou lista negra e imprime o ticket.">
            <div className="flex flex-col items-center gap-4">
              <div className="overflow-hidden rounded-[16px] border-2 border-dark bg-paper">
                <div className="bg-[#1f47a0] py-1 text-center text-[9px] font-semibold tracking-[0.3em] text-white">BRASIL</div>
                <div className="px-8 py-3 text-[40px] font-semibold tracking-[0.12em]">RTA4B21</div>
              </div>
              <div className="glass flex items-center gap-3 px-4 py-2.5 text-[13px]">
                <span className="pill pill-ok">Reconhecido</span> Hyundai HB20 · 14 visitas
              </div>
            </div>
          </Recurso>
          <Recurso icone={<I.qr size={18} />} titulo="Saída com PIX" texto="Valor calculado na hora, em letras grandes. O cliente paga pelo QR code e o caixa confirma.">
            <TelaSaida className="w-full max-w-[340px] scale-[0.92]" />
          </Recurso>
          <Recurso icone={<I.wallet size={18} />} titulo="Caixa sem susto" texto="Abertura, sangria e fechamento por turno. O sistema mostra o esperado e compara com o contado.">
            <div className="w-full max-w-[360px]">
              <div className="tile grid grid-cols-3 bg-paper">
                {[
                  ["Dinheiro", 210],
                  ["PIX", 325],
                  ["Total", 640],
                ].map(([l, v]) => (
                  <div key={String(l)} className="px-3 py-2.5">
                    <div className="label">{l}</div>
                    <Money value={Number(v)} className="text-[19px]" />
                  </div>
                ))}
              </div>
              <div className="mt-3 h-[90px]">
                <Bars values={serie(40, 3, [0.45, 0.85])} highlight={[18]} />
              </div>
              <div className="mt-3 flex justify-center">
                <span className="pill pill-ok !px-3 !py-1.5">Caixa fechado sem diferença</span>
              </div>
            </div>
          </Recurso>
          <Recurso icone={<I.users size={18} />} titulo="Mensalistas e convênios" texto="Cobrança pelo WhatsApp, descontos de clientes VIP e lojas parceiras aplicados sozinhos.">
            <div className="w-full max-w-[320px] space-y-2">
              {[
                ["Marcos Silva", "Em dia", "pill-ok"],
                ["Ana Paula Costa", "Em atraso", "pill-alert"],
                ["Loja Fátima Modas", "Convênio 50%", "pill-n"],
              ].map(([n, s, c]) => (
                <div key={n} className="card flex items-center justify-between !rounded-[14px] px-3.5 py-2.5 text-[13px]">
                  {n}
                  <span className={`pill ${c}`}>{s}</span>
                </div>
              ))}
            </div>
          </Recurso>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Recurso className="!min-h-[220px]" icone={<I.drop size={18} />} titulo="Lava-jato" texto="Fila de serviços, aviso de carro pronto e cobrança junto com o ticket." />
          <Recurso className="!min-h-[220px]" icone={<I.report size={18} />} titulo="Relatórios" texto="Movimento, caixas, convênios e histórico de alterações, com exportação para planilha." />
          <Recurso className="!min-h-[220px]" icone={<I.chart size={18} />} titulo="Estatísticas" texto="Mapa de movimento, ticket médio, tempo de permanência e clientes que mais voltam." />
        </div>
      </section>

      {/* ---------------- tela do sistema ---------------- */}
      <section className="mx-auto max-w-[1240px] px-5 pb-28 md:px-8">
        <div className="mb-10 text-center">
          <div className="sec">O sistema</div>
          <h2 className="title mt-2 text-[38px] md:text-[48px]">
            Tudo em uma tela só. <span className="g">Sem menus escondidos.</span>
          </h2>
        </div>
        <TelaSistema />
        <div className="mx-auto h-16 w-40 bg-gradient-to-b from-[#e9e9e7] to-[#d5d5d2]" />
      </section>

      {/* ---------------- celular ---------------- */}
      <section className="mx-auto grid max-w-[1240px] items-center gap-12 px-5 pb-28 md:px-8 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <div className="sec">No seu celular</div>
          <h2 className="title mt-2 text-[38px] md:text-[48px]">
            O seu estacionamento <span className="g">na palma da mão.</span>
          </h2>
          <p className="mb-7 mt-4 max-w-[460px] text-[17px] font-light text-ink-2">Sem precisar ligar para ninguém nem ir até lá para saber como está o dia.</p>
          <ul className="space-y-3.5">
            <Check>
              <b className="font-medium text-ink">Quanto entrou</b> hoje, na semana e no mês.
            </Check>
            <Check>
              <b className="font-medium text-ink">Carros no pátio</b> agora, com o tempo de cada um.
            </Check>
            <Check>
              <b className="font-medium text-ink">Resumo do fechamento</b> de caixa no seu WhatsApp.
            </Check>
          </ul>
        </div>
        <div className="relative flex h-[640px] justify-center">
          <div className="absolute left-[2%] top-4 rotate-[-4deg] sm:left-[6%]">
            <PhonePainel />
          </div>
          <div className="absolute right-[2%] top-0 hidden rotate-[4deg] sm:right-[6%] sm:block">
            <PhonePatio />
          </div>
        </div>
      </section>

      {/* ---------------- segurança ---------------- */}
      <section id="seguranca" className="mx-auto max-w-[1240px] px-5 pb-28 md:px-8">
        <div className="sec">Segurança</div>
        <h2 className="title mt-2 text-[38px] md:text-[48px]">
          Nenhum valor some <span className="g">sem explicação.</span>
        </h2>
        <div className="mt-10 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="glass p-6">
            <div className="mb-2 flex items-center justify-between">
              <div className="num text-[24px]">Histórico de alterações</div>
              <span className="chip">Esta semana</span>
            </div>
            {[
              ["CR", "Cancelamento · ticket 271 · R$ 10,00", "Carlos · “Cliente desistiu na entrada” · autorizado pela gerência", "Com senha", "pill-warn"],
              ["JL", "Placa corrigida · QPA1C23 → QPA1C28", "Juliana · “Erro de digitação”", "Registrado", "pill-n"],
              ["CR", "Desconto VIP · ticket 266 · −R$ 5,00", "Carlos · cliente VIP cadastrado", "Automático", "pill-ok"],
              ["JL", "Lista negra · placa PXK9D11 tentou entrar", "Entrada bloqueada · gerente avisado", "Alerta", "pill-alert"],
            ].map(([a, t, d, p, c]) => (
              <div key={t} className="row text-[14px]">
                <span className="flex items-center gap-3">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e6e1db] to-[#cfc7be] text-[10.5px] font-semibold text-[#555]">{a}</span>
                  <span>
                    <span className="block font-medium">{t}</span>
                    <span className="block text-[12px] text-muted">{d}</span>
                  </span>
                </span>
                <span className={`pill ${c}`}>{p}</span>
              </div>
            ))}
          </div>
          <div className="grid gap-3">
            {[
              [<I.lock key="a" size={18} />, "Senha e motivo obrigatórios", "Para cancelar ou mudar valores."],
              [<I.wifiOff key="b" size={18} />, "Funciona sem internet", "O caixa não para se a rede cair."],
              [<I.backup key="c" size={18} />, "Cópia de segurança", "Baixe um backup completo quando quiser."],
            ].map(([ic, t, d]) => (
              <div key={String(t)} className="glass flex items-center gap-4 p-5">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-paper shadow-[0_3px_12px_rgba(0,0,0,0.06)]">{ic}</span>
                <span>
                  <span className="block text-[17px] font-medium">{t}</span>
                  <span className="block text-[14px] text-muted">{d}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- preços ---------------- */}
      <section id="precos" className="mx-auto max-w-[1240px] px-5 pb-28 md:px-8">
        <div className="glass px-5 py-14 md:px-12">
          <div className="text-center">
            <h2 className="title text-[38px] md:text-[48px]">Preço simples. Sem surpresas.</h2>
            <p className="mt-3 text-[15px] text-muted">Mensalidade fixa por estacionamento. Sem taxa de conserto quando o sistema dá problema.</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-[1020px] gap-4 md:grid-cols-3">
            {[
              {
                n: "Básico",
                d: "Para começar a sair do sistema antigo.",
                p: 149,
                cta: "Começar",
                itens: ["Entrada e saída", "Caixa por turno", "Tabela de preços e promoções", "Relatórios do dia"],
              },
              {
                n: "Completo",
                d: "Tudo o que o pátio precisa.",
                p: 249,
                cta: "Escolher o Completo",
                destaque: true,
                itens: ["Tudo do Básico", "PIX com QR code", "Mensalistas e convênios", "Lava-jato", "Painel no celular", "Avisos no WhatsApp"],
              },
              {
                n: "Rede",
                d: "Para quem tem mais de uma unidade.",
                p: null,
                cta: "Falar com a gente",
                itens: ["Tudo do Completo", "Várias unidades no mesmo painel", "Relatórios consolidados", "Leitura de placa por câmera"],
              },
            ].map((pl) => (
              <div key={pl.n} className={`overflow-hidden rounded-[26px] bg-paper ${pl.destaque ? "shadow-[0_24px_60px_rgba(0,0,0,0.1)] md:-mt-4" : "border border-line"}`}>
                {pl.destaque && (
                  <div className="relative h-20 bg-[radial-gradient(120px_60px_at_20%_40%,#f9c7ae,transparent),radial-gradient(160px_80px_at_70%_60%,#f4a585,transparent),linear-gradient(135deg,#fbd9c7,#f3b79c)]">
                    <span className="absolute right-4 top-4 rounded-full bg-paper px-3 py-1 text-[12px] font-semibold text-[#c2502a]">✦ Mais escolhido</span>
                  </div>
                )}
                <div className="p-6">
                  <div className="text-[22px] font-medium">{pl.n}</div>
                  <div className="mt-1 text-[13px] text-muted">{pl.d}</div>
                  <div className="mt-5">
                    {pl.p ? (
                      <>
                        <Money value={pl.p} cents={false} className="text-[40px]" />
                        <span className="text-[14px] text-muted"> /mês</span>
                      </>
                    ) : (
                      <span className="num text-[34px]">Sob consulta</span>
                    )}
                  </div>
                  <Link href="/app" className={`btn mt-5 w-full ${pl.destaque ? "btn-dark" : "btn-light"}`}>
                    {pl.cta}
                  </Link>
                  <ul className="mt-6 space-y-2.5">
                    {pl.itens.map((i) => (
                      <Check key={i}>{i}</Check>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-[12.5px] text-muted">Valores de lançamento, sujeitos a ajuste. Implantação com transferência dos dados do sistema antigo.</p>
        </div>
      </section>

      {/* ---------------- como funciona ---------------- */}
      <section id="como-funciona" className="mx-auto max-w-[1240px] px-5 pb-28 md:px-8">
        <div className="sec">Como funciona</div>
        <h2 className="title mt-2 text-[38px] md:text-[48px]">
          Uma troca sem susto, <span className="g">passo a passo.</span>
        </h2>
        <p className="mt-3 max-w-[520px] text-[16px] text-muted">Durante todo o processo, o sistema atual continua funcionando. Nada para.</p>
        <div className="mt-12 grid gap-10 md:grid-cols-4">
          {[
            ["Conversa", ["Conhecemos a rotina", "Ouvimos você e a equipe", "Anotamos seus preços"]],
            ["Implantação", ["Cadastramos suas regras", "Transferimos seus dados", "Instalamos no seu computador"]],
            ["Teste lado a lado", ["Usa junto com o atual", "Ajustamos o que precisar", "Sem nenhum risco"]],
            ["Troca definitiva", ["Treinamos a equipe", "Desligamos o antigo", "Suporte de perto"]],
          ].map(([t, itens], i) => (
            <div key={String(t)} style={{ marginTop: `${i * 28}px` }} className="max-md:!mt-0">
              <span className="inline-flex items-center gap-3 rounded-full bg-[#e9e9e7] py-1 pl-4 pr-1 text-[14px] text-ink-2">
                Etapa {i + 1}
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-paper text-[13px] font-semibold">{i + 1}</span>
              </span>
              <div className="ml-1 mt-5 border-l border-[#d6d6d3] pl-5">
                <div className="text-[22px] font-medium">{t}</div>
                {(itens as string[]).map((x) => (
                  <div key={x} className="py-1 text-[15px] font-light text-ink-2">
                    {x}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- rodapé ---------------- */}
      <footer className="px-3 pb-3 md:px-5 md:pb-5">
        <div className="relative overflow-hidden rounded-[30px] bg-ink px-6 pb-10 pt-16 text-white md:px-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_360px_at_90%_0%,rgba(246,183,154,0.35),transparent_70%)]" />
          <div className="faixas pointer-events-none absolute -bottom-10 -left-10 h-48 w-80 opacity-[0.08]" />
          <Wordmark className="relative mx-auto block w-full max-w-[1000px] text-white" style={{ height: "auto" }} />
          <div className="relative mt-12 grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
            <div>
              <div className="text-[30px] font-light">E aí, vamos conversar?</div>
              <p className="mt-2 max-w-[360px] text-[14px] text-white/70">Teste a demonstração completa agora mesmo, direto no navegador. Sem cadastro.</p>
              <Link href="/app" className="btn mt-5 bg-white text-ink hover:bg-white/90">
                Abrir demonstração
              </Link>
            </div>
            {[
              ["Produto", ["Recursos", "Segurança", "Preços"]],
              ["Sistema", ["Pátio", "Caixa", "Relatórios"]],
              ["Empresa", ["Feito em Juiz de Fora", "Suporte local", "Contato"]],
            ].map(([t, l]) => (
              <div key={String(t)}>
                <div className="text-[16px]">{t}</div>
                <ul className="mt-3 space-y-2 text-[13px] text-white/65">
                  {(l as string[]).map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="relative mt-12 flex flex-wrap justify-between gap-2 border-t border-white/15 pt-5 text-[12px] text-white/55">
            <span>© {new Date().getFullYear()} Vagou · nome provisório</span>
            <span className="flex items-center gap-3">
              <Plate placa="VAG0U26" /> Sistema de gestão para estacionamentos
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
