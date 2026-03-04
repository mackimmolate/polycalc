export interface Database {
  public: {
    Tables: {
      materials: {
        Row: {
          id: string;
          name: string;
          manufacturer: string;
          category: string;
          price_per_kg_eur: number;
          max_temperature_c: number | null;
          time_per_layer_45_deg_seconds: number;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          manufacturer: string;
          category: string;
          price_per_kg_eur: number;
          max_temperature_c?: number | null;
          time_per_layer_45_deg_seconds: number;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          manufacturer?: string;
          category?: string;
          price_per_kg_eur?: number;
          max_temperature_c?: number | null;
          time_per_layer_45_deg_seconds?: number;
          notes?: string;
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          material_id: string;
          label?: string;
          kg_material: number;
          print_time_hours: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          material_id?: string;
          label?: string;
          kg_material?: number;
          print_time_hours?: number;
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
