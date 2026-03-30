import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Send, Users, Bell, Package, ShieldAlert,
  TrendingUp, Clock, CheckCircle2, AlertTriangle
} from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

async function getDashboardData() {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];
  const in30days = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

  const [
    { count: deliveriesToday },
    { count: pendingSignatures },
    { count: lowStock },
    { count: expiringCA },
    { data: recentDeliveries },
  ] = await Promise.all<any>([
    supabase
      .from("deliveries")
      .select("*", { count: "exact", head: true })
      .gte("delivery_date", today + "T00:00:00")
      .lte("delivery_date", today + "T23:59:59"),
    supabase
      .from("deliveries")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending_signature"),
    supabase
      .from("stock")
      .select("*", { count: "exact", head: true })
      .filter("quantity", "lte", "min_quantity"),
    supabase
      .from("epi_catalog")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .lte("ca_expiry_date", in30days),
    supabase
      .from("deliveries")
      .select(`
        id, delivery_date, status,
        employees(full_name, badge_number),
        delivery_items(count)
      `)
      .order("delivery_date", { ascending: false })
      .limit(5),
  ]);

  return {
    deliveriesToday: deliveriesToday ?? 0,
    pendingSignatures: pendingSignatures ?? 0,
    lowStock: lowStock ?? 0,
    expiringCA: expiringCA ?? 0,
    recentDeliveries: recentDeliveries ?? [],
  };
}

const statusColors: Record<string, string> = {
  completed: "badge-success",
  pending_signature: "badge-warning",
  draft: "badge-muted",
  cancelled: "badge-danger",
};

const statusLabels: Record<string, string> = {
  completed: "Concluída",
  pending_signature: "Aguard. assinatura",
  draft: "Rascunho",
  cancelled: "Cancelada",
};

export default async function DashboardPage() {
  const data = await getDashboardData();

  const metrics = [
    {
      label: "Entregas hoje",
      value: data.deliveriesToday,
      icon: Send,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
    },
    {
      label: "Assinaturas pendentes",
      value: data.pendingSignatures,
      icon: Clock,
      color: "text-warning",
      bg: "bg-warning/10",
      border: "border-warning/20",
      urgent: data.pendingSignatures > 0,
    },
    {
      label: "Itens com estoque baixo",
      value: data.lowStock,
      icon: Package,
      color: "text-danger",
      bg: "bg-danger/10",
      border: "border-danger/20",
      urgent: data.lowStock > 0,
    },
    {
      label: "CA vencendo em 30 dias",
      value: data.expiringCA,
      icon: ShieldAlert,
      color: "text-warning",
      bg: "bg-warning/10",
      border: "border-warning/20",
      urgent: data.expiringCA > 0,
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Métricas */}
      <div>
        <h2 className="text-sm font-medium text-text-secondary mb-3">
          Visão geral — hoje
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className={`card border ${m.border} relative overflow-hidden`}
              >
                {m.urgent && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-current animate-pulse-slow"
                    style={{ color: m.color.replace("text-", "") }} />
                )}
                <div className={`inline-flex p-2 rounded-lg ${m.bg} mb-3`}>
                  <Icon className={`w-5 h-5 ${m.color}`} />
                </div>
                <div className={`text-3xl font-bold ${m.color} mb-1`}>{m.value}</div>
                <div className="text-xs text-text-secondary leading-tight">{m.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Entrega Rápida */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-text-primary mb-1">Entrega Rápida</h3>
            <p className="text-sm text-text-secondary">
              Busque o colaborador e registre a entrega de EPIs em segundos.
            </p>
          </div>
          <Link href="/entrega/busca" className="btn-primary shrink-0">
            <Send className="w-4 h-4" />
            Iniciar entrega
          </Link>
        </div>
      </div>

      {/* Entregas recentes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-text-secondary">
            Entregas recentes
          </h2>
          <Link href="/auditoria" className="text-xs text-primary hover:underline">
            Ver todas
          </Link>
        </div>

        <div className="card p-0 overflow-hidden">
          {data.recentDeliveries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="w-8 h-8 text-text-muted mb-2" />
              <p className="text-text-secondary text-sm">Nenhuma entrega registrada ainda.</p>
              <Link href="/entrega/busca" className="btn-primary mt-4 text-sm">
                Registrar primeira entrega
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wide">
                <span className="col-span-5">Colaborador</span>
                <span className="col-span-3 hidden sm:block">Data/Hora</span>
                <span className="col-span-2">Itens</span>
                <span className="col-span-2">Status</span>
              </div>
              {data.recentDeliveries.map((delivery: any) => (
                <Link
                  key={delivery.id}
                  href={`/entrega/${delivery.id}/termo`}
                  className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-bg-elevated transition-colors items-center"
                >
                  <div className="col-span-5">
                    <p className="text-sm font-medium text-text-primary line-clamp-1">
                      {delivery.employees?.full_name ?? "—"}
                    </p>
                    <p className="text-xs text-text-muted">
                      #{delivery.employees?.badge_number}
                    </p>
                  </div>
                  <div className="col-span-3 hidden sm:block text-sm text-text-secondary">
                    {new Date(delivery.delivery_date).toLocaleString("pt-BR", {
                      day: "2-digit", month: "2-digit",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                  <div className="col-span-2 text-sm text-text-secondary">
                    {delivery.delivery_items?.[0]?.count ?? 0} un
                  </div>
                  <div className="col-span-2">
                    <span className={statusColors[delivery.status] ?? "badge-muted"}>
                      {statusLabels[delivery.status] ?? delivery.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Links rápidos */}
      <div>
        <h2 className="text-sm font-medium text-text-secondary mb-3">Acesso rápido</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/colaboradores", label: "Colaboradores", icon: Users, color: "text-primary" },
            { href: "/estoque",       label: "Estoque",       icon: Package, color: "text-success" },
            { href: "/alertas",       label: "Alertas",       icon: Bell, color: "text-warning" },
            { href: "/relatorios",    label: "Relatórios",    icon: TrendingUp, color: "text-text-secondary" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="card flex flex-col items-center gap-2 py-5 hover:border-border-strong hover:bg-bg-elevated transition-all text-center"
              >
                <Icon className={`w-5 h-5 ${item.color}`} />
                <span className="text-sm font-medium text-text-primary">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
