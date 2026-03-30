"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/types/database";

type EmployeeStatus = Database["public"]["Tables"]["employees"]["Row"]["status"];

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function asNullable(value: FormDataEntryValue | null) {
  const normalized = asString(value);
  return normalized ? normalized : null;
}

export async function createEmployeeAction(formData: FormData) {
  const supabase = createAdminClient();
  const employeesTable: any = supabase.from("employees");

  const payload: Database["public"]["Tables"]["employees"]["Insert"] = {
    company_id: asString(formData.get("company_id")),
    unit_id: asString(formData.get("unit_id")),
    department_id: asNullable(formData.get("department_id")),
    role_id: asNullable(formData.get("role_id")),
    full_name: asString(formData.get("full_name")),
    badge_number: asString(formData.get("badge_number")),
    cpf: asNullable(formData.get("cpf")),
    email: asNullable(formData.get("email")),
    phone: asNullable(formData.get("phone")),
    hire_date: asNullable(formData.get("hire_date")),
    status: (asString(formData.get("status")) || "active") as EmployeeStatus,
  };

  if (!payload.company_id || !payload.unit_id || !payload.full_name || !payload.badge_number) {
    redirect("/colaboradores?error=Preencha+os+campos+obrigatorios");
  }

  const { error } = await employeesTable.insert(payload);

  if (error) {
    redirect(`/colaboradores?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/colaboradores");
  revalidatePath("/entrega/busca");
  redirect("/colaboradores?message=Colaborador+cadastrado+com+sucesso");
}

export async function updateEmployeeStatusAction(formData: FormData) {
  const supabase = createAdminClient();
  const employeesTable: any = supabase.from("employees");
  const employeeId = asString(formData.get("employee_id"));
  const status = asString(formData.get("status")) as EmployeeStatus;

  if (!employeeId || !status) {
    redirect("/colaboradores?error=Atualizacao+invalida");
  }

  const payload: Database["public"]["Tables"]["employees"]["Update"] = {
    status,
    updated_at: new Date().toISOString(),
    termination_date: status === "terminated" ? new Date().toISOString().slice(0, 10) : null,
  };

  const { error } = await employeesTable.update(payload).eq("id", employeeId);

  if (error) {
    redirect(`/colaboradores/${employeeId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/colaboradores");
  revalidatePath(`/colaboradores/${employeeId}`);
  revalidatePath("/entrega/busca");
  redirect(`/colaboradores/${employeeId}?message=Situacao+atualizada+com+sucesso`);
}

export async function deleteEmployeeAction(formData: FormData) {
  const supabase = createAdminClient();
  const employeesTable: any = supabase.from("employees");
  const employeeId = asString(formData.get("employee_id"));

  if (!employeeId) {
    redirect("/colaboradores?error=Exclusao+invalida");
  }

  const { count } = await supabase
    .from("deliveries")
    .select("id", { count: "exact", head: true })
    .eq("employee_id", employeeId);

  if ((count ?? 0) > 0) {
    redirect(`/colaboradores/${employeeId}?error=Nao+e+possivel+excluir+um+colaborador+com+historico+de+entregas`);
  }

  const { error } = await employeesTable.delete().eq("id", employeeId);

  if (error) {
    redirect(`/colaboradores/${employeeId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/colaboradores");
  revalidatePath("/entrega/busca");
  redirect("/colaboradores?message=Colaborador+excluido+com+sucesso");
}
