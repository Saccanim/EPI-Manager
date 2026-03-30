import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Users } from "lucide-react";

export const metadata: Metadata = { title: "Administração de Colaboradores" };

export default function AdminColaboradoresPage() {
  return (
    <div className="max-w-3xl space-y-5">
      <div className="card space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold text-text-primary">Gestão de colaboradores</h1>
        </div>
        <p className="text-sm text-text-secondary">
          O cadastro, a exclusão e a mudança de situação já estão disponíveis na central de colaboradores.
        </p>
        <Link href="/colaboradores" className="btn-primary w-fit">
          Abrir colaboradores
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
