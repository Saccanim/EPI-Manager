"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ShieldAlert, ShieldCheck, Plus, Minus, ChevronRight,
  Loader2, AlertTriangle, User, ArrowLeft
} from "lucide-react";
import { cn, formatDate, getExpiryStatus, isExpired } from "@/lib/utils";
import Link from "next/link";

interface SelectedEpi {
  epiId: string;
  variantId: string | null;
  stockId: string;
  quantity: number;
  name: string;
  caNumber: string;
  caExpiryDate: string;
  sizeLabel: string;
  isException: boolean;
}

export default function EpisColaboradorPage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;
  const [supabase] = useState(() => createClient());

  const [employee, setEmployee] = useState<any>(null);
  const [requiredEpis, setRequiredEpis] = useState<any[]>([]);
  const [stock, setStock] = useState<any[]>([]);
  const [selected, setSelected] = useState<SelectedEpi[]>([]);
  const [loading, setLoading] = useState(true);
  const [exceptionReason, setExceptionReason] = useState("");
  const [showException, setShowException] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [empRes, stockRes] = await Promise.all<any>([
        supabase
          .from("employees")
          .select(`
            *,
            departments(name),
            roles(id, name),
            units(name)
          `)
          .eq("id", employeeId)
          .single(),
        supabase
          .from("stock")
          .select(`
            *,
            epi_catalog(*),
            epi_variants(*)
          `)
          .gt("quantity", 0),
      ]);

      if (empRes.data?.roles?.id) {
        const { data: matrix } = await supabase
          .from("occupational_matrix")
          .select(`
            *,
            epi_catalog(*)
          `)
          .eq("role_id", empRes.data.roles.id);
        setRequiredEpis(matrix ?? []);
      }

      setEmployee(empRes.data);
      setStock(stockRes.data ?? []);
      setLoading(false);
    })();
  }, [employeeId, supabase]);

  function toggleEpi(epi: any, stockItem: any) {
    const key = epi.id;
    const existing = selected.find((s) => s.epiId === key);
    const expiredCA = isExpired(epi.ca_expiry_date);

    if (existing) {
      setSelected(selected.filter((s) => s.epiId !== key));
    } else {
      if (expiredCA) setShowException(true);
      setSelected([
        ...selected,
        {
          epiId: epi.id,
          variantId: stockItem?.epi_variants?.id ?? null,
          stockId: stockItem?.id,
          quantity: 1,
          name: epi.name,
          caNumber: epi.ca_number,
          caExpiryDate: epi.ca_expiry_date,
          sizeLabel: stockItem?.epi_variants?.size_label ?? "Único",
          isException: expiredCA,
        },
      ]);
    }
  }

  function adjustQty(epiId: string, delta: number) {
    setSelected((prev) =>
      prev.map((s) =>
        s.epiId === epiId
          ? { ...s, quantity: Math.max(1, s.quantity + delta) }
          : s
      )
    );
  }

  function proceedToSignature() {
    if (selected.length === 0) return;
    const payload = encodeURIComponent(JSON.stringify(selected));
    const reason = encodeURIComponent(exceptionReason);
    router.push(`/entrega/${employeeId}/assinar?items=${payload}&reason=${reason}`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const hasException = selected.some((s) => s.isException);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Voltar */}
      <Link href="/entrega/busca" className="btn-ghost -ml-2 text-xs">
        <ArrowLeft className="w-3.5 h-3.5" />
        Trocar colaborador
      </Link>

      {/* Colaborador */}
      {employee && (
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-bg-overlay border border-border
                          flex items-center justify-center text-lg font-bold text-primary">
            {employee.full_name?.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-text-primary">{employee.full_name}</div>
            <div className="text-xs text-text-secondary mt-0.5">
              Mat. {employee.badge_number} · {employee.departments?.name} · {employee.roles?.name}
            </div>
          </div>
          <User className="w-4 h-4 text-text-muted ml-auto" />
        </div>
      )}

      {/* Lista de EPIs */}
      <div>
        <h3 className="text-sm font-medium text-text-secondary mb-2">
          EPIs obrigatórios por função
        </h3>
        <div className="space-y-2">
          {requiredEpis.length === 0 && (
            <div className="card text-sm text-text-muted text-center py-8">
              Nenhum EPI configurado para esta função.
            </div>
          )}
          {requiredEpis.map((item: any) => {
            const epi = item.epi_catalog;
            const expiryStatus = getExpiryStatus(epi.ca_expiry_date);
            const stockItem = stock.find((s) => s.epi_id === epi.id);
            const isSelected = selected.some((s) => s.epiId === epi.id);
            const noStock = !stockItem || stockItem.quantity === 0;

            return (
              <div
                key={item.id}
                className={cn(
                  "card border transition-all duration-150",
                  isSelected
                    ? "border-primary/50 bg-primary/5"
                    : "border-border",
                  noStock && "opacity-60"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Check */}
                  <button
                    onClick={() => !noStock && toggleEpi(epi, stockItem)}
                    disabled={noStock}
                    className={cn(
                      "mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-all",
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-border-strong bg-bg-elevated hover:border-primary"
                    )}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-text-primary leading-tight">
                        {epi.name}
                      </span>
                      {expiryStatus === "expired" ? (
                        <span className="badge-danger shrink-0">
                          <ShieldAlert className="w-3 h-3" /> CA Vencido
                        </span>
                      ) : expiryStatus === "critical" ? (
                        <span className="badge-warning shrink-0">
                          <AlertTriangle className="w-3 h-3" /> Vencendo
                        </span>
                      ) : (
                        <span className="badge-success shrink-0">
                          <ShieldCheck className="w-3 h-3" /> CA OK
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                      <span className="text-xs text-text-muted">CA {epi.ca_number}</span>
                      <span className="text-xs text-text-muted">
                        Vence: {formatDate(epi.ca_expiry_date)}
                      </span>
                      <span className={cn(
                        "text-xs",
                        noStock ? "text-danger" : "text-text-muted"
                      )}>
                        Estoque: {stockItem?.quantity ?? 0} {epi.unit_of_measure}
                      </span>
                    </div>

                    {/* Quantity selector */}
                    {isSelected && (
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs text-text-secondary">Qtd:</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => adjustQty(epi.id, -1)}
                            className="btn-icon !p-1"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-text-primary">
                            {selected.find((s) => s.epiId === epi.id)?.quantity}
                          </span>
                          <button
                            onClick={() => adjustQty(epi.id, 1)}
                            className="btn-icon !p-1"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Justificativa de exceção */}
      {showException && (
        <div className="p-4 rounded-xl bg-danger-muted border border-danger/30 space-y-2 animate-fade-in">
          <div className="flex items-center gap-2 text-sm font-medium text-danger">
            <AlertTriangle className="w-4 h-4" />
            EPI com CA vencido — justificativa obrigatória
          </div>
          <textarea
            value={exceptionReason}
            onChange={(e) => setExceptionReason(e.target.value)}
            placeholder="Informe o motivo da entrega fora da conformidade..."
            className="input h-20 resize-none text-sm"
            required
          />
        </div>
      )}

      {/* Rodapé fixo */}
      <div className="sticky bottom-0 pt-3 pb-2 bg-bg-base border-t border-border mt-6 -mx-4 px-4 lg:-mx-6 lg:px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <span className="text-sm text-text-secondary">
            {selected.length === 0
              ? "Nenhum item selecionado"
              : `${selected.length} item(s) selecionado(s)`}
          </span>
          <button
            onClick={proceedToSignature}
            disabled={
              selected.length === 0 ||
              (hasException && !exceptionReason.trim())
            }
            className="btn-primary"
          >
            Ir para assinatura
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
