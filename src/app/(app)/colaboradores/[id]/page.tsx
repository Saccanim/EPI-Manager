import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Send, ShieldCheck, ShieldAlert,
  Clock, Package, AlertTriangle, Trash2, Save
} from "lucide-react";
import { cn, formatDate, formatDateTime, getEmployeeStatusLabel, getExpiryStatus } from "@/lib/utils";
import type { Metadata } from "next";
import { deleteEmployeeAction, updateEmployeeStatusAction } from "../actions";

type ProfileEmployee = {
  id: string;
  full_name: string;
  badge_number: string;
  cpf: string | null;
  status: string;
  hire_date: string | null;
  units: { name: string; city: string | null; state: string | null } | null;
  departments: { name: string } | null;
  roles: { id: string; name: string } | null;
};

type ProfileDeliveryItem = {
  id: string;
  quantity: number;
  ca_number: string;
  ca_expiry_date: string;
  is_exception: boolean;
  epi_catalog: { name: string; category: string } | null;
  epi_variants: { size_label: string } | null;
};

type ProfileDelivery = {
  id: string;
  status: string;
  delivery_date: string;
  exception_reason: string | null;
  delivery_items: ProfileDeliveryItem[] | null;
  signatures: { signed_at: string; type: string }[] | null;
};

export const metadata: Metadata = { title: "Perfil do Colaborador" };

const statusBadge: Record<string, string> = {
  active:     "badge-success",
  away:       "badge-warning",
  vacation:   "badge-primary",
  leave:      "badge-muted",
  terminated: "badge-danger",
};

const deliveryStatusLabel: Record<string, string> = {
  completed:         "Concluída",
  pending_signature: "Pend. assinatura",
  cancelled:         "Cancelada",
  reversed:          "Estornada",
};
const deliveryStatusBadge: Record<string, string> = {
  completed:         "badge-success",
  pending_signature: "badge-warning",
  cancelled:         "badge-danger",
  reversed:          "badge-muted",
};

export default async function ColaboradorPerfilPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const message = resolvedSearchParams.message ?? "";
  const error = resolvedSearchParams.error ?? "";

  const [empRes, deliveriesRes] = await Promise.all([
    supabase
      .from("employees")
      .select(`
        *,
        departments(name),
        roles(id, name),
        units(name, city, state)
      `)
      .eq("id", id)
      .single() as unknown as Promise<{ data: unknown }>,
    supabase
      .from("deliveries")
      .select(`
        id, status, delivery_date, exception_reason,
        delivery_items(
          id, quantity, ca_number, ca_expiry_date, is_exception,
          epi_catalog(name, category),
          epi_variants(size_label)
        ),
        signatures(signed_at, type)
      `)
      .eq("employee_id", id)
      .order("delivery_date", { ascending: false })
      .limit(20) as unknown as Promise<{ data: unknown }>,
  ]);

  if (!empRes.data) notFound();

  const emp = empRes.data as unknown as ProfileEmployee;
  const deliveries = (deliveriesRes.data as unknown as ProfileDelivery[]) ?? [];

  const canDeliver = emp.status === "active";

  return (
    <div className="max-w-3xl space-y-5">
      {(message || error) && (
        <div
          className={cn(
            "rounded-xl border px-4 py-3 text-sm",
            error
              ? "border-danger/30 bg-danger-muted text-danger"
              : "border-success/30 bg-success/10 text-success"
          )}
        >
          {decodeURIComponent(error || message).replace(/\+/g, " ")}
        </div>
      )}

      {/* Voltar */}
      <Link href="/colaboradores" className="btn-ghost -ml-2 text-xs">
        <ArrowLeft className="w-3.5 h-3.5" />
        Colaboradores
      </Link>

      {/* Header do perfil */}
      <div className="card flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-bg-overlay border-2 border-border
                        flex items-center justify-center text-xl font-bold text-primary shrink-0">
          {emp.full_name?.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-lg font-semibold text-text-primary">{emp.full_name}</h2>
            <span className={cn("badge", statusBadge[emp.status])}>
              {getEmployeeStatusLabel(emp.status)}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
            <span>Mat. {emp.badge_number}</span>
            {emp.cpf && <span>CPF {emp.cpf}</span>}
            {emp.units?.name && <span>{emp.units.name}</span>}
            {emp.departments?.name && <span>{emp.departments.name}</span>}
            {emp.roles?.name && <span>{emp.roles.name}</span>}
            {emp.hire_date && (
              <span>Admissão: {formatDate(emp.hire_date)}</span>
            )}
          </div>
        </div>
        {canDeliver && (
          <Link href={`/entrega/${emp.id}/epis`} className="btn-primary shrink-0">
            <Send className="w-4 h-4" />
            Entregar EPI
          </Link>
        )}
      </div>

      {/* Aviso de status */}
      {!canDeliver && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-danger-muted border border-danger/30 text-sm text-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          Colaborador {getEmployeeStatusLabel(emp.status).toLowerCase()} — novas entregas bloqueadas.
        </div>
      )}

      {/* Histórico de entregas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form action={updateEmployeeStatusAction} className="card space-y-3">
          <div>
            <h3 className="text-sm font-medium text-text-primary">Mudar situação</h3>
            <p className="text-xs text-text-secondary mt-1">
              Atualize o status para liberar ou bloquear novas entregas.
            </p>
          </div>
          <input type="hidden" name="employee_id" value={emp.id} />
          <div>
            <label htmlFor="status" className="input-label">Situação</label>
            <select id="status" name="status" className="input" defaultValue={emp.status}>
              <option value="active">Ativo</option>
              <option value="away">Afastado</option>
              <option value="vacation">Férias</option>
              <option value="leave">Licença</option>
              <option value="terminated">Desligado</option>
            </select>
          </div>
          <button type="submit" className="btn-primary w-full">
            <Save className="w-4 h-4" />
            Salvar situação
          </button>
        </form>

        <form action={deleteEmployeeAction} className="card space-y-3 border-danger/30">
          <div>
            <h3 className="text-sm font-medium text-text-primary">Excluir colaborador</h3>
            <p className="text-xs text-text-secondary mt-1">
              A exclusão só é permitida quando não existe histórico de entregas vinculado.
            </p>
          </div>
          <input type="hidden" name="employee_id" value={emp.id} />
          <button
            type="submit"
            className="w-full h-10 rounded-lg border border-danger/40 text-danger hover:bg-danger-muted transition-colors inline-flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Excluir colaborador
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-sm font-medium text-text-secondary mb-3">
          Histórico de entregas ({deliveries.length})
        </h3>

        {deliveries.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-12 text-center text-text-muted">
            <Package className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">Nenhuma entrega registrada para este colaborador.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deliveries.map((d) => {
              const items = d.delivery_items ?? [];
              return (
                <Link
                  key={d.id}
                  href={`/entrega/${d.id}/termo`}
                  className="card hover:border-border-strong hover:bg-bg-elevated transition-all block"
                >
                  {/* Header da entrega */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-text-muted" />
                      <span className="text-xs text-text-secondary">
                        {formatDateTime(d.delivery_date)}
                      </span>
                    </div>
                    <span className={cn("badge text-xs", deliveryStatusBadge[d.status])}>
                      {deliveryStatusLabel[d.status] ?? d.status}
                    </span>
                  </div>

                  {/* Itens */}
                  <div className="space-y-1.5">
                    {items.map((item) => {
                      const expStatus = getExpiryStatus(item.ca_expiry_date);
                      return (
                        <div key={item.id} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {expStatus === "expired" || item.is_exception ? (
                              <ShieldAlert className="w-3.5 h-3.5 text-danger shrink-0" />
                            ) : (
                              <ShieldCheck className="w-3.5 h-3.5 text-success shrink-0" />
                            )}
                            <span className="text-sm text-text-primary truncate">
                              {item.epi_catalog?.name}
                            </span>
                            {item.epi_variants?.size_label && (
                              <span className="text-xs text-text-muted shrink-0">
                                Tam. {item.epi_variants.size_label}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-text-muted shrink-0">
                            {item.quantity}x
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {d.exception_reason && (
                    <p className="mt-2 text-xs text-warning border-t border-border pt-2">
                      ⚠ {d.exception_reason}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
