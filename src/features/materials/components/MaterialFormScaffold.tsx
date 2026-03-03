import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import type { Material, MaterialCategory, MaterialStatus } from '@/types/material';

interface MaterialFormScaffoldProps {
  mode: 'create' | 'edit';
  initialMaterial?: Material;
}

interface MaterialFormState {
  name: string;
  displayName: string;
  category: MaterialCategory;
  manufacturer: string;
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
    displayName: material?.displayName ?? '',
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
        ? 'Create flow wiring to Supabase is scheduled for Phase 2.'
        : 'Update flow wiring to Supabase is scheduled for Phase 2.',
    );
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <SurfaceCard className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-[var(--ink)]">Internal name</span>
          <input
            required
            value={formState.name}
            onChange={(event) =>
              setFormState((current) => ({ ...current, name: event.target.value }))
            }
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
            placeholder="example-pla-black"
          />
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-semibold text-[var(--ink)]">Display name</span>
          <input
            required
            value={formState.displayName}
            onChange={(event) =>
              setFormState((current) => ({ ...current, displayName: event.target.value }))
            }
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
            placeholder="SUNLU PLA+ Black"
          />
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-semibold text-[var(--ink)]">Category</span>
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
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-semibold text-[var(--ink)]">Manufacturer / brand</span>
          <input
            value={formState.manufacturer}
            onChange={(event) =>
              setFormState((current) => ({ ...current, manufacturer: event.target.value }))
            }
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
            placeholder="SUNLU"
          />
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-semibold text-[var(--ink)]">Price per kg (USD)</span>
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
          <span className="font-semibold text-[var(--ink)]">Max temperature (C)</span>
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
          <span className="font-semibold text-[var(--ink)]">Notes</span>
          <textarea
            value={formState.notes}
            onChange={(event) =>
              setFormState((current) => ({ ...current, notes: event.target.value }))
            }
            className="min-h-24 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
            placeholder="Printing profile notes, drying requirements, or usage context..."
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
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </label>
        ) : null}
      </SurfaceCard>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--muted)]">
          Validation and persistence are intentionally deferred to Phase 2.
        </p>
        <div className="flex items-center gap-2">
          <Link
            to="/materials"
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-soft)]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="rounded-full border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            {mode === 'create' ? 'Save Material' : 'Update Material'}
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
