import { Settings, Building2, Users, Shield, HardHat } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Administração" };

const adminSections = [
  {
    href: "/admin/empresa",
    icon: Building2,
    label: "Empresa e Unidades",
    description: "Gerenciar empresas, filiais, departamentos e setores.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    href: "/admin/colaboradores",
    icon: Users,
    label: "Colaboradores",
    description: "Importar, cadastrar e gerenciar colaboradores e funções.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    href: "/admin/epis",
    icon: HardHat,
    label: "Catálogo de EPIs",
    description: "Cadastrar e gerenciar o catálogo de EPIs e a matriz ocupacional.",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    href: "/admin/usuarios",
    icon: Shield,
    label: "Usuários e Permissões",
    description: "Gerenciar acessos, perfis e permissões de usuário do sistema.",
    color: "text-danger",
    bg: "bg-danger/10",
  },
];

export default function AdminPage() {
  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-text-secondary" />
        <p className="text-sm text-text-secondary">
          Configurações globais da plataforma. Requer perfil de Administrador.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {adminSections.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              className="card hover:border-border-strong hover:bg-bg-elevated transition-all group"
            >
              <div className={`inline-flex p-2.5 rounded-xl ${s.bg} mb-3`}>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <h3 className="font-semibold text-text-primary text-sm mb-1 group-hover:text-primary transition-colors">
                {s.label}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">{s.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
