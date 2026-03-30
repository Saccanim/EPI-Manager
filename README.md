# EPI Manager

Sistema digital de gestão, rastreabilidade e assinatura de EPIs.

## Stack

- **Frontend/BFF:** Next.js 15 (App Router) + TypeScript
- **Backend/Banco:** Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Estilo:** Tailwind CSS (design system industrial dark)
- **Deploy:** Vercel

---

## Configuração rápida

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e preencha com suas credenciais do Supabase:

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com as credenciais do seu projeto Supabase.

### 3. Configurar o banco de dados (Supabase)

1. Acesse [supabase.com](https://supabase.com) e crie um projeto.
2. No painel, vá em **SQL Editor**.
3. Execute em ordem:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_functions.sql`
   - `supabase/seed.sql` ← dados de exemplo para desenvolvimento

### 4. Configurar o Supabase Storage

1. No painel Supabase → **Storage**
2. Criar bucket chamado `epi-signatures` (público)

### 5. Criar usuário de teste

No painel Supabase → **Authentication** → **Users** → criar um usuário com e-mail e senha.

### 6. Rodar localmente

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## Estrutura do projeto

```
src/
├── app/
│   ├── (auth)/login/          # Tela de login
│   └── (app)/                 # Área autenticada
│       ├── dashboard/         # Visão geral do dia
│       ├── entrega/           # Fluxo core de entrega + assinatura
│       ├── colaboradores/     # Lista e perfil
│       ├── estoque/           # Posição de estoque
│       ├── alertas/           # Central de alertas
│       ├── relatorios/        # Relatórios e exportação
│       ├── auditoria/         # Trilha de auditoria
│       └── admin/             # Configurações
├── components/
│   └── layout/                # Sidebar + AppLayout
├── lib/
│   ├── supabase/              # Clients browser + server
│   ├── types/database.ts      # Tipos TypeScript do banco
│   └── utils.ts               # Utilitários de formatação
└── middleware.ts               # Proteção de rotas (auth)

supabase/
├── migrations/001_initial_schema.sql
├── migrations/002_functions.sql
└── seed.sql
```

---

## Fluxo principal de entrega

```
Login → Dashboard → Entrega Rápida →
Buscar Colaborador → Selecionar EPIs →
Coletar Assinatura → Comprovante
```

---

## Checklist de implantação

- [ ] Projeto Supabase criado
- [ ] Schema SQL executado
- [ ] Bucket `epi-signatures` criado
- [ ] `.env.local` configurado
- [ ] Usuário administrador criado
- [ ] Seed data carregado (opcional)
- [ ] `npm install && npm run dev` ok

---

## Roadmap

| Fase | Status | Conteúdo |
|------|--------|----------|
| MVP (Fase 1) | 🟢 **Scaffold pronto** | Auth, entrega, assinatura, histórico, estoque, alertas |
| Fase 2 | 🔲 Planejada | Devoluções, importação em massa, relatórios exportáveis |
| Fase 3 | 🔲 Planejada | QR code, offline, integração ERP/RH |
| Fase 4 | 🔲 Planejada | Multiempresa, API pública, app mobile |
