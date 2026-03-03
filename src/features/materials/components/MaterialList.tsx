import { Link } from 'react-router-dom';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getCategoryLabel } from '@/features/materials/utils/materialLabels';
import type { Material } from '@/types/material';
import { cn } from '@/utils/cn';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface MaterialListProps {
  materials: Material[];
}

export function MaterialList({ materials }: MaterialListProps) {
  const columnsClass =
    'md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)]';

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_12px_32px_-24px_rgba(15,23,42,0.45)]">
      <div
        className={cn(
          'hidden gap-4 border-b border-[var(--border)] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)] md:grid',
          columnsClass,
        )}
      >
        <span className="text-left">Material</span>
        <span className="text-left">Kategori</span>
        <span className="text-right">Pris/kg</span>
        <span className="text-right">Uppdaterad</span>
        <span className="pl-2 text-left">Status</span>
      </div>

      <ul className="divide-y divide-[var(--border)]">
        {materials.map((material) => (
          <li key={material.id}>
            <Link
              to={`/materials/${material.id}`}
              className={cn(
                'grid gap-3 px-5 py-4 transition hover:bg-[var(--surface-soft)] md:items-center',
                columnsClass,
              )}
            >
              <div>
                <p className="font-semibold text-[var(--ink)]">{material.displayName}</p>
                <p className="text-xs text-[var(--muted)]">
                  {material.manufacturer ?? 'Ingen tillverkare angiven'}
                </p>
              </div>

              <p className="text-sm text-[var(--ink)]">{getCategoryLabel(material.category)}</p>
              <p className="text-right text-sm tabular-nums text-[var(--ink)]">
                {formatCurrency(material.pricePerKg)}
              </p>
              <p className="text-right text-sm tabular-nums text-[var(--ink)]">
                {formatDate(material.updatedAt)}
              </p>
              <div className="pl-2">
                <StatusBadge status={material.status} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
