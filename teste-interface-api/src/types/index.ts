export interface Region {
  id?: number;
  nome: string;
}

export interface Analyst {
  id?: number;
  nome: string;
  usuario: string;
  regiaoId: number;
  regiao?: Region | null;
  metaDiaria: number;
}

export interface AnalystResultDTO {
  analistaId?: number;
  nomeAnalista?: string;
  regiaoId?: number;
  totalDiasUteis?: number;
  metaDiaria?: number;
  totalMetaPeriodo?: number;
  ticketsFechados?: number;
  percentualMetaAlcancada?: number;
}

export interface Holiday {
  id?: number;
  data: string;
  descricao: string;
  regiaoId: number;
  regiao?: Region | null;
}

export interface Occurrence {
  id?: number;
  tipo: number;
  descricao: string;
  analistaId: number;
  analista?: Analyst | null;
  dataInicio: string;
  dataFim: string;
}

export interface Ticket {
  id?: number;
  analystId: number;
  analyst?: Analyst | null;
  dataFechamento: string;
}

export type Page =
  | "regions"
  | "analysts"
  | "holidays"
  | "occurrences"
  | "tickets"
  | "results";
