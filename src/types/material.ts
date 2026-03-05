export type MaterialCategory = string;
export type MaterialManufacturer = string;
export type MaterialReferenceAngle = 45 | 90;

export interface Material {
  id: string;
  categoryId: string;
  manufacturerId: string;
  name: string;
  category: MaterialCategory;
  manufacturer: MaterialManufacturer;
  pricePerKgEur: number;
  maxTemperatureC: number | null;
  timePerLayerSeconds: number;
  timePerLayerReferenceAngleDeg: MaterialReferenceAngle;
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
  timePerLayerSeconds: number;
  timePerLayerReferenceAngleDeg: MaterialReferenceAngle;
  notes: string;
}
