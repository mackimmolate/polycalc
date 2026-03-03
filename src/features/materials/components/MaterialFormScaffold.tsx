import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { getCategoryLabel } from '@/features/materials/utils/materialLabels';
import {
  type MaterialFormErrors,
  type MaterialFormValues,
  validateMaterialForm,
} from '@/features/materials/utils/materialValidation';
import type { Material, MaterialCategory, MaterialMutationInput } from '@/types/material';
import { manufacturerOptions, type Manufacturer } from '@/types/manufacturer';
import { formatDurationSeconds } from '@/utils/duration';

interface MaterialFormScaffoldProps {
  mode: 'create' | 'edit';
  initialMaterial?: Material;
  submitting?: boolean;
  serverError?: string | null;
  onSubmit: (input: MaterialMutationInput) => Promise<void>;
}

const categoryOptions: MaterialCategory[] = [
  'PLA',
  'PETG',
  'ABS',
  'Nylon',
  'TPU',
  'Resin',
  'Other',
];

function toFormValues(material?: Material): MaterialFormValues {
  return {
    name: material?.name ?? '',
    category: material?.category ?? 'PLA',
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

  const parsedLayerDuration = useMemo(() => {
    const numeric = Number(formValues.timePerLayer45DegSeconds.replace(',', '.'));
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return 'Ange tid i sekunder';
    }

    return formatDurationSeconds(Math.round(numeric));
  }, [formValues.timePerLayer45DegSeconds]);

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
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {getCategoryLabel(category)}
              </option>
            ))}
          </select>
        </label>

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
            {manufacturerOptions.map((manufacturer) => (
              <option key={manufacturer} value={manufacturer}>
                {manufacturer}
              </option>
            ))}
          </select>
          <FieldError error={fieldErrors.manufacturer} />
        </label>

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
