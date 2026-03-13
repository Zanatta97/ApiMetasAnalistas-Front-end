import { useEffect } from "react";

export interface ToastData {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContainerProps {
  toasts: ToastData[];
  onRemove: (id: number) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

function Toast({
  toast,
  onRemove,
}: {
  toast: ToastData;
  onRemove: (id: number) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icons = { success: "✓", error: "✕", info: "ℹ" };

  return (
    <div className={`toast toast-${toast.type}`}>
      <span className="toast-icon">{icons[toast.type]}</span>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-dismiss" onClick={() => onRemove(toast.id)}>
        ✕
      </button>
    </div>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────
import { useState, useCallback } from "react";

let nextId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const show = useCallback(
    (message: string, type: ToastData["type"] = "info") => {
      const id = ++nextId;
      setToasts((prev) => [...prev, { id, message, type }]);
    },
    [],
  );

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, show, remove };
}
