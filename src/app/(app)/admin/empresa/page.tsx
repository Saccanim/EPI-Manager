import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { OrganizationForms } from "@/components/admin/OrganizationForms";
import {
  createCompanyAction,
  createDepartmentAction,
  createRoleAction,
  createUnitAction,
} from "../actions";

export const metadata: Metadata = { title: "Empresa e Unidades" };

type CompanyOption = { id: string; name: string; cnpj: string | null };
type UnitOption = {
  id: string;
  company_id: string;
  name: string;
  city: string | null;
  state: string | null;
  companies: { name: string } | null;
};
type DepartmentOption = {
  id: string;
  unit_id: string;
  name: string;
  units: { name: string } | null;
};
type RoleOption = {
  id: string;
  department_id: string | null;
  name: string;
  description: string | null;
  departments: { name: string } | null;
};

export default async function AdminEmpresaPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const supabase = createAdminClient();
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

  const companyOptions = (companies as unknown as CompanyOption[]) ?? [];
  const unitOptions = (units as unknown as UnitOption[]) ?? [];
  const departmentOptions = (departments as unknown as DepartmentOption[]) ?? [];
  const roleOptions = (roles as unknown as RoleOption[]) ?? [];

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

      <OrganizationForms
        companies={companyOptions}
        units={unitOptions}
        departments={departmentOptions}
        roles={roleOptions}
        createCompanyAction={createCompanyAction}
        createUnitAction={createUnitAction}
        createDepartmentAction={createDepartmentAction}
        createRoleAction={createRoleAction}
      />

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Empresas</h3>
          <div className="space-y-2">
            {companyOptions.length === 0 && (
              <p className="text-sm text-text-muted">Nenhuma empresa cadastrada.</p>
            )}
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
            {unitOptions.length === 0 && (
              <p className="text-sm text-text-muted">Nenhuma unidade cadastrada.</p>
            )}
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
            {roleOptions.length === 0 && (
              <p className="text-sm text-text-muted">Nenhuma função cadastrada.</p>
            )}
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
