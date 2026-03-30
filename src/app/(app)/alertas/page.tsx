import { createClient } from "@/lib/supabase/server";
import { cn, formatDate, daysUntilExpiry } from "@/lib/utils";
import { ShieldAlert, Package, Clock, AlertTriangle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Alertas" };

export default async function AlertasPage() {
  const supabase = await createClient();
  const in90days = new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0];

  const [
    { data: expiringCAs },
    { data: lowStockItems },
    { data: pendingDeliveries },
  ] = await Promise.all([
    supabase
      .from("epi_catalog")
      .select("id, name, ca_number, ca_expiry_date, status")
      .eq("status", "active")
      .lte("ca_expiry_date", in90days)
      .order("ca_expiry_date"),
    supabase
      .from("stock")
      .select(`
        id, quantity, min_quantity,
        epi_catalog(name),
        warehouses(name)
      `)
      .filter("quantity", "lte", "min_quantity")
      .order("quantity"),
    supabase
      .from("deliveries")
      .select(`
        id, delivery_date,
        employees(full_name, badge_number)
      `)
      .eq("status", "pending_signature")
      .order("delivery_date"),
  ]);

  const sections = [
    {
      title: "CA vencendo nos próximos 90 dias",
      icon: ShieldAlert,
      color: "text-warning",
      bg: "bg-warning/10",
      border: "border-warning/20",
      items: (expiringCAs ?? []).map((epi: any) => {
        const days = daysUntilExpiry(epi.ca_expiry_date);
        const isExpired = days < 0;
        return {
          key: epi.id,
          title: epi.name,
          subtitle: `CA ${epi.ca_number} · Vence: ${formatDate(epi.ca_expiry_date)}`,
          badge: isExpired
            ? { label: "VENCIDO", cls: "badge-danger" }
            : days <= 30
            ? { label: `${days}d`, cls: "badge-danger" }
            : { label: `${days}d`, cls: "badge-warning" },
        };
      }),
    },
    {
      title: "Estoque baixo ou zerado",
      icon: Package,
      color: "text-danger",
      bg: "bg-danger/10",
      border: "border-danger/20",
      items: (lowStockItems ?? []).map((s: any) => ({
        key: s.id,
        title: (s.epi_catalog as any)?.name ?? "—",
        subtitle: `${(s.warehouses as any)?.name} · Saldo: ${s.quantity} / Mín: ${s.min_quantity}`,
        badge:
          s.quantity === 0
            ? { label: "Zerado", cls: "badge-danger" }
            : { label: "Baixo", cls: "badge-warning" },
      })),
    },
    {
      title: "Entregas aguardando assinatura",
      icon: Clock,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
      items: (pendingDeliveries ?? []).map((d: any) => ({
        key: d.id,
        title: (d.employees as any)?.full_name ?? "—",
        subtitle: `Mat. ${(d.employees as any)?.badge_number} · ${new Date(d.delivery_date).toLocaleString("pt-BR")}`,
        badge: { label: "Pend. assinatura", cls: "badge-warning" },
      })),
    },
  ];

  const totalAlerts = sections.reduce((acc, s) => acc + s.items.length, 0);

  return (
    <div className="max-w-3xl space-y-5">
      {/* Resumo */}
      <div className="card flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-warning/10 border border-warning/20 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-warning" />
        </div>
        <div>
          <p className="font-semibold text-text-primary">
            {totalAlerts} alerta{totalAlerts !== 1 ? "s" : ""} ativos
          </p>
          <p className="text-xs text-text-secondary">
            Verifique e trate os itens abaixo para manter a operação em conformidade.
          </p>
        </div>
      </div>

      {/* Seções de alerta */}
      {sections.map((section) => {
        const Icon = section.icon;
        if (section.items.length === 0) return null;

        return (
          <div key={section.title}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn("w-4 h-4", section.color)} />
              <h3 className="text-sm font-medium text-text-secondary">
                {section.title}
                <span className="ml-2 badge-muted text-xs">
                  {section.items.length}
                </span>
              </h3>
            </div>

            <div className={cn(
              "rounded-xl border divide-y divide-border overflow-hidden",
              section.border
            )}>
              {section.items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-4 px-4 py-3 bg-bg-surface hover:bg-bg-elevated transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-text-muted truncate">{item.subtitle}</p>
                  </div>
                  <span className={cn("badge shrink-0", item.badge.cls)}>
                    {item.badge.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {totalAlerts === 0 && (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mb-3">
            <ShieldAlert className="w-6 h-6 text-success" />
          </div>
          <p className="font-medium text-text-primary">Tudo em conformidade!</p>
          <p className="text-sm text-text-muted mt-1">
            Nenhum alerta ativo no momento.
          </p>
        </div>
      )}
    </div>
  );
}
