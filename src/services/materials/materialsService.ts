import { getSupabaseClientOrThrow } from '@/lib/supabase/client';
import {
  asSupabaseErrorMessage,
  requireAuthenticatedSession,
} from '@/lib/supabase/serviceHelpers';
import type { Database } from '@/lib/supabase/database.types';
import type { Material, MaterialMutationInput } from '@/types/material';

const MATERIALS_TABLE = 'materials';
const MATERIAL_COLUMNS = `
  id,
  name,
  category_id,
  manufacturer_id,
  price_per_kg_eur,
  max_temperature_c,
  time_per_layer_45_deg_seconds,
  time_per_layer_reference_angle_deg,
  notes,
  created_at,
  updated_at,
  category_ref:material_categories (
    id,
    label,
    is_active
  ),
  manufacturer_ref:material_manufacturers (
    id,
    label,
    is_active
  )
`;

type MaterialRow = Database['public']['Tables']['materials']['Row'];
type MaterialInsert = Database['public']['Tables']['materials']['Insert'];
type MaterialUpdate = Database['public']['Tables']['materials']['Update'];
type MaterialRelationRow = {
  id: string;
  label: string;
  is_active: boolean;
};
type MaterialRowWithRelations = MaterialRow & {
  category_ref: MaterialRelationRow | null;
  manufacturer_ref: MaterialRelationRow | null;
};

function mapRowToMaterial(row: MaterialRowWithRelations): Material {
  return {
    id: row.id,
    categoryId: row.category_id,
    manufacturerId: row.manufacturer_id,
    name: row.name,
    category: row.category_ref?.label ?? 'Ej angiven',
    manufacturer: row.manufacturer_ref?.label ?? 'Ej angiven',
    pricePerKgEur: row.price_per_kg_eur,
    maxTemperatureC: row.max_temperature_c,
    timePerLayerSeconds: row.time_per_layer_45_deg_seconds,
    timePerLayerReferenceAngleDeg: row.time_per_layer_reference_angle_deg === 90 ? 90 : 45,
    notes: row.notes ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMutationToInsert(input: MaterialMutationInput): MaterialInsert {
  return {
    name: input.name,
    category_id: input.categoryId,
    manufacturer_id: input.manufacturerId,
    price_per_kg_eur: input.pricePerKgEur,
    max_temperature_c: input.maxTemperatureC,
    time_per_layer_45_deg_seconds: input.timePerLayerSeconds,
    time_per_layer_reference_angle_deg: input.timePerLayerReferenceAngleDeg,
    notes: input.notes,
  };
}

function mapMutationToUpdate(input: MaterialMutationInput): MaterialUpdate {
  return mapMutationToInsert(input);
}

export async function listMaterials(): Promise<Material[]> {
  const supabase = getSupabaseClientOrThrow();
  const { data, error } = await supabase
    .from(MATERIALS_TABLE)
    .select(MATERIAL_COLUMNS)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(
      `Det gick inte att läsa material från databasen: ${asSupabaseErrorMessage(error)}`,
    );
  }

  return (data ?? []).map((row) => mapRowToMaterial(row as MaterialRowWithRelations));
}

export async function getMaterialById(materialId: string): Promise<Material | null> {
  const supabase = getSupabaseClientOrThrow();
  const { data, error } = await supabase
    .from(MATERIALS_TABLE)
    .select(MATERIAL_COLUMNS)
    .eq('id', materialId)
    .maybeSingle();

  if (error) {
    throw new Error(`Det gick inte att läsa materialdetaljer: ${asSupabaseErrorMessage(error)}`);
  }

  if (!data) {
    return null;
  }

  return mapRowToMaterial(data as MaterialRowWithRelations);
}

export async function createMaterial(input: MaterialMutationInput): Promise<Material> {
  await requireAuthenticatedSession('material');

  const supabase = getSupabaseClientOrThrow();
  const { data, error } = await supabase
    .from(MATERIALS_TABLE)
    .insert(mapMutationToInsert(input))
    .select(MATERIAL_COLUMNS)
    .single();

  if (error) {
    throw new Error(`Det gick inte att skapa materialet: ${asSupabaseErrorMessage(error)}`);
  }

  return mapRowToMaterial(data as MaterialRowWithRelations);
}

export async function updateMaterial(
  materialId: string,
  input: MaterialMutationInput,
): Promise<Material> {
  await requireAuthenticatedSession('material');

  const supabase = getSupabaseClientOrThrow();
  const { data, error } = await supabase
    .from(MATERIALS_TABLE)
    .update(mapMutationToUpdate(input))
    .eq('id', materialId)
    .select(MATERIAL_COLUMNS)
    .single();

  if (error) {
    throw new Error(`Det gick inte att uppdatera materialet: ${asSupabaseErrorMessage(error)}`);
  }

  return mapRowToMaterial(data as MaterialRowWithRelations);
}

export async function deleteMaterial(materialId: string): Promise<void> {
  await requireAuthenticatedSession('material');

  const supabase = getSupabaseClientOrThrow();
  const { error } = await supabase.from(MATERIALS_TABLE).delete().eq('id', materialId);

  if (error) {
    throw new Error(`Det gick inte att ta bort materialet: ${asSupabaseErrorMessage(error)}`);
  }
}
