export interface CalculationScenarioValues {
  kgMaterial: number | null;
  printTimeMinutes: number | null;
  quantity: number | null;
  detailsPerPrinter: number | null;
  machineHourlyRateEur: number | null;
  setupTimeMinutes: number | null;
  printerCount: number | null;
}

export interface CalculationMetrics {
  materialCostPerPart: number | null;
  machineCostPerPart: number | null;
  internalCostPerPart: number | null;
  batchInternalCost: number | null;
  leadTimeMinutes: number | null;
  totalParallelCapacity: number | null;
}

function isFiniteNumber(value: number | null): value is number {
  return value !== null && Number.isFinite(value);
}

function isNonNegativeNumber(value: number | null): value is number {
  return isFiniteNumber(value) && value >= 0;
}

function isPositiveInteger(value: number | null): value is number {
  return isFiniteNumber(value) && Number.isInteger(value) && value > 0;
}

export function getTotalParallelCapacity(values: CalculationScenarioValues) {
  return isPositiveInteger(values.printerCount) && isPositiveInteger(values.detailsPerPrinter)
    ? values.printerCount * values.detailsPerPrinter
    : null;
}

export function minutesToHours(minutes: number) {
  return minutes / 60;
}

export function computeCalculationMetrics(
  materialPricePerKg: number,
  values: CalculationScenarioValues,
): CalculationMetrics {
  const totalParallelCapacity = getTotalParallelCapacity(values);

  const materialCostPerPart =
    isNonNegativeNumber(values.kgMaterial) ? materialPricePerKg * values.kgMaterial : null;

  const machineCostPerPart =
    isNonNegativeNumber(values.machineHourlyRateEur) &&
    isNonNegativeNumber(values.printTimeMinutes) &&
    isPositiveInteger(values.detailsPerPrinter)
      ? (values.machineHourlyRateEur * minutesToHours(values.printTimeMinutes)) /
        values.detailsPerPrinter
      : null;

  const internalCostPerPart =
    materialCostPerPart !== null && machineCostPerPart !== null
      ? materialCostPerPart + machineCostPerPart
      : null;

  const batchInternalCost =
    internalCostPerPart !== null && isPositiveInteger(values.quantity)
      ? internalCostPerPart * values.quantity
      : null;

  const leadTimeMinutes =
    isNonNegativeNumber(values.setupTimeMinutes) &&
    isNonNegativeNumber(values.printTimeMinutes) &&
    isPositiveInteger(values.quantity) &&
    totalParallelCapacity !== null
      ? values.setupTimeMinutes +
        (values.printTimeMinutes * values.quantity) / totalParallelCapacity
      : null;

  return {
    materialCostPerPart,
    machineCostPerPart,
    internalCostPerPart,
    batchInternalCost,
    leadTimeMinutes,
    totalParallelCapacity,
  };
}
