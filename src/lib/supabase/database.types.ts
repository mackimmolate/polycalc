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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
