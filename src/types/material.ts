import type { Manufacturer } from '@/types/manufacturer';

export type MaterialStatus = 'active' | 'archived';

export type MaterialCategory = 'PLA' | 'PETG' | 'ABS' | 'Nylon' | 'TPU' | 'Resin' | 'Other';

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  manufacturer: Manufacturer | null;
  pricePerKg: number | null;
  maxTemperature: number | null;
  notes: string;
  status: MaterialStatus;
  createdAt: string;
  updatedAt: string;
}
