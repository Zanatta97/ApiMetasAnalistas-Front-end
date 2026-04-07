import { useState, useEffect, useCallback } from "react";
import { ticketsApi, analystsApi } from "../services/api";
import type { Ticket, Analyst } from "../types";
import { Modal } from "../components/Modal";
import { useToast, ToastContainer } from "../components/Toast";

const emptyTicket = (): Ticket => ({
  analystId: 0,
  dataFechamento: new Date().toISOString().slice(0, 10),
});

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [analysts, setAnalysts] = useState<Analyst[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAnalystId, setFilterAnalystId] = useState<number | null>(null);
  const [filterAnalystQuery, setFilterAnalystQuery] = useState("");
  const [showFilterAnalystOptions, setShowFilterAnalystOptions] =
    useState(false);
  const [editing, setEditing] = useState<Ticket | null>(null);
  const [editingAnalystQuery, setEditingAnalystQuery] = useState("");
  const [showEditingAnalystOptions, setShowEditingAnalystOptions] =
    useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Ticket | null>(null);
  const { toasts, show, remove } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const [ticketsResult, analystsResult] = await Promise.allSettled([
      ticketsApi.getAll(),
      analystsApi.getAll(),
    ]);

    if (ticketsResult.status === "fulfilled") {
      setTickets(
        ticketsResult.value.map((t) => ({
          ...t,
          id: t.id != null ? Number(t.id) : undefined,
          analystId: Number(t.analystId),
        })),
      );
    } else {
      setTickets([]);
      show("Nao foi possivel carregar os tickets.", "error");
    }

    if (analystsResult.status === "fulfilled") {
      setAnalysts(
        analystsResult.value.map((a) => ({
          ...a,
          id: a.id != null ? Number(a.id) : undefined,
          regiaoId: Number(a.regiaoId),
          metaDiaria: Number(a.metaDiaria),
        })),
      );
    } else {
      setAnalysts([]);
      show("Nao foi possivel carregar os analistas.", "error");
    }

    setLoading(false);
  }, [show]);

  useEffect(() => {
    load();
  }, [load]);

  const analystName = (id: number) =>
    analysts.find((a) => Number(a.id) === Number(id))?.nome ?? "-";

  const filteredAnalystsForFilter = analysts
    .filter((a) =>
      a.nome.toLowerCase().includes(filterAnalystQuery.toLowerCase()),
    )
    .slice(0, 10);

  const filteredAnalystsForEditing = analysts
    .filter((a) =>
      a.nome.toLowerCase().includes(editingAnalystQuery.toLowerCase()),
    )
    .slice(0, 10);

  const openCreate = () => {
    setEditing(emptyTicket());
    setEditingAnalystQuery("");
    setShowEditingAnalystOptions(false);
    setShowModal(true);
  };
  const openEdit = (t: Ticket) => {
    const analystId = Number(t.analystId);
    const currentAnalystName = analystName(analystId);
    setEditing({ ...t, dataFechamento: t.dataFechamento.slice(0, 10) });
    setEditingAnalystQuery(
      currentAnalystName === "-" ? "" : currentAnalystName,
    );
    setShowEditingAnalystOptions(false);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setEditingAnalystQuery("");
    setShowEditingAnalystOptions(false);
  };

  const handleSave = async () => {
    if (!editing) return;
    const payload: Ticket = {
      ...editing,
      dataFechamento: new Date(editing.dataFechamento).toISOString(),
    };
    try {
      if (editing.id) {
        await ticketsApi.update(editing.id, payload);
        show("Ticket atualizado!", "success");
      } else {
        await ticketsApi.create(payload);
        show("Ticket criado!", "success");
      }
      closeModal();
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete?.id) return;
    try {
      await ticketsApi.delete(confirmDelete.id);
      show("Ticket removido!", "success");
      setConfirmDelete(null);
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  };

  const isFormValid = editing
    ? editing.analystId > 0 && !!editing.dataFechamento
    : false;

  // Aggregate summary to keep layout scalable with many analysts
  const ticketsByAnalyst = analysts
    .map((a) => ({
      analyst: a,
      count: tickets.filter((t) => t.analystId === a.id).length,
    }))
    .filter((x) => x.count > 0);

  const analystsWithTicketsCount = ticketsByAnalyst.length;
  const avgTicketsPerAnalyst =
    analystsWithTicketsCount > 0
      ? ticketsByAnalyst.reduce((acc, item) => acc + item.count, 0) /
        analystsWithTicketsCount
      : 0;
  const topAnalystEntry = ticketsByAnalyst.reduce<{
    analyst: Analyst;
    count: number;
  } | null>((top, current) => {
    if (!top || current.count > top.count) return current;
    return top;
  }, null);

  const filtered = tickets.filter((t) => {
    const matchSearch = analystName(t.analystId)
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchAnalyst =
      filterAnalystId === null ||
      Number(t.analystId) === Number(filterAnalystId);
    return matchSearch && matchAnalyst;
  });

  return (
    <div className="page">
      <ToastContainer toasts={toasts} onRemove={remove} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Tickets</h1>
          <p className="page-subtitle">
            {tickets.length} ticket(s) cadastrado(s)
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Novo Ticket
        </button>
      </div>

      {ticketsByAnalyst.length > 0 && (
        <div className="summary-panel">
          <div className="summary-item">
            <span className="summary-label">Analistas com tickets</span>
            <span className="summary-value">{analystsWithTicketsCount}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Media por analista</span>
            <span className="summary-value">
              {avgTicketsPerAnalyst.toFixed(1)}
            </span>
          </div>
          <div className="summary-item summary-item-wide">
            <span className="summary-label">Maior volume</span>
            <span className="summary-value">
              {topAnalystEntry
                ? `${topAnalystEntry.analyst.nome} (${topAnalystEntry.count})`
                : "-"}
            </span>
          </div>
        </div>
      )}

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Buscar por analista..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="combobox toolbar-select">
          <input
            className="form-input"
            value={filterAnalystQuery}
            placeholder="Filtrar por analista..."
            onFocus={() => setShowFilterAnalystOptions(true)}
            onBlur={() => {
              setTimeout(() => setShowFilterAnalystOptions(false), 120);
            }}
            onChange={(e) => {
              setFilterAnalystQuery(e.target.value);
              setFilterAnalystId(null);
              setShowFilterAnalystOptions(true);
            }}
          />
          {showFilterAnalystOptions && (
            <div className="combobox-menu">
              <button
                className="combobox-option"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setFilterAnalystId(null);
                  setFilterAnalystQuery("");
                  setShowFilterAnalystOptions(false);
                }}
              >
                Todos os analistas
              </button>
              {filteredAnalystsForFilter.length === 0 ? (
                <div className="combobox-empty">
                  Nenhum analista encontrado.
                </div>
              ) : (
                filteredAnalystsForFilter.map((a) => (
                  <button
                    key={a.id}
                    className="combobox-option"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setFilterAnalystId(Number(a.id));
                      setFilterAnalystQuery(a.nome);
                      setShowFilterAnalystOptions(false);
                    }}
                  >
                    {a.nome}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">Nenhum ticket encontrado.</div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Analista</th>
                <th>Data de Fechamento</th>
                <th className="col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered
                .sort(
                  (a, b) =>
                    new Date(b.dataFechamento).getTime() -
                    new Date(a.dataFechamento).getTime(),
                )
                .map((t) => (
                  <tr key={t.id}>
                    <td className="col-id">{t.id}</td>
                    <td>{analystName(t.analystId)}</td>
                    <td>{fmtDate(t.dataFechamento)}</td>
                    <td className="col-actions">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => openEdit(t)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => setConfirmDelete(t)}
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && editing && (
        <Modal
          title={editing.id ? "Editar Ticket" : "Novo Ticket"}
          onClose={closeModal}
          onConfirm={handleSave}
          confirmDisabled={!isFormValid}
          size="sm"
        >
          <div className="form-group">
            <label className="form-label">Analista *</label>
            <div className="combobox combobox-full">
              <input
                className="form-input"
                value={editingAnalystQuery}
                placeholder="Digite para buscar analista..."
                onFocus={() => setShowEditingAnalystOptions(true)}
                onBlur={() => {
                  setTimeout(() => setShowEditingAnalystOptions(false), 120);
                }}
                onChange={(e) => {
                  setEditingAnalystQuery(e.target.value);
                  setEditing({ ...editing, analystId: 0 });
                  setShowEditingAnalystOptions(true);
                }}
              />
              {showEditingAnalystOptions && (
                <div className="combobox-menu">
                  {filteredAnalystsForEditing.length === 0 ? (
                    <div className="combobox-empty">
                      Nenhum analista encontrado.
                    </div>
                  ) : (
                    filteredAnalystsForEditing.map((a) => (
                      <button
                        key={a.id}
                        className="combobox-option"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setEditing({ ...editing, analystId: Number(a.id) });
                          setEditingAnalystQuery(a.nome);
                          setShowEditingAnalystOptions(false);
                        }}
                      >
                        {a.nome}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Data de Fechamento *</label>
            <input
              className="form-input"
              type="date"
              value={editing.dataFechamento}
              onChange={(e) =>
                setEditing({ ...editing, dataFechamento: e.target.value })
              }
            />
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <Modal
          title="Confirmar Exclusão"
          onClose={() => setConfirmDelete(null)}
          onConfirm={handleDelete}
          confirmLabel="Excluir"
          size="sm"
        >
          <p>
            Deseja excluir o ticket <strong>#{confirmDelete.id}</strong> de{" "}
            <strong>{analystName(confirmDelete.analystId)}</strong>?
          </p>
        </Modal>
      )}
    </div>
  );
}
