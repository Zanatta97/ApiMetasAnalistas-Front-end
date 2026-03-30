export interface Region {
  id?: number;
  nome: string;
}

export interface Analyst {
  id?: number;
  nome: string;
  usuario: string;
  regiaoId: number;
  nomeRegiao?: string | null;
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
}

export interface Occurrence {
  id?: number;
  tipo: number;
  descricao: string;
  analistaId: number;
  dataInicio: string;
  dataFim: string;
}

export interface Ticket {
  id?: number;
  analystId: number;
  dataFechamento: string;
}

export type RegionRequestDTO = Pick<Region, "nome">;

export type AnalystRequestDTO = Pick<
  Analyst,
  "nome" | "usuario" | "regiaoId" | "metaDiaria"
>;

export type HolidayRequestDTO = Pick<
  Holiday,
  "data" | "descricao" | "regiaoId"
>;

export type OccurrenceRequestDTO = Pick<
  Occurrence,
  "tipo" | "descricao" | "analistaId" | "dataInicio" | "dataFim"
>;

export type TicketRequestDTO = Pick<Ticket, "analystId" | "dataFechamento">;

export interface ErrorResponseDTO {
  statusCode?: number;
  errorMessage?: string;
  statusMessage?: string | null;
  timestamp?: string;
}

export type Page =
  | "regions"
  | "analysts"
  | "holidays"
  | "occurrences"
  | "tickets"
  | "results";
