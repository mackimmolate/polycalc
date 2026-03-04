export type MaterialCategory = string;
export type MaterialManufacturer = string;

export interface Material {
  id: string;
  categoryId: string;
  manufacturerId: string;
  name: string;
  category: MaterialCategory;
  manufacturer: MaterialManufacturer;
  pricePerKgEur: number;
  maxTemperatureC: number | null;
  timePerLayer45DegSeconds: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialMutationInput {
  name: string;
  categoryId: string;
  manufacturerId: string;
  pricePerKgEur: number;
  maxTemperatureC: number | null;
  timePerLayer45DegSeconds: number;
  notes: string;
}
