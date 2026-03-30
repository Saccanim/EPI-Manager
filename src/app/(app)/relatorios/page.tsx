import { FileText, Download, Filter } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Relatórios" };

const reports = [
  {
    id: "entregas-colaborador",
    title: "Entregas por Colaborador",
    description: "Histórico completo de EPIs entregues para um colaborador específico.",
    icon: "👤",
  },
  {
    id: "conformidade-setor",
    title: "Conformidade por Setor",
    description: "% de colaboradores com todos os EPIs obrigatórios em dia.",
    icon: "📊",
  },
  {
    id: "validade-ca",
    title: "Validade de CA",
    description: "EPIs com CA vencido ou vencendo nos próximos 30/60/90 dias.",
    icon: "🛡️",
  },
  {
    id: "consumo-periodo",
    title: "Consumo por Período",
    description: "Quantidade de itens entregues por EPI em um período selecionado.",
    icon: "📦",
  },
  {
    id: "inventario-estoque",
    title: "Inventário de Estoque",
    description: "Posição atual de estoque por almoxarifado e EPI.",
    icon: "🏭",
  },
  {
    id: "auditoria-completa",
    title: "Auditoria Completa",
    description: "Exportação da trilha de auditoria para PDF com assinaturas digitais.",
    icon: "📋",
  },
];

export default function RelatoriosPage() {
  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-2 text-text-secondary text-sm">
        <Filter className="w-4 h-4" />
        Selecione um relatório para configurar filtros e exportar.
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {reports.map((r) => (
          <button
            key={r.id}
            className="card text-left hover:border-border-strong hover:bg-bg-elevated
                       transition-all active:scale-[0.98] group"
          >
            <div className="text-2xl mb-3">{r.icon}</div>
            <h3 className="font-semibold text-text-primary text-sm mb-1 group-hover:text-primary transition-colors">
              {r.title}
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">{r.description}</p>
            <div className="flex items-center gap-1.5 mt-4 text-xs text-text-muted group-hover:text-primary transition-colors">
              <Download className="w-3.5 h-3.5" />
              Exportar PDF / Excel
            </div>
          </button>
        ))}
      </div>

      <div className="card border-primary/20 bg-primary/5 text-sm text-text-secondary">
        <div className="flex items-start gap-2">
          <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p>
            A exportação completa de relatórios em PDF e Excel estará disponível na
            <strong className="text-text-primary"> Fase 2</strong> do desenvolvimento.
            Os dados são todos rastreáveis em{" "}
            <strong className="text-text-primary">tempo real</strong> na trilha de auditoria.
          </p>
        </div>
      </div>
    </div>
  );
}
