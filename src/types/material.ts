import type { Manufacturer } from '@/types/manufacturer';

export type MaterialCategory = 'PLA' | 'PETG' | 'ABS' | 'Nylon' | 'TPU' | 'Resin' | 'Other';

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
