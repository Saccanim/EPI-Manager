"use client";

import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";

type CompanyOption = { id: string; name: string };
type UnitOption = { id: string; company_id: string; name: string };
type DepartmentOption = { id: string; unit_id: string; name: string };
type RoleOption = { id: string; department_id: string | null; name: string };

type Props = {
  companies: CompanyOption[];
  units: UnitOption[];
  departments: DepartmentOption[];
  roles: RoleOption[];
  action: (formData: FormData) => void | Promise<void>;
};

export function EmployeeCreateForm({
  companies,
  units,
  departments,
  roles,
  action,
}: Props) {
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? "");
  const filteredUnits = units.filter((unit) => unit.company_id === companyId);
  const [unitId, setUnitId] = useState(filteredUnits[0]?.id ?? "");
  const filteredDepartments = departments.filter((department) => department.unit_id === unitId);
  const [departmentId, setDepartmentId] = useState("");
  const filteredRoles = roles.filter((role) => role.department_id === departmentId);
  const [roleId, setRoleId] = useState("");

  useEffect(() => {
    const nextUnitId = filteredUnits[0]?.id ?? "";
    setUnitId(nextUnitId);
  }, [companyId]);

  useEffect(() => {
    const nextDepartmentId = filteredDepartments[0]?.id ?? "";
    setDepartmentId(nextDepartmentId);
  }, [unitId]);

  useEffect(() => {
    setRoleId(filteredRoles[0]?.id ?? "");
  }, [departmentId]);

  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <UserPlus className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-text-primary">Novo colaborador</h2>
          <p className="text-xs text-text-secondary">Cadastre um colaborador respeitando a hierarquia da estrutura.</p>
        </div>
      </div>

      <form action={action} className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
          <select id="status" name="status" className="input" defaultValue="active">
            <option value="active">Ativo</option>
            <option value="away">Afastado</option>
            <option value="vacation">Férias</option>
            <option value="leave">Licença</option>
            <option value="terminated">Desligado</option>
          </select>
        </div>
        <div>
          <label htmlFor="company_id" className="input-label">Empresa</label>
          <select
            id="company_id"
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
        </div>
        <div>
          <label htmlFor="unit_id" className="input-label">Unidade</label>
          <select
            id="unit_id"
            name="unit_id"
            className="input"
            required
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
            disabled={filteredUnits.length === 0}
          >
            {filteredUnits.length === 0 && <option value="">Nenhuma unidade para a empresa</option>}
            {filteredUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>{unit.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="department_id" className="input-label">Departamento</label>
          <select
            id="department_id"
            name="department_id"
            className="input"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            disabled={!unitId}
          >
            <option value="">Não informado</option>
            {filteredDepartments.map((department) => (
              <option key={department.id} value={department.id}>{department.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="role_id" className="input-label">Função</label>
          <select
            id="role_id"
            name="role_id"
            className="input"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            disabled={!departmentId}
          >
            <option value="">Não informada</option>
            {filteredRoles.map((role) => (
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
          <button type="submit" className="btn-primary" disabled={!companyId || !unitId}>
            <UserPlus className="w-4 h-4" />
            Cadastrar colaborador
          </button>
        </div>
      </form>
    </div>
  );
}
