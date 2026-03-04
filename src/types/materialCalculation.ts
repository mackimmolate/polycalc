export interface MaterialCalculation {
  id: string;
  materialId: string;
  label: string;
  kgMaterial: number;
  printTimeHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialCalculationMutationInput {
  label: string;
  kgMaterial: number;
  printTimeHours: number;
}
