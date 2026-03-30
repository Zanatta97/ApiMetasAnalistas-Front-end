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
  const [filterAnalystId, setFilterAnalystId] = useState<number | null>(null);
  const [filterAnalystQuery, setFilterAnalystQuery] = useState("");
  const [showFilterAnalystOptions, setShowFilterAnalystOptions] =
    useState(false);
  const [startDate, setStartDate] = useState(firstOfMonth());
  const [endDate, setEndDate] = useState(lastOfMonth());
  const [usePeriod, setUsePeriod] = useState(true);
  const [editing, setEditing] = useState<Occurrence | null>(null);
  const [editingAnalystQuery, setEditingAnalystQuery] = useState("");
  const [showEditingAnalystOptions, setShowEditingAnalystOptions] =
    useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Occurrence | null>(null);
  const { toasts, show, remove } = useToast();

  const load = useCallback(
    async (period?: boolean) => {
      setLoading(true);
      const [occurrencesResult, analystsResult] = await Promise.allSettled([
        period && startDate && endDate
          ? occurrencesApi.getByPeriod(
              new Date(startDate).toISOString(),
              new Date(endDate).toISOString(),
            )
          : occurrencesApi.getAll(),
        analystsApi.getAll(),
      ]);

      if (occurrencesResult.status === "fulfilled") {
        setOccurrences(
          occurrencesResult.value.map((o) => ({
            ...o,
            id: o.id != null ? Number(o.id) : undefined,
            tipo: Number(o.tipo),
            analistaId: Number(o.analistaId),
          })),
        );
      } else {
        setOccurrences([]);
        show("Nao foi possivel carregar as ocorrencias.", "error");
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
    },
    [startDate, endDate, show],
  );

  useEffect(() => {
    load(true);
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
    setEditing(emptyOccurrence());
    setEditingAnalystQuery("");
    setShowEditingAnalystOptions(false);
    setShowModal(true);
  };
  const openEdit = (o: Occurrence) => {
    const analystId = Number(o.analistaId);
    const currentAnalystName = analystName(analystId);
    setEditing({
      ...o,
      analistaId: analystId,
      dataInicio: o.dataInicio.slice(0, 10),
      dataFim: o.dataFim.slice(0, 10),
    });
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
      filterAnalystId === null ||
      Number(o.analistaId) === Number(filterAnalystId);
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
                  setEditing({ ...editing, analistaId: 0 });
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
                          setEditing({ ...editing, analistaId: Number(a.id) });
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
