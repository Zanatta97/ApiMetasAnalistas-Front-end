import type {
  Analyst,
  AnalystResultDTO,
  Holiday,
  Occurrence,
  Region,
  Ticket,
} from "../types";

const BASE_URL = "";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Erro ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as T);
}

// ─── Regions ────────────────────────────────────────────────────────────────
export const regionsApi = {
  getAll: () => request<Region[]>("/Regions"),
  getById: (id: number) => request<Region>(`/Regions/${id}`),
  create: (data: Region) =>
    request<void>("/Regions", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Region) =>
    request<void>(`/Regions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) => request<void>(`/Regions/${id}`, { method: "DELETE" }),
};

// ─── Analysts ───────────────────────────────────────────────────────────────
export const analystsApi = {
  getAll: () => request<Analyst[]>("/Analysts"),
  getById: (id: number) => request<Analyst>(`/Analysts/${id}`),
  create: (data: Analyst) =>
    request<void>("/Analysts", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Analyst) =>
    request<void>(`/Analysts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
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
    request<void>("/Holidays", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Holiday) =>
    request<void>(`/Holidays/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<void>(`/Holidays/${id}`, { method: "DELETE" }),
  getPeriod: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return request<Holiday[]>(`/Holidays/period?${params}`);
  },
};

// ─── Occurrences ────────────────────────────────────────────────────────────
export const occurrencesApi = {
  getAll: () => request<Occurrence[]>("/Occurrences"),
  getById: (id: number) => request<Occurrence>(`/Occurrences/${id}`),
  create: (data: Occurrence) =>
    request<void>("/Occurrences", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Occurrence) =>
    request<void>(`/Occurrences/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<void>(`/Occurrences/${id}`, { method: "DELETE" }),
  getByAnalyst: (idAnalista: number) =>
    request<Occurrence[]>(`/Occurrences/analyst/${idAnalista}`),
  getByPeriod: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return request<Occurrence[]>(`/Occurrences/period?${params}`);
  },
};

// ─── Tickets ────────────────────────────────────────────────────────────────
export const ticketsApi = {
  getAll: () => request<Ticket[]>("/Tickets"),
  getById: (id: number) => request<Ticket>(`/Tickets/${id}`),
  create: (data: Ticket) =>
    request<void>("/Tickets", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Ticket) =>
    request<void>(`/Tickets/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) => request<void>(`/Tickets/${id}`, { method: "DELETE" }),
  getByAnalyst: (idAnalista: number) =>
    request<Ticket[]>(`/Tickets/analyst/${idAnalista}`),
};
