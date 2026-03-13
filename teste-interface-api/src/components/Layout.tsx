import type { ReactNode } from "react";
import type { Page } from "../types";

interface LayoutProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  children: ReactNode;
}

const navItems: { id: Page; label: string; icon: string }[] = [
  { id: "results", label: "Resultados", icon: "🏆" },
  { id: "regions", label: "Regiões", icon: "🗺️" },
  { id: "analysts", label: "Analistas", icon: "👤" },
  { id: "holidays", label: "Feriados", icon: "📅" },
  { id: "occurrences", label: "Ocorrências", icon: "📋" },
  { id: "tickets", label: "Tickets", icon: "🎫" },
];

export function Layout({ activePage, onNavigate, children }: LayoutProps) {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src="/logo.png" alt="Logo" className="sidebar-logo-img" />
          <h2>Teste Api Metas</h2>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item${activePage === item.id ? " active" : ""}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="api-url">localhost:5037</span>
        </div>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
