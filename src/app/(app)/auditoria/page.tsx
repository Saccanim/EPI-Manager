import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Shield, Clock } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";
import type { Metadata } from "next";
import type { Database } from "@/lib/types/database";

type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];

export const metadata: Metadata = { title: "Auditoria" };

const actionLabels: Record<string, string> = {
  DELIVERY_COMPLETED: "Entrega concluída",
  INSERT:             "Registro criado",
  UPDATE:             "Registro atualizado",
  DELETE:             "Registro removido",
  EXCEPTION:          "Exceção registrada",
};

const actionBadge: Record<string, string> = {
  DELIVERY_COMPLETED: "badge-success",
  INSERT:             "badge-primary",
  UPDATE:             "badge-warning",
  DELETE:             "badge-danger",
  EXCEPTION:          "badge-danger",
};

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; table?: string }>;
}) {
  const supabase = await createClient();
  const resolvedParams = await searchParams;

  let query = supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (resolvedParams.action) query = query.eq("action", resolvedParams.action);
  if (resolvedParams.table)  query = query.eq("table_name", resolvedParams.table);

  const { data: logs } = await query;

  const filterActions = [
    { value: "", label: "Todos" },
    { value: "DELIVERY_COMPLETED", label: "Entregas" },
    { value: "EXCEPTION", label: "Exceções" },
    { value: "UPDATE", label: "Alterações" },
  ];

  return (
    <div className="max-w-4xl space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-primary" />
        <div>
          <h2 className="font-semibold text-text-primary">Trilha de Auditoria</h2>
          <p className="text-xs text-text-secondary">
            Registro imutável de todas as ações do sistema.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {filterActions.map((f) => (
          <Link
            key={f.value}
            href={`/auditoria?action=${f.value}`}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
              resolvedParams.action === f.value || (!resolvedParams.action && !f.value)
                ? "bg-primary border-primary text-white"
                : "bg-bg-elevated border-border text-text-secondary hover:text-text-primary"
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Log */}
      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border text-xs text-text-muted">
          {logs?.length ?? 0} registro(s) — dados protegidos e imutáveis
        </div>

        {(!logs || logs.length === 0) ? (
          <div className="flex flex-col items-center py-12 text-center text-text-muted">
            <Shield className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">Nenhum registro de auditoria encontrado.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {logs.map((log: AuditLog) => (
              <div
                key={log.id}
                className="px-4 py-3 hover:bg-bg-elevated transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn("badge text-xs", actionBadge[log.action] ?? "badge-muted")}>
                        {actionLabels[log.action] ?? log.action}
                      </span>
                      <span className="text-xs text-text-muted font-mono">
                        {log.table_name}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-1 font-mono truncate">
                      ID: {String(log.record_id).slice(0, 8)}…
                    </p>
                    {log.new_data && (
                      <p className="text-xs text-text-secondary mt-0.5 truncate">
                        {JSON.stringify(log.new_data).slice(0, 120)}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="flex items-center gap-1 text-xs text-text-muted">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(log.created_at)}
                    </div>
                    {log.ip_address && (
                      <p className="text-xs text-text-muted mt-0.5">{log.ip_address}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
