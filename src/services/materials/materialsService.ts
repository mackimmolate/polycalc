import { getSupabaseClientOrThrow } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';
import { manufacturerOptions } from '@/types/manufacturer';
import type { Manufacturer } from '@/types/manufacturer';
import type { Material, MaterialCategory, MaterialMutationInput } from '@/types/material';

const MATERIALS_TABLE = 'materials';
const MATERIAL_COLUMNS = `
  id,
  name,
  category,
  manufacturer,
  price_per_kg_eur,
  max_temperature_c,
  time_per_layer_45_deg_seconds,
  notes,
  created_at,
  updated_at
`;

const categoryValues: MaterialCategory[] = ['PLA', 'PETG', 'ABS', 'Nylon', 'TPU', 'Resin', 'Other'];
type MaterialRow = Database['public']['Tables']['materials']['Row'];
type MaterialInsert = Database['public']['Tables']['materials']['Insert'];
type MaterialUpdate = Database['public']['Tables']['materials']['Update'];

function asCategory(value: string): MaterialCategory {
  if (categoryValues.includes(value as MaterialCategory)) {
    return value as MaterialCategory;
  }

  throw new Error(`Ogiltig kategori i databasen: ${value}`);
}

function asManufacturer(value: string): Manufacturer {
  if (manufacturerOptions.includes(value as Manufacturer)) {
    return value as Manufacturer;
  }

  throw new Error(`Ogiltig tillverkare i databasen: ${value}`);
}

function mapRowToMaterial(row: MaterialRow): Material {
  return {
    id: row.id,
    name: row.name,
    category: asCategory(row.category),
    manufacturer: asManufacturer(row.manufacturer),
    pricePerKgEur: row.price_per_kg_eur,
    maxTemperatureC: row.max_temperature_c,
    timePerLayer45DegSeconds: row.time_per_layer_45_deg_seconds,
    notes: row.notes ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMutationToInsert(input: MaterialMutationInput): MaterialInsert {
  return {
    name: input.name,
    category: input.category,
    manufacturer: input.manufacturer,
    price_per_kg_eur: input.pricePerKgEur,
    max_temperature_c: input.maxTemperatureC,
    time_per_layer_45_deg_seconds: input.timePerLayer45DegSeconds,
    notes: input.notes,
  };
}

function mapMutationToUpdate(input: MaterialMutationInput): MaterialUpdate {
  return mapMutationToInsert(input);
}

async function requireWriteSession() {
  const supabase = getSupabaseClientOrThrow();
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error('Det gick inte att kontrollera inloggning.');
  }

  if (!data.session) {
    throw new Error('Du måste vara inloggad för att ändra material.');
  }
}

export async function listMaterials(): Promise<Material[]> {
  const supabase = getSupabaseClientOrThrow();
  const { data, error } = await supabase
    .from(MATERIALS_TABLE)
    .select(MATERIAL_COLUMNS)
    .order('name', { ascending: true });

  if (error) {
    throw new Error('Det gick inte att läsa material från databasen.');
  }

  return (data ?? []).map((row) => mapRowToMaterial(row as MaterialRow));
}

export async function getMaterialById(materialId: string): Promise<Material | null> {
  const supabase = getSupabaseClientOrThrow();
  const { data, error } = await supabase
    .from(MATERIALS_TABLE)
    .select(MATERIAL_COLUMNS)
    .eq('id', materialId)
    .maybeSingle();

  if (error) {
    throw new Error('Det gick inte att läsa materialdetaljer.');
  }

  if (!data) {
    return null;
  }

  return mapRowToMaterial(data as MaterialRow);
}

export async function createMaterial(input: MaterialMutationInput): Promise<Material> {
  await requireWriteSession();

  const supabase = getSupabaseClientOrThrow();
  const { data, error } = await supabase
    .from(MATERIALS_TABLE)
    .insert(mapMutationToInsert(input))
    .select(MATERIAL_COLUMNS)
    .single();

  if (error) {
    throw new Error('Det gick inte att skapa materialet.');
  }

  return mapRowToMaterial(data as MaterialRow);
}

export async function updateMaterial(
  materialId: string,
  input: MaterialMutationInput,
): Promise<Material> {
  await requireWriteSession();

  const supabase = getSupabaseClientOrThrow();
  const { data, error } = await supabase
    .from(MATERIALS_TABLE)
    .update(mapMutationToUpdate(input))
    .eq('id', materialId)
    .select(MATERIAL_COLUMNS)
    .single();

  if (error) {
    throw new Error('Det gick inte att uppdatera materialet.');
  }

  return mapRowToMaterial(data as MaterialRow);
}

export async function deleteMaterial(materialId: string): Promise<void> {
  await requireWriteSession();

  const supabase = getSupabaseClientOrThrow();
  const { error } = await supabase.from(MATERIALS_TABLE).delete().eq('id', materialId);

  if (error) {
    throw new Error('Det gick inte att ta bort materialet.');
  }
}
