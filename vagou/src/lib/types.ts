export type ID = string;

/** Tabela de preços de uma categoria de veículo (antigo cadastro "Automóveis"). */
export interface Tarifa {
  id: ID;
  nome: string; // Carro, Moto, Utilitário...
  /** Minutos iniciais sem cobrança (cliente que entra e sai). */
  toleranciaInicialMin: number;
  /** Minutos de tolerância antes de cobrar uma nova hora iniciada. */
  toleranciaFracaoMin: number;
  /** Valor da 1ª, 2ª e da 3ª hora em diante. */
  valorHoras: [number, number, number];
  /** Teto para permanência de até 12h. */
  meiaDiaria: number;
  /** Teto para permanência de 12h a 24h, e valor de cada dia completo. */
  diaria: number;
  /** Valor da diária lançada manualmente ("Lançar diária"). */
  diariaLancada: number;
}

export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Promocao {
  id: ID;
  nome: string;
  ativa: boolean;
  dias: DiaSemana[];
  /** "HH:MM" — vale para entradas a partir deste horário. */
  aPartirDe: string;
  tipo: "fixo" | "desconto";
  /** Valor fixo em reais ou percentual de desconto. */
  valor: number;
}

export type TipoCliente = "mensalista" | "vip" | "especial" | "convenio" | "lista_negra";

export interface Cliente {
  id: ID;
  tipo: TipoCliente;
  nome: string;
  telefone: string;
  placas: string[];
  /** Mensalista: valor mensal e dia de vencimento. */
  mensalidade?: number;
  vencimentoDia?: number;
  /** Mensalista: último mês pago, "YYYY-MM". */
  pagoAte?: string;
  /** VIP / especial / convênio: desconto percentual sobre o valor calculado. */
  descontoPct?: number;
  observacao?: string;
  criadoEm: number;
}

export interface Veiculo {
  placa: string;
  modelo: string;
  cor: string;
  tarifaId: ID;
  visitas: number;
  ultimaVisita: number;
}

export type FormaPagamento = "dinheiro" | "pix" | "debito" | "credito" | "mensalista" | "convenio" | "isento";

export type StatusTicket = "aberto" | "pago" | "cancelado";

export interface Ticket {
  id: ID;
  numero: number;
  placa: string;
  modelo: string;
  cor: string;
  tarifaId: ID;
  entrada: number;
  saida?: number;
  status: StatusTicket;
  /** Diária lançada: cobra valor fixo, independente do tempo. */
  diaria?: boolean;
  clienteId?: ID;
  convenioId?: ID;
  valorBruto?: number;
  desconto?: number;
  valorServicos?: number;
  valor?: number;
  pagamento?: FormaPagamento;
  promocaoId?: ID;
  operadorEntrada: ID;
  operadorSaida?: ID;
  caixaId?: ID;
  cancelamento?: { motivo: string; por: ID; autorizadoPor: ID; em: number };
}

export type TipoMovimentoCaixa = "ticket" | "mensalidade" | "lavajato" | "sangria" | "suprimento";

export interface MovimentoCaixa {
  id: ID;
  caixaId: ID;
  tipo: TipoMovimentoCaixa;
  forma: FormaPagamento;
  valor: number; // sangria é negativo
  descricao: string;
  em: number;
  refId?: ID;
}

export interface Caixa {
  id: ID;
  operador: ID;
  abertura: number;
  trocoInicial: number;
  fechamento?: number;
  contado?: number;
  observacao?: string;
}

export type StatusServico = "fila" | "lavando" | "pronto" | "entregue";

export interface ServicoCatalogo {
  id: ID;
  nome: string;
  valor: number;
}

export interface ServicoLavaJato {
  id: ID;
  placa: string;
  modelo: string;
  servicoId: ID;
  nome: string;
  valor: number;
  status: StatusServico;
  telefone?: string;
  ticketId?: ID;
  /** Pago junto com o ticket de saída ou separado no caixa. */
  pago: boolean;
  criadoEm: number;
  atualizadoEm: number;
}

export type Papel = "operador" | "gerente" | "dono";

export interface Usuario {
  id: ID;
  nome: string;
  papel: Papel;
  pin: string;
}

export type TipoAuditoria =
  | "cancelamento"
  | "correcao_placa"
  | "desconto"
  | "lista_negra"
  | "tarifa"
  | "caixa"
  | "diaria"
  | "cliente"
  | "sistema";

export interface Auditoria {
  id: ID;
  em: number;
  tipo: TipoAuditoria;
  operador: ID;
  descricao: string;
  motivo?: string;
  autorizadoPor?: ID;
  severidade: "info" | "atencao" | "alerta";
}

export interface Empresa {
  nome: string;
  cidade: string;
  documento: string;
  telefone: string;
  chavePix: string;
  regulamento: string;
}

export interface Configuracoes {
  empresa: Empresa;
  vagas: number;
  tarifas: Tarifa[];
  tarifaPadraoId: ID;
  promocoes: Promocao[];
  servicos: ServicoCatalogo[];
  /** Alerta no pátio para carros parados há mais de X horas. */
  alertaHoras: number;
  /** Abre a impressão do ticket logo após a entrada. */
  imprimirAutomatico: boolean;
}
