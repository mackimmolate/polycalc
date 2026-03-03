import { Link, useParams } from 'react-router-dom';
import { PageHeading } from '@/components/ui/PageHeading';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { materialPreviewData } from '@/features/materials/data/materialPreviewData';
import { formatCurrency, formatDate } from '@/utils/formatters';

export function MaterialDetailPage() {
  const { materialId } = useParams();
  const material = materialPreviewData.find((entry) => entry.id === materialId);

  if (!material) {
    return (
      <SurfaceCard>
        <p className="text-lg font-semibold text-[var(--ink)]">Material not found</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          The material id does not exist in the current preview dataset.
        </p>
        <Link
          to="/materials"
          className="mt-4 inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-soft)]"
        >
          Back to materials
        </Link>
      </SurfaceCard>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title={material.displayName}
        description={material.notes || 'No notes added yet.'}
        actions={
          <div className="flex items-center gap-2">
            <Link
              to={`/materials/${material.id}/edit`}
              className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-soft)]"
            >
              Edit
            </Link>
            <button
              type="button"
              className="rounded-full border border-amber-400 bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800"
            >
              Archive (Phase 2)
            </button>
          </div>
        }
      />

      <SurfaceCard className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Status
          </p>
          <div className="mt-2">
            <StatusBadge status={material.status} />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Category
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--ink)]">{material.category}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Price per kg
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
            {formatCurrency(material.pricePerKg)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Max temperature
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
            {material.maxTemperature ? `${material.maxTemperature} C` : 'Not set'}
          </p>
        </div>
      </SurfaceCard>

      <SurfaceCard className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Internal name
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--ink)]">{material.name}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Manufacturer
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
            {material.manufacturer ?? 'Not set'}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Created
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
            {formatDate(material.createdAt)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Updated
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
            {formatDate(material.updatedAt)}
          </p>
        </div>
      </SurfaceCard>
    </div>
  );
}
