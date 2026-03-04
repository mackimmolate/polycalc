import { MaterialExpandedPanel } from '@/features/materials/components/MaterialExpandedPanel';
import { getCategoryLabel } from '@/features/materials/utils/materialLabels';
import type { MaterialSort, MaterialSortField } from '@/features/materials/utils/filterMaterials';
import type { Material } from '@/types/material';
import { cn } from '@/utils/cn';
import { formatDurationSeconds } from '@/utils/duration';
import { formatCurrency } from '@/utils/formatters';

interface MaterialListProps {
  materials: Material[];
  sort: MaterialSort;
  expandedMaterialId: string | null;
  canWrite: boolean;
  onSortChange: (field: MaterialSortField) => void;
  onToggleExpand: (materialId: string) => void;
  onMaterialDeleted: (materialId: string, successMessage: string) => void;
}

const rowGridClass =
  'grid gap-3 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,2.4fr)_auto]';

function formatTemperature(value: number | null) {
  return value === null ? 'Ej angivet' : `${value} °C`;
}

function SortHeader({
  field,
  label,
  sort,
  onSortChange,
}: {
  field: MaterialSortField;
  label: string;
  sort: MaterialSort;
  onSortChange: (field: MaterialSortField) => void;
}) {
  const isActive = sort.field === field;
  const directionIcon = sort.direction === 'asc' ? '▲' : '▼';

  return (
    <button
      type="button"
      onClick={() => onSortChange(field)}
      className={cn(
        'inline-flex items-center gap-1 text-left text-[11px] font-semibold uppercase tracking-wide transition',
        isActive ? 'text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--ink)]',
      )}
    >
      <span>{label}</span>
      <span className={cn('text-[10px]', isActive ? 'opacity-100' : 'opacity-40')}>
        {isActive ? directionIcon : '▲'}
      </span>
    </button>
  );
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

export function MaterialList({
  materials,
  sort,
  expandedMaterialId,
  canWrite,
  onSortChange,
  onToggleExpand,
  onMaterialDeleted,
}: MaterialListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_10px_26px_-24px_rgba(15,23,42,0.45)]">
      <div
        className={cn(
          'hidden border-b border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 lg:grid',
          rowGridClass,
        )}
      >
        <SortHeader field="name" label="Material" sort={sort} onSortChange={onSortChange} />
        <SortHeader
          field="manufacturer"
          label="Tillverkare"
          sort={sort}
          onSortChange={onSortChange}
        />
        <SortHeader field="category" label="Kategori" sort={sort} onSortChange={onSortChange} />
        <SortHeader field="pricePerKgEur" label="Pris/kg" sort={sort} onSortChange={onSortChange} />
        <SortHeader
          field="maxTemperatureC"
          label="Maxtemp"
          sort={sort}
          onSortChange={onSortChange}
        />
        <SortHeader
          field="timePerLayer45DegSeconds"
          label="Tid/lager 45°"
          sort={sort}
          onSortChange={onSortChange}
        />
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
          Anteckning
        </p>
        <p className="text-right text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
          Arbetsyta
        </p>
      </div>

      <ul className="divide-y divide-[var(--border)]">
        {materials.map((material) => {
          const isExpanded = expandedMaterialId === material.id;

          return (
            <li key={material.id}>
              <div
                className={cn(
                  'px-4 py-3 transition hover:bg-[var(--surface-soft)]',
                  rowGridClass,
                  isExpanded ? 'bg-[var(--surface-soft)]' : '',
                )}
              >
                <RowField label="Material" value={material.name} valueClassName="font-semibold" />
                <RowField label="Tillverkare" value={material.manufacturer} />
                <RowField label="Kategori" value={getCategoryLabel(material.category)} />
                <RowField
                  label="Pris/kg"
                  value={formatCurrency(material.pricePerKgEur)}
                  valueClassName="tabular-nums"
                />
                <RowField
                  label="Maxtemp"
                  value={formatTemperature(material.maxTemperatureC)}
                  valueClassName="tabular-nums"
                />
                <RowField
                  label="Tid/lager 45°"
                  value={formatDurationSeconds(material.timePerLayer45DegSeconds)}
                />
                <RowField
                  label="Anteckning"
                  value={material.notes || 'Inga anteckningar'}
                  valueClassName="line-clamp-2 text-[var(--muted)]"
                />

                <div className="flex items-center justify-start lg:justify-end">
                  <button
                    type="button"
                    onClick={() => onToggleExpand(material.id)}
                    aria-expanded={isExpanded}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                      isExpanded
                        ? 'border-[var(--accent)] bg-[var(--accent)] text-white hover:bg-teal-700'
                        : 'border-[var(--border)] bg-white text-[var(--ink)] hover:bg-[var(--surface-soft)]',
                    )}
                  >
                    {isExpanded ? 'Dölj' : 'Öppna'}
                  </button>
                </div>
              </div>

              {isExpanded ? (
                <MaterialExpandedPanel
                  material={material}
                  canWrite={canWrite}
                  onMaterialDeleted={onMaterialDeleted}
                />
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
