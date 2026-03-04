import { useEffect, useMemo, useState } from 'react';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import {
  createMaterialCalculation,
  deleteMaterialCalculation,
  listMaterialCalculations,
  updateMaterialCalculation,
} from '@/services/material-calculations/materialCalculationsService';
import type { Material } from '@/types/material';
import type { MaterialCalculation } from '@/types/materialCalculation';
import { cn } from '@/utils/cn';
import { formatHours } from '@/utils/duration';
import { formatCurrency } from '@/utils/formatters';

interface MaterialCalculationsWorkspaceProps {
  material: Material;
  canWrite: boolean;
}

interface CalculationDraft {
  id: string;
  label: string;
  kgMaterialInput: string;
  printTimeHoursInput: string;
  quantityInput: string;
  machineHourlyRateEurInput: string;
  laborCostPerPartEurInput: string;
  postProcessCostPerPartEurInput: string;
  setupTimeHoursInput: string;
  postProcessTimeHoursPerPartInput: string;
  riskBufferPercentInput: string;
  targetMarginPercentInput: string;
  printerCountInput: string;
  savedLabel: string;
  savedKgMaterialInput: string;
  savedPrintTimeHoursInput: string;
  savedQuantityInput: string;
  savedMachineHourlyRateEurInput: string;
  savedLaborCostPerPartEurInput: string;
  savedPostProcessCostPerPartEurInput: string;
  savedSetupTimeHoursInput: string;
  savedPostProcessTimeHoursPerPartInput: string;
  savedRiskBufferPercentInput: string;
  savedTargetMarginPercentInput: string;
  savedPrinterCountInput: string;
  isEditing: boolean;
  saving: boolean;
  deleting: boolean;
  error: string | null;
}

interface ParsedDraftValues {
  kgMaterial: number | null;
  printTimeHours: number | null;
  quantity: number | null;
  machineHourlyRateEur: number | null;
  laborCostPerPartEur: number | null;
  postProcessCostPerPartEur: number | null;
  setupTimeHours: number | null;
  postProcessTimeHoursPerPart: number | null;
  riskBufferPercent: number | null;
  targetMarginPercent: number | null;
  printerCount: number | null;
}

interface CalculationMetrics {
  materialCostPerPart: number | null;
  machineCostPerPart: number | null;
  riskCostPerPart: number | null;
  internalCostPerPart: number | null;
  suggestedSalesPricePerPart: number | null;
  batchInternalCost: number | null;
  batchSalesTotal: number | null;
  leadTimeHours: number | null;
}

type EditableFieldKey =
  | 'label'
  | 'kgMaterialInput'
  | 'printTimeHoursInput'
  | 'quantityInput'
  | 'machineHourlyRateEurInput'
  | 'laborCostPerPartEurInput'
  | 'postProcessCostPerPartEurInput'
  | 'setupTimeHoursInput'
  | 'postProcessTimeHoursPerPartInput'
  | 'riskBufferPercentInput'
  | 'printerCountInput';

interface FieldConfig {
  key: EditableFieldKey;
  label: string;
  placeholder: string;
  inputMode: 'text' | 'decimal' | 'numeric';
}

const ORDER_FIELDS: FieldConfig[] = [
  { key: 'label', label: 'Namn på kalkyl', placeholder: 'Kalkyl', inputMode: 'text' },
  { key: 'kgMaterialInput', label: 'Kg material', placeholder: '0,85', inputMode: 'decimal' },
  {
    key: 'printTimeHoursInput',
    label: 'Printtid/st (h)',
    placeholder: '2,5',
    inputMode: 'decimal',
  },
  { key: 'quantityInput', label: 'Antal', placeholder: '10', inputMode: 'numeric' },
];

const COST_FIELDS: FieldConfig[] = [
  {
    key: 'machineHourlyRateEurInput',
    label: 'Maskinkostnad/h (EUR)',
    placeholder: '8',
    inputMode: 'decimal',
  },
  {
    key: 'laborCostPerPartEurInput',
    label: 'Arbetskostnad/st (EUR)',
    placeholder: '2',
    inputMode: 'decimal',
  },
  {
    key: 'postProcessCostPerPartEurInput',
    label: 'Efterbearbetning/st (EUR)',
    placeholder: '1,5',
    inputMode: 'decimal',
  },
  {
    key: 'riskBufferPercentInput',
    label: 'Riskpåslag (%)',
    placeholder: '10',
    inputMode: 'decimal',
  },
];

const CAPACITY_FIELDS: FieldConfig[] = [
  {
    key: 'setupTimeHoursInput',
    label: 'Uppstartstid (h)',
    placeholder: '0,5',
    inputMode: 'decimal',
  },
  {
    key: 'postProcessTimeHoursPerPartInput',
    label: 'Efterbearbetningstid/st (h)',
    placeholder: '0,1',
    inputMode: 'decimal',
  },
  {
    key: 'printerCountInput',
    label: 'Antal skrivare',
    placeholder: '1',
    inputMode: 'numeric',
  },
];

function parseDecimalInput(value: string) {
  const normalized = value.trim().replace(',', '.');
  if (normalized.length === 0) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function parseIntegerInput(value: string) {
  const parsed = parseDecimalInput(value);
  if (parsed === null || Number.isNaN(parsed)) {
    return parsed;
  }

  return Number.isInteger(parsed) ? parsed : Number.NaN;
}

function formatInputDecimal(value: number, maxFractionDigits: number) {
  return new Intl.NumberFormat('sv-SE', {
    useGrouping: false,
    maximumFractionDigits: maxFractionDigits,
  }).format(value);
}

function formatNumber(value: number | null, maxFractionDigits = 2) {
  if (value === null || !Number.isFinite(value)) {
    return 'Ej angivet';
  }

  return new Intl.NumberFormat('sv-SE', { maximumFractionDigits: maxFractionDigits }).format(value);
}

function formatMetricCurrency(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return 'Ej beräknat';
  }

  return formatCurrency(value);
}

function formatHoursWithUnit(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return 'Ej beräknat';
  }

  return `${formatHours(value)} h`;
}

function toDraft(calculation: MaterialCalculation, isEditing = false): CalculationDraft {
  const label = calculation.label;
  const kgMaterialInput = formatInputDecimal(calculation.kgMaterial, 3);
  const printTimeHoursInput = formatInputDecimal(calculation.printTimeHours, 2);
  const quantityInput = String(calculation.quantity);
  const machineHourlyRateEurInput = formatInputDecimal(calculation.machineHourlyRateEur, 2);
  const laborCostPerPartEurInput = formatInputDecimal(calculation.laborCostPerPartEur, 2);
  const postProcessCostPerPartEurInput = formatInputDecimal(
    calculation.postProcessCostPerPartEur,
    2,
  );
  const setupTimeHoursInput = formatInputDecimal(calculation.setupTimeHours, 2);
  const postProcessTimeHoursPerPartInput = formatInputDecimal(
    calculation.postProcessTimeHoursPerPart,
    2,
  );
  const riskBufferPercentInput = formatInputDecimal(calculation.riskBufferPercent, 2);
  const targetMarginPercentInput = formatInputDecimal(calculation.targetMarginPercent, 2);
  const printerCountInput = String(calculation.printerCount);

  return {
    id: calculation.id,
    label,
    kgMaterialInput,
    printTimeHoursInput,
    quantityInput,
    machineHourlyRateEurInput,
    laborCostPerPartEurInput,
    postProcessCostPerPartEurInput,
    setupTimeHoursInput,
    postProcessTimeHoursPerPartInput,
    riskBufferPercentInput,
    targetMarginPercentInput,
    printerCountInput,
    savedLabel: label,
    savedKgMaterialInput: kgMaterialInput,
    savedPrintTimeHoursInput: printTimeHoursInput,
    savedQuantityInput: quantityInput,
    savedMachineHourlyRateEurInput: machineHourlyRateEurInput,
    savedLaborCostPerPartEurInput: laborCostPerPartEurInput,
    savedPostProcessCostPerPartEurInput: postProcessCostPerPartEurInput,
    savedSetupTimeHoursInput: setupTimeHoursInput,
    savedPostProcessTimeHoursPerPartInput: postProcessTimeHoursPerPartInput,
    savedRiskBufferPercentInput: riskBufferPercentInput,
    savedTargetMarginPercentInput: targetMarginPercentInput,
    savedPrinterCountInput: printerCountInput,
    isEditing,
    saving: false,
    deleting: false,
    error: null,
  };
}

function getCalculationLabel(label: string, index: number) {
  const trimmed = label.trim();
  return trimmed.length > 0 ? trimmed : `Kalkyl ${index + 1}`;
}

function parseDraftValues(draft: CalculationDraft): ParsedDraftValues {
  return {
    kgMaterial: parseDecimalInput(draft.kgMaterialInput),
    printTimeHours: parseDecimalInput(draft.printTimeHoursInput),
    quantity: parseIntegerInput(draft.quantityInput),
    machineHourlyRateEur: parseDecimalInput(draft.machineHourlyRateEurInput),
    laborCostPerPartEur: parseDecimalInput(draft.laborCostPerPartEurInput),
    postProcessCostPerPartEur: parseDecimalInput(draft.postProcessCostPerPartEurInput),
    setupTimeHours: parseDecimalInput(draft.setupTimeHoursInput),
    postProcessTimeHoursPerPart: parseDecimalInput(draft.postProcessTimeHoursPerPartInput),
    riskBufferPercent: parseDecimalInput(draft.riskBufferPercentInput),
    targetMarginPercent: parseDecimalInput(draft.targetMarginPercentInput),
    printerCount: parseIntegerInput(draft.printerCountInput),
  };
}

function computeMetrics(
  materialPricePerKg: number,
  parsedValues: ParsedDraftValues,
): CalculationMetrics {
  const {
    kgMaterial,
    printTimeHours,
    quantity,
    machineHourlyRateEur,
    laborCostPerPartEur,
    postProcessCostPerPartEur,
    setupTimeHours,
    postProcessTimeHoursPerPart,
    riskBufferPercent,
    targetMarginPercent,
    printerCount,
  } = parsedValues;

  const isValidNonNegative = (value: number | null) =>
    value !== null && Number.isFinite(value) && value >= 0;
  const isValidPositiveInteger = (value: number | null) =>
    value !== null && Number.isInteger(value) && value > 0;

  const materialCostPerPart =
    isValidNonNegative(kgMaterial) && kgMaterial !== null ? materialPricePerKg * kgMaterial : null;

  const machineCostPerPart =
    isValidNonNegative(machineHourlyRateEur) &&
    isValidNonNegative(printTimeHours) &&
    machineHourlyRateEur !== null &&
    printTimeHours !== null
      ? machineHourlyRateEur * printTimeHours
      : null;

  const directCostPerPart =
    materialCostPerPart !== null &&
    machineCostPerPart !== null &&
    isValidNonNegative(laborCostPerPartEur) &&
    isValidNonNegative(postProcessCostPerPartEur) &&
    laborCostPerPartEur !== null &&
    postProcessCostPerPartEur !== null
      ? materialCostPerPart + machineCostPerPart + laborCostPerPartEur + postProcessCostPerPartEur
      : null;

  const riskCostPerPart =
    directCostPerPart !== null &&
    isValidNonNegative(riskBufferPercent) &&
    riskBufferPercent !== null
      ? directCostPerPart * (riskBufferPercent / 100)
      : null;

  const internalCostPerPart =
    directCostPerPart !== null && riskCostPerPart !== null
      ? directCostPerPart + riskCostPerPart
      : null;

  const suggestedSalesPricePerPart =
    internalCostPerPart !== null &&
    targetMarginPercent !== null &&
    Number.isFinite(targetMarginPercent) &&
    targetMarginPercent >= 0 &&
    targetMarginPercent < 100
      ? internalCostPerPart / (1 - targetMarginPercent / 100)
      : null;

  const batchInternalCost =
    internalCostPerPart !== null && isValidPositiveInteger(quantity) && quantity !== null
      ? internalCostPerPart * quantity
      : null;

  const batchSalesTotal =
    suggestedSalesPricePerPart !== null && isValidPositiveInteger(quantity) && quantity !== null
      ? suggestedSalesPricePerPart * quantity
      : null;

  const leadTimeHours =
    isValidNonNegative(setupTimeHours) &&
    isValidNonNegative(printTimeHours) &&
    isValidNonNegative(postProcessTimeHoursPerPart) &&
    isValidPositiveInteger(quantity) &&
    isValidPositiveInteger(printerCount) &&
    setupTimeHours !== null &&
    printTimeHours !== null &&
    postProcessTimeHoursPerPart !== null &&
    quantity !== null &&
    printerCount !== null
      ? setupTimeHours +
        (printTimeHours * quantity) / printerCount +
        postProcessTimeHoursPerPart * quantity
      : null;

  return {
    materialCostPerPart,
    machineCostPerPart,
    riskCostPerPart,
    internalCostPerPart,
    suggestedSalesPricePerPart,
    batchInternalCost,
    batchSalesTotal,
    leadTimeHours,
  };
}

interface ResultCardProps {
  label: string;
  value: string;
  emphasis?: 'default' | 'success' | 'accent';
}

function ResultCard({ label, value, emphasis = 'default' }: ResultCardProps) {
  const styleByEmphasis = {
    default: 'border-[var(--border)] bg-[var(--surface)] text-[var(--ink)]',
    success: 'border-emerald-300 bg-emerald-50 text-emerald-900',
    accent: 'border-[var(--accent)] bg-teal-50 text-teal-900',
  } as const;

  return (
    <div className={cn('rounded-xl border px-3 py-2.5', styleByEmphasis[emphasis])}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function MaterialCalculationsWorkspace({
  material,
  canWrite,
}: MaterialCalculationsWorkspaceProps) {
  const [drafts, setDrafts] = useState<CalculationDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createPending, setCreatePending] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadCalculations = async () => {
      setLoading(true);
      setError(null);

      try {
        const calculations = await listMaterialCalculations(material.id);
        if (isMounted) {
          setDrafts(calculations.map((calculation) => toDraft(calculation)));
        }
      } catch (caughtError) {
        if (isMounted) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : 'Det gick inte att läsa in kalkyler.',
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadCalculations();

    return () => {
      isMounted = false;
    };
  }, [material.id]);

  const nextCalculationLabel = useMemo(() => `Kalkyl ${drafts.length + 1}`, [drafts.length]);

  const updateDraft = (id: string, updater: (current: CalculationDraft) => CalculationDraft) => {
    setDrafts((currentDrafts) =>
      currentDrafts.map((draft) => (draft.id === id ? updater(draft) : draft)),
    );
  };

  const setDraftField = (id: string, key: EditableFieldKey, value: string) => {
    updateDraft(id, (current) => ({
      ...current,
      [key]: value,
      error: null,
    }));
  };

  const startEdit = (id: string) => {
    updateDraft(id, (current) => ({ ...current, isEditing: true, error: null }));
  };

  const cancelEdit = (id: string) => {
    updateDraft(id, (current) => ({
      ...current,
      label: current.savedLabel,
      kgMaterialInput: current.savedKgMaterialInput,
      printTimeHoursInput: current.savedPrintTimeHoursInput,
      quantityInput: current.savedQuantityInput,
      machineHourlyRateEurInput: current.savedMachineHourlyRateEurInput,
      laborCostPerPartEurInput: current.savedLaborCostPerPartEurInput,
      postProcessCostPerPartEurInput: current.savedPostProcessCostPerPartEurInput,
      setupTimeHoursInput: current.savedSetupTimeHoursInput,
      postProcessTimeHoursPerPartInput: current.savedPostProcessTimeHoursPerPartInput,
      riskBufferPercentInput: current.savedRiskBufferPercentInput,
      targetMarginPercentInput: current.savedTargetMarginPercentInput,
      printerCountInput: current.savedPrinterCountInput,
      isEditing: false,
      error: null,
    }));
  };

  const createCalculation = async () => {
    if (!canWrite) {
      return;
    }

    setCreatePending(true);
    setError(null);

    try {
      const created = await createMaterialCalculation(material.id, {
        label: nextCalculationLabel,
        kgMaterial: 0,
        printTimeHours: 0,
        quantity: 1,
        machineHourlyRateEur: 0,
        laborCostPerPartEur: 0,
        postProcessCostPerPartEur: 0,
        setupTimeHours: 0,
        postProcessTimeHoursPerPart: 0,
        riskBufferPercent: 10,
        targetMarginPercent: 30,
        printerCount: 1,
      });

      setDrafts((currentDrafts) => [...currentDrafts, toDraft(created, true)]);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Det gick inte att skapa en ny kalkyl.',
      );
    } finally {
      setCreatePending(false);
    }
  };

  const saveCalculation = async (draft: CalculationDraft) => {
    if (!canWrite) {
      return;
    }

    const parsed = parseDraftValues(draft);
    const label = draft.label.trim();

    const invalid = (message: string) => {
      updateDraft(draft.id, (current) => ({ ...current, error: message }));
    };

    if (parsed.kgMaterial === null || Number.isNaN(parsed.kgMaterial) || parsed.kgMaterial < 0) {
      invalid('Ange kg material som 0 eller högre.');
      return;
    }

    if (
      parsed.printTimeHours === null ||
      Number.isNaN(parsed.printTimeHours) ||
      parsed.printTimeHours < 0
    ) {
      invalid('Ange printtid i timmar som 0 eller högre.');
      return;
    }

    if (
      parsed.quantity === null ||
      Number.isNaN(parsed.quantity) ||
      !Number.isInteger(parsed.quantity) ||
      parsed.quantity <= 0
    ) {
      invalid('Antal måste vara ett heltal större än 0.');
      return;
    }

    if (
      parsed.printerCount === null ||
      Number.isNaN(parsed.printerCount) ||
      !Number.isInteger(parsed.printerCount) ||
      parsed.printerCount <= 0
    ) {
      invalid('Antal skrivare måste vara ett heltal större än 0.');
      return;
    }

    const nonNegativeChecks: Array<[number | null, string]> = [
      [parsed.machineHourlyRateEur, 'Maskinkostnad per timme måste vara 0 eller högre.'],
      [parsed.laborCostPerPartEur, 'Arbetskostnad per styck måste vara 0 eller högre.'],
      [
        parsed.postProcessCostPerPartEur,
        'Efterbearbetningskostnad per styck måste vara 0 eller högre.',
      ],
      [parsed.setupTimeHours, 'Uppstartstid måste vara 0 eller högre.'],
      [
        parsed.postProcessTimeHoursPerPart,
        'Efterbearbetningstid per styck måste vara 0 eller högre.',
      ],
      [parsed.riskBufferPercent, 'Riskpåslag måste vara 0 till 100 %.'],
    ];

    for (const [value, message] of nonNegativeChecks) {
      if (value === null || Number.isNaN(value) || value < 0) {
        invalid(message);
        return;
      }
    }

    if (parsed.riskBufferPercent !== null && parsed.riskBufferPercent > 100) {
      invalid('Riskpåslag måste vara 0 till 100 %.');
      return;
    }

    if (
      parsed.targetMarginPercent === null ||
      Number.isNaN(parsed.targetMarginPercent) ||
      parsed.targetMarginPercent < 0 ||
      parsed.targetMarginPercent >= 100
    ) {
      invalid('Målmarginal måste vara 0 till 99,99 %.');
      return;
    }

    updateDraft(draft.id, (current) => ({ ...current, saving: true, error: null }));

    try {
      const updated = await updateMaterialCalculation(draft.id, {
        label,
        kgMaterial: parsed.kgMaterial,
        printTimeHours: parsed.printTimeHours,
        quantity: parsed.quantity,
        machineHourlyRateEur: parsed.machineHourlyRateEur ?? 0,
        laborCostPerPartEur: parsed.laborCostPerPartEur ?? 0,
        postProcessCostPerPartEur: parsed.postProcessCostPerPartEur ?? 0,
        setupTimeHours: parsed.setupTimeHours ?? 0,
        postProcessTimeHoursPerPart: parsed.postProcessTimeHoursPerPart ?? 0,
        riskBufferPercent: parsed.riskBufferPercent ?? 0,
        targetMarginPercent: parsed.targetMarginPercent,
        printerCount: parsed.printerCount,
      });

      const updatedDraft = toDraft(updated, false);
      updateDraft(draft.id, (current) => ({
        ...current,
        ...updatedDraft,
        saving: false,
        deleting: current.deleting,
      }));
    } catch (caughtError) {
      updateDraft(draft.id, (current) => ({
        ...current,
        saving: false,
        error:
          caughtError instanceof Error ? caughtError.message : 'Det gick inte att spara kalkylen.',
      }));
    }
  };

  const removeCalculation = async (draft: CalculationDraft) => {
    if (!canWrite) {
      return;
    }

    const shouldDelete = window.confirm('Ta bort den här kalkylen?');
    if (!shouldDelete) {
      return;
    }

    updateDraft(draft.id, (current) => ({ ...current, deleting: true, error: null }));

    try {
      await deleteMaterialCalculation(draft.id);
      setDrafts((currentDrafts) => currentDrafts.filter((item) => item.id !== draft.id));
    } catch (caughtError) {
      updateDraft(draft.id, (current) => ({
        ...current,
        deleting: false,
        error:
          caughtError instanceof Error
            ? caughtError.message
            : 'Det gick inte att ta bort kalkylen.',
      }));
    }
  };

  const renderField = (draft: CalculationDraft, field: FieldConfig) => {
    const placeholder =
      field.key === 'label' ? `${field.placeholder} ${draft.id.slice(0, 4)}` : field.placeholder;

    return (
      <label key={field.key} className="space-y-1 text-sm">
        <span className="font-medium text-[var(--ink)]">{field.label}</span>
        <input
          value={draft[field.key]}
          inputMode={field.inputMode}
          onChange={(event) => setDraftField(draft.id, field.key, event.target.value)}
          disabled={!canWrite || draft.saving || draft.deleting}
          className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-[var(--surface-soft)]"
          placeholder={placeholder}
        />
      </label>
    );
  };

  const renderEditForm = (draft: CalculationDraft, index: number) => {
    const title = getCalculationLabel(draft.label, index);
    const parsedValues = parseDraftValues(draft);
    const metrics = computeMetrics(material.pricePerKgEur, parsedValues);

    const formula =
      metrics.materialCostPerPart !== null &&
      parsedValues.kgMaterial !== null &&
      Number.isFinite(parsedValues.kgMaterial)
        ? `${formatCurrency(material.pricePerKgEur)} × ${formatNumber(parsedValues.kgMaterial, 3)} kg = ${formatCurrency(metrics.materialCostPerPart)}`
        : 'Ange kg material för att se materialkostnad.';

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-[var(--ink)]">{title}</p>
            <p className="text-xs text-[var(--muted)]">
              Fyll i underlag, kontrollera förhandsvisning och spara.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void removeCalculation(draft)}
            disabled={!canWrite || draft.saving || draft.deleting}
            className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {draft.deleting ? 'Tar bort...' : 'Ta bort'}
          </button>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <div className="space-y-3">
            <div className="space-y-3 rounded-xl border border-[var(--border)] bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                1. Beställning
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {ORDER_FIELDS.map((field) => renderField(draft, field))}
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-[var(--border)] bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                2. Kostnader per styck
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {COST_FIELDS.map((field) => renderField(draft, field))}
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-[var(--border)] bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                3. Kapacitet och tid
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {CAPACITY_FIELDS.map((field) => renderField(draft, field))}
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-teal-200 bg-teal-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              Förhandsvisning
            </p>
            <div className="grid gap-2">
              <ResultCard
                label="Internkostnad/st"
                value={formatMetricCurrency(metrics.internalCostPerPart)}
              />
              <ResultCard
                label="Prisförslag/st"
                value={formatMetricCurrency(metrics.suggestedSalesPricePerPart)}
                emphasis="accent"
              />
              <ResultCard label="Totalpris" value={formatMetricCurrency(metrics.batchSalesTotal)} />
              <ResultCard label="Ledtid total" value={formatHoursWithUnit(metrics.leadTimeHours)} />
            </div>
            <div className="rounded-lg border border-teal-200 bg-white px-3 py-2 text-xs text-[var(--muted)]">
              {formula}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => void saveCalculation(draft)}
            disabled={!canWrite || draft.saving || draft.deleting}
            className="rounded-full border border-[var(--accent)] bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {draft.saving ? 'Sparar...' : 'Spara'}
          </button>
          <button
            type="button"
            onClick={() => cancelEdit(draft.id)}
            disabled={!canWrite || draft.saving || draft.deleting}
            className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Avbryt
          </button>
        </div>
      </div>
    );
  };

  const renderReadOnly = (draft: CalculationDraft, index: number) => {
    const parsedValues = parseDraftValues(draft);
    const metrics = computeMetrics(material.pricePerKgEur, parsedValues);
    const title = getCalculationLabel(draft.label, index);

    const formula =
      metrics.materialCostPerPart !== null &&
      parsedValues.kgMaterial !== null &&
      Number.isFinite(parsedValues.kgMaterial)
        ? `${formatCurrency(material.pricePerKgEur)} × ${formatNumber(parsedValues.kgMaterial, 3)} kg = ${formatCurrency(metrics.materialCostPerPart)}`
        : 'Ange kg material för att se materialkostnad.';

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-[var(--ink)]">{title}</p>
            <p className="text-xs text-[var(--muted)]">
              Sparad kalkyl. Klicka på redigera för ändringar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              Sparad
            </span>
            <button
              type="button"
              onClick={() => startEdit(draft.id)}
              disabled={!canWrite || draft.deleting}
              className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Redigera
            </button>
            <button
              type="button"
              onClick={() => void removeCalculation(draft)}
              disabled={!canWrite || draft.deleting}
              className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {draft.deleting ? 'Tar bort...' : 'Ta bort'}
            </button>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-5">
          <ResultCard
            label="Materialkostnad/st"
            value={formatMetricCurrency(metrics.materialCostPerPart)}
          />
          <ResultCard
            label="Internkostnad/st"
            value={formatMetricCurrency(metrics.internalCostPerPart)}
          />
          <ResultCard
            label="Prisförslag/st"
            value={formatMetricCurrency(metrics.suggestedSalesPricePerPart)}
            emphasis="accent"
          />
          <ResultCard
            label="Totalpris"
            value={formatMetricCurrency(metrics.batchSalesTotal)}
            emphasis="accent"
          />
          <ResultCard label="Ledtid total" value={formatHoursWithUnit(metrics.leadTimeHours)} />
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs text-[var(--muted)]">
          {formula}
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="space-y-2 rounded-xl border border-teal-200 bg-teal-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Kundsammanfattning
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <ResultCard
                label="Pris/st"
                value={formatMetricCurrency(metrics.suggestedSalesPricePerPart)}
                emphasis="accent"
              />
              <ResultCard
                label="Totalpris"
                value={formatMetricCurrency(metrics.batchSalesTotal)}
                emphasis="accent"
              />
              <ResultCard label="Leveranstid" value={formatHoursWithUnit(metrics.leadTimeHours)} />
              <ResultCard
                label="Totalkostnad"
                value={formatMetricCurrency(metrics.batchInternalCost)}
              />
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Underlag
            </p>
            <dl className="grid gap-x-3 gap-y-1 text-xs text-[var(--muted)] sm:grid-cols-2">
              <dt>Antal</dt>
              <dd className="text-right font-semibold text-[var(--ink)]">
                {formatNumber(parsedValues.quantity, 0)}
              </dd>
              <dt>Kg material/st</dt>
              <dd className="text-right font-semibold text-[var(--ink)]">
                {formatNumber(parsedValues.kgMaterial, 3)} kg
              </dd>
              <dt>Printtid/st</dt>
              <dd className="text-right font-semibold text-[var(--ink)]">
                {formatHoursWithUnit(parsedValues.printTimeHours)}
              </dd>
              <dt>Uppstartstid</dt>
              <dd className="text-right font-semibold text-[var(--ink)]">
                {formatHoursWithUnit(parsedValues.setupTimeHours)}
              </dd>
              <dt>Efterbearbetning/st</dt>
              <dd className="text-right font-semibold text-[var(--ink)]">
                {formatHoursWithUnit(parsedValues.postProcessTimeHoursPerPart)}
              </dd>
              <dt>Antal skrivare</dt>
              <dd className="text-right font-semibold text-[var(--ink)]">
                {formatNumber(parsedValues.printerCount, 0)}
              </dd>
            </dl>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          <ResultCard
            label="Maskinkostnad/st"
            value={formatMetricCurrency(metrics.machineCostPerPart)}
          />
          <ResultCard label="Riskpåslag/st" value={formatMetricCurrency(metrics.riskCostPerPart)} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[var(--ink)]">Kalkyler</p>
          <p className="text-xs text-[var(--muted)]">
            Skapa scenarier för internkostnad, prisförslag, batch och ledtid.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void createCalculation()}
          disabled={!canWrite || createPending || loading}
          className="rounded-full border border-[var(--accent)] bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {createPending ? 'Skapar...' : 'Ny kalkyl'}
        </button>
      </div>

      {!canWrite ? (
        <p className="text-xs text-[var(--muted)]">
          Logga in för att skapa, spara eller ta bort kalkyler.
        </p>
      ) : null}

      {error ? (
        <SurfaceCard className="space-y-1 border-red-200 bg-red-50 p-3">
          <p className="text-sm font-semibold text-red-700">Det gick inte att läsa kalkyler.</p>
          <p className="text-sm text-red-900/85">{error}</p>
        </SurfaceCard>
      ) : null}

      {loading ? (
        <SurfaceCard className="p-3">
          <p className="text-sm text-[var(--muted)]">Läser in kalkyler...</p>
        </SurfaceCard>
      ) : null}

      {!loading && !error && drafts.length === 0 ? (
        <SurfaceCard className="space-y-1 p-3">
          <p className="text-sm font-semibold text-[var(--ink)]">Inga kalkyler ännu.</p>
          <p className="text-sm text-[var(--muted)]">
            Lägg till en kalkyl för att räkna internkostnad, offertpris och leveranstid.
          </p>
        </SurfaceCard>
      ) : null}

      {!loading && !error && drafts.length > 0 ? (
        <ul className="space-y-3">
          {drafts.map((draft, index) => (
            <li
              key={draft.id}
              className={cn(
                'rounded-2xl border p-3',
                draft.isEditing
                  ? 'border-[var(--accent)] bg-white'
                  : 'border-[var(--border)] bg-[var(--surface-soft)]',
              )}
            >
              {draft.isEditing ? renderEditForm(draft, index) : renderReadOnly(draft, index)}

              {draft.error ? (
                <p className="mt-2 text-xs font-semibold text-red-700">{draft.error}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
