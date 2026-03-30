import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Search, ChevronRight, UserX } from "lucide-react";
import { cn, getEmployeeStatusLabel } from "@/lib/utils";
import type { Metadata } from "next";
import { QueryData } from "@supabase/supabase-js";

export const metadata: Metadata = { title: "Colaboradores" };

const statusBadge: Record<string, string> = {
  active:     "badge-success",
  away:       "badge-warning",
  vacation:   "badge-primary",
  leave:      "badge-muted",
  terminated: "badge-danger",
};

export default async function ColaboradoresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const supabase = await createClient();
  const resolvedParams = await searchParams;
  const q = resolvedParams.q ?? "";
  const statusFilter = resolvedParams.status ?? "";

  const employeesQuery = supabase
    .from("employees")
    .select(`
      id, full_name, badge_number, cpf, status, hire_date,
      departments(name),
      roles(name)
    `)
    .order("full_name")
    .limit(100);

  let finalQuery = employeesQuery;
  if (q) {
    finalQuery = finalQuery.or(`full_name.ilike.%${q}%,badge_number.ilike.%${q}%`);
  }
  if (statusFilter) {
    finalQuery = finalQuery.eq("status", statusFilter);
  }

  type EmployeeQueryResult = {
    id: string;
    full_name: string;
    badge_number: string;
    cpf: string | null;
    status: string;
    hire_date: string | null;
    departments: { name: string } | null;
    roles: { name: string } | null;
  };

  const { data } = await finalQuery;
  const employees = (data as unknown as EmployeeQueryResult[]) || [];

  const statusOptions = [
    { value: "", label: "Todos" },
    { value: "active", label: "Ativos" },
    { value: "away", label: "Afastados" },
    { value: "terminated", label: "Desligados" },
  ];

  return (
    <div className="max-w-4xl space-y-5">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form className="flex-1">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar por nome ou matrícula..."
              className="input pl-10 h-10"
            />
          </div>
        </form>
        <div className="flex gap-2">
          {statusOptions.map((opt) => (
            <Link
              key={opt.value}
              href={`/colaboradores?status=${opt.value}${q ? `&q=${q}` : ""}`}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-medium border transition-all",
                statusFilter === opt.value
                  ? "bg-primary border-primary text-white"
                  : "bg-bg-elevated border-border text-text-secondary hover:text-text-primary"
              )}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <span className="text-sm font-medium text-text-primary">
            {employees?.length ?? 0} colaborador(es)
          </span>
          <Link href="/entrega/busca" className="btn-primary text-xs px-3 py-2">
            Nova entrega
          </Link>
        </div>

        {!employees?.length ? (
          <div className="flex flex-col items-center py-12 text-center text-text-muted">
            <UserX className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">Nenhum colaborador encontrado.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-text-muted uppercase tracking-wide">
              <span className="col-span-4">Nome</span>
              <span className="col-span-2">Matrícula</span>
              <span className="col-span-3">Setor / Função</span>
              <span className="col-span-2">Status</span>
              <span className="col-span-1" />
            </div>

            {employees.map((emp: EmployeeQueryResult) => (
              <Link
                key={emp.id}
                href={`/colaboradores/${emp.id}`}
                className="grid grid-cols-12 gap-4 px-4 py-3.5 hover:bg-bg-elevated transition-colors items-center"
              >
                <div className="col-span-8 sm:col-span-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-bg-overlay border border-border
                                  flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {emp.full_name?.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-text-primary truncate">
                    {emp.full_name}
                  </span>
                </div>
                <div className="hidden sm:block col-span-2 text-sm text-text-secondary">
                  {emp.badge_number}
                </div>
                <div className="hidden sm:block col-span-3 text-sm text-text-secondary truncate">
                  {emp.departments?.name}
                  {emp.roles?.name && (
                    <span className="text-text-muted"> · {emp.roles.name}</span>
                  )}
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <span className={cn("badge text-xs", statusBadge[emp.status])}>
                    {getEmployeeStatusLabel(emp.status)}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end">
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
