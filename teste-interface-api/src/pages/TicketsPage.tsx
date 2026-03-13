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
  const [filterAnalyst, setFilterAnalyst] = useState<string>("");
  const [editing, setEditing] = useState<Ticket | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Ticket | null>(null);
  const { toasts, show, remove } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, a] = await Promise.all([
        ticketsApi.getAll(),
        analystsApi.getAll(),
      ]);
      setTickets(t);
      setAnalysts(a);
    } catch (e: any) {
      show(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => {
    load();
  }, [load]);

  const analystName = (id: number) =>
    analysts.find((a) => a.id === id)?.nome ?? "-";

  const openCreate = () => {
    setEditing(emptyTicket());
    setShowModal(true);
  };
  const openEdit = (t: Ticket) => {
    setEditing({ ...t, dataFechamento: t.dataFechamento.slice(0, 10) });
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
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

  // Group by analyst for summary
  const ticketsByAnalyst = analysts
    .map((a) => ({
      analyst: a,
      count: tickets.filter((t) => t.analystId === a.id).length,
    }))
    .filter((x) => x.count > 0);

  const filtered = tickets.filter((t) => {
    const matchSearch = analystName(t.analystId)
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchAnalyst =
      filterAnalyst === "" || t.analystId === Number(filterAnalyst);
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
        <div className="summary-cards">
          {ticketsByAnalyst.map(({ analyst, count }) => (
            <div key={analyst.id} className="summary-card">
              <span className="summary-name">{analyst.nome}</span>
              <span className="summary-count">{count}</span>
              <span className="summary-label">tickets</span>
            </div>
          ))}
        </div>
      )}

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Buscar por analista..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-input toolbar-select"
          value={filterAnalyst}
          onChange={(e) => setFilterAnalyst(e.target.value)}
        >
          <option value="">Todos os analistas</option>
          {analysts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome}
            </option>
          ))}
        </select>
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
            <select
              className="form-input"
              value={editing.analystId}
              onChange={(e) =>
                setEditing({ ...editing, analystId: Number(e.target.value) })
              }
            >
              <option value={0}>Selecione...</option>
              {analysts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome}
                </option>
              ))}
            </select>
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
