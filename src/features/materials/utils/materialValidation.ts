import type { Manufacturer } from '@/types/manufacturer';
import type { MaterialCategory, MaterialMutationInput } from '@/types/material';

export interface MaterialFormValues {
  name: string;
  category: MaterialCategory;
  manufacturer: Manufacturer | '';
  pricePerKgEur: string;
  maxTemperatureC: string;
  timePerLayer45DegSeconds: string;
  notes: string;
}

export type MaterialFormErrors = Partial<Record<keyof MaterialFormValues, string>>;

function parseNumber(value: string) {
  const trimmed = value.trim().replace(',', '.');
  if (trimmed.length === 0) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function validateMaterialForm(values: MaterialFormValues): {
  input: MaterialMutationInput | null;
  errors: MaterialFormErrors;
} {
  const errors: MaterialFormErrors = {};

  const name = values.name.trim();
  if (name.length < 2) {
    errors.name = 'Ange ett materialnamn med minst 2 tecken.';
  }

  if (!values.manufacturer) {
    errors.manufacturer = 'Välj en tillverkare.';
  }

  const price = parseNumber(values.pricePerKgEur);
  if (price === null || Number.isNaN(price) || price < 0) {
    errors.pricePerKgEur = 'Ange ett giltigt pris i EUR per kg.';
  }

  const maxTemperature = parseNumber(values.maxTemperatureC);
  if (maxTemperature !== null && (Number.isNaN(maxTemperature) || maxTemperature < 0)) {
    errors.maxTemperatureC = 'Maxtemperatur måste vara 0 eller högre.';
  }

  const timePerLayer = parseNumber(values.timePerLayer45DegSeconds);
  if (timePerLayer === null || Number.isNaN(timePerLayer) || timePerLayer <= 0) {
    errors.timePerLayer45DegSeconds = 'Tid per lager måste vara större än 0 sekunder.';
  }

  if (values.notes.length > 1200) {
    errors.notes = 'Anteckningar kan vara högst 1200 tecken.';
  }

  if (Object.keys(errors).length > 0) {
    return { input: null, errors };
  }

  return {
    input: {
      name,
      category: values.category,
      manufacturer: values.manufacturer as Manufacturer,
      pricePerKgEur: Number(price),
      maxTemperatureC: maxTemperature === null ? null : Math.round(maxTemperature),
      timePerLayer45DegSeconds: Math.round(Number(timePerLayer)),
      notes: values.notes.trim(),
    },
    errors,
  };
}
