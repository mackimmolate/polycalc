import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/app/providers/useAuth';
import { AuthRequiredState } from '@/components/ui/AuthRequiredState';
import { PageHeading } from '@/components/ui/PageHeading';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { MaterialFormScaffold } from '@/features/materials/components/MaterialFormScaffold';
import { getMaterialById, updateMaterial } from '@/services/materials/materialsService';
import type { Material, MaterialMutationInput } from '@/types/material';
import { useNavigate } from 'react-router-dom';

export function EditMaterialPage() {
  const navigate = useNavigate();
  const { materialId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!materialId) {
        setError('Saknar material-id.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const foundMaterial = await getMaterialById(materialId);
        if (isMounted) {
          setMaterial(foundMaterial);
        }
      } catch (caughtError) {
        if (isMounted) {
          setError(
            caughtError instanceof Error ? caughtError.message : 'Det gick inte att läsa material.',
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, [materialId]);

  const onSubmit = async (input: MaterialMutationInput) => {
    if (!materialId) {
      return;
    }

    setSubmitting(true);
    setServerError(null);
    try {
      const updated = await updateMaterial(materialId, input);
      navigate(`/materials/${updated.id}`, {
        replace: true,
        state: { successMessage: 'Materialet uppdaterades.' },
      });
    } catch (caughtError) {
      setServerError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Det gick inte att uppdatera materialet.',
      );
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <SurfaceCard>
        <p className="text-sm text-[var(--muted)]">Läser material...</p>
      </SurfaceCard>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <PageHeading
          title="Redigera material"
          description="Inloggning krävs för att redigera material i databasen."
        />
        <AuthRequiredState />
      </div>
    );
  }

  if (error) {
    return (
      <SurfaceCard>
        <p className="text-sm font-semibold text-red-700">Det gick inte att läsa materialet.</p>
        <p className="mt-1 text-sm text-[var(--muted)]">{error}</p>
      </SurfaceCard>
    );
  }

  if (!material) {
    return (
      <SurfaceCard>
        <p className="text-lg font-semibold text-[var(--ink)]">Materialet hittades inte</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Det valda materialet finns inte i databasen.
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
        description="Uppdatera fasta materialvärden som används i kalkylvyn."
      />
      <MaterialFormScaffold
        mode="edit"
        initialMaterial={material}
        onSubmit={onSubmit}
        submitting={submitting}
        serverError={serverError}
      />
    </div>
  );
}
