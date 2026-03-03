import { Link, useParams } from 'react-router-dom';
import { PageHeading } from '@/components/ui/PageHeading';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { MaterialFormScaffold } from '@/features/materials/components/MaterialFormScaffold';
import { materialPreviewData } from '@/features/materials/data/materialPreviewData';

export function EditMaterialPage() {
  const { materialId } = useParams();
  const material = materialPreviewData.find((entry) => entry.id === materialId);

  if (!material) {
    return (
      <SurfaceCard>
        <p className="text-lg font-semibold text-[var(--ink)]">Material not found</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          The selected material is not available in this preview dataset.
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
        title={`Edit ${material.displayName}`}
        description="Refine metadata and status. Save behavior is intentionally deferred until Supabase wiring in Phase 2."
      />
      <MaterialFormScaffold mode="edit" initialMaterial={material} />
    </div>
  );
}
