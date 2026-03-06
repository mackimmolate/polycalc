import { getSupabaseClientOrThrow } from '@/lib/supabase/client';
import {
  asSupabaseErrorMessage,
  requireAuthenticatedSession,
} from '@/lib/supabase/serviceHelpers';
import type { Database } from '@/lib/supabase/database.types';
import type { MaterialOption, MaterialOptionUpsertResult } from '@/types/materialOption';

const MATERIAL_CATEGORY_TABLE = 'material_categories';
const MATERIAL_MANUFACTURER_TABLE = 'material_manufacturers';
const OPTION_COLUMNS = `
  id,
  label,
  normalized_key,
  is_active,
  created_at,
  updated_at
`;

type OptionTable = typeof MATERIAL_CATEGORY_TABLE | typeof MATERIAL_MANUFACTURER_TABLE;
type MaterialCategoryRow = Database['public']['Tables']['material_categories']['Row'];
type MaterialCategoryInsert = Database['public']['Tables']['material_categories']['Insert'];
type MaterialManufacturerRow = Database['public']['Tables']['material_manufacturers']['Row'];
type MaterialManufacturerInsert = Database['public']['Tables']['material_manufacturers']['Insert'];
type MaterialOptionRow = MaterialCategoryRow | MaterialManufacturerRow;
type MaterialOptionInsert = MaterialCategoryInsert | MaterialManufacturerInsert;

function normalizeOptionLabel(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function normalizeOptionKey(value: string) {
  return normalizeOptionLabel(value).toLocaleLowerCase('sv-SE');
}

function mapRowToMaterialOption(row: MaterialOptionRow): MaterialOption {
  return {
    id: row.id,
    label: row.label,
    normalizedKey: row.normalized_key,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function listOptions(
  table: OptionTable,
  includeInactive: boolean,
): Promise<MaterialOption[]> {
  const supabase = getSupabaseClientOrThrow();
  let query = supabase.from(table).select(OPTION_COLUMNS).order('label', { ascending: true });

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Det gick inte att läsa valbara alternativ: ${asSupabaseErrorMessage(error)}`);
  }

  return (data ?? []).map((row) => mapRowToMaterialOption(row as MaterialOptionRow));
}

async function getOptionByNormalizedKey(
  table: OptionTable,
  normalizedKey: string,
): Promise<MaterialOption | null> {
  const supabase = getSupabaseClientOrThrow();
  const { data, error } = await supabase
    .from(table)
    .select(OPTION_COLUMNS)
    .eq('normalized_key', normalizedKey)
    .maybeSingle();

  if (error) {
    throw new Error(`Det gick inte att läsa alternativet: ${asSupabaseErrorMessage(error)}`);
  }

  if (!data) {
    return null;
  }

  return mapRowToMaterialOption(data as MaterialOptionRow);
}

async function createOrReactivateOption(
  table: OptionTable,
  rawLabel: string,
): Promise<MaterialOptionUpsertResult> {
  const label = normalizeOptionLabel(rawLabel);
  const normalizedKey = normalizeOptionKey(label);

  if (label.length < 2) {
    throw new Error('Ange minst 2 tecken.');
  }

  const existing = await getOptionByNormalizedKey(table, normalizedKey);
  if (existing) {
    if (existing.isActive) {
      return { option: existing, status: 'existing' };
    }

    const supabase = getSupabaseClientOrThrow();
    const { data, error } = await supabase
      .from(table)
      .update({ is_active: true })
      .eq('id', existing.id)
      .select(OPTION_COLUMNS)
      .single();

    if (error) {
      throw new Error(
        `Det gick inte att återaktivera alternativet: ${asSupabaseErrorMessage(error)}`,
      );
    }

    return {
      option: mapRowToMaterialOption(data as MaterialOptionRow),
      status: 'reactivated',
    };
  }

  const insertPayload: MaterialOptionInsert = {
    label,
    normalized_key: normalizedKey,
    is_active: true,
  };

  const supabase = getSupabaseClientOrThrow();
  const { data, error } = await supabase
    .from(table)
    .insert(insertPayload)
    .select(OPTION_COLUMNS)
    .single();

  if (error) {
    if ((error as { code?: string }).code === '23505') {
      const duplicate = await getOptionByNormalizedKey(table, normalizedKey);
      if (duplicate) {
        return { option: duplicate, status: duplicate.isActive ? 'existing' : 'reactivated' };
      }
    }

    throw new Error(`Det gick inte att skapa alternativet: ${asSupabaseErrorMessage(error)}`);
  }

  return { option: mapRowToMaterialOption(data as MaterialOptionRow), status: 'created' };
}

async function deactivateOption(table: OptionTable, optionId: string) {
  const supabase = getSupabaseClientOrThrow();
  const { data, error } = await supabase
    .from(table)
    .update({ is_active: false })
    .eq('id', optionId)
    .select(OPTION_COLUMNS)
    .maybeSingle();

  if (error) {
    throw new Error(`Det gick inte att inaktivera alternativet: ${asSupabaseErrorMessage(error)}`);
  }

  if (!data) {
    throw new Error('Alternativet kunde inte hittas.');
  }

  return mapRowToMaterialOption(data as MaterialOptionRow);
}

export async function listMaterialCategories(params?: { includeInactive?: boolean }) {
  return listOptions(MATERIAL_CATEGORY_TABLE, params?.includeInactive ?? false);
}

export async function listMaterialManufacturers(params?: { includeInactive?: boolean }) {
  return listOptions(MATERIAL_MANUFACTURER_TABLE, params?.includeInactive ?? false);
}

export async function createMaterialCategory(rawLabel: string) {
  await requireAuthenticatedSession('kategorier');
  return createOrReactivateOption(MATERIAL_CATEGORY_TABLE, rawLabel);
}

export async function createMaterialManufacturer(rawLabel: string) {
  await requireAuthenticatedSession('tillverkare');
  return createOrReactivateOption(MATERIAL_MANUFACTURER_TABLE, rawLabel);
}

export async function deactivateMaterialCategory(optionId: string) {
  await requireAuthenticatedSession('kategorier');
  return deactivateOption(MATERIAL_CATEGORY_TABLE, optionId);
}

export async function deactivateMaterialManufacturer(optionId: string) {
  await requireAuthenticatedSession('tillverkare');
  return deactivateOption(MATERIAL_MANUFACTURER_TABLE, optionId);
}
