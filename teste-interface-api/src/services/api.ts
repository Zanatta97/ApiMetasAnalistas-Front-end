import type {
  Analyst,
  AnalystRequestDTO,
  AnalystResultDTO,
  ErrorResponseDTO,
  Holiday,
  HolidayRequestDTO,
  Occurrence,
  OccurrenceRequestDTO,
  Region,
  RegionRequestDTO,
  Ticket,
  TicketRequestDTO,
} from "../types";

const BASE_URL = "";

class ApiError extends Error {
  statusCode?: number;
  timestamp?: string;

  constructor(message: string, statusCode?: number, timestamp?: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.timestamp = timestamp;
  }
}

function parseErrorPayload(payload: unknown): ErrorResponseDTO | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as Partial<ErrorResponseDTO>;
  const hasAnyField =
    typeof candidate.statusCode === "number" ||
    typeof candidate.errorMessage === "string" ||
    typeof candidate.statusMessage === "string" ||
    typeof candidate.timestamp === "string";

  if (!hasAnyField) {
    return null;
  }

  return {
    statusCode: candidate.statusCode,
    errorMessage: candidate.errorMessage,
    statusMessage: candidate.statusMessage,
    timestamp: candidate.timestamp,
  };
}

function resolveErrorMessage(
  parsedError: ErrorResponseDTO | null,
  fallbackText: string,
  status: number,
): string {
  if (parsedError?.errorMessage) {
    return parsedError.statusCode
      ? `[${parsedError.statusCode}] ${parsedError.errorMessage}`
      : parsedError.errorMessage;
  }

  if (parsedError?.statusMessage) {
    return parsedError.statusCode
      ? `[${parsedError.statusCode}] ${parsedError.statusMessage}`
      : parsedError.statusMessage;
  }

  return fallbackText || `Erro ${status}`;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);

    let parsedPayload: unknown = null;
    if (text) {
      try {
        parsedPayload = JSON.parse(text);
      } catch {
        parsedPayload = null;
      }
    }

    const parsedError = parseErrorPayload(parsedPayload);
    const message = resolveErrorMessage(parsedError, text, res.status);
    throw new ApiError(
      message,
      parsedError?.statusCode ?? res.status,
      parsedError?.timestamp,
    );
  }

  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as T);
}

function toRegionRequest(data: Region): RegionRequestDTO {
  return {
    nome: data.nome,
  };
}

function toAnalystRequest(data: Analyst): AnalystRequestDTO {
  return {
    nome: data.nome,
    usuario: data.usuario,
    regiaoId: data.regiaoId,
    metaDiaria: data.metaDiaria,
  };
}

function toHolidayRequest(data: Holiday): HolidayRequestDTO {
  return {
    data: data.data,
    descricao: data.descricao,
    regiaoId: data.regiaoId,
  };
}

function toOccurrenceRequest(data: Occurrence): OccurrenceRequestDTO {
  return {
    tipo: data.tipo,
    descricao: data.descricao,
    analistaId: data.analistaId,
    dataInicio: data.dataInicio,
    dataFim: data.dataFim,
  };
}

function toTicketRequest(data: Ticket): TicketRequestDTO {
  return {
    analystId: data.analystId,
    dataFechamento: data.dataFechamento,
  };
}

// ─── Regions ────────────────────────────────────────────────────────────────
export const regionsApi = {
  getAll: () => request<Region[]>("/Regions"),
  getById: (id: number) => request<Region>(`/Regions/${id}`),
  create: (data: Region) =>
    request<void>("/Regions", {
      method: "POST",
      body: JSON.stringify(toRegionRequest(data)),
    }),
  update: (id: number, data: Region) =>
    request<void>(`/Regions/${id}`, {
      method: "PUT",
      body: JSON.stringify(toRegionRequest(data)),
    }),
  delete: (id: number) => request<void>(`/Regions/${id}`, { method: "DELETE" }),
};

// ─── Analysts ───────────────────────────────────────────────────────────────
export const analystsApi = {
  getAll: () => request<Analyst[]>("/Analysts"),
  getById: (id: number) => request<Analyst>(`/Analysts/${id}`),
  create: (data: Analyst) =>
    request<void>("/Analysts", {
      method: "POST",
      body: JSON.stringify(toAnalystRequest(data)),
    }),
  update: (id: number, data: Analyst) =>
    request<void>(`/Analysts/${id}`, {
      method: "PUT",
      body: JSON.stringify(toAnalystRequest(data)),
    }),
  delete: (id: number) =>
    request<void>(`/Analysts/${id}`, { method: "DELETE" }),
  exists: (username: string) =>
    request<boolean>(`/Analysts/exists/${username}`),
  getTarget: (id: number, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const qs = params.toString() ? `?${params}` : "";
    return request<AnalystResultDTO>(`/Analysts/target/${id}${qs}`);
  },
  getAllTargets: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const qs = params.toString() ? `?${params}` : "";
    return request<AnalystResultDTO[]>(`/Analysts/target${qs}`);
  },
};

// ─── Holidays ───────────────────────────────────────────────────────────────
export const holidaysApi = {
  getAll: () => request<Holiday[]>("/Holidays"),
  getById: (id: number) => request<Holiday>(`/Holidays/${id}`),
  create: (data: Holiday) =>
    request<void>("/Holidays", {
      method: "POST",
      body: JSON.stringify(toHolidayRequest(data)),
    }),
  update: (id: number, data: Holiday) =>
    request<void>(`/Holidays/${id}`, {
      method: "PUT",
      body: JSON.stringify(toHolidayRequest(data)),
    }),
  delete: (id: number) =>
    request<void>(`/Holidays/${id}`, { method: "DELETE" }),
  getPeriod: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const qs = params.toString() ? `?${params}` : "";
    return request<Holiday[]>(`/Holidays/period${qs}`);
  },
};

// ─── Occurrences ────────────────────────────────────────────────────────────
export const occurrencesApi = {
  getAll: () => request<Occurrence[]>("/Occurrences"),
  getById: (id: number) => request<Occurrence>(`/Occurrences/${id}`),
  create: (data: Occurrence) =>
    request<void>("/Occurrences", {
      method: "POST",
      body: JSON.stringify(toOccurrenceRequest(data)),
    }),
  update: (id: number, data: Occurrence) =>
    request<void>(`/Occurrences/${id}`, {
      method: "PUT",
      body: JSON.stringify(toOccurrenceRequest(data)),
    }),
  delete: (id: number) =>
    request<void>(`/Occurrences/${id}`, { method: "DELETE" }),
  getByAnalyst: (idAnalista: number) =>
    request<Occurrence[]>(`/Occurrences/analyst/${idAnalista}`),
  getByPeriod: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const qs = params.toString() ? `?${params}` : "";
    return request<Occurrence[]>(`/Occurrences/period${qs}`);
  },
};

// ─── Tickets ────────────────────────────────────────────────────────────────
export const ticketsApi = {
  getAll: () => request<Ticket[]>("/Tickets"),
  getById: (id: number) => request<Ticket>(`/Tickets/${id}`),
  create: (data: Ticket) =>
    request<void>("/Tickets", {
      method: "POST",
      body: JSON.stringify(toTicketRequest(data)),
    }),
  update: (id: number, data: Ticket) =>
    request<void>(`/Tickets/${id}`, {
      method: "PUT",
      body: JSON.stringify(toTicketRequest(data)),
    }),
  delete: (id: number) => request<void>(`/Tickets/${id}`, { method: "DELETE" }),
  getByAnalyst: (idAnalista: number) =>
    request<Ticket[]>(`/Tickets/analyst/${idAnalista}`),
};
