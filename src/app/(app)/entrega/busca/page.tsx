"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Search, QrCode, UserX, ChevronRight, Loader2, Fingerprint } from "lucide-react";
import { cn, getEmployeeStatusLabel } from "@/lib/utils";
import type { Database } from "@/lib/types/database";

type Employee = Database["public"]["Tables"]["employees"]["Row"] & {
  departments: { name: string } | null;
  roles: { name: string } | null;
};

const statusBadge: Record<string, string> = {
  active: "badge-success",
  away: "badge-warning",
  vacation: "badge-primary",
  leave: "badge-muted",
  terminated: "badge-danger",
};

export default function BuscaColaboradorPage() {
  const router = useRouter();
  const supabase = createClient();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = useCallback(
    async (value: string) => {
      if (value.trim().length < 2) {
        setResults([]);
        setSearched(false);
        return;
      }

      setLoading(true);
      setSearched(true);

      const { data } = await supabase
        .from("employees")
        .select(`
          *,
          departments(name),
          roles(name)
        `)
        .or(
          `full_name.ilike.%${value}%,badge_number.ilike.%${value}%,cpf.ilike.%${value}%`
        )
        .order("full_name")
        .limit(20);

      setResults((data as Employee[]) ?? []);
      setLoading(false);
    },
    [supabase]
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQuery(v);
    search(v);
  }

  function selectEmployee(emp: Employee) {
    if (emp.status === "terminated") return;
    router.push(`/entrega/${emp.id}/epis`);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Buscar Colaborador</h2>
        <p className="text-sm text-text-secondary mt-0.5">
          Pesquise por nome, matrícula ou CPF para iniciar a entrega.
        </p>
      </div>

      {/* Barra de busca */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        <input
          id="employee-search"
          type="search"
          value={query}
          onChange={handleChange}
          placeholder="Nome, matrícula ou CPF..."
          className="input pl-10 pr-12 h-12 text-base"
          autoFocus
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted animate-spin" />
        )}
      </div>

      {/* Dica QR code */}
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-bg-elevated border border-border text-xs text-text-secondary">
        <QrCode className="w-4 h-4 text-primary shrink-0" />
        <span>
          Leia o QR code do crachá do colaborador para localizar automaticamente.
        </span>
      </div>

      {/* Resultados */}
      {searched && !loading && (
        <div className="space-y-2 animate-fade-in">
          {results.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-10 text-center">
              <UserX className="w-8 h-8 text-text-muted mb-2" />
              <p className="text-text-secondary text-sm">Nenhum colaborador encontrado.</p>
              <p className="text-text-muted text-xs mt-1">Tente outro nome, matrícula ou CPF.</p>
            </div>
          ) : (
            results.map((emp) => {
              const isTerminated = emp.status === "terminated";
              return (
                <button
                  key={emp.id}
                  onClick={() => selectEmployee(emp)}
                  disabled={isTerminated}
                  className={cn(
                    "w-full card flex items-center gap-4 text-left transition-all duration-150",
                    isTerminated
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:border-border-strong hover:bg-bg-elevated cursor-pointer active:scale-[0.99]"
                  )}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-bg-overlay border border-border shrink-0
                                  flex items-center justify-center text-sm font-semibold text-text-secondary">
                    {emp.full_name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-text-primary text-sm truncate">
                        {emp.full_name}
                      </span>
                      <span className={cn("badge text-xs", statusBadge[emp.status])}>
                        {getEmployeeStatusLabel(emp.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-text-muted">
                        Mat. {emp.badge_number}
                      </span>
                      {emp.departments?.name && (
                        <span className="text-xs text-text-muted truncate">
                          · {emp.departments.name}
                        </span>
                      )}
                      {emp.roles?.name && (
                        <span className="text-xs text-text-muted truncate hidden sm:inline">
                          · {emp.roles.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  {!isTerminated && (
                    <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
                  )}
                  {isTerminated && (
                    <Fingerprint className="w-4 h-4 text-danger shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}

      {/* Estado vazio inicial */}
      {!searched && (
        <div className="flex flex-col items-center justify-center py-12 text-center text-text-muted">
          <Search className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm">Digite pelo menos 2 caracteres para buscar</p>
        </div>
      )}
    </div>
  );
}
