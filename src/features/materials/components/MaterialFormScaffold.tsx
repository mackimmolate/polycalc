import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { getCategoryLabel } from '@/features/materials/utils/materialLabels';
import type { Material, MaterialCategory, MaterialStatus } from '@/types/material';
import { manufacturerOptions, type Manufacturer } from '@/types/manufacturer';

interface MaterialFormScaffoldProps {
  mode: 'create' | 'edit';
  initialMaterial?: Material;
}

interface MaterialFormState {
  name: string;
  category: MaterialCategory;
  manufacturer: Manufacturer | '';
  pricePerKg: string;
  maxTemperature: string;
  notes: string;
  status: MaterialStatus;
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

function toFormState(material?: Material): MaterialFormState {
  return {
    name: material?.name ?? '',
    category: material?.category ?? 'PLA',
    manufacturer: material?.manufacturer ?? '',
    pricePerKg: material?.pricePerKg?.toString() ?? '',
    maxTemperature: material?.maxTemperature?.toString() ?? '',
    notes: material?.notes ?? '',
    status: material?.status ?? 'active',
  };
}

export function MaterialFormScaffold({ mode, initialMaterial }: MaterialFormScaffoldProps) {
  const [formState, setFormState] = useState<MaterialFormState>(() => toFormState(initialMaterial));
  const [message, setMessage] = useState('');

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(
      mode === 'create'
        ? 'Skapaflödet kopplas till Supabase i Fas 2.'
        : 'Uppdateringsflödet kopplas till Supabase i Fas 2.',
    );
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <SurfaceCard className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-[var(--ink)]">Materialnamn</span>
          <input
            required
            value={formState.name}
            onChange={(event) =>
              setFormState((current) => ({ ...current, name: event.target.value }))
            }
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
            placeholder="SUNLU PLA+ Svart"
          />
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-semibold text-[var(--ink)]">Kategori</span>
          <select
            value={formState.category}
            onChange={(event) =>
              setFormState((current) => ({
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
            value={formState.manufacturer}
            onChange={(event) =>
              setFormState((current) => ({
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
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-semibold text-[var(--ink)]">Pris per kg (USD)</span>
          <input
            value={formState.pricePerKg}
            onChange={(event) =>
              setFormState((current) => ({ ...current, pricePerKg: event.target.value }))
            }
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
            placeholder="24.50"
          />
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-semibold text-[var(--ink)]">Maxtemperatur (°C)</span>
          <input
            value={formState.maxTemperature}
            onChange={(event) =>
              setFormState((current) => ({ ...current, maxTemperature: event.target.value }))
            }
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
            placeholder="240"
          />
        </label>

        <label className="space-y-1 text-sm md:col-span-2">
          <span className="font-semibold text-[var(--ink)]">Anteckningar</span>
          <textarea
            value={formState.notes}
            onChange={(event) =>
              setFormState((current) => ({ ...current, notes: event.target.value }))
            }
            className="min-h-24 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
            placeholder="Skriv utprofiler, torkkrav eller användningsområde..."
          />
        </label>

        {mode === 'edit' ? (
          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-semibold text-[var(--ink)]">Status</span>
            <select
              value={formState.status}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  status: event.target.value as MaterialStatus,
                }))
              }
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
            >
              <option value="active">Aktiv</option>
              <option value="archived">Arkiverad</option>
            </select>
          </label>
        ) : null}
      </SurfaceCard>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--muted)]">
          Validering och lagring är avsiktligt uppskjutet till Fas 2.
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
            className="rounded-full border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            {mode === 'create' ? 'Spara material' : 'Uppdatera material'}
          </button>
        </div>
      </div>

      {message ? (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
          {message}
        </p>
      ) : null}
    </form>
  );
}
