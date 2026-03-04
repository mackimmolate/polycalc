import type { Manufacturer } from '@/types/manufacturer';

export const defaultMaterialCategoryOptions = [
  'PLA',
  'PETG',
  'ABS',
  'Nylon',
  'TPU',
  'Resin',
  'Other',
] as const;

export type MaterialCategory = string;

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  manufacturer: Manufacturer;
  pricePerKgEur: number;
  maxTemperatureC: number | null;
  timePerLayer45DegSeconds: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialMutationInput {
  name: string;
  category: MaterialCategory;
  manufacturer: Manufacturer;
  pricePerKgEur: number;
  maxTemperatureC: number | null;
  timePerLayer45DegSeconds: number;
  notes: string;
}
