import { getSupabaseClientOrThrow } from '@/lib/supabase/client';
import {
  asSupabaseErrorMessage,
  requireAuthenticatedSession,
} from '@/lib/supabase/serviceHelpers';
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
  quantity,
  details_per_printer,
  machine_hourly_rate_eur,
  setup_time_hours,
  printer_count,
  created_at,
  updated_at
`;

type MaterialCalculationRow = Database['public']['Tables']['material_calculations']['Row'];
type MaterialCalculationInsert = Database['public']['Tables']['material_calculations']['Insert'];
type MaterialCalculationUpdate = Database['public']['Tables']['material_calculations']['Update'];

function mapRowToMaterialCalculation(row: MaterialCalculationRow): MaterialCalculation {
  return {
    id: row.id,
    materialId: row.material_id,
    label: row.label,
    kgMaterial: row.kg_material,
    printTimeHours: row.print_time_hours,
    quantity: row.quantity,
    detailsPerPrinter: row.details_per_printer,
    machineHourlyRateEur: row.machine_hourly_rate_eur,
    setupTimeHours: row.setup_time_hours,
    printerCount: row.printer_count,
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
    quantity: input.quantity,
    details_per_printer: input.detailsPerPrinter,
    machine_hourly_rate_eur: input.machineHourlyRateEur,
    setup_time_hours: input.setupTimeHours,
    printer_count: input.printerCount,
  };
}

function mapMutationToUpdate(input: MaterialCalculationMutationInput): MaterialCalculationUpdate {
  return {
    label: input.label,
    kg_material: input.kgMaterial,
    print_time_hours: input.printTimeHours,
    quantity: input.quantity,
    details_per_printer: input.detailsPerPrinter,
    machine_hourly_rate_eur: input.machineHourlyRateEur,
    setup_time_hours: input.setupTimeHours,
    printer_count: input.printerCount,
  };
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
  await requireAuthenticatedSession('kalkyler');

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
  await requireAuthenticatedSession('kalkyler');

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
  await requireAuthenticatedSession('kalkyler');

  const supabase = getSupabaseClientOrThrow();
  const { error } = await supabase
    .from(MATERIAL_CALCULATIONS_TABLE)
    .delete()
    .eq('id', calculationId);

  if (error) {
    throw new Error(`Det gick inte att ta bort kalkylen: ${asSupabaseErrorMessage(error)}`);
  }
}
