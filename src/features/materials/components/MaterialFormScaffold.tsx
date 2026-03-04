import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { getCategoryLabel } from '@/features/materials/utils/materialLabels';
import {
  type MaterialFormErrors,
  type MaterialFormValues,
  validateMaterialForm,
} from '@/features/materials/utils/materialValidation';
import { manufacturerOptions, type Manufacturer } from '@/types/manufacturer';
import {
  defaultMaterialCategoryOptions,
  type Material,
  type MaterialCategory,
  type MaterialMutationInput,
} from '@/types/material';
import { formatDurationSeconds } from '@/utils/duration';

interface MaterialFormScaffoldProps {
  mode: 'create' | 'edit';
  initialMaterial?: Material;
  submitting?: boolean;
  serverError?: string | null;
  onSubmit: (input: MaterialMutationInput) => Promise<void>;
}

function normalizeOptionValue(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function mergeUniqueOptions(options: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  options.forEach((option) => {
    const normalized = normalizeOptionValue(option);
    if (normalized.length === 0) {
      return;
    }

    const key = normalized.toLocaleLowerCase('sv-SE');
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    result.push(normalized);
  });

  return result;
}

function resolveExistingOption(options: string[], rawValue: string) {
  const normalized = normalizeOptionValue(rawValue);
  const key = normalized.toLocaleLowerCase('sv-SE');
  const existing = options.find((option) => option.toLocaleLowerCase('sv-SE') === key);

  return existing ?? normalized;
}

function toFormValues(material?: Material): MaterialFormValues {
  return {
    name: material?.name ?? '',
    category: material?.category ?? defaultMaterialCategoryOptions[0],
    manufacturer: material?.manufacturer ?? '',
    pricePerKgEur: material ? material.pricePerKgEur.toString() : '',
    maxTemperatureC: material?.maxTemperatureC?.toString() ?? '',
    timePerLayer45DegSeconds: material?.timePerLayer45DegSeconds?.toString() ?? '',
    notes: material?.notes ?? '',
  };
}

function FieldError({ error }: { error?: string }) {
  if (!error) {
    return null;
  }

  return <p className="text-xs font-medium text-red-700">{error}</p>;
}

export function MaterialFormScaffold({
  mode,
  initialMaterial,
  submitting = false,
  serverError,
  onSubmit,
}: MaterialFormScaffoldProps) {
  const [formValues, setFormValues] = useState<MaterialFormValues>(() =>
    toFormValues(initialMaterial),
  );
  const [fieldErrors, setFieldErrors] = useState<MaterialFormErrors>({});

  const [customManufacturers, setCustomManufacturers] = useState<string[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  const [showAddManufacturer, setShowAddManufacturer] = useState(false);
  const [manufacturerDraft, setManufacturerDraft] = useState('');
  const [manufacturerDraftError, setManufacturerDraftError] = useState<string | null>(null);

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState('');
  const [categoryDraftError, setCategoryDraftError] = useState<string | null>(null);

  const parsedLayerDuration = useMemo(() => {
    const numeric = Number(formValues.timePerLayer45DegSeconds.replace(',', '.'));
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return 'Ange tid i sekunder';
    }

    return formatDurationSeconds(Math.round(numeric));
  }, [formValues.timePerLayer45DegSeconds]);

  const manufacturerSelectOptions = useMemo(
    () =>
      mergeUniqueOptions([...manufacturerOptions, ...customManufacturers, formValues.manufacturer]),
    [customManufacturers, formValues.manufacturer],
  );

  const categorySelectOptions = useMemo(
    () =>
      mergeUniqueOptions([
        ...defaultMaterialCategoryOptions,
        ...customCategories,
        formValues.category,
      ]),
    [customCategories, formValues.category],
  );

  const addManufacturer = () => {
    const normalized = normalizeOptionValue(manufacturerDraft);
    if (normalized.length < 2) {
      setManufacturerDraftError('Ange minst 2 tecken för tillverkare.');
      return;
    }

    const resolved = resolveExistingOption(manufacturerSelectOptions, normalized);
    if (!manufacturerSelectOptions.includes(resolved)) {
      setCustomManufacturers((current) => mergeUniqueOptions([...current, resolved]));
    }

    setFormValues((current) => ({ ...current, manufacturer: resolved as Manufacturer }));
    setFieldErrors((current) => ({ ...current, manufacturer: undefined }));
    setManufacturerDraft('');
    setManufacturerDraftError(null);
    setShowAddManufacturer(false);
  };

  const addCategory = () => {
    const normalized = normalizeOptionValue(categoryDraft);
    if (normalized.length < 2) {
      setCategoryDraftError('Ange minst 2 tecken för kategori.');
      return;
    }

    const resolved = resolveExistingOption(categorySelectOptions, normalized);
    if (!categorySelectOptions.includes(resolved)) {
      setCustomCategories((current) => mergeUniqueOptions([...current, resolved]));
    }

    setFormValues((current) => ({ ...current, category: resolved as MaterialCategory }));
    setFieldErrors((current) => ({ ...current, category: undefined }));
    setCategoryDraft('');
    setCategoryDraftError(null);
    setShowAddCategory(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { input, errors } = validateMaterialForm(formValues);
    setFieldErrors(errors);

    if (!input) {
      return;
    }

    await onSubmit(input);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <SurfaceCard className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-[var(--ink)]">Materialnamn</span>
          <input
            required
            value={formValues.name}
            onChange={(event) =>
              setFormValues((current) => ({ ...current, name: event.target.value }))
            }
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
            placeholder="SUNLU PLA+ Svart"
          />
          <FieldError error={fieldErrors.name} />
        </label>

        <div className="space-y-1 text-sm">
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-[var(--ink)]">Kategori</span>
            <select
              value={formValues.category}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  category: event.target.value as MaterialCategory,
                }))
              }
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
            >
              {categorySelectOptions.map((category) => (
                <option key={category} value={category}>
                  {getCategoryLabel(category)}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => {
              setShowAddCategory((current) => !current);
              setCategoryDraftError(null);
            }}
            className="text-xs font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
          >
            + Lägg till ny kategori
          </button>

          {showAddCategory ? (
            <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
              <input
                value={categoryDraft}
                onChange={(event) => {
                  setCategoryDraft(event.target.value);
                  setCategoryDraftError(null);
                }}
                className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
                placeholder="t.ex. PC Blend"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={addCategory}
                  className="rounded-full border border-[var(--accent)] bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-700"
                >
                  Lägg till
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCategory(false);
                    setCategoryDraft('');
                    setCategoryDraftError(null);
                  }}
                  className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink)] transition hover:bg-[var(--surface)]"
                >
                  Avbryt
                </button>
              </div>
              {categoryDraftError ? (
                <p className="text-xs font-medium text-red-700">{categoryDraftError}</p>
              ) : null}
            </div>
          ) : null}

          <FieldError error={fieldErrors.category} />
        </div>

        <div className="space-y-1 text-sm">
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-[var(--ink)]">Tillverkare</span>
            <select
              value={formValues.manufacturer}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  manufacturer: event.target.value as Manufacturer | '',
                }))
              }
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
            >
              <option value="">Välj tillverkare</option>
              {manufacturerSelectOptions.map((manufacturer) => (
                <option key={manufacturer} value={manufacturer}>
                  {manufacturer}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => {
              setShowAddManufacturer((current) => !current);
              setManufacturerDraftError(null);
            }}
            className="text-xs font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
          >
            + Lägg till ny tillverkare
          </button>

          {showAddManufacturer ? (
            <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
              <input
                value={manufacturerDraft}
                onChange={(event) => {
                  setManufacturerDraft(event.target.value);
                  setManufacturerDraftError(null);
                }}
                className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
                placeholder="t.ex. FormFutura"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={addManufacturer}
                  className="rounded-full border border-[var(--accent)] bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-700"
                >
                  Lägg till
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddManufacturer(false);
                    setManufacturerDraft('');
                    setManufacturerDraftError(null);
                  }}
                  className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink)] transition hover:bg-[var(--surface)]"
                >
                  Avbryt
                </button>
              </div>
              {manufacturerDraftError ? (
                <p className="text-xs font-medium text-red-700">{manufacturerDraftError}</p>
              ) : null}
            </div>
          ) : null}

          <FieldError error={fieldErrors.manufacturer} />
        </div>

        <label className="space-y-1 text-sm">
          <span className="font-semibold text-[var(--ink)]">Pris per kg (EUR)</span>
          <input
            required
            inputMode="decimal"
            value={formValues.pricePerKgEur}
            onChange={(event) =>
              setFormValues((current) => ({ ...current, pricePerKgEur: event.target.value }))
            }
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
            placeholder="24,50"
          />
          <FieldError error={fieldErrors.pricePerKgEur} />
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-semibold text-[var(--ink)]">Maxtemperatur (°C)</span>
          <input
            inputMode="numeric"
            value={formValues.maxTemperatureC}
            onChange={(event) =>
              setFormValues((current) => ({ ...current, maxTemperatureC: event.target.value }))
            }
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
            placeholder="260"
          />
          <FieldError error={fieldErrors.maxTemperatureC} />
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-semibold text-[var(--ink)]">Tid per lager vid 45° (sekunder)</span>
          <input
            required
            inputMode="numeric"
            value={formValues.timePerLayer45DegSeconds}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                timePerLayer45DegSeconds: event.target.value,
              }))
            }
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
            placeholder="75"
          />
          <p className="text-xs text-[var(--muted)]">Visas som {parsedLayerDuration}</p>
          <FieldError error={fieldErrors.timePerLayer45DegSeconds} />
        </label>

        <label className="space-y-1 text-sm md:col-span-2">
          <span className="font-semibold text-[var(--ink)]">Anteckningar</span>
          <textarea
            value={formValues.notes}
            onChange={(event) =>
              setFormValues((current) => ({ ...current, notes: event.target.value }))
            }
            className="min-h-24 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
            placeholder="Skriv utprofiler, torkkrav eller användningsområde..."
          />
          <FieldError error={fieldErrors.notes} />
        </label>
      </SurfaceCard>

      {serverError ? (
        <SurfaceCard>
          <p className="text-sm font-semibold text-red-700">Det gick inte att spara materialet.</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{serverError}</p>
        </SurfaceCard>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--muted)]">
          {mode === 'create'
            ? 'Materialet sparas direkt i Supabase när formuläret skickas.'
            : 'Ändringar sparas direkt i Supabase när formuläret skickas.'}
        </p>
        <div className="flex items-center gap-2">
          <Link
            to="/materials"
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-soft)]"
          >
            Avbryt
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Sparar...' : mode === 'create' ? 'Spara material' : 'Uppdatera material'}
          </button>
        </div>
      </div>
    </form>
  );
}
