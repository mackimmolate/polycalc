import { describe, expect, it } from 'vitest';
import {
  computeCalculationMetrics,
  getTotalParallelCapacity,
  minutesToHours,
  type CalculationScenarioValues,
} from './materialCalculationLogic';

function buildValues(
  overrides: Partial<CalculationScenarioValues> = {},
): CalculationScenarioValues {
  return {
    kgMaterial: 2,
    printTimeMinutes: 30,
    quantity: 4,
    detailsPerPrinter: 2,
    machineHourlyRateEur: 12,
    setupTimeMinutes: 20,
    printerCount: 2,
    ...overrides,
  };
}

describe('materialCalculationLogic', () => {
  it('converts minutes to hours consistently', () => {
    expect(minutesToHours(90)).toBe(1.5);
  });

  it('calculates capacity-aware metrics from scenario inputs', () => {
    const metrics = computeCalculationMetrics(15, buildValues());

    expect(metrics.materialCostPerPart).toBe(30);
    expect(metrics.machineCostPerPart).toBe(3);
    expect(metrics.internalCostPerPart).toBe(33);
    expect(metrics.batchInternalCost).toBe(132);
    expect(metrics.totalParallelCapacity).toBe(4);
    expect(metrics.leadTimeMinutes).toBe(50);
  });

  it('keeps setup time even when print time is zero', () => {
    const metrics = computeCalculationMetrics(
      20,
      buildValues({
        printTimeMinutes: 0,
      }),
    );

    expect(metrics.machineCostPerPart).toBe(0);
    expect(metrics.leadTimeMinutes).toBe(20);
  });

  it('returns null metrics for invalid capacity inputs', () => {
    const metrics = computeCalculationMetrics(
      15,
      buildValues({
        detailsPerPrinter: 0,
      }),
    );

    expect(metrics.machineCostPerPart).toBeNull();
    expect(metrics.leadTimeMinutes).toBeNull();
    expect(metrics.totalParallelCapacity).toBeNull();
  });

  it('returns null batch totals when quantity is invalid', () => {
    const metrics = computeCalculationMetrics(
      15,
      buildValues({
        quantity: 0,
      }),
    );

    expect(metrics.batchInternalCost).toBeNull();
    expect(metrics.leadTimeMinutes).toBeNull();
  });

  it('calculates total parallel capacity only for positive integer values', () => {
    expect(getTotalParallelCapacity(buildValues())).toBe(4);
    expect(getTotalParallelCapacity(buildValues({ printerCount: 0 }))).toBeNull();
    expect(getTotalParallelCapacity(buildValues({ detailsPerPrinter: 1.5 }))).toBeNull();
  });
});
