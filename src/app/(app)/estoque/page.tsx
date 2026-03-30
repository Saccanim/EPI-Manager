import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { Package, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Estoque" };

export default async function EstoquePage() {
  const supabase = await createClient();

  const { data: stock } = await supabase
    .from("stock")
    .select(`
      *,
      epi_catalog(name, category, ca_expiry_date, unit_of_measure),
      warehouses(name),
      epi_variants(size_label)
    `)
    .order("quantity", { ascending: true });

  const totalItems = stock?.length ?? 0;
  const lowStock  = stock?.filter((s) => s.quantity <= s.min_quantity).length ?? 0;
  const zeroStock = stock?.filter((s) => s.quantity === 0).length ?? 0;
  const totalQty  = stock?.reduce((acc, s) => acc + s.quantity, 0) ?? 0;

  return (
    <div className="max-w-5xl space-y-5">
      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Itens cadastrados", value: totalItems, icon: Package, color: "text-primary" },
          { label: "Total em estoque",  value: totalQty, icon: TrendingUp, color: "text-success" },
          { label: "Estoque baixo",     value: lowStock,  icon: TrendingDown, color: "text-warning", urgent: lowStock > 0 },
          { label: "Estoque zerado",    value: zeroStock, icon: AlertTriangle, color: "text-danger",  urgent: zeroStock > 0 },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="card">
              <div className={`text-3xl font-bold ${m.color} mb-1`}>{m.value}</div>
              <div className="text-xs text-text-secondary flex items-center gap-1.5">
                <Icon className={cn("w-3.5 h-3.5", m.color)} />
                {m.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabela de estoque */}
      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-medium text-text-primary">Posição de Estoque</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-elevated">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wide">
                  EPI
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wide hidden md:table-cell">
                  Almoxarifado
                </th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wide">
                  Saldo
                </th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wide hidden sm:table-cell">
                  Mínimo
                </th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stock?.map((item: any) => {
                const isLow  = item.quantity <= item.min_quantity && item.quantity > 0;
                const isZero = item.quantity === 0;
                return (
                  <tr key={item.id} className="hover:bg-bg-elevated transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary line-clamp-1">
                        {item.epi_catalog?.name}
                        {item.epi_variants?.size_label && (
                          <span className="text-text-muted font-normal">
                            {" "}· {item.epi_variants.size_label}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-text-muted">{item.epi_catalog?.category}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-text-secondary">
                      {item.warehouses?.name}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn(
                        "font-semibold text-base tabular-nums",
                        isZero ? "text-danger" : isLow ? "text-warning" : "text-success"
                      )}>
                        {item.quantity}
                      </span>
                      <span className="text-xs text-text-muted ml-1">
                        {item.epi_catalog?.unit_of_measure}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell text-text-muted text-sm">
                      {item.min_quantity}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isZero ? (
                        <span className="badge-danger">Zerado</span>
                      ) : isLow ? (
                        <span className="badge-warning">Baixo</span>
                      ) : (
                        <span className="badge-success">Normal</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
