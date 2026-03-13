import { useState, useEffect, useCallback } from "react";
import { analystsApi, regionsApi } from "../services/api";
import type { Analyst, AnalystResultDTO, Region } from "../types";
import { Modal } from "../components/Modal";
import { useToast, ToastContainer } from "../components/Toast";

const emptyAnalyst = (): Analyst => ({
  nome: "",
  usuario: "",
  regiaoId: 0,
  metaDiaria: 0,
});

function today() {
  return new Date().toISOString().slice(0, 10);
}
function firstOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

export function AnalystsPage() {
  const [analysts, setAnalysts] = useState<Analyst[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Analyst | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Analyst | null>(null);
  const [targetAnalyst, setTargetAnalyst] = useState<Analyst | null>(null);
  const [targetResult, setTargetResult] = useState<AnalystResultDTO | null>(
    null,
  );
  const [targetStart, setTargetStart] = useState(firstOfMonth());
  const [targetEnd, setTargetEnd] = useState(today());
  const { toasts, show, remove } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, r] = await Promise.all([
        analystsApi.getAll(),
        regionsApi.getAll(),
      ]);
      setAnalysts(a);
      setRegions(r);
    } catch (e: any) {
      show(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => {
    load();
  }, [load]);

  const regionName = (id: number) =>
    regions.find((r) => r.id === id)?.nome ?? "-";

  const openCreate = () => {
    setEditing(emptyAnalyst());
    setShowModal(true);
  };
  const openEdit = (a: Analyst) => {
    setEditing({ ...a });
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const handleSave = async () => {
    if (!editing) return;
    try {
      if (editing.id) {
        await analystsApi.update(editing.id, editing);
        show("Analista atualizado!", "success");
      } else {
        await analystsApi.create(editing);
        show("Analista criado!", "success");
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
      await analystsApi.delete(confirmDelete.id);
      show("Analista removido!", "success");
      setConfirmDelete(null);
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  };

  const fetchTarget = async () => {
    if (!targetAnalyst?.id) return;
    try {
      const r = await analystsApi.getTarget(
        targetAnalyst.id,
        new Date(targetStart).toISOString(),
        new Date(targetEnd).toISOString(),
      );
      setTargetResult(r);
    } catch (e: any) {
      show(e.message, "error");
    }
  };

  const isFormValid = editing
    ? editing.nome.trim() !== "" &&
      editing.usuario.trim() !== "" &&
      editing.regiaoId > 0
    : false;

  const filtered = analysts.filter(
    (a) =>
      a.nome.toLowerCase().includes(search.toLowerCase()) ||
      a.usuario.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="page">
      <ToastContainer toasts={toasts} onRemove={remove} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Analistas</h1>
          <p className="page-subtitle">
            {analysts.length} analista(s) cadastrado(s)
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Novo Analista
        </button>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Buscar por nome ou usuário..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">Nenhum analista encontrado.</div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th>Usuário</th>
                <th>Região</th>
                <th>Meta Diária</th>
                <th className="col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td className="col-id">{a.id}</td>
                  <td>{a.nome}</td>
                  <td>
                    <code>{a.usuario}</code>
                  </td>
                  <td>
                    <span className="badge badge-blue">
                      {regionName(a.regiaoId)}
                    </span>
                  </td>
                  <td>{a.metaDiaria}/dia</td>
                  <td className="col-actions">
                    <button
                      className="btn-icon"
                      onClick={() => {
                        setTargetAnalyst(a);
                        setTargetResult(null);
                      }}
                      title="Ver Meta"
                    >
                      📊
                    </button>
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => openEdit(a)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => setConfirmDelete(a)}
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

      {/* Modal de criação/edição */}
      {showModal && editing && (
        <Modal
          title={editing.id ? "Editar Analista" : "Novo Analista"}
          onClose={closeModal}
          onConfirm={handleSave}
          confirmDisabled={!isFormValid}
          size="md"
        >
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Nome *</label>
              <input
                className="form-input"
                value={editing.nome}
                onChange={(e) =>
                  setEditing({ ...editing, nome: e.target.value })
                }
                maxLength={60}
                placeholder="Nome completo"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Usuário *</label>
              <input
                className="form-input"
                value={editing.usuario}
                onChange={(e) =>
                  setEditing({ ...editing, usuario: e.target.value })
                }
                maxLength={60}
                placeholder="nome.usuario"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Região *</label>
              <select
                className="form-input"
                value={editing.regiaoId}
                onChange={(e) =>
                  setEditing({ ...editing, regiaoId: Number(e.target.value) })
                }
              >
                <option value={0}>Selecione...</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Meta Diária *</label>
              <input
                className="form-input"
                type="number"
                min={0}
                max={99}
                value={editing.metaDiaria}
                onChange={(e) =>
                  setEditing({ ...editing, metaDiaria: Number(e.target.value) })
                }
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de meta do analista */}
      {targetAnalyst && (
        <Modal
          title={`Meta — ${targetAnalyst.nome}`}
          onClose={() => {
            setTargetAnalyst(null);
            setTargetResult(null);
          }}
          size="md"
        >
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Data Início</label>
              <input
                className="form-input"
                type="date"
                value={targetStart}
                onChange={(e) => setTargetStart(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Data Fim</label>
              <input
                className="form-input"
                type="date"
                value={targetEnd}
                onChange={(e) => setTargetEnd(e.target.value)}
              />
            </div>
          </div>
          <button
            className="btn btn-primary"
            style={{ marginBottom: "1rem" }}
            onClick={fetchTarget}
          >
            Consultar
          </button>
          {targetResult && (
            <div className="target-result">
              <div className="target-grid">
                <div className="target-card">
                  <span className="target-label">Dias Úteis</span>
                  <span className="target-value">
                    {targetResult.totalDiasUteis}
                  </span>
                </div>
                <div className="target-card">
                  <span className="target-label">Meta do Período</span>
                  <span className="target-value">
                    {targetResult.totalMetaPeriodo}
                  </span>
                </div>
                <div className="target-card">
                  <span className="target-label">Tickets Fechados</span>
                  <span className="target-value">
                    {targetResult.ticketsFechados}
                  </span>
                </div>
                <div className="target-card highlight">
                  <span className="target-label">% Meta Alcançada</span>
                  <span className="target-value">
                    {targetResult.percentualMetaAlcancada?.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}
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
            Deseja excluir o analista <strong>{confirmDelete.nome}</strong>?
          </p>
        </Modal>
      )}
    </div>
  );
}
