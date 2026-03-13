import { useState, useCallback, useEffect } from "react";
import { analystsApi } from "../services/api";
import type { AnalystResultDTO } from "../types";
import { useToast, ToastContainer } from "../components/Toast";

function firstOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}
function today() {
  return new Date().toISOString().slice(0, 10);
}

type SortKey =
  | "nomeAnalista"
  | "ticketsFechados"
  | "totalMetaPeriodo"
  | "percentualMetaAlcancada";
type SortDir = "asc" | "desc";

function pctClass(pct: number) {
  if (pct > 90) return "above";
  if (pct > 70) return "near";
  return "below";
}

export function ResultsPage() {
  const [startDate, setStartDate] = useState(firstOfMonth());
  const [endDate, setEndDate] = useState(today());
  const [results, setResults] = useState<AnalystResultDTO[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("percentualMetaAlcancada");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const { toasts, show, remove } = useToast();

  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await analystsApi.getAllTargets(
        new Date(startDate).toISOString(),
        new Date(endDate).toISOString(),
      );
      setResults(Array.isArray(data) ? data : []);
      setLoaded(true);
    } catch (e: any) {
      show(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, show]);

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = [...results].sort((a, b) => {
    const av = (a[sortKey] ?? 0) as number | string;
    const bv = (b[sortKey] ?? 0) as number | string;
    const cmp =
      typeof av === "string"
        ? av.localeCompare(bv as string)
        : (av as number) - (bv as number);
    return sortDir === "asc" ? cmp : -cmp;
  });

  const totalTickets = results.reduce(
    (s, r) => s + (r.ticketsFechados ?? 0),
    0,
  );
  const totalMeta = results.reduce((s, r) => s + (r.totalMetaPeriodo ?? 0), 0);
  const avgPct =
    results.length > 0
      ? results.reduce((s, r) => s + (r.percentualMetaAlcancada ?? 0), 0) /
        results.length
      : 0;
  const metAtGoal = results.filter(
    (r) => (r.percentualMetaAlcancada ?? 0) >= 100,
  ).length;

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return " ↕";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className="page">
      <ToastContainer toasts={toasts} onRemove={remove} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Resultados por Período</h1>
          <p className="page-subtitle">
            Desempenho dos analistas em relação à meta
          </p>
        </div>
      </div>

      {/* Period picker */}
      <div className="results-period">
        <div className="form-group">
          <label className="form-label">Data Início</label>
          <input
            className="form-input"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Data Fim</label>
          <input
            className="form-input"
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSearch}
          disabled={loading || !startDate || !endDate}
        >
          {loading ? "Consultando…" : "Consultar"}
        </button>
      </div>

      {/* Summary bar */}
      {loaded && results.length > 0 && (
        <div className="results-summary">
          <div className="results-stat-card">
            <span className="stat-value">{results.length}</span>
            <span className="stat-label">Analistas</span>
          </div>
          <div className="results-stat-card">
            <span className="stat-value">{totalTickets}</span>
            <span className="stat-label">Tickets Fechados</span>
          </div>
          <div className="results-stat-card">
            <span className="stat-value">{totalMeta}</span>
            <span className="stat-label">Meta Total do Período</span>
          </div>
          <div className="results-stat-card">
            <span
              className="stat-value"
              style={{
                color:
                  pctClass(avgPct) === "above"
                    ? "var(--success)"
                    : pctClass(avgPct) === "near"
                      ? "var(--warning)"
                      : "var(--danger)",
              }}
            >
              {avgPct.toFixed(1)}%
            </span>
            <span className="stat-label">Média % Meta</span>
          </div>
          <div className="results-stat-card">
            <span className="stat-value" style={{ color: "var(--success)" }}>
              {metAtGoal}
            </span>
            <span className="stat-label">Bateram a Meta</span>
          </div>
        </div>
      )}

      {/* Sort controls */}
      {loaded && results.length > 0 && (
        <div className="toolbar" style={{ marginBottom: "14px" }}>
          <span
            style={{ fontSize: 13, color: "var(--text-muted)", paddingTop: 8 }}
          >
            Ordenar por:
          </span>
          {(
            [
              "nomeAnalista",
              "ticketsFechados",
              "totalMetaPeriodo",
              "percentualMetaAlcancada",
            ] as SortKey[]
          ).map((key) => {
            const labels: Record<SortKey, string> = {
              nomeAnalista: "Nome",
              ticketsFechados: "Tickets",
              totalMetaPeriodo: "Meta",
              percentualMetaAlcancada: "% Meta",
            };
            return (
              <button
                key={key}
                className={`btn ${sortKey === key ? "btn-primary" : "btn-secondary"}`}
                style={{ padding: "6px 12px", fontSize: 13 }}
                onClick={() => toggleSort(key)}
              >
                {labels[key]}
                {sortIcon(key)}
              </button>
            );
          })}
        </div>
      )}

      {/* Results grid */}
      {loading && <div className="loading">Consultando analistas…</div>}

      {!loading && loaded && results.length === 0 && (
        <div className="empty-state">
          Nenhum resultado encontrado para o período.
        </div>
      )}

      {!loading && sorted.length > 0 && (
        <div className="results-grid">
          {sorted.map((r) => {
            const pct = r.percentualMetaAlcancada ?? 0;
            const cls = pctClass(pct);
            const fillWidth = Math.min(pct, 100);

            return (
              <div key={r.analistaId} className="result-card">
                <div className="result-card-header">
                  <span className="result-analyst-name">{r.nomeAnalista}</span>
                  <span className={`result-pct-badge ${cls}`}>
                    {pct.toFixed(1)}%
                  </span>
                </div>

                <div className="result-progress-wrap">
                  <div className="result-progress-labels">
                    <span>{r.ticketsFechados} tickets fechados</span>
                    <span>Meta: {r.totalMetaPeriodo}</span>
                  </div>
                  <div className="result-progress-bar">
                    <div
                      className={`result-progress-fill fill-${cls}`}
                      style={{ width: `${fillWidth}%` }}
                    />
                  </div>
                </div>

                <div className="result-stats">
                  <div className="result-stat">
                    <span className="result-stat-value">
                      {r.totalDiasUteis}
                    </span>
                    <span className="result-stat-label">Dias Úteis</span>
                  </div>
                  <div className="result-stat">
                    <span className="result-stat-value">{r.metaDiaria}</span>
                    <span className="result-stat-label">Meta/Dia</span>
                  </div>
                  <div className="result-stat">
                    <span className="result-stat-value">
                      {r.totalMetaPeriodo}
                    </span>
                    <span className="result-stat-label">Meta Total</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
