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
        <p className="text-lg font-semibold text-[var(--ink)]">Materialet hittades inte</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Det valda materialet finns inte i förhandsdatasetet.
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
        title={`Redigera ${material.name}`}
        description="Justera metadata och status. Spara-beteendet är avsiktligt uppskjutet tills Supabase-kopplingen i Fas 2."
      />
      <MaterialFormScaffold mode="edit" initialMaterial={material} />
    </div>
  );
}
