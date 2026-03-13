import { useState, useEffect, useCallback } from "react";
import { regionsApi } from "../services/api";
import type { Region } from "../types";
import { Modal } from "../components/Modal";
import { useToast, ToastContainer } from "../components/Toast";

const emptyRegion = (): Region => ({ nome: "" });

export function RegionsPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Region | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Region | null>(null);
  const { toasts, show, remove } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRegions(await regionsApi.getAll());
    } catch (e: any) {
      show(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(emptyRegion());
    setShowModal(true);
  };
  const openEdit = (r: Region) => {
    setEditing({ ...r });
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
        await regionsApi.update(editing.id, editing);
        show("Região atualizada com sucesso!", "success");
      } else {
        await regionsApi.create(editing);
        show("Região criada com sucesso!", "success");
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
      await regionsApi.delete(confirmDelete.id);
      show("Região removida com sucesso!", "success");
      setConfirmDelete(null);
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  };

  const filtered = regions.filter((r) =>
    r.nome.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="page">
      <ToastContainer toasts={toasts} onRemove={remove} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Regiões</h1>
          <p className="page-subtitle">
            {regions.length} região(ões) cadastrada(s)
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Nova Região
        </button>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">Nenhuma região encontrada.</div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th className="col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td className="col-id">{r.id}</td>
                  <td>{r.nome}</td>
                  <td className="col-actions">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => openEdit(r)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => setConfirmDelete(r)}
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
          title={editing.id ? "Editar Região" : "Nova Região"}
          onClose={closeModal}
          onConfirm={handleSave}
          confirmDisabled={!editing.nome.trim()}
        >
          <div className="form-group">
            <label className="form-label">Nome *</label>
            <input
              className="form-input"
              value={editing.nome}
              onChange={(e) => setEditing({ ...editing, nome: e.target.value })}
              maxLength={50}
              placeholder="Nome da região"
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
            Deseja excluir a região <strong>{confirmDelete.nome}</strong>?
          </p>
        </Modal>
      )}
    </div>
  );
}
