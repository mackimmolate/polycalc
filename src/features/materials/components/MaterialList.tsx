import { Link } from 'react-router-dom';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Material } from '@/types/material';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface MaterialListProps {
  materials: Material[];
}

export function MaterialList({ materials }: MaterialListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_12px_32px_-24px_rgba(15,23,42,0.45)]">
      <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-[var(--border)] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)] md:grid">
        <span>Material</span>
        <span>Category</span>
        <span>Price / Kg</span>
        <span>Updated</span>
        <span>Status</span>
      </div>

      <ul className="divide-y divide-[var(--border)]">
        {materials.map((material) => (
          <li key={material.id}>
            <Link
              to={`/materials/${material.id}`}
              className="grid gap-3 px-5 py-4 transition hover:bg-[var(--surface-soft)] md:grid-cols-[2fr_1fr_1fr_1fr_auto] md:items-center"
            >
              <div>
                <p className="font-semibold text-[var(--ink)]">{material.displayName}</p>
                <p className="text-xs text-[var(--muted)]">
                  {material.manufacturer ?? 'Manufacturer not set'}
                </p>
              </div>

              <p className="text-sm text-[var(--ink)]">{material.category}</p>
              <p className="text-sm text-[var(--ink)]">{formatCurrency(material.pricePerKg)}</p>
              <p className="text-sm text-[var(--ink)]">{formatDate(material.updatedAt)}</p>
              <StatusBadge status={material.status} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
