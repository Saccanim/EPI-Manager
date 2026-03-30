-- ============================================================
-- EPI MANAGER — Schema inicial
-- Executar no SQL Editor do Supabase
-- ============================================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ESTRUTURA ORGANIZACIONAL
-- ============================================================

CREATE TABLE companies (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  cnpj       TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE units (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  city       TEXT,
  state      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE departments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id    UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE roles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id),
  name          TEXT NOT NULL,
  description   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COLABORADORES
-- ============================================================

CREATE TYPE employee_status AS ENUM (
  'active', 'away', 'vacation', 'leave', 'terminated'
);

CREATE TABLE employees (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  unit_id         UUID NOT NULL REFERENCES units(id),
  department_id   UUID REFERENCES departments(id),
  role_id         UUID REFERENCES roles(id),
  full_name       TEXT NOT NULL,
  badge_number    TEXT NOT NULL,
  cpf             TEXT,
  email           TEXT,
  phone           TEXT,
  hire_date       DATE,
  termination_date DATE,
  status          employee_status NOT NULL DEFAULT 'active',
  photo_url       TEXT,
  manager_id      UUID REFERENCES employees(id),
  external_erp_id TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, badge_number),
  UNIQUE(company_id, cpf)
);

-- ============================================================
-- CATÁLOGO DE EPIs
-- ============================================================

CREATE TYPE epi_status AS ENUM (
  'active', 'expired', 'blocked', 'discontinued', 'quarantine'
);

CREATE TABLE epi_catalog (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                    TEXT NOT NULL,
  category                TEXT NOT NULL,
  ca_number               TEXT NOT NULL,
  ca_issue_date           DATE NOT NULL,
  ca_expiry_date          DATE NOT NULL,
  manufacturer            TEXT,
  model_ref               TEXT,
  unit_of_measure         TEXT NOT NULL DEFAULT 'un',
  estimated_lifespan_days INT,
  replacement_period_days INT,
  requires_return         BOOLEAN NOT NULL DEFAULT FALSE,
  track_by_lot            BOOLEAN NOT NULL DEFAULT FALSE,
  requires_signature      BOOLEAN NOT NULL DEFAULT TRUE,
  requires_training       BOOLEAN NOT NULL DEFAULT FALSE,
  status                  epi_status NOT NULL DEFAULT 'active',
  photo_url               TEXT,
  notes                   TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE epi_variants (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  epi_id     UUID NOT NULL REFERENCES epi_catalog(id) ON DELETE CASCADE,
  size_label TEXT NOT NULL,
  sku        TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(epi_id, size_label)
);

-- ============================================================
-- MATRIZ OCUPACIONAL
-- ============================================================

CREATE TABLE occupational_matrix (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id      UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  epi_id       UUID NOT NULL REFERENCES epi_catalog(id) ON DELETE CASCADE,
  quantity     INT NOT NULL DEFAULT 1,
  is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, epi_id)
);

-- ============================================================
-- ESTOQUE
-- ============================================================

CREATE TABLE warehouses (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id    UUID NOT NULL REFERENCES units(id),
  name       TEXT NOT NULL,
  location   TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stock (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  epi_id       UUID NOT NULL REFERENCES epi_catalog(id),
  variant_id   UUID REFERENCES epi_variants(id),
  lot_number   TEXT,
  expiry_date  DATE,
  quantity     INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  min_quantity INT NOT NULL DEFAULT 5,
  max_quantity INT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ENTREGAS (CORE)
-- ============================================================

CREATE TYPE delivery_status AS ENUM (
  'draft', 'pending_signature', 'completed', 'cancelled', 'reversed', 'adjusted'
);

CREATE TABLE deliveries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id      UUID NOT NULL REFERENCES employees(id),
  warehouse_id     UUID NOT NULL REFERENCES warehouses(id),
  operator_id      UUID NOT NULL REFERENCES auth.users(id),
  status           delivery_status NOT NULL DEFAULT 'pending_signature',
  delivery_date    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes            TEXT,
  exception_reason TEXT,
  photo_url        TEXT,
  device_info      JSONB,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE delivery_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id    UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  epi_id         UUID NOT NULL REFERENCES epi_catalog(id),
  variant_id     UUID REFERENCES epi_variants(id),
  stock_id       UUID REFERENCES stock(id),
  quantity       INT NOT NULL CHECK (quantity > 0),
  lot_number     TEXT,
  ca_number      TEXT NOT NULL,
  ca_expiry_date DATE NOT NULL,
  is_exception   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ASSINATURAS
-- ============================================================

CREATE TYPE signature_type AS ENUM (
  'canvas', 'pin', 'biometric', 'qr_code', 'operator', 'mixed'
);

CREATE TABLE signatures (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id         UUID NOT NULL UNIQUE REFERENCES deliveries(id),
  type                signature_type NOT NULL DEFAULT 'canvas',
  signature_url       TEXT,
  signed_by_employee  BOOLEAN NOT NULL DEFAULT TRUE,
  signed_by_operator  BOOLEAN NOT NULL DEFAULT FALSE,
  signed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address          TEXT,
  device_info         JSONB
);

-- ============================================================
-- DEVOLUÇÕES
-- ============================================================

CREATE TABLE returns (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_item_id UUID NOT NULL REFERENCES delivery_items(id),
  employee_id      UUID NOT NULL REFERENCES employees(id),
  operator_id      UUID NOT NULL REFERENCES auth.users(id),
  return_date      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason           TEXT NOT NULL,
  condition        TEXT,
  quantity         INT NOT NULL CHECK (quantity > 0),
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MOVIMENTAÇÕES DE ESTOQUE — APPEND ONLY
-- ============================================================

CREATE TYPE stock_movement_type AS ENUM (
  'entry', 'delivery', 'return', 'loss', 'damage',
  'transfer', 'adjustment', 'reserve'
);

CREATE TABLE stock_movements (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id       UUID NOT NULL REFERENCES stock(id),
  warehouse_id   UUID NOT NULL REFERENCES warehouses(id),
  type           stock_movement_type NOT NULL,
  quantity       INT NOT NULL,
  reference_id   UUID,
  reference_type TEXT,
  reason         TEXT,
  operator_id    UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- NUNCA faça DELETE ou UPDATE nesta tabela
);

-- ============================================================
-- AUDITORIA — APPEND ONLY
-- ============================================================

CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name  TEXT NOT NULL,
  record_id   UUID NOT NULL,
  action      TEXT NOT NULL,
  old_data    JSONB,
  new_data    JSONB,
  operator_id UUID REFERENCES auth.users(id),
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- NUNCA faça DELETE ou UPDATE nesta tabela
);

-- ============================================================
-- PERFIS DE USUÁRIO
-- ============================================================

CREATE TYPE user_role AS ENUM (
  'admin', 'sst_manager', 'warehouse_operator',
  'supervisor', 'hr', 'auditor', 'employee'
);

CREATE TABLE user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id  UUID REFERENCES companies(id),
  employee_id UUID REFERENCES employees(id),
  role        user_role NOT NULL DEFAULT 'warehouse_operator',
  unit_id     UUID REFERENCES units(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES DE PERFORMANCE
-- ============================================================

CREATE INDEX idx_employees_badge      ON employees(badge_number);
CREATE INDEX idx_employees_cpf        ON employees(cpf);
CREATE INDEX idx_employees_status     ON employees(status);
CREATE INDEX idx_employees_unit       ON employees(unit_id);
CREATE INDEX idx_deliveries_employee  ON deliveries(employee_id);
CREATE INDEX idx_deliveries_status    ON deliveries(status);
CREATE INDEX idx_deliveries_date      ON deliveries(delivery_date DESC);
CREATE INDEX idx_delivery_items_del   ON delivery_items(delivery_id);
CREATE INDEX idx_stock_epi_wh         ON stock(epi_id, warehouse_id);
CREATE INDEX idx_stock_movements_date ON stock_movements(created_at DESC);
CREATE INDEX idx_audit_table_record   ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_created        ON audit_logs(created_at DESC);
CREATE INDEX idx_epi_ca_expiry        ON epi_catalog(ca_expiry_date);
CREATE INDEX idx_epi_status           ON epi_catalog(status);

-- ============================================================
-- TRIGGER: atualiza updated_at automaticamente
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_epi_catalog_updated_at
  BEFORE UPDATE ON epi_catalog
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_deliveries_updated_at
  BEFORE UPDATE ON deliveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_stock_updated_at
  BEFORE UPDATE ON stock
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE companies          ENABLE ROW LEVEL SECURITY;
ALTER TABLE units              ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees          ENABLE ROW LEVEL SECURITY;
ALTER TABLE epi_catalog        ENABLE ROW LEVEL SECURITY;
ALTER TABLE epi_variants       ENABLE ROW LEVEL SECURITY;
ALTER TABLE occupational_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock              ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements    ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries         ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures         ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns            ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles      ENABLE ROW LEVEL SECURITY;

-- Política base: usuário autenticado de mesma empresa pode ver seus dados
CREATE POLICY "users_see_own_company" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Política para admins (simplificada — refinar por módulo em produção)
CREATE POLICY "authenticated_read_companies" ON companies
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "authenticated_read_units" ON units
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "authenticated_read_employees" ON employees
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "authenticated_all_deliveries" ON deliveries
  FOR ALL TO authenticated USING (TRUE);

CREATE POLICY "authenticated_all_delivery_items" ON delivery_items
  FOR ALL TO authenticated USING (TRUE);

CREATE POLICY "authenticated_all_signatures" ON signatures
  FOR ALL TO authenticated USING (TRUE);

CREATE POLICY "authenticated_read_epi" ON epi_catalog
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "authenticated_all_stock" ON stock
  FOR ALL TO authenticated USING (TRUE);

CREATE POLICY "authenticated_insert_movements" ON stock_movements
  FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "authenticated_read_movements" ON stock_movements
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "authenticated_insert_audit" ON audit_logs
  FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "authenticated_read_audit" ON audit_logs
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "authenticated_read_warehouses" ON warehouses
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "authenticated_read_occupational" ON occupational_matrix
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "authenticated_read_epi_variants" ON epi_variants
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "authenticated_read_departments" ON departments
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "authenticated_read_roles" ON roles
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "authenticated_all_returns" ON returns
  FOR ALL TO authenticated USING (TRUE);
