import { useState, useEffect, useCallback } from "react";
import { holidaysApi, regionsApi } from "../services/api";
import type { Holiday, Region } from "../types";
import { Modal } from "../components/Modal";
import { useToast, ToastContainer } from "../components/Toast";

const emptyHoliday = (): Holiday => ({
  data: new Date().toISOString().slice(0, 10),
  descricao: "",
  regiaoId: 0,
});

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

function firstOfYear() {
  const d = new Date();
  return new Date(d.getFullYear(), 0, 1).toISOString().slice(0, 10);
}

function lastOfYear() {
  const d = new Date();
  return new Date(d.getFullYear(), 11, 31).toISOString().slice(0, 10);
}

export function HolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState(firstOfYear());
  const [endDate, setEndDate] = useState(lastOfYear());
  const [usePeriod, setUsePeriod] = useState(true);
  const [editing, setEditing] = useState<Holiday | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Holiday | null>(null);
  const { toasts, show, remove } = useToast();

  const load = useCallback(
    async (period?: boolean) => {
      setLoading(true);
      try {
        const data =
          period && startDate && endDate
            ? await holidaysApi.getPeriod(
                new Date(startDate).toISOString(),
                new Date(endDate).toISOString(),
              )
            : await holidaysApi.getAll();
        const r = await regionsApi.getAll();
        setHolidays(data);
        setRegions(r);
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

  const regionName = (id: number) =>
    regions.find((r) => r.id === id)?.nome ?? "-";

  const openCreate = () => {
    setEditing(emptyHoliday());
    setShowModal(true);
  };
  const openEdit = (h: Holiday) => {
    setEditing({ ...h, data: h.data.slice(0, 10) });
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const handleSave = async () => {
    if (!editing) return;
    const payload: Holiday = {
      ...editing,
      data: new Date(editing.data).toISOString(),
    };
    try {
      if (editing.id) {
        await holidaysApi.update(editing.id, payload);
        show("Feriado atualizado!", "success");
      } else {
        await holidaysApi.create(payload);
        show("Feriado criado!", "success");
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
      await holidaysApi.delete(confirmDelete.id);
      show("Feriado removido!", "success");
      setConfirmDelete(null);
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  };

  const isFormValid = editing
    ? editing.descricao.trim() !== "" && editing.regiaoId > 0 && !!editing.data
    : false;

  const filtered = holidays.filter(
    (h) =>
      h.descricao.toLowerCase().includes(search.toLowerCase()) ||
      regionName(h.regiaoId).toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="page">
      <ToastContainer toasts={toasts} onRemove={remove} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Feriados</h1>
          <p className="page-subtitle">
            {holidays.length} feriado(s) cadastrado(s)
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Novo Feriado
        </button>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Buscar por descrição ou região..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
        <div className="empty-state">Nenhum feriado encontrado no período.</div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Data</th>
                <th>Descrição</th>
                <th>Região</th>
                <th className="col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered
                .sort(
                  (a, b) =>
                    new Date(a.data).getTime() - new Date(b.data).getTime(),
                )
                .map((h) => (
                  <tr key={h.id}>
                    <td className="col-id">{h.id}</td>
                    <td>{fmtDate(h.data)}</td>
                    <td>{h.descricao}</td>
                    <td>
                      <span className="badge badge-blue">
                        {regionName(h.regiaoId)}
                      </span>
                    </td>
                    <td className="col-actions">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => openEdit(h)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => setConfirmDelete(h)}
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
          title={editing.id ? "Editar Feriado" : "Novo Feriado"}
          onClose={closeModal}
          onConfirm={handleSave}
          confirmDisabled={!isFormValid}
        >
          <div className="form-group">
            <label className="form-label">Data *</label>
            <input
              className="form-input"
              type="date"
              value={editing.data}
              onChange={(e) => setEditing({ ...editing, data: e.target.value })}
            />
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
              placeholder="Ex: Natal, Páscoa..."
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
            Deseja excluir o feriado <strong>{confirmDelete.descricao}</strong>?
          </p>
        </Modal>
      )}
    </div>
  );
}
