export interface MaterialCalculation {
  id: string;
  materialId: string;
  label: string;
  kgMaterial: number;
  printTimeHours: number;
  quantity: number;
  detailsPerPrinter: number;
  machineHourlyRateEur: number;
  setupTimeHours: number;
  printerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialCalculationMutationInput {
  label: string;
  kgMaterial: number;
  printTimeHours: number;
  quantity: number;
  detailsPerPrinter: number;
  machineHourlyRateEur: number;
  setupTimeHours: number;
  printerCount: number;
}
