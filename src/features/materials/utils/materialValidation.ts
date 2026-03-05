import type { MaterialMutationInput } from '@/types/material';

export interface MaterialFormValues {
  name: string;
  categoryId: string;
  manufacturerId: string;
  pricePerKgEur: string;
  maxTemperatureC: string;
  timePerLayerMinutes: string;
  timePerLayerReferenceAngleDeg: string;
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

  const manufacturerId = values.manufacturerId.trim();
  if (manufacturerId.length < 1) {
    errors.manufacturerId = 'Välj en tillverkare.';
  }

  const categoryId = values.categoryId.trim();
  if (categoryId.length < 1) {
    errors.categoryId = 'Välj en kategori.';
  }

  const price = parseNumber(values.pricePerKgEur);
  if (price === null || Number.isNaN(price) || price < 0) {
    errors.pricePerKgEur = 'Ange ett giltigt pris i EUR per kg.';
  }

  const maxTemperature = parseNumber(values.maxTemperatureC);
  if (maxTemperature !== null && (Number.isNaN(maxTemperature) || maxTemperature < 0)) {
    errors.maxTemperatureC = 'Maxtemperatur måste vara 0 eller högre.';
  }

  const referenceAngle = Number(values.timePerLayerReferenceAngleDeg);
  if (referenceAngle !== 45 && referenceAngle !== 90) {
    errors.timePerLayerReferenceAngleDeg = 'Välj 45° eller 90° som referensvinkel.';
  }

  const timePerLayerMinutes = parseNumber(values.timePerLayerMinutes);
  if (
    timePerLayerMinutes === null ||
    Number.isNaN(timePerLayerMinutes) ||
    timePerLayerMinutes <= 0
  ) {
    errors.timePerLayerMinutes = 'Tid per lager måste vara större än 0 minuter.';
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
      categoryId,
      manufacturerId,
      pricePerKgEur: Number(price),
      maxTemperatureC: maxTemperature === null ? null : Math.round(maxTemperature),
      timePerLayerSeconds: Math.round(Number(timePerLayerMinutes) * 60),
      timePerLayerReferenceAngleDeg: referenceAngle === 90 ? 90 : 45,
      notes: values.notes.trim(),
    },
    errors,
  };
}
