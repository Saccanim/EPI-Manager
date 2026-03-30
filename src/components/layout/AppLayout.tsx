"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Bell } from "lucide-react";
import Sidebar from "./Sidebar";

const pageTitles: Record<string, string> = {
  "/dashboard":      "Dashboard",
  "/entrega/busca":  "Entrega Rápida",
  "/colaboradores":  "Colaboradores",
  "/estoque":        "Estoque",
  "/alertas":        "Alertas",
  "/relatorios":     "Relatórios",
  "/auditoria":      "Auditoria",
  "/admin":          "Administração",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const title = Object.entries(pageTitles).find(([key]) =>
    pathname === key || pathname.startsWith(key + "/")
  )?.[1] ?? "EPI Manager";

  return (
    <div className="flex h-screen bg-bg-base overflow-hidden">
      {/* Sidebar desktop */}
      <div className="hidden lg:flex w-64 shrink-0">
        <Sidebar />
      </div>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-64 animate-slide-up">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="shrink-0 h-14 flex items-center gap-4 px-4 border-b border-border bg-bg-surface/80 backdrop-blur-sm">
          <button
            className="btn-icon lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-4 h-4" />
          </button>
          <h1 className="font-semibold text-text-primary text-base">{title}</h1>
          <div className="ml-auto flex items-center gap-2">
            <button className="btn-icon relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full ring-2 ring-bg-surface" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin p-4 lg:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
