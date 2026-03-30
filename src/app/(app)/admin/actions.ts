"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/types/database";

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function asNullable(value: FormDataEntryValue | null) {
  const normalized = asString(value);
  return normalized || null;
}

export async function createCompanyAction(formData: FormData) {
  const supabase = createAdminClient();
  const payload: Database["public"]["Tables"]["companies"]["Insert"] = {
    name: asString(formData.get("name")),
    cnpj: asNullable(formData.get("cnpj")),
  };

  if (!payload.name) {
    redirect("/admin/empresa?error=Informe+o+nome+da+empresa");
  }

  const { error } = await (supabase.from("companies") as any).insert(payload);
  if (error) {
    redirect(`/admin/empresa?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/empresa");
  revalidatePath("/colaboradores");
  redirect("/admin/empresa?message=Empresa+cadastrada+com+sucesso");
}

export async function createUnitAction(formData: FormData) {
  const supabase = createAdminClient();
  const payload: Database["public"]["Tables"]["units"]["Insert"] = {
    company_id: asString(formData.get("company_id")),
    name: asString(formData.get("name")),
    city: asNullable(formData.get("city")),
    state: asNullable(formData.get("state")),
  };

  if (!payload.company_id || !payload.name) {
    redirect("/admin/empresa?error=Informe+empresa+e+nome+da+unidade");
  }

  const { error } = await (supabase.from("units") as any).insert(payload);
  if (error) {
    redirect(`/admin/empresa?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/empresa");
  revalidatePath("/colaboradores");
  redirect("/admin/empresa?message=Unidade+cadastrada+com+sucesso");
}

export async function createDepartmentAction(formData: FormData) {
  const supabase = createAdminClient();
  const payload: Database["public"]["Tables"]["departments"]["Insert"] = {
    unit_id: asString(formData.get("unit_id")),
    name: asString(formData.get("name")),
  };

  if (!payload.unit_id || !payload.name) {
    redirect("/admin/empresa?error=Informe+unidade+e+nome+do+departamento");
  }

  const { error } = await (supabase.from("departments") as any).insert(payload);
  if (error) {
    redirect(`/admin/empresa?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/empresa");
  revalidatePath("/colaboradores");
  redirect("/admin/empresa?message=Departamento+cadastrado+com+sucesso");
}

export async function createRoleAction(formData: FormData) {
  const supabase = createAdminClient();
  const payload: Database["public"]["Tables"]["roles"]["Insert"] = {
    department_id: asNullable(formData.get("department_id")),
    name: asString(formData.get("name")),
    description: asNullable(formData.get("description")),
  };

  if (!payload.name) {
    redirect("/admin/empresa?error=Informe+o+nome+da+funcao");
  }

  const { error } = await (supabase.from("roles") as any).insert(payload);
  if (error) {
    redirect(`/admin/empresa?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/empresa");
  revalidatePath("/colaboradores");
  redirect("/admin/empresa?message=Funcao+cadastrada+com+sucesso");
}
