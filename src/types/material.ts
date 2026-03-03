export type MaterialStatus = 'active' | 'archived';

export type MaterialCategory = 'PLA' | 'PETG' | 'ABS' | 'Nylon' | 'TPU' | 'Resin' | 'Other';

export interface Material {
  id: string;
  name: string;
  displayName: string;
  category: MaterialCategory;
  manufacturer: string | null;
  pricePerKg: number | null;
  maxTemperature: number | null;
  notes: string;
  status: MaterialStatus;
  createdAt: string;
  updatedAt: string;
}
