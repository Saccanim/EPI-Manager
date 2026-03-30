"use client";

import { useEffect, useState } from "react";
import { BriefcaseBusiness, Building, Building2, Network } from "lucide-react";

type CompanyOption = { id: string; name: string; cnpj: string | null };
type UnitOption = { id: string; company_id: string; name: string; city: string | null; state: string | null; companies: { name: string } | null };
type DepartmentOption = { id: string; unit_id: string; name: string; units: { name: string } | null };
type RoleOption = { id: string; department_id: string | null; name: string; description: string | null; departments: { name: string } | null };

type Props = {
  companies: CompanyOption[];
  units: UnitOption[];
  departments: DepartmentOption[];
  roles: RoleOption[];
  createCompanyAction: (formData: FormData) => void | Promise<void>;
  createUnitAction: (formData: FormData) => void | Promise<void>;
  createDepartmentAction: (formData: FormData) => void | Promise<void>;
  createRoleAction: (formData: FormData) => void | Promise<void>;
};

export function OrganizationForms(props: Props) {
  const {
    companies,
    units,
    departments,
    roles,
    createCompanyAction,
    createUnitAction,
    createDepartmentAction,
    createRoleAction,
  } = props;

  const [companyId, setCompanyId] = useState(companies[0]?.id ?? "");
  const filteredUnits = units.filter((unit) => unit.company_id === companyId);
  const [unitId, setUnitId] = useState(filteredUnits[0]?.id ?? "");
  const filteredDepartments = departments.filter((department) => department.unit_id === unitId);
  const [departmentId, setDepartmentId] = useState(filteredDepartments[0]?.id ?? "");

  useEffect(() => {
    setUnitId(filteredUnits[0]?.id ?? "");
  }, [companyId]);

  useEffect(() => {
    setDepartmentId(filteredDepartments[0]?.id ?? "");
  }, [unitId]);

  return (
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
        <select
          name="company_id"
          className="input"
          required
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
        >
          {companies.length === 0 && <option value="">Cadastre uma empresa antes</option>}
          {companies.map((company) => (
            <option key={company.id} value={company.id}>{company.name}</option>
          ))}
        </select>
        <input name="name" className="input" placeholder="Nome da unidade" required />
        <div className="grid grid-cols-2 gap-3">
          <input name="city" className="input" placeholder="Cidade" />
          <input name="state" className="input" placeholder="UF" maxLength={2} />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={!companyId}>Salvar unidade</button>
      </form>

      <form action={createDepartmentAction} className="card space-y-3">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-warning" />
          <h2 className="text-sm font-semibold text-text-primary">Cadastrar departamento</h2>
        </div>
        <select
          name="unit_id"
          className="input"
          required
          value={unitId}
          onChange={(e) => setUnitId(e.target.value)}
          disabled={filteredUnits.length === 0}
        >
          {filteredUnits.length === 0 && <option value="">Cadastre uma unidade antes</option>}
          {filteredUnits.map((unit) => (
            <option key={unit.id} value={unit.id}>{unit.name}</option>
          ))}
        </select>
        <input name="name" className="input" placeholder="Nome do departamento" required />
        <button type="submit" className="btn-primary w-full" disabled={!unitId}>Salvar departamento</button>
      </form>

      <form action={createRoleAction} className="card space-y-3">
        <div className="flex items-center gap-2">
          <BriefcaseBusiness className="w-4 h-4 text-danger" />
          <h2 className="text-sm font-semibold text-text-primary">Cadastrar função</h2>
        </div>
        <select
          name="department_id"
          className="input"
          required
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          disabled={filteredDepartments.length === 0}
        >
          {filteredDepartments.length === 0 && <option value="">Cadastre um departamento antes</option>}
          {filteredDepartments.map((department) => (
            <option key={department.id} value={department.id}>{department.name}</option>
          ))}
        </select>
        <input name="name" className="input" placeholder="Nome da função" required />
        <input name="description" className="input" placeholder="Descrição" />
        <button type="submit" className="btn-primary w-full" disabled={!departmentId}>Salvar função</button>
      </form>
    </div>
  );
}
