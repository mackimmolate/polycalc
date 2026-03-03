import { Link } from 'react-router-dom';
import { getCategoryLabel } from '@/features/materials/utils/materialLabels';
import type { Material } from '@/types/material';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/utils/cn';

interface MaterialListProps {
  materials: Material[];
}

const rowGridClass =
  'grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,2.1fr)]';

function formatTemperature(value: number | null) {
  return value === null ? 'Ej angivet' : `${value} °C`;
}

interface RowFieldProps {
  label: string;
  value: string;
  className?: string;
  valueClassName?: string;
}

function RowField({ label, value, className, valueClassName }: RowFieldProps) {
  return (
    <div className={cn('space-y-0.5', className)}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)] lg:hidden">
        {label}
      </p>
      <p className={cn('text-sm text-[var(--ink)]', valueClassName)}>{value}</p>
    </div>
  );
}

export function MaterialList({ materials }: MaterialListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_10px_26px_-24px_rgba(15,23,42,0.45)]">
      <div
        className={cn(
          'hidden border-b border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 lg:grid',
          rowGridClass,
        )}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
          Material
        </p>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
          Tillverkare
        </p>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
          Kategori
        </p>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
          Pris/kg
        </p>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
          Maxtemp
        </p>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
          Anteckning
        </p>
      </div>

      <ul className="divide-y divide-[var(--border)]">
        {materials.map((material) => (
          <li key={material.id}>
            <Link
              to={`/materials/${material.id}`}
              className={cn(
                'block px-4 py-3 transition hover:bg-[var(--surface-soft)] lg:py-2.5',
                rowGridClass,
              )}
            >
              <RowField label="Material" value={material.name} valueClassName="font-semibold" />
              <RowField label="Tillverkare" value={material.manufacturer ?? 'Ej angiven'} />
              <RowField
                label="Kategori"
                value={getCategoryLabel(material.category)}
                valueClassName="font-medium"
              />
              <RowField
                label="Pris/kg"
                value={formatCurrency(material.pricePerKg)}
                valueClassName="tabular-nums"
              />
              <RowField
                label="Maxtemp"
                value={formatTemperature(material.maxTemperature)}
                valueClassName="tabular-nums"
              />
              <RowField
                label="Anteckning"
                value={material.notes || 'Inga anteckningar'}
                valueClassName="line-clamp-1 text-[var(--muted)]"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
