import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/ui/Header.jsx";
import Sidebar from "../components/ui/Sidebar.jsx";
import "./AppLayout.css";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("app-sidebar-collapsed") === "true";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("app-sidebar-collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  return (
    <div className="app-layout">
      <div className="app-layout__glow app-layout__glow--primary" />
      <div className="app-layout__glow app-layout__glow--secondary" />
      <div
        className={`app-layout__grid ${sidebarCollapsed ? "app-layout__grid--collapsed" : ""}`}
      >
        <aside
          className={`app-layout__aside ${sidebarCollapsed ? "app-layout__aside--collapsed" : ""}`}
        >
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
          />
        </aside>

        <main className="app-layout__main">
          <Header
            onOpenSidebar={() => setSidebarOpen(true)}
            showMenuButton
          />
          <div className="app-layout__content">
            <Outlet />
          </div>
        </main>
      </div>

      {sidebarOpen ? (
        <div className="app-layout__mobile-layer">
          <button
            type="button"
            className="app-layout__mobile-backdrop"
            aria-label="Fechar menu"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="app-layout__mobile-sidebar">
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </div>
      ) : null}
    </div>
  );
}
