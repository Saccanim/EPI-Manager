import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CheckCircle2, Download, Send, ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import type { Metadata } from "next";
import { QueryData } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

export const metadata: Metadata = { title: "Comprovante de Entrega" };

export default async function TermoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id: deliveryId } = await params;

  const deliveryQuery = supabase
    .from("deliveries")
    .select(`
      *,
      employees(full_name, badge_number, cpf),
      warehouses(name),
      delivery_items(
        *,
        epi_catalog(name, category),
        epi_variants(size_label)
      ),
      signatures(signature_url, type, signed_at)
    `)
    .eq("id", deliveryId)
    .single();

  type DeliveryWithRelations = QueryData<typeof deliveryQuery>;
  const { data: delivery, error } = await deliveryQuery as any; // Cast only for QueryData vs Postgrest error

  if (error || !delivery) notFound();

  const employee = delivery.employees;
  const warehouse = delivery.warehouses;
  const items = delivery.delivery_items;
  const signature = delivery.signatures?.[0] || delivery.signatures;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-success" />
        </div>
        <div>
          <h2 className="font-semibold text-text-primary">Entrega Confirmada</h2>
          <p className="text-xs text-text-secondary">
            Comprovante #{deliveryId.slice(0, 8).toUpperCase()}
          </p>
        </div>
      </div>

      {/* Card principal */}
      <div className="card space-y-5 print:shadow-none">
        {/* Dados do colaborador */}
        <div>
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
            Colaborador
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-text-muted text-xs">Nome</span>
              <p className="text-text-primary font-medium">{employee?.full_name}</p>
            </div>
            <div>
              <span className="text-text-muted text-xs">Matrícula</span>
              <p className="text-text-primary">{employee?.badge_number}</p>
            </div>
            <div>
              <span className="text-text-muted text-xs">Data/Hora</span>
              <p className="text-text-primary">
                {formatDateTime(delivery.delivery_date)}
              </p>
            </div>
            <div>
              <span className="text-text-muted text-xs">Almoxarifado</span>
              <p className="text-text-primary">{warehouse?.name}</p>
            </div>
          </div>
        </div>

        {/* Itens entregues */}
        <div className="border-t border-border pt-4">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
            Itens entregues
          </p>
          <div className="divide-y divide-border">
            {items?.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {item.epi_catalog?.name}
                  </p>
                  <p className="text-xs text-text-muted">
                    CA {item.ca_number}
                    {item.epi_variants?.size_label &&
                      ` · Tam. ${item.epi_variants.size_label}`}
                    {item.is_exception && (
                      <span className="ml-2 text-warning">⚠ Exceção</span>
                    )}
                  </p>
                </div>
                <span className="text-sm font-semibold text-text-primary">
                  {item.quantity}x
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Assinatura */}
        {signature?.signature_url && (
          <div className="border-t border-border pt-4">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
              Assinatura digital coletada
            </p>
            <div className="rounded-lg border border-border bg-bg-elevated p-3 inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={signature.signature_url}
                alt="Assinatura do colaborador"
                className="h-16 max-w-full object-contain"
              />
            </div>
            <p className="text-xs text-text-muted mt-1">
              Coletada em {formatDateTime(signature.signed_at)}
            </p>
          </div>
        )}

        {/* Exceção */}
        {delivery.exception_reason && (
          <div className="p-3 rounded-lg bg-warning-muted border border-warning/30 text-sm text-warning">
            <span className="font-medium">Exceção registrada: </span>
            {delivery.exception_reason}
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="flex gap-3 flex-wrap">
        <Link href="/entrega/busca" className="btn-primary flex-1">
          <Send className="w-4 h-4" />
          Nova entrega
        </Link>
        <button className="btn-secondary flex-1">
          <Printer className="w-4 h-4" />
          Imprimir
        </button>
        <button className="btn-secondary flex-1">
          <Download className="w-4 h-4" />
          Baixar PDF
        </button>
      </div>

      <Link href="/dashboard" className="btn-ghost w-full justify-center text-sm">
        <ArrowLeft className="w-3.5 h-3.5" />
        Voltar ao dashboard
      </Link>
    </div>
  );
}
