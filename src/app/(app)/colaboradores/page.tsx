import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Search, ChevronRight, UserX, UserPlus } from "lucide-react";
import { cn, getEmployeeStatusLabel } from "@/lib/utils";
import type { Metadata } from "next";
import { createEmployeeAction } from "./actions";

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
  searchParams: Promise<{ q?: string; status?: string; message?: string; error?: string }>;
}) {
  const supabase = await createClient();
  const resolvedParams = await searchParams;
  const q = resolvedParams.q ?? "";
  const statusFilter = resolvedParams.status ?? "";
  const message = resolvedParams.message ?? "";
  const error = resolvedParams.error ?? "";

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

  type CompanyOption = { id: string; name: string };
  type UnitOption = { id: string; company_id: string; name: string };
  type DepartmentOption = { id: string; unit_id: string; name: string };
  type RoleOption = { id: string; department_id: string | null; name: string };

  const [{ data }, { data: companies }, { data: units }, { data: departments }, { data: roles }] =
    await Promise.all([
      finalQuery,
      supabase.from("companies").select("id, name").order("name"),
      supabase.from("units").select("id, company_id, name").order("name"),
      supabase.from("departments").select("id, unit_id, name").order("name"),
      supabase.from("roles").select("id, department_id, name").order("name"),
    ]);
  const employees = (data as unknown as EmployeeQueryResult[]) || [];
  const companyOptions = (companies as unknown as CompanyOption[]) || [];
  const unitOptions = (units as unknown as UnitOption[]) || [];
  const departmentOptions = (departments as unknown as DepartmentOption[]) || [];
  const roleOptions = (roles as unknown as RoleOption[]) || [];

  const statusOptions = [
    { value: "", label: "Todos" },
    { value: "active", label: "Ativos" },
    { value: "away", label: "Afastados" },
    { value: "terminated", label: "Desligados" },
  ];

  return (
    <div className="max-w-4xl space-y-5">
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

      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">Novo colaborador</h2>
            <p className="text-xs text-text-secondary">Cadastre um colaborador e deixe o perfil pronto para entrega de EPI.</p>
          </div>
        </div>

        <form action={createEmployeeAction} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label htmlFor="full_name" className="input-label">Nome completo</label>
            <input id="full_name" name="full_name" className="input" required />
          </div>
          <div>
            <label htmlFor="badge_number" className="input-label">Matrícula</label>
            <input id="badge_number" name="badge_number" className="input" required />
          </div>
          <div>
            <label htmlFor="status" className="input-label">Situação</label>
            <select id="status" name="status" className="input">
              <option value="active">Ativo</option>
              <option value="away">Afastado</option>
              <option value="vacation">Férias</option>
              <option value="leave">Licença</option>
              <option value="terminated">Desligado</option>
            </select>
          </div>
          <div>
            <label htmlFor="company_id" className="input-label">Empresa</label>
            <select id="company_id" name="company_id" className="input" required defaultValue={companyOptions[0]?.id ?? ""}>
              {companyOptions.map((company) => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="unit_id" className="input-label">Unidade</label>
            <select id="unit_id" name="unit_id" className="input" required defaultValue={unitOptions[0]?.id ?? ""}>
              {unitOptions.map((unit) => (
                <option key={unit.id} value={unit.id}>{unit.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="department_id" className="input-label">Departamento</label>
            <select id="department_id" name="department_id" className="input" defaultValue="">
              <option value="">Não informado</option>
              {departmentOptions.map((department) => (
                <option key={department.id} value={department.id}>{department.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="role_id" className="input-label">Função</label>
            <select id="role_id" name="role_id" className="input" defaultValue="">
              <option value="">Não informada</option>
              {roleOptions.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="cpf" className="input-label">CPF</label>
            <input id="cpf" name="cpf" className="input" />
          </div>
          <div>
            <label htmlFor="hire_date" className="input-label">Admissão</label>
            <input id="hire_date" name="hire_date" type="date" className="input" />
          </div>
          <div>
            <label htmlFor="email" className="input-label">E-mail</label>
            <input id="email" name="email" type="email" className="input" />
          </div>
          <div>
            <label htmlFor="phone" className="input-label">Telefone</label>
            <input id="phone" name="phone" className="input" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="btn-primary">
              <UserPlus className="w-4 h-4" />
              Cadastrar colaborador
            </button>
          </div>
        </form>
      </div>

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
