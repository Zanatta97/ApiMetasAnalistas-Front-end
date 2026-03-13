import { useState, useEffect, useCallback } from "react";
import { occurrencesApi, analystsApi } from "../services/api";
import type { Occurrence, Analyst } from "../types";
import { Modal } from "../components/Modal";
import { useToast, ToastContainer } from "../components/Toast";

const TIPOS: Record<number, string> = {
  0: "Férias",
  1: "Falta",
  2: "Licença Médica",
  3: "Licença Maternidade/Paternidade",
  4: "Suspensão",
  5: "Outro",
};

const emptyOccurrence = (): Occurrence => ({
  tipo: 0,
  descricao: "",
  analistaId: 0,
  dataInicio: new Date().toISOString().slice(0, 10),
  dataFim: new Date().toISOString().slice(0, 10),
});

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

function firstOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function lastOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);
}

export function OccurrencesPage() {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [analysts, setAnalysts] = useState<Analyst[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAnalyst, setFilterAnalyst] = useState<string>("");
  const [startDate, setStartDate] = useState(firstOfMonth());
  const [endDate, setEndDate] = useState(lastOfMonth());
  const [usePeriod, setUsePeriod] = useState(true);
  const [editing, setEditing] = useState<Occurrence | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Occurrence | null>(null);
  const { toasts, show, remove } = useToast();

  const load = useCallback(
    async (period?: boolean) => {
      setLoading(true);
      try {
        const data =
          period && startDate && endDate
            ? await occurrencesApi.getByPeriod(
                new Date(startDate).toISOString(),
                new Date(endDate).toISOString(),
              )
            : await occurrencesApi.getAll();
        const a = await analystsApi.getAll();
        setOccurrences(data);
        setAnalysts(a);
      } catch (e: any) {
        show(e.message, "error");
      } finally {
        setLoading(false);
      }
    },
    [startDate, endDate, show],
  );

  useEffect(() => {
    load(true);
  }, [load]);

  const analystName = (id: number) =>
    analysts.find((a) => a.id === id)?.nome ?? "-";

  const openCreate = () => {
    setEditing(emptyOccurrence());
    setShowModal(true);
  };
  const openEdit = (o: Occurrence) => {
    setEditing({
      ...o,
      dataInicio: o.dataInicio.slice(0, 10),
      dataFim: o.dataFim.slice(0, 10),
    });
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const handleSave = async () => {
    if (!editing) return;
    const payload: Occurrence = {
      ...editing,
      dataInicio: new Date(editing.dataInicio).toISOString(),
      dataFim: new Date(editing.dataFim).toISOString(),
    };
    try {
      if (editing.id) {
        await occurrencesApi.update(editing.id, payload);
        show("Ocorrência atualizada!", "success");
      } else {
        await occurrencesApi.create(payload);
        show("Ocorrência criada!", "success");
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
      await occurrencesApi.delete(confirmDelete.id);
      show("Ocorrência removida!", "success");
      setConfirmDelete(null);
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  };

  const isFormValid = editing
    ? editing.descricao.trim() !== "" &&
      editing.analistaId > 0 &&
      !!editing.dataInicio &&
      !!editing.dataFim
    : false;

  const filtered = occurrences.filter((o) => {
    const matchSearch =
      o.descricao.toLowerCase().includes(search.toLowerCase()) ||
      analystName(o.analistaId).toLowerCase().includes(search.toLowerCase());
    const matchAnalyst =
      filterAnalyst === "" || o.analistaId === Number(filterAnalyst);
    return matchSearch && matchAnalyst;
  });

  return (
    <div className="page">
      <ToastContainer toasts={toasts} onRemove={remove} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Ocorrências</h1>
          <p className="page-subtitle">
            {occurrences.length} ocorrência(s) cadastrada(s)
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Nova Ocorrência
        </button>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Buscar por descrição ou analista..."
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

      <div className="toolbar">
        <input
          className="form-input"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Data início"
          title="Data início do período"
        />
        <input
          className="form-input"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="Data fim"
          title="Data fim do período"
        />
        <button
          className="btn btn-primary"
          disabled={!startDate || !endDate}
          onClick={() => {
            setUsePeriod(true);
            load(true);
          }}
        >
          Filtrar por Período
        </button>
        {usePeriod && (
          <button
            className="btn btn-secondary"
            onClick={() => {
              setUsePeriod(false);
              setStartDate("");
              setEndDate("");
              load();
            }}
          >
            Limpar Filtro
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          Nenhuma ocorrência encontrada no período.
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tipo</th>
                <th>Analista</th>
                <th>Descrição</th>
                <th>Início</th>
                <th>Fim</th>
                <th className="col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td className="col-id">{o.id}</td>
                  <td>
                    <span className="badge badge-orange">
                      {TIPOS[o.tipo] ?? `Tipo ${o.tipo}`}
                    </span>
                  </td>
                  <td>{analystName(o.analistaId)}</td>
                  <td>{o.descricao}</td>
                  <td>{fmtDate(o.dataInicio)}</td>
                  <td>{fmtDate(o.dataFim)}</td>
                  <td className="col-actions">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => openEdit(o)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => setConfirmDelete(o)}
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
          title={editing.id ? "Editar Ocorrência" : "Nova Ocorrência"}
          onClose={closeModal}
          onConfirm={handleSave}
          confirmDisabled={!isFormValid}
          size="md"
        >
          <div className="form-group">
            <label className="form-label">Analista *</label>
            <select
              className="form-input"
              value={editing.analistaId}
              onChange={(e) =>
                setEditing({ ...editing, analistaId: Number(e.target.value) })
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
            <label className="form-label">Tipo *</label>
            <select
              className="form-input"
              value={editing.tipo}
              onChange={(e) =>
                setEditing({ ...editing, tipo: Number(e.target.value) })
              }
            >
              {Object.entries(TIPOS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Descrição *</label>
            <input
              className="form-input"
              value={editing.descricao}
              onChange={(e) =>
                setEditing({ ...editing, descricao: e.target.value })
              }
              maxLength={200}
              placeholder="Detalhes da ocorrência"
            />
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Data Início *</label>
              <input
                className="form-input"
                type="date"
                value={editing.dataInicio}
                onChange={(e) =>
                  setEditing({ ...editing, dataInicio: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Data Fim *</label>
              <input
                className="form-input"
                type="date"
                value={editing.dataFim}
                min={editing.dataInicio}
                onChange={(e) =>
                  setEditing({ ...editing, dataFim: e.target.value })
                }
              />
            </div>
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
            Deseja excluir a ocorrência <strong>#{confirmDelete.id}</strong> de{" "}
            <strong>{analystName(confirmDelete.analistaId)}</strong>?
          </p>
        </Modal>
      )}
    </div>
  );
}
