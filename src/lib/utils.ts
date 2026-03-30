import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, differenceInDays, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function daysUntilExpiry(expiryDate: string): number {
  return differenceInDays(new Date(expiryDate), new Date());
}

export function isExpired(expiryDate: string): boolean {
  return isPast(new Date(expiryDate));
}

export function getExpiryStatus(expiryDate: string): "ok" | "warning" | "critical" | "expired" {
  const days = daysUntilExpiry(expiryDate);
  if (days < 0) return "expired";
  if (days <= 30) return "critical";
  if (days <= 90) return "warning";
  return "ok";
}

export function formatCPF(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function getEmployeeStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: "Ativo",
    away: "Afastado",
    vacation: "Férias",
    leave: "Licença",
    terminated: "Desligado",
  };
  return labels[status] ?? status;
}

export function getDeliveryStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: "Rascunho",
    pending_signature: "Aguardando Assinatura",
    completed: "Concluída",
    cancelled: "Cancelada",
    reversed: "Estornada",
    adjusted: "Ajustada",
  };
  return labels[status] ?? status;
}
