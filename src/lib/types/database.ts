export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          id: string
          table_name: string
          record_id: string
          action: string
          old_data: Json | null
          new_data: Json | null
          operator_id: string | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          table_name: string
          record_id: string
          action: string
          old_data?: Json | null
          new_data?: Json | null
          operator_id?: string | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          [K in keyof Database["public"]["Tables"]["audit_logs"]["Insert"]]?: Database["public"]["Tables"]["audit_logs"]["Insert"][K]
        }
        Relationships: any[]
      }
      companies: {
        Row: { id: string; name: string; cnpj: string | null; created_at: string | null }
        Insert: { id?: string; name: string; cnpj?: string | null; created_at?: string | null }
        Update: { name?: string; cnpj?: string | null }
        Relationships: any[]
      }
      units: {
        Row: { id: string; company_id: string; name: string; city: string | null; state: string | null; created_at: string | null }
        Insert: { id?: string; company_id: string; name: string; city?: string | null; state?: string | null; created_at?: string | null }
        Update: { name?: string; city?: string | null; state?: string | null }
        Relationships: any[]
      }
      departments: {
        Row: { id: string; unit_id: string; name: string; created_at: string | null }
        Insert: { id?: string; unit_id: string; name: string; created_at?: string | null }
        Update: { name?: string }
        Relationships: any[]
      }
      roles: {
        Row: { id: string; department_id: string | null; name: string; description: string | null; created_at: string | null }
        Insert: { id?: string; department_id?: string | null; name: string; description?: string | null; created_at?: string | null }
        Update: { name?: string; description?: string | null }
        Relationships: any[]
      }
      employees: {
        Row: {
          id: string; company_id: string; unit_id: string; department_id: string | null;
          role_id: string | null; full_name: string; badge_number: string; cpf: string | null;
          email: string | null; phone: string | null; hire_date: string | null;
          termination_date: string | null; status: string; photo_url: string | null;
          manager_id: string | null; external_erp_id: string | null;
          created_at: string | null; updated_at: string | null;
        }
        Insert: {
          id?: string; company_id: string; unit_id: string; department_id?: string | null;
          role_id?: string | null; full_name: string; badge_number: string; cpf?: string | null;
          email?: string | null; phone?: string | null; hire_date?: string | null;
          status?: string; photo_url?: string | null; created_at?: string | null; updated_at?: string | null;
        }
        Update: {
          full_name?: string; status?: string; department_id?: string | null;
          role_id?: string | null; photo_url?: string | null; updated_at?: string | null;
          termination_date?: string | null; email?: string | null; phone?: string | null;
        }
        Relationships: any[]
      }
      epi_catalog: {
        Row: {
          id: string; name: string; category: string; ca_number: string;
          ca_issue_date: string; ca_expiry_date: string; manufacturer: string | null;
          model_ref: string | null; unit_of_measure: string; estimated_lifespan_days: number | null;
          replacement_period_days: number | null; requires_return: boolean;
          track_by_lot: boolean; requires_signature: boolean; requires_training: boolean;
          status: string; photo_url: string | null; notes: string | null;
          created_at: string | null; updated_at: string | null;
        }
        Insert: {
          id?: string; name: string; category: string; ca_number: string;
          ca_issue_date: string; ca_expiry_date: string; manufacturer?: string | null;
          model_ref?: string | null; unit_of_measure?: string; estimated_lifespan_days?: number | null;
          replacement_period_days?: number | null; requires_return?: boolean;
          track_by_lot?: boolean; requires_signature?: boolean; requires_training?: boolean;
          status?: string; photo_url?: string | null; notes?: string | null;
          created_at?: string | null; updated_at?: string | null;
        }
        Update: { status?: string; ca_expiry_date?: string; updated_at?: string | null }
        Relationships: any[]
      }
      epi_variants: {
        Row: { id: string; epi_id: string; size_label: string; sku: string | null; created_at: string | null }
        Insert: { id?: string; epi_id: string; size_label: string; sku?: string | null; created_at?: string | null }
        Update: { size_label?: string; sku?: string | null }
        Relationships: any[]
      }
      occupational_matrix: {
        Row: { id: string; role_id: string; epi_id: string; quantity: number; is_mandatory: boolean; created_at: string | null }
        Insert: { id?: string; role_id: string; epi_id: string; quantity?: number; is_mandatory?: boolean; created_at?: string | null }
        Update: { quantity?: number; is_mandatory?: boolean }
        Relationships: any[]
      }
      warehouses: {
        Row: { id: string; unit_id: string; name: string; location: string | null; created_at: string | null }
        Insert: { id?: string; unit_id: string; name: string; location?: string | null; created_at?: string | null }
        Update: { name?: string; location?: string | null }
        Relationships: any[]
      }
      stock: {
        Row: {
          id: string; warehouse_id: string; epi_id: string; variant_id: string | null;
          lot_number: string | null; expiry_date: string | null; quantity: number;
          min_quantity: number; max_quantity: number | null; created_at: string | null; updated_at: string | null;
        }
        Insert: {
          id?: string; warehouse_id: string; epi_id: string; variant_id?: string | null;
          lot_number?: string | null; expiry_date?: string | null; quantity?: number;
          min_quantity?: number; max_quantity?: number | null; created_at?: string | null; updated_at?: string | null;
        }
        Update: { quantity?: number; min_quantity?: number; max_quantity?: number | null; updated_at?: string | null }
        Relationships: any[]
      }
      deliveries: {
        Row: {
          id: string; employee_id: string; warehouse_id: string; operator_id: string;
          status: string; delivery_date: string; notes: string | null;
          exception_reason: string | null; photo_url: string | null; device_info: Json | null;
          created_at: string | null; updated_at: string | null;
        }
        Insert: {
          id?: string; employee_id: string; warehouse_id: string; operator_id: string;
          status?: string; delivery_date?: string; notes?: string | null;
          exception_reason?: string | null; photo_url?: string | null; device_info?: Json | null;
          created_at?: string | null; updated_at?: string | null;
        }
        Update: { status?: string; notes?: string | null; exception_reason?: string | null; updated_at?: string | null }
        Relationships: any[]
      }
      delivery_items: {
        Row: {
          id: string; delivery_id: string; epi_id: string; variant_id: string | null;
          stock_id: string | null; quantity: number; lot_number: string | null;
          ca_number: string; ca_expiry_date: string; is_exception: boolean; created_at: string | null;
        }
        Insert: {
          id?: string; delivery_id: string; epi_id: string; variant_id?: string | null;
          stock_id?: string | null; quantity: number; lot_number?: string | null;
          ca_number: string; ca_expiry_date: string; is_exception?: boolean;
          created_at?: string | null;
        }
        Update: { quantity?: number; is_exception?: boolean }
        Relationships: any[]
      }
      signatures: {
        Row: {
          id: string; delivery_id: string; type: string; signature_url: string | null;
          signed_by_employee: boolean; signed_by_operator: boolean;
          signed_at: string; ip_address: string | null; device_info: Json | null;
        }
        Insert: {
          id?: string; delivery_id: string; type?: string; signature_url?: string | null;
          signed_by_employee?: boolean; signed_by_operator?: boolean;
          signed_at?: string; ip_address?: string | null; device_info?: Json | null;
        }
        Update: { signature_url?: string | null }
        Relationships: any[]
      }
      returns: {
        Row: {
          id: string; delivery_item_id: string; employee_id: string; operator_id: string;
          return_date: string; reason: string; condition: string | null;
          quantity: number; notes: string | null; created_at: string | null;
        }
        Insert: {
          id?: string; delivery_item_id: string; employee_id: string; operator_id: string;
          return_date?: string; reason: string; condition?: string | null;
          quantity: number; notes?: string | null; created_at?: string | null;
        }
        Update: { notes?: string | null }
        Relationships: any[]
      }
      stock_movements: {
        Row: {
          id: string; stock_id: string; warehouse_id: string; type: string;
          quantity: number; reference_id: string | null; reference_type: string | null;
          reason: string | null; operator_id: string | null; created_at: string;
        }
        Insert: {
          id?: string; stock_id: string; warehouse_id: string; type: string;
          quantity: number; reference_id?: string | null; reference_type?: string | null;
          reason?: string | null; operator_id?: string | null; created_at?: string;
        }
        Update: { [_ in never]: never }
        Relationships: any[]
      }
      user_profiles: {
        Row: {
          id: string; company_id: string | null; employee_id: string | null;
          role: string; unit_id: string | null; created_at: string | null;
        }
        Insert: {
          id: string; company_id?: string | null; employee_id?: string | null;
          role?: string; unit_id?: string | null; created_at?: string | null;
        }
        Update: { role?: string; unit_id?: string | null }
        Relationships: any[]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_stock: {
        Args: {
          p_stock_id: string
          p_qty: number
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
