import { useEffect, useMemo, useState } from 'react';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { exportQuotePdf } from '@/features/materials/utils/exportQuotePdf';
import {
  createMaterialCalculation,
  deleteMaterialCalculation,
  listMaterialCalculations,
  updateMaterialCalculation,
} from '@/services/material-calculations/materialCalculationsService';
import type { Material } from '@/types/material';
import type { MaterialCalculation } from '@/types/materialCalculation';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/formatters';

interface MaterialCalculationsWorkspaceProps {
  material: Material;
  canWrite: boolean;
}

interface CalculationDraft {
  id: string;
  label: string;
  kgMaterialInput: string;
  printTimeMinutesInput: string;
  quantityInput: string;
  detailsPerPrinterInput: string;
  machineHourlyRateEurInput: string;
  setupTimeMinutesInput: string;
  printerCountInput: string;
  savedLabel: string;
  savedKgMaterialInput: string;
  savedPrintTimeMinutesInput: string;
  savedQuantityInput: string;
  savedDetailsPerPrinterInput: string;
  savedMachineHourlyRateEurInput: string;
  savedSetupTimeMinutesInput: string;
  savedPrinterCountInput: string;
  isEditing: boolean;
  saving: boolean;
  deleting: boolean;
  error: string | null;
}

interface ParsedDraftValues {
  kgMaterial: number | null;
  printTimeMinutes: number | null;
  printTimeHours: number | null;
  quantity: number | null;
  detailsPerPrinter: number | null;
  machineHourlyRateEur: number | null;
  setupTimeMinutes: number | null;
  setupTimeHours: number | null;
  printerCount: number | null;
}

interface CalculationMetrics {
  materialCostPerPart: number | null;
  machineCostPerPart: number | null;
  internalCostPerPart: number | null;
  batchInternalCost: number | null;
  leadTimeMinutes: number | null;
}

type EditableFieldKey =
  | 'label'
  | 'kgMaterialInput'
  | 'printTimeMinutesInput'
  | 'quantityInput'
  | 'detailsPerPrinterInput'
  | 'machineHourlyRateEurInput'
  | 'setupTimeMinutesInput'
  | 'printerCountInput';

interface FieldConfig {
  key: EditableFieldKey;
  label: string;
  placeholder: string;
  inputMode: 'text' | 'decimal' | 'numeric';
}

const ORDER_FIELDS: FieldConfig[] = [
  { key: 'label', label: 'Namn på kalkyl', placeholder: 'Kalkyl', inputMode: 'text' },
  { key: 'kgMaterialInput', label: 'Kg/detalj', placeholder: '0,85', inputMode: 'decimal' },
  {
    key: 'printTimeMinutesInput',
    label: 'Printtid/st (min)',
    placeholder: '30',
    inputMode: 'decimal',
  },
  { key: 'quantityInput', label: 'Antal detaljer', placeholder: '10', inputMode: 'numeric' },
];

const COST_FIELDS: FieldConfig[] = [
  {
    key: 'machineHourlyRateEurInput',
    label: 'Maskinkostnad/h (EUR)',
    placeholder: '8',
    inputMode: 'decimal',
  },
];

const CAPACITY_FIELDS: FieldConfig[] = [
  {
    key: 'detailsPerPrinterInput',
    label: 'Antal detaljer/skrivare',
    placeholder: '1',
    inputMode: 'numeric',
  },
  {
    key: 'setupTimeMinutesInput',
    label: 'Uppstartstid (min)',
    placeholder: '30',
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

function formatMinutesWithUnit(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return 'Ej beräknat';
  }

  return `${formatNumber(value, 1)} min`;
}

function formatLeadTime(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return 'Ej beräknat';
  }

  const totalMinutes = Math.max(0, Math.round(value));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${minutes} min`;
}

const DEFAULT_TARGET_MARGIN_PERCENT = 0;
const DEFAULT_RISK_BUFFER_PERCENT = 0;
const DEFAULT_POST_PROCESS_COST_PER_PART_EUR = 0;
const DEFAULT_POST_PROCESS_TIME_HOURS_PER_PART = 0;

function toDraft(calculation: MaterialCalculation, isEditing = false): CalculationDraft {
  const label = calculation.label;
  const kgMaterialInput = formatInputDecimal(calculation.kgMaterial, 3);
  const printTimeMinutesInput = formatInputDecimal(calculation.printTimeHours * 60, 1);
  const quantityInput = String(calculation.quantity);
  const detailsPerPrinterInput = String(calculation.detailsPerPrinter);
  const machineHourlyRateEurInput = formatInputDecimal(calculation.machineHourlyRateEur, 2);
  const setupTimeMinutesInput = formatInputDecimal(calculation.setupTimeHours * 60, 1);
  const printerCountInput = String(calculation.printerCount);

  return {
    id: calculation.id,
    label,
    kgMaterialInput,
    printTimeMinutesInput,
    quantityInput,
    detailsPerPrinterInput,
    machineHourlyRateEurInput,
    setupTimeMinutesInput,
    printerCountInput,
    savedLabel: label,
    savedKgMaterialInput: kgMaterialInput,
    savedPrintTimeMinutesInput: printTimeMinutesInput,
    savedQuantityInput: quantityInput,
    savedDetailsPerPrinterInput: detailsPerPrinterInput,
    savedMachineHourlyRateEurInput: machineHourlyRateEurInput,
    savedSetupTimeMinutesInput: setupTimeMinutesInput,
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
  const printTimeMinutes = parseDecimalInput(draft.printTimeMinutesInput);
  const printTimeHours =
    printTimeMinutes === null || Number.isNaN(printTimeMinutes) ? printTimeMinutes : printTimeMinutes / 60;
  const setupTimeMinutes = parseDecimalInput(draft.setupTimeMinutesInput);
  const setupTimeHours =
    setupTimeMinutes === null || Number.isNaN(setupTimeMinutes) ? setupTimeMinutes : setupTimeMinutes / 60;

  return {
    kgMaterial: parseDecimalInput(draft.kgMaterialInput),
    printTimeMinutes,
    printTimeHours,
    quantity: parseIntegerInput(draft.quantityInput),
    detailsPerPrinter: parseIntegerInput(draft.detailsPerPrinterInput),
    machineHourlyRateEur: parseDecimalInput(draft.machineHourlyRateEurInput),
    setupTimeMinutes,
    setupTimeHours,
    printerCount: parseIntegerInput(draft.printerCountInput),
  };
}

function computeMetrics(
  materialPricePerKg: number,
  parsedValues: ParsedDraftValues,
): CalculationMetrics {
  const {
    kgMaterial,
    printTimeMinutes,
    printTimeHours,
    quantity,
    detailsPerPrinter,
    machineHourlyRateEur,
    setupTimeMinutes,
    printerCount,
  } = parsedValues;

  const isValidNonNegative = (value: number | null) =>
    value !== null && Number.isFinite(value) && value >= 0;
  const isValidPositiveInteger = (value: number | null) =>
    value !== null && Number.isInteger(value) && value > 0;
  const isValidPositive = (value: number | null) => value !== null && Number.isFinite(value) && value > 0;

  const materialCostPerPart =
    isValidNonNegative(kgMaterial) && kgMaterial !== null ? materialPricePerKg * kgMaterial : null;

  const detailsPerPrinterDivisor =
    isValidPositiveInteger(detailsPerPrinter) && detailsPerPrinter !== null ? detailsPerPrinter : null;

  const machineCostPerPart =
    isValidNonNegative(machineHourlyRateEur) &&
    isValidNonNegative(printTimeHours) &&
    isValidPositive(detailsPerPrinterDivisor) &&
    machineHourlyRateEur !== null &&
    printTimeHours !== null &&
    detailsPerPrinterDivisor !== null
      ? (machineHourlyRateEur * printTimeHours) / detailsPerPrinterDivisor
      : null;

  const directCostPerPart =
    materialCostPerPart !== null && machineCostPerPart !== null
      ? materialCostPerPart + machineCostPerPart
      : null;

  const internalCostPerPart = directCostPerPart;

  const batchInternalCost =
    internalCostPerPart !== null && isValidPositiveInteger(quantity) && quantity !== null
      ? internalCostPerPart * quantity
      : null;

  const totalParallelCapacity =
    isValidPositiveInteger(printerCount) &&
    isValidPositiveInteger(detailsPerPrinter) &&
    printerCount !== null &&
    detailsPerPrinter !== null
      ? printerCount * detailsPerPrinter
      : null;

  const leadTimeMinutes =
    isValidNonNegative(setupTimeMinutes) &&
    isValidNonNegative(printTimeMinutes) &&
    isValidPositiveInteger(quantity) &&
    isValidPositiveInteger(printerCount) &&
    isValidPositiveInteger(detailsPerPrinter) &&
    setupTimeMinutes !== null &&
    printTimeMinutes !== null &&
    quantity !== null &&
    totalParallelCapacity !== null
      ? setupTimeMinutes + (printTimeMinutes * quantity) / totalParallelCapacity
      : null;

  return {
    materialCostPerPart,
    machineCostPerPart,
    internalCostPerPart,
    batchInternalCost,
    leadTimeMinutes,
  };
}

interface ResultCardProps {
  label: string;
  value: string;
  emphasis?: 'default' | 'success' | 'accent';
}

function ResultCard({ label, value, emphasis = 'default' }: ResultCardProps) {
  const styleByEmphasis = {
    default: 'border-[var(--border)] bg-white text-[var(--ink)]',
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
      printTimeMinutesInput: current.savedPrintTimeMinutesInput,
      quantityInput: current.savedQuantityInput,
      detailsPerPrinterInput: current.savedDetailsPerPrinterInput,
      machineHourlyRateEurInput: current.savedMachineHourlyRateEurInput,
      setupTimeMinutesInput: current.savedSetupTimeMinutesInput,
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
        detailsPerPrinter: 1,
        machineHourlyRateEur: 0,
        laborCostPerPartEur: 0,
        postProcessCostPerPartEur: DEFAULT_POST_PROCESS_COST_PER_PART_EUR,
        setupTimeHours: 0,
        postProcessTimeHoursPerPart: DEFAULT_POST_PROCESS_TIME_HOURS_PER_PART,
        riskBufferPercent: DEFAULT_RISK_BUFFER_PERCENT,
        targetMarginPercent: DEFAULT_TARGET_MARGIN_PERCENT,
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
      parsed.printTimeMinutes === null ||
      Number.isNaN(parsed.printTimeMinutes) ||
      parsed.printTimeMinutes < 0
    ) {
      invalid('Ange printtid i minuter som 0 eller högre.');
      return;
    }

    if (
      parsed.printTimeHours === null ||
      Number.isNaN(parsed.printTimeHours) ||
      parsed.printTimeHours < 0
    ) {
      invalid('Ange printtid i minuter som 0 eller högre.');
      return;
    }

    if (
      parsed.quantity === null ||
      Number.isNaN(parsed.quantity) ||
      !Number.isInteger(parsed.quantity) ||
      parsed.quantity <= 0
    ) {
      invalid('Antal detaljer måste vara ett heltal större än 0.');
      return;
    }

    if (
      parsed.detailsPerPrinter === null ||
      Number.isNaN(parsed.detailsPerPrinter) ||
      !Number.isInteger(parsed.detailsPerPrinter) ||
      parsed.detailsPerPrinter <= 0
    ) {
      invalid('Antal detaljer per skrivare måste vara ett heltal större än 0.');
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
      [parsed.setupTimeMinutes, 'Uppstartstid i minuter måste vara 0 eller högre.'],
    ];

    for (const [value, message] of nonNegativeChecks) {
      if (value === null || Number.isNaN(value) || value < 0) {
        invalid(message);
        return;
      }
    }

    updateDraft(draft.id, (current) => ({ ...current, saving: true, error: null }));

    try {
      const updated = await updateMaterialCalculation(draft.id, {
        label,
        kgMaterial: parsed.kgMaterial,
        printTimeHours: parsed.printTimeHours,
        quantity: parsed.quantity,
        detailsPerPrinter: parsed.detailsPerPrinter,
        machineHourlyRateEur: parsed.machineHourlyRateEur ?? 0,
        laborCostPerPartEur: 0,
        postProcessCostPerPartEur: DEFAULT_POST_PROCESS_COST_PER_PART_EUR,
        setupTimeHours: parsed.setupTimeHours ?? 0,
        postProcessTimeHoursPerPart: DEFAULT_POST_PROCESS_TIME_HOURS_PER_PART,
        riskBufferPercent: DEFAULT_RISK_BUFFER_PERCENT,
        targetMarginPercent: DEFAULT_TARGET_MARGIN_PERCENT,
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

  const exportCalculation = async (
    draft: CalculationDraft,
    title: string,
    parsedValues: ParsedDraftValues,
    metrics: CalculationMetrics,
  ) => {
    updateDraft(draft.id, (current) => ({ ...current, error: null }));

    try {
      await exportQuotePdf({
        material,
        calculationLabel: title,
        inputs: {
          kgPerDetail: parsedValues.kgMaterial,
          quantity: parsedValues.quantity,
          printTimeMinutesPerDetail: parsedValues.printTimeMinutes,
          setupTimeMinutes: parsedValues.setupTimeMinutes,
          printerCount: parsedValues.printerCount,
          detailsPerPrinter: parsedValues.detailsPerPrinter,
          machineHourlyRateEur: parsedValues.machineHourlyRateEur,
        },
        results: {
          materialCostPerPart: metrics.materialCostPerPart,
          machineCostPerPart: metrics.machineCostPerPart,
          internalCostPerPart: metrics.internalCostPerPart,
          batchInternalCost: metrics.batchInternalCost,
          leadTimeMinutes: metrics.leadTimeMinutes,
        },
      });
    } catch (caughtError) {
      updateDraft(draft.id, (current) => ({
        ...current,
        error:
          caughtError instanceof Error
            ? caughtError.message
            : 'Det gick inte att exportera självkostnadskalkyl som PDF.',
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
                label="Självkostnad/st"
                value={formatMetricCurrency(metrics.internalCostPerPart)}
              />
              <ResultCard label="Totalkostnad" value={formatMetricCurrency(metrics.batchInternalCost)} />
              <ResultCard label="Leveranstid" value={formatLeadTime(metrics.leadTimeMinutes)} />
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

    const quantity = parsedValues.quantity ?? 0;
    const materialCostTotal =
      metrics.materialCostPerPart !== null && quantity > 0
        ? metrics.materialCostPerPart * quantity
        : null;
    const machineCostTotal =
      metrics.machineCostPerPart !== null && quantity > 0
        ? metrics.machineCostPerPart * quantity
        : null;
    const totalParallelCapacity =
      parsedValues.printerCount !== null &&
      parsedValues.detailsPerPrinter !== null &&
      parsedValues.printerCount > 0 &&
      parsedValues.detailsPerPrinter > 0
        ? parsedValues.printerCount * parsedValues.detailsPerPrinter
        : null;

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-[var(--ink)]">{title}</p>
            <p className="text-xs text-[var(--muted)]">Sparad kalkyl. Klicka på redigera för ändringar.</p>
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
              onClick={() => void exportCalculation(draft, title, parsedValues, metrics)}
              disabled={draft.deleting}
              className="rounded-full border border-[var(--accent)] bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Exportera PDF
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

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Beräkningsunderlag</p>
            <div className="space-y-2 text-xs">
              <div className="space-y-1 rounded-lg border border-[var(--border)] bg-white p-2">
                <p className="font-semibold uppercase tracking-wide text-[var(--muted)]">Material</p>
                <p className="text-[var(--ink)]">Antal detaljer: {formatNumber(parsedValues.quantity, 0)} st</p>
                <p className="text-[var(--ink)]">Kg/detalj: {formatNumber(parsedValues.kgMaterial, 3)} kg</p>
                <p className="text-[var(--ink)]">Materialkostnad/st: {formatMetricCurrency(metrics.materialCostPerPart)}</p>
                <p className="text-[var(--ink)]">Materialkostnad totalt: {formatMetricCurrency(materialCostTotal)}</p>
              </div>
              <div className="space-y-1 rounded-lg border border-[var(--border)] bg-white p-2">
                <p className="font-semibold uppercase tracking-wide text-[var(--muted)]">Tid</p>
                <p className="text-[var(--ink)]">Printtid/st (min): {formatMinutesWithUnit(parsedValues.printTimeMinutes)}</p>
                <p className="text-[var(--ink)]">Uppstartstid (min): {formatMinutesWithUnit(parsedValues.setupTimeMinutes)}</p>
                <p className="text-[var(--ink)]">Total produktionstid: {formatLeadTime(metrics.leadTimeMinutes)}</p>
              </div>
              <div className="space-y-1 rounded-lg border border-[var(--border)] bg-white p-2">
                <p className="font-semibold uppercase tracking-wide text-[var(--muted)]">Resurser och kostnad</p>
                <p className="text-[var(--ink)]">Antal skrivare: {formatNumber(parsedValues.printerCount, 0)}</p>
                <p className="text-[var(--ink)]">Antal detaljer/skrivare: {formatNumber(parsedValues.detailsPerPrinter, 0)}</p>
                <p className="text-[var(--ink)]">Parallell kapacitet: {formatNumber(totalParallelCapacity, 0)} detaljer/körning</p>
                <p className="text-[var(--ink)]">Maskinkostnad/st: {formatMetricCurrency(metrics.machineCostPerPart)}</p>
                <p className="text-[var(--ink)]">Maskinkostnad totalt: {formatMetricCurrency(machineCostTotal)}</p>
                <p className="text-[var(--ink)]">Självkostnad/st: {formatMetricCurrency(metrics.internalCostPerPart)}</p>
                <p className="text-[var(--ink)]">Totalkostnad: {formatMetricCurrency(metrics.batchInternalCost)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-teal-300 bg-teal-50 p-3">
            <p className="text-sm font-semibold text-teal-800">Kostnadsöversikt</p>
            <div className="space-y-2">
              <ResultCard label="Självkostnad/st" value={formatMetricCurrency(metrics.internalCostPerPart)} />
              <ResultCard label="Totalkostnad" value={formatMetricCurrency(metrics.batchInternalCost)} />
              <ResultCard label="Antal detaljer" value={`${formatNumber(parsedValues.quantity, 0)} st`} />
              <ResultCard label="Leveranstid" value={formatLeadTime(metrics.leadTimeMinutes)} />
            </div>
          </div>
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
            Skapa scenarier för internkostnad, batch och ledtid.
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
            Lägg till en kalkyl för att räkna internkostnad och leveranstid.
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


