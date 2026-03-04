import { getSupabaseClientOrThrow } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';
import type {
  MaterialCalculation,
  MaterialCalculationMutationInput,
} from '@/types/materialCalculation';

const MATERIAL_CALCULATIONS_TABLE = 'material_calculations';
const MATERIAL_CALCULATION_COLUMNS = `
  id,
  material_id,
  label,
  kg_material,
  print_time_hours,
  created_at,
  updated_at
`;

type MaterialCalculationRow = Database['public']['Tables']['material_calculations']['Row'];
type MaterialCalculationInsert = Database['public']['Tables']['material_calculations']['Insert'];
type MaterialCalculationUpdate = Database['public']['Tables']['material_calculations']['Update'];

function asSupabaseErrorMessage(error: { message?: string; details?: string | null }) {
  const details = error.details?.trim();
  if (details) {
    return `${error.message} (${details})`;
  }

  return error.message ?? 'Okänt databasfel';
}

function mapRowToMaterialCalculation(row: MaterialCalculationRow): MaterialCalculation {
  return {
    id: row.id,
    materialId: row.material_id,
    label: row.label,
    kgMaterial: row.kg_material,
    printTimeHours: row.print_time_hours,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMutationToInsert(
  materialId: string,
  input: MaterialCalculationMutationInput,
): MaterialCalculationInsert {
  return {
    material_id: materialId,
    label: input.label,
    kg_material: input.kgMaterial,
    print_time_hours: input.printTimeHours,
  };
}

function mapMutationToUpdate(input: MaterialCalculationMutationInput): MaterialCalculationUpdate {
  return {
    label: input.label,
    kg_material: input.kgMaterial,
    print_time_hours: input.printTimeHours,
  };
}

async function requireWriteSession() {
  const supabase = getSupabaseClientOrThrow();
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error('Det gick inte att kontrollera inloggning.');
  }

  if (!data.session) {
    throw new Error('Du måste vara inloggad för att ändra kalkyler.');
  }
}

export async function listMaterialCalculations(materialId: string): Promise<MaterialCalculation[]> {
  const supabase = getSupabaseClientOrThrow();
  const { data, error } = await supabase
    .from(MATERIAL_CALCULATIONS_TABLE)
    .select(MATERIAL_CALCULATION_COLUMNS)
    .eq('material_id', materialId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Det gick inte att läsa kalkyler: ${asSupabaseErrorMessage(error)}`);
  }

  return (data ?? []).map((row) => mapRowToMaterialCalculation(row as MaterialCalculationRow));
}

export async function createMaterialCalculation(
  materialId: string,
  input: MaterialCalculationMutationInput,
): Promise<MaterialCalculation> {
  await requireWriteSession();

  const supabase = getSupabaseClientOrThrow();
  const { data, error } = await supabase
    .from(MATERIAL_CALCULATIONS_TABLE)
    .insert(mapMutationToInsert(materialId, input))
    .select(MATERIAL_CALCULATION_COLUMNS)
    .single();

  if (error) {
    throw new Error(`Det gick inte att skapa kalkylen: ${asSupabaseErrorMessage(error)}`);
  }

  return mapRowToMaterialCalculation(data as MaterialCalculationRow);
}

export async function updateMaterialCalculation(
  calculationId: string,
  input: MaterialCalculationMutationInput,
): Promise<MaterialCalculation> {
  await requireWriteSession();

  const supabase = getSupabaseClientOrThrow();
  const { data, error } = await supabase
    .from(MATERIAL_CALCULATIONS_TABLE)
    .update(mapMutationToUpdate(input))
    .eq('id', calculationId)
    .select(MATERIAL_CALCULATION_COLUMNS)
    .single();

  if (error) {
    throw new Error(`Det gick inte att spara kalkylen: ${asSupabaseErrorMessage(error)}`);
  }

  return mapRowToMaterialCalculation(data as MaterialCalculationRow);
}

export async function deleteMaterialCalculation(calculationId: string): Promise<void> {
  await requireWriteSession();

  const supabase = getSupabaseClientOrThrow();
  const { error } = await supabase
    .from(MATERIAL_CALCULATIONS_TABLE)
    .delete()
    .eq('id', calculationId);

  if (error) {
    throw new Error(`Det gick inte att ta bort kalkylen: ${asSupabaseErrorMessage(error)}`);
  }
}
