"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Package, Send, Users, Warehouse,
  Bell, FileText, Shield, Settings, HardHat, LogOut, X, Menu
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Dashboard",     href: "/dashboard",    icon: LayoutDashboard },
  { label: "Entrega Rápida",href: "/entrega/busca", icon: Send,            highlight: true },
  { label: "Colaboradores", href: "/colaboradores", icon: Users },
  { label: "Estoque",       href: "/estoque",       icon: Warehouse },
  { label: "Alertas",       href: "/alertas",       icon: Bell },
  { label: "Relatórios",    href: "/relatorios",    icon: FileText },
  { label: "Auditoria",     href: "/auditoria",     icon: Shield },
  { label: "Admin",         href: "/admin",         icon: Settings },
];

function NavLink({ item, onClick }: { item: typeof navItems[0]; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
        item.highlight && !isActive &&
          "bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20",
        isActive
          ? "bg-primary text-white shadow-lg shadow-primary/20"
          : !item.highlight && "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {item.label}
    </Link>
  );
}

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex flex-col h-full bg-bg-surface border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <HardHat className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-text-primary">EPI Manager</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="btn-icon lg:hidden">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} onClick={onClose} />
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium
                     text-text-secondary hover:text-danger hover:bg-danger-muted transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
