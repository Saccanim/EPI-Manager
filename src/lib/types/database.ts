// Tipos TypeScript gerados do schema do Supabase
// Em produção, gere automaticamente com: npx supabase gen types typescript --project-id SEU_ID > src/lib/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type EmployeeStatus = "active" | "away" | "vacation" | "leave" | "terminated";
export type EpiStatus = "active" | "expired" | "blocked" | "discontinued" | "quarantine";
export type DeliveryStatus = "draft" | "pending_signature" | "completed" | "cancelled" | "reversed" | "adjusted";
export type SignatureType = "canvas" | "pin" | "biometric" | "qr_code" | "operator" | "mixed";
export type StockMovementType = "entry" | "delivery" | "return" | "loss" | "damage" | "transfer" | "adjustment" | "reserve";
export type UserRole = "admin" | "sst_manager" | "warehouse_operator" | "supervisor" | "hr" | "auditor" | "employee";

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: { id: string; name: string; cnpj: string | null; created_at: string };
        Insert: { id?: string; name: string; cnpj?: string | null };
        Update: { name?: string; cnpj?: string | null };
      };
      units: {
        Row: { id: string; company_id: string; name: string; city: string | null; state: string | null; created_at: string };
        Insert: { id?: string; company_id: string; name: string; city?: string | null; state?: string | null };
        Update: { name?: string; city?: string | null; state?: string | null };
      };
      departments: {
        Row: { id: string; unit_id: string; name: string; created_at: string };
        Insert: { id?: string; unit_id: string; name: string };
        Update: { name?: string };
      };
      roles: {
        Row: { id: string; department_id: string | null; name: string; description: string | null; created_at: string };
        Insert: { id?: string; department_id?: string | null; name: string; description?: string | null };
        Update: { name?: string; description?: string | null };
      };
      employees: {
        Row: {
          id: string; company_id: string; unit_id: string; department_id: string | null;
          role_id: string | null; full_name: string; badge_number: string; cpf: string | null;
          email: string | null; phone: string | null; hire_date: string | null;
          termination_date: string | null; status: EmployeeStatus; photo_url: string | null;
          manager_id: string | null; external_erp_id: string | null;
          created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; company_id: string; unit_id: string; department_id?: string | null;
          role_id?: string | null; full_name: string; badge_number: string; cpf?: string | null;
          email?: string | null; phone?: string | null; hire_date?: string | null;
          status?: EmployeeStatus; photo_url?: string | null;
        };
        Update: {
          full_name?: string; status?: EmployeeStatus; department_id?: string | null;
          role_id?: string | null; photo_url?: string | null;
        };
      };
      epi_catalog: {
        Row: {
          id: string; name: string; category: string; ca_number: string;
          ca_issue_date: string; ca_expiry_date: string; manufacturer: string | null;
          model_ref: string | null; unit_of_measure: string; estimated_lifespan_days: number | null;
          replacement_period_days: number | null; requires_return: boolean;
          track_by_lot: boolean; requires_signature: boolean; requires_training: boolean;
          status: EpiStatus; photo_url: string | null; notes: string | null;
          created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; name: string; category: string; ca_number: string;
          ca_issue_date: string; ca_expiry_date: string; manufacturer?: string | null;
          model_ref?: string | null; unit_of_measure?: string; estimated_lifespan_days?: number | null;
          replacement_period_days?: number | null; requires_return?: boolean;
          track_by_lot?: boolean; requires_signature?: boolean; requires_training?: boolean;
          status?: EpiStatus; photo_url?: string | null; notes?: string | null;
        };
        Update: { name?: string; status?: EpiStatus; ca_expiry_date?: string };
      };
      epi_variants: {
        Row: { id: string; epi_id: string; size_label: string; sku: string | null; created_at: string };
        Insert: { id?: string; epi_id: string; size_label: string; sku?: string | null };
        Update: { size_label?: string; sku?: string | null };
      };
      occupational_matrix: {
        Row: { id: string; role_id: string; epi_id: string; quantity: number; is_mandatory: boolean; created_at: string };
        Insert: { id?: string; role_id: string; epi_id: string; quantity?: number; is_mandatory?: boolean };
        Update: { quantity?: number; is_mandatory?: boolean };
      };
      warehouses: {
        Row: { id: string; unit_id: string; name: string; location: string | null; created_at: string };
        Insert: { id?: string; unit_id: string; name: string; location?: string | null };
        Update: { name?: string; location?: string | null };
      };
      stock: {
        Row: {
          id: string; warehouse_id: string; epi_id: string; variant_id: string | null;
          lot_number: string | null; expiry_date: string | null; quantity: number;
          min_quantity: number; max_quantity: number | null; created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; warehouse_id: string; epi_id: string; variant_id?: string | null;
          lot_number?: string | null; expiry_date?: string | null; quantity?: number;
          min_quantity?: number; max_quantity?: number | null;
        };
        Update: { quantity?: number; min_quantity?: number; max_quantity?: number | null };
      };
      deliveries: {
        Row: {
          id: string; employee_id: string; warehouse_id: string; operator_id: string;
          status: DeliveryStatus; delivery_date: string; notes: string | null;
          exception_reason: string | null; photo_url: string | null; device_info: Json | null;
          created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; employee_id: string; warehouse_id: string; operator_id: string;
          status?: DeliveryStatus; delivery_date?: string; notes?: string | null;
          exception_reason?: string | null; photo_url?: string | null; device_info?: Json | null;
        };
        Update: { status?: DeliveryStatus; notes?: string | null; exception_reason?: string | null };
      };
      delivery_items: {
        Row: {
          id: string; delivery_id: string; epi_id: string; variant_id: string | null;
          stock_id: string | null; quantity: number; lot_number: string | null;
          ca_number: string; ca_expiry_date: string; is_exception: boolean; created_at: string;
        };
        Insert: {
          id?: string; delivery_id: string; epi_id: string; variant_id?: string | null;
          stock_id?: string | null; quantity: number; lot_number?: string | null;
          ca_number: string; ca_expiry_date: string; is_exception?: boolean;
        };
        Update: never;
      };
      signatures: {
        Row: {
          id: string; delivery_id: string; type: SignatureType; signature_url: string | null;
          signed_by_employee: boolean; signed_by_operator: boolean;
          signed_at: string; ip_address: string | null; device_info: Json | null;
        };
        Insert: {
          id?: string; delivery_id: string; type?: SignatureType; signature_url?: string | null;
          signed_by_employee?: boolean; signed_by_operator?: boolean;
          ip_address?: string | null; device_info?: Json | null;
        };
        Update: never;
      };
      returns: {
        Row: {
          id: string; delivery_item_id: string; employee_id: string; operator_id: string;
          return_date: string; reason: string; condition: string | null;
          quantity: number; notes: string | null; created_at: string;
        };
        Insert: {
          id?: string; delivery_item_id: string; employee_id: string; operator_id: string;
          return_date?: string; reason: string; condition?: string | null;
          quantity: number; notes?: string | null;
        };
        Update: never;
      };
      stock_movements: {
        Row: {
          id: string; stock_id: string; warehouse_id: string; type: StockMovementType;
          quantity: number; reference_id: string | null; reference_type: string | null;
          reason: string | null; operator_id: string | null; created_at: string;
        };
        Insert: {
          id?: string; stock_id: string; warehouse_id: string; type: StockMovementType;
          quantity: number; reference_id?: string | null; reference_type?: string | null;
          reason?: string | null; operator_id?: string | null;
        };
        Update: never;
      };
      audit_logs: {
        Row: {
          id: string; table_name: string; record_id: string; action: string;
          old_data: Json | null; new_data: Json | null;
          operator_id: string | null; ip_address: string | null; created_at: string;
        };
        Insert: {
          id?: string; table_name: string; record_id: string; action: string;
          old_data?: Json | null; new_data?: Json | null;
          operator_id?: string | null; ip_address?: string | null;
        };
        Update: never;
      };
      user_profiles: {
        Row: {
          id: string; company_id: string | null; employee_id: string | null;
          role: UserRole; unit_id: string | null; created_at: string;
        };
        Insert: {
          id: string; company_id?: string | null; employee_id?: string | null;
          role?: UserRole; unit_id?: string | null;
        };
        Update: { role?: UserRole; unit_id?: string | null };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      employee_status: EmployeeStatus;
      epi_status: EpiStatus;
      delivery_status: DeliveryStatus;
      signature_type: SignatureType;
      stock_movement_type: StockMovementType;
      user_role: UserRole;
    };
  };
}
