"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database";
import { CheckCircle2, Eraser, Loader2, ArrowLeft, FileSignature } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

// SSR safe
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SignatureCanvasDynamic = dynamic(
  () => import("react-signature-canvas"),
  { ssr: false }
) as any;

interface SelectedEpiItem {
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

type EmployeeWithRelations = Database["public"]["Tables"]["employees"]["Row"] & {
  departments: { name: string } | null;
  roles: { name: string } | null;
};

export default function AssinarPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const employeeId = params.id;

  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sigRef = useRef<any>(null); // react-signature-canvas generic ref

  const [employee, setEmployee] = useState<EmployeeWithRelations | null>(null);
  const [items, setItems] = useState<SelectedEpiItem[]>([]);
  const [exceptionReason, setExceptionReason] = useState("");
  const [isEmpty, setIsEmpty] = useState(true);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const rawItems = searchParams.get("items");
    const rawReason = searchParams.get("reason");
    if (rawItems) setItems(JSON.parse(decodeURIComponent(rawItems)));
    if (rawReason) setExceptionReason(decodeURIComponent(rawReason));

    supabase
      .from("employees")
      .select("*, departments(name), roles(name)")
      .eq("id", employeeId)
      .single()
      .then(({ data }) => setEmployee(data as unknown as EmployeeWithRelations));
  }, [employeeId, searchParams, supabase]);

  function clearSignature() {
    sigRef.current?.clear();
    setIsEmpty(true);
  }

  async function handleConfirm() {
    if (isEmpty || !sigRef.current) return;
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Não autenticado");

      // Pegar warehouse padrão
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fromWarehouses: any = supabase.from("warehouses");
      const { data: warehouse, error: warehouseError } = await fromWarehouses
        .select("id")
        .limit(1)
        .maybeSingle() as unknown as { data: { id: string } | null; error: unknown };

      if (warehouseError || !warehouse) {
        throw new Error("Nenhum almoxarifado encontrado para esta unidade.");
      }

      // Criar entrega
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fromDeliveries: any = supabase.from("deliveries");
      const { data: delivery, error: deliveryError } = await fromDeliveries
        .insert({
          employee_id: employeeId,
          warehouse_id: warehouse.id,
          operator_id: user.id,
          status: "pending_signature",
          exception_reason: exceptionReason || null,
          device_info: {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          },
        })
        .select()
        .single();

      if (deliveryError || !delivery) throw deliveryError;

      // Inserir itens
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fromDeliveryItems: any = supabase.from("delivery_items");
      await fromDeliveryItems.insert(
        items.map((item) => ({
          delivery_id: delivery.id,
          epi_id: item.epiId,
          variant_id: item.variantId,
          stock_id: item.stockId,
          quantity: item.quantity,
          ca_number: item.caNumber,
          ca_expiry_date: item.caExpiryDate,
          is_exception: item.isException,
        }))
      );

      // Baixar estoque para cada item
      for (const item of items) {
        // @ts-expect-error - inference fails
        await supabase.rpc("decrement_stock", {
          p_stock_id: item.stockId,
          p_qty: item.quantity,
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fromStockMovements: any = supabase.from("stock_movements");
        await fromStockMovements.insert({
          stock_id: item.stockId,
          warehouse_id: warehouse!.id,
          type: "delivery",
          quantity: -item.quantity,
          reference_id: delivery.id,
          reference_type: "deliveries",
          reason: "Entrega de EPI",
          operator_id: user.id,
        });
      }

      // Salvar assinatura no Storage
      const signatureDataUrl = sigRef.current!.toDataURL("image/png");
      const blob = await (await fetch(signatureDataUrl)).blob();
      const signaturePath = `signatures/${delivery.id}.png`;

      await supabase.storage
        .from("epi-signatures")
        .upload(signaturePath, blob, { contentType: "image/png" });

      const { data: signatureUrl } = supabase.storage
        .from("epi-signatures")
        .getPublicUrl(signaturePath);

      // Registrar assinatura
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fromSignatures: any = supabase.from("signatures");
      await fromSignatures.insert({
        delivery_id: delivery.id,
        type: "canvas",
        signature_url: signatureUrl.publicUrl,
        signed_by_employee: true,
        signed_by_operator: false,
      });

      // Atualizar status da entrega
      await fromDeliveries
        .update({ status: "completed" })
        .eq("id", delivery.id);

      // Log de auditoria
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fromAuditLogs: any = supabase.from("audit_logs");
      await fromAuditLogs.insert({
        table_name: "deliveries",
        record_id: delivery.id,
        action: "DELIVERY_COMPLETED",
        new_data: { employee_id: employeeId, items_count: items.length },
        operator_id: user.id,
      });

      setConfirmed(true);
      setTimeout(() => router.push(`/entrega/${delivery.id}/termo`), 800);
    } catch (err) {
      console.error(err);
      alert("Erro ao confirmar entrega. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (confirmed) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary">Entrega confirmada!</h2>
        <p className="text-text-secondary text-sm">Gerando comprovante...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Voltar */}
      {employee && (
        <Link
          href={`/entrega/${employeeId}/epis`}
          className="btn-ghost -ml-2 text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Alterar itens
        </Link>
      )}

      {/* Termo de entrega */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <FileSignature className="w-4 h-4 text-primary" />
          Termo de Entrega de EPI
        </div>

        {employee && (
          <div className="p-3 rounded-lg bg-bg-elevated border border-border space-y-1 text-sm">
            <p>
              <span className="text-text-muted">Colaborador: </span>
              <span className="text-text-primary font-medium">{employee.full_name}</span>
            </p>
            <p>
              <span className="text-text-muted">Matrícula: </span>
              <span className="text-text-primary">{employee.badge_number}</span>
            </p>
            <p>
              <span className="text-text-muted">Setor: </span>
              <span className="text-text-primary">{employee.departments?.name}</span>
            </p>
            <p>
              <span className="text-text-muted">Data/Hora: </span>
              <span className="text-text-primary">
                {new Date().toLocaleString("pt-BR")}
              </span>
            </p>
          </div>
        )}

        {/* Itens */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
            Itens entregues
          </p>
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-1.5 border-b border-border last:border-0"
            >
              <div>
                <p className="text-sm text-text-primary font-medium">{item.name}</p>
                <p className="text-xs text-text-muted">
                  CA {item.caNumber} · Tamanho: {item.sizeLabel}
                </p>
              </div>
              <span className="text-sm text-text-secondary font-medium">{item.quantity}x</span>
            </div>
          ))}
        </div>

        {/* Texto do termo */}
        <p className="text-xs text-text-secondary leading-relaxed border-t border-border pt-3">
          Declaro que recebi o(s) Equipamento(s) de Proteção Individual (EPI) acima
          listado(s) em perfeito estado de conservação, tendo sido orientado sobre o uso
          correto, higienização e guarda dos mesmos, conforme NR-6.
        </p>
      </div>

      {/* Canvas de assinatura */}
      <div>
        <p className="text-sm font-medium text-text-secondary mb-2">
          Assinatura do colaborador
        </p>
        <div className="rounded-xl border-2 border-dashed border-border bg-bg-elevated overflow-hidden">
          <SignatureCanvasDynamic
            ref={sigRef}
            canvasProps={{
              className: "w-full h-40 touch-none",
              style: { touchAction: "none" },
            }}
            backgroundColor="transparent"
            penColor="#e2e8f0"
            onEnd={() => setIsEmpty(false)}
          />
        </div>
        <button
          onClick={clearSignature}
          className="btn-ghost mt-2 text-xs"
          type="button"
        >
          <Eraser className="w-3.5 h-3.5" />
          Limpar assinatura
        </button>
      </div>

      {/* Confirmar */}
      <button
        onClick={handleConfirm}
        disabled={isEmpty || loading}
        className="btn-primary w-full h-12 text-base"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Confirmando entrega...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5" />
            Confirmar Entrega
          </>
        )}
      </button>
    </div>
  );
}
