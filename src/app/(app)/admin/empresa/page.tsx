import type { Metadata } from "next";
import { Building2, Building, BriefcaseBusiness, Network } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import {
  createCompanyAction,
  createDepartmentAction,
  createRoleAction,
  createUnitAction,
} from "../actions";

export const metadata: Metadata = { title: "Empresa e Unidades" };

export default async function AdminEmpresaPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const supabase = await createClient();
  const resolvedParams = await searchParams;
  const message = resolvedParams.message ?? "";
  const error = resolvedParams.error ?? "";

  const [{ data: companies }, { data: units }, { data: departments }, { data: roles }] =
    await Promise.all([
      supabase.from("companies").select("id, name, cnpj").order("name"),
      supabase.from("units").select("id, company_id, name, city, state, companies(name)").order("name"),
      supabase.from("departments").select("id, unit_id, name, units(name)").order("name"),
      supabase.from("roles").select("id, department_id, name, description, departments(name)").order("name"),
    ]);

  const companyOptions = (companies as Array<{ id: string; name: string; cnpj: string | null }>) ?? [];
  const unitOptions =
    (units as Array<{ id: string; name: string; city: string | null; state: string | null; companies: { name: string } | null }>) ?? [];
  const departmentOptions =
    (departments as Array<{ id: string; name: string; units: { name: string } | null }>) ?? [];
  const roleOptions =
    (roles as Array<{ id: string; name: string; description: string | null; departments: { name: string } | null }>) ?? [];

  return (
    <div className="max-w-5xl space-y-5">
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

      <div className="grid lg:grid-cols-2 gap-4">
        <form action={createCompanyAction} className="card space-y-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-text-primary">Cadastrar empresa</h2>
          </div>
          <input name="name" className="input" placeholder="Nome da empresa" required />
          <input name="cnpj" className="input" placeholder="CNPJ" />
          <button type="submit" className="btn-primary w-full">Salvar empresa</button>
        </form>

        <form action={createUnitAction} className="card space-y-3">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-success" />
            <h2 className="text-sm font-semibold text-text-primary">Cadastrar unidade</h2>
          </div>
          <select name="company_id" className="input" defaultValue={companyOptions[0]?.id ?? ""} required>
            {companyOptions.map((company) => (
              <option key={company.id} value={company.id}>{company.name}</option>
            ))}
          </select>
          <input name="name" className="input" placeholder="Nome da unidade" required />
          <div className="grid grid-cols-2 gap-3">
            <input name="city" className="input" placeholder="Cidade" />
            <input name="state" className="input" placeholder="UF" maxLength={2} />
          </div>
          <button type="submit" className="btn-primary w-full">Salvar unidade</button>
        </form>

        <form action={createDepartmentAction} className="card space-y-3">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-warning" />
            <h2 className="text-sm font-semibold text-text-primary">Cadastrar departamento</h2>
          </div>
          <select name="unit_id" className="input" defaultValue={unitOptions[0]?.id ?? ""} required>
            {unitOptions.map((unit) => (
              <option key={unit.id} value={unit.id}>{unit.name}</option>
            ))}
          </select>
          <input name="name" className="input" placeholder="Nome do departamento" required />
          <button type="submit" className="btn-primary w-full">Salvar departamento</button>
        </form>

        <form action={createRoleAction} className="card space-y-3">
          <div className="flex items-center gap-2">
            <BriefcaseBusiness className="w-4 h-4 text-danger" />
            <h2 className="text-sm font-semibold text-text-primary">Cadastrar função</h2>
          </div>
          <select name="department_id" className="input" defaultValue={departmentOptions[0]?.id ?? ""}>
            {departmentOptions.map((department) => (
              <option key={department.id} value={department.id}>{department.name}</option>
            ))}
          </select>
          <input name="name" className="input" placeholder="Nome da função" required />
          <input name="description" className="input" placeholder="Descrição" />
          <button type="submit" className="btn-primary w-full">Salvar função</button>
        </form>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Empresas</h3>
          <div className="space-y-2">
            {companyOptions.map((company) => (
              <div key={company.id} className="rounded-lg border border-border px-3 py-2">
                <div className="text-sm font-medium text-text-primary">{company.name}</div>
                <div className="text-xs text-text-secondary">{company.cnpj || "Sem CNPJ"}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Unidades e Departamentos</h3>
          <div className="space-y-2">
            {unitOptions.map((unit) => (
              <div key={unit.id} className="rounded-lg border border-border px-3 py-2">
                <div className="text-sm font-medium text-text-primary">
                  {unit.name}
                  <span className="text-text-muted font-normal"> · {unit.companies?.name ?? "Sem empresa"}</span>
                </div>
                <div className="text-xs text-text-secondary">
                  {[unit.city, unit.state].filter(Boolean).join(" / ") || "Local não informado"}
                </div>
              </div>
            ))}
            {departmentOptions.map((department) => (
              <div key={department.id} className="rounded-lg border border-border px-3 py-2 bg-bg-elevated">
                <div className="text-sm font-medium text-text-primary">{department.name}</div>
                <div className="text-xs text-text-secondary">Unidade: {department.units?.name ?? "N/A"}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Funções</h3>
          <div className="grid md:grid-cols-2 gap-2">
            {roleOptions.map((role) => (
              <div key={role.id} className="rounded-lg border border-border px-3 py-2">
                <div className="text-sm font-medium text-text-primary">{role.name}</div>
                <div className="text-xs text-text-secondary">
                  {role.departments?.name ?? "Sem departamento"}
                  {role.description ? ` · ${role.description}` : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
