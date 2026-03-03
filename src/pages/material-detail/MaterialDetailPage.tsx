import { Link, useParams } from 'react-router-dom';
import { PageHeading } from '@/components/ui/PageHeading';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { materialPreviewData } from '@/features/materials/data/materialPreviewData';
import { getCategoryLabel } from '@/features/materials/utils/materialLabels';
import { formatCurrency, formatDate } from '@/utils/formatters';

export function MaterialDetailPage() {
  const { materialId } = useParams();
  const material = materialPreviewData.find((entry) => entry.id === materialId);

  if (!material) {
    return (
      <SurfaceCard>
        <p className="text-lg font-semibold text-[var(--ink)]">Materialet hittades inte</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Material-id:t finns inte i det aktuella förhandsdatasetet.
        </p>
        <Link
          to="/materials"
          className="mt-4 inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-soft)]"
        >
          Till material
        </Link>
      </SurfaceCard>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title={material.name}
        description={material.notes || 'Inga anteckningar ännu.'}
        actions={
          <div className="flex items-center gap-2">
            <Link
              to={`/materials/${material.id}/edit`}
              className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-soft)]"
            >
              Redigera
            </Link>
            <button
              type="button"
              className="rounded-full border border-amber-400 bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800"
            >
              Arkivera (Fas 2)
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
            Kategori
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
            {getCategoryLabel(material.category)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Pris per kg
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
            {formatCurrency(material.pricePerKg)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Maxtemperatur
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
            {material.maxTemperature ? `${material.maxTemperature} °C` : 'Ej angivet'}
          </p>
        </div>
      </SurfaceCard>

      <SurfaceCard className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Namn</p>
          <p className="mt-2 text-sm font-semibold text-[var(--ink)]">{material.name}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Tillverkare
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
            {material.manufacturer ?? 'Ej angivet'}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Skapad
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
            {formatDate(material.createdAt)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Uppdaterad
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
            {formatDate(material.updatedAt)}
          </p>
        </div>
      </SurfaceCard>
    </div>
  );
}
