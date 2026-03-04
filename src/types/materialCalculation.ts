export interface MaterialCalculation {
  id: string;
  materialId: string;
  label: string;
  kgMaterial: number;
  printTimeHours: number;
  quantity: number;
  machineHourlyRateEur: number;
  laborCostPerPartEur: number;
  postProcessCostPerPartEur: number;
  setupTimeHours: number;
  postProcessTimeHoursPerPart: number;
  riskBufferPercent: number;
  targetMarginPercent: number;
  printerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialCalculationMutationInput {
  label: string;
  kgMaterial: number;
  printTimeHours: number;
  quantity: number;
  machineHourlyRateEur: number;
  laborCostPerPartEur: number;
  postProcessCostPerPartEur: number;
  setupTimeHours: number;
  postProcessTimeHoursPerPart: number;
  riskBufferPercent: number;
  targetMarginPercent: number;
  printerCount: number;
}
