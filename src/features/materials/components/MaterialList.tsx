import { Link } from 'react-router-dom';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { getCategoryLabel } from '@/features/materials/utils/materialLabels';
import type { Material } from '@/types/material';
import { formatCurrency } from '@/utils/formatters';

interface MaterialListProps {
  materials: Material[];
}

function formatTemperature(value: number | null) {
  return value === null ? 'Ej angivet' : `${value} °C`;
}

export function MaterialList({ materials }: MaterialListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {materials.map((material) => (
        <Link key={material.id} to={`/materials/${material.id}`} className="group">
          <SurfaceCard className="h-full p-5 transition group-hover:-translate-y-0.5 group-hover:border-[var(--accent)] group-hover:shadow-[0_16px_40px_-28px_rgba(15,118,110,0.45)]">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Materialnamn
                  </p>
                  <p className="mt-1 text-base font-semibold text-[var(--ink)]">{material.name}</p>
                </div>
                <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                  {getCategoryLabel(material.category)}
                </span>
              </div>

              <dl className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Tillverkare
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-[var(--ink)]">
                    {material.manufacturer ?? 'Ej angiven'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Pris per kg
                  </dt>
                  <dd className="mt-1 text-sm font-medium tabular-nums text-[var(--ink)]">
                    {formatCurrency(material.pricePerKg)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Maxtemperatur
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-[var(--ink)]">
                    {formatTemperature(material.maxTemperature)}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Anteckningar
                  </dt>
                  <dd className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                    {material.notes || 'Inga anteckningar'}
                  </dd>
                </div>
              </dl>
            </div>
          </SurfaceCard>
        </Link>
      ))}
    </div>
  );
}
