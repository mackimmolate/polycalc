export interface Database {
  public: {
    Tables: {
      materials: {
        Row: {
          id: string;
          name: string;
          manufacturer_id: string;
          category_id: string;
          price_per_kg_eur: number;
          max_temperature_c: number | null;
          time_per_layer_45_deg_seconds: number;
          time_per_layer_reference_angle_deg: number;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          manufacturer_id: string;
          category_id: string;
          price_per_kg_eur: number;
          max_temperature_c?: number | null;
          time_per_layer_45_deg_seconds: number;
          time_per_layer_reference_angle_deg?: number;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          manufacturer_id?: string;
          category_id?: string;
          price_per_kg_eur?: number;
          max_temperature_c?: number | null;
          time_per_layer_45_deg_seconds?: number;
          time_per_layer_reference_angle_deg?: number;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'materials_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'material_categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'materials_manufacturer_id_fkey';
            columns: ['manufacturer_id'];
            isOneToOne: false;
            referencedRelation: 'material_manufacturers';
            referencedColumns: ['id'];
          },
        ];
      };
      material_categories: {
        Row: {
          id: string;
          label: string;
          normalized_key: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          label: string;
          normalized_key: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          label?: string;
          normalized_key?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      material_manufacturers: {
        Row: {
          id: string;
          label: string;
          normalized_key: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          label: string;
          normalized_key: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          label?: string;
          normalized_key?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      material_calculations: {
        Row: {
          id: string;
          material_id: string;
          label: string;
          kg_material: number;
          print_time_hours: number;
          quantity: number;
          details_per_printer: number;
          machine_hourly_rate_eur: number;
          labor_cost_per_part_eur: number;
          post_process_cost_per_part_eur: number;
          setup_time_hours: number;
          post_process_time_hours_per_part: number;
          risk_buffer_percent: number;
          target_margin_percent: number;
          printer_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          material_id: string;
          label?: string;
          kg_material: number;
          print_time_hours: number;
          quantity?: number;
          details_per_printer?: number;
          machine_hourly_rate_eur?: number;
          labor_cost_per_part_eur?: number;
          post_process_cost_per_part_eur?: number;
          setup_time_hours?: number;
          post_process_time_hours_per_part?: number;
          risk_buffer_percent?: number;
          target_margin_percent?: number;
          printer_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          material_id?: string;
          label?: string;
          kg_material?: number;
          print_time_hours?: number;
          quantity?: number;
          details_per_printer?: number;
          machine_hourly_rate_eur?: number;
          labor_cost_per_part_eur?: number;
          post_process_cost_per_part_eur?: number;
          setup_time_hours?: number;
          post_process_time_hours_per_part?: number;
          risk_buffer_percent?: number;
          target_margin_percent?: number;
          printer_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'material_calculations_material_id_fkey';
            columns: ['material_id'];
            isOneToOne: false;
            referencedRelation: 'materials';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
