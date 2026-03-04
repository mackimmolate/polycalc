import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MaterialCalculationsWorkspace } from '@/features/materials/components/MaterialCalculationsWorkspace';
import { deleteMaterial } from '@/services/materials/materialsService';
import type { Material } from '@/types/material';

interface MaterialExpandedPanelProps {
  material: Material;
  canWrite: boolean;
  onMaterialDeleted: (materialId: string, successMessage: string) => void;
}

export function MaterialExpandedPanel({
  material,
  canWrite,
  onMaterialDeleted,
}: MaterialExpandedPanelProps) {
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const runDelete = async () => {
    setDeletePending(true);
    setDeleteError(null);

    try {
      await deleteMaterial(material.id);
      onMaterialDeleted(material.id, `Materialet "${material.name}" togs bort.`);
    } catch (caughtError) {
      setDeleteError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Det gick inte att ta bort materialet.',
      );
      setDeletePending(false);
    }
  };

  return (
    <div className="border-t border-[var(--border)] bg-[var(--surface-soft)] px-4 py-4 lg:px-5">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-[var(--ink)]">Kalkylarbetsyta</p>
            <p className="text-xs text-[var(--muted)]">
              Hantera kalkylscenarier för <span className="font-semibold">{material.name}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/materials/${material.id}/edit`}
              className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink)] transition hover:bg-[var(--surface)]"
            >
              Redigera material
            </Link>
            <button
              type="button"
              onClick={() => setDeleteStep(1)}
              disabled={!canWrite || deletePending}
              className="rounded-full border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Ta bort material
            </button>
          </div>
        </div>

        {!canWrite ? (
          <p className="text-xs text-[var(--muted)]">
            Inloggning krävs för att redigera eller ta bort material.
          </p>
        ) : null}

        {deleteStep > 0 ? (
          <div className="space-y-2 rounded-xl border border-red-200 bg-red-50 px-3 py-3">
            {deleteStep === 1 ? (
              <>
                <p className="text-sm font-semibold text-red-700">Är du säker?</p>
                <p className="text-sm text-red-900/90">
                  Du håller på att ta bort materialet <strong>{material.name}</strong>.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDeleteStep(0)}
                    className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink)] transition hover:bg-[var(--surface)]"
                  >
                    Avbryt
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteStep(2)}
                    className="rounded-full border border-red-300 bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-200"
                  >
                    Fortsätt
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-red-700">Bekräfta borttagning igen</p>
                <p className="text-sm text-red-900/90">
                  Åtgärden är permanent och kan inte ångras.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDeleteStep(0)}
                    className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink)] transition hover:bg-[var(--surface)]"
                  >
                    Avbryt
                  </button>
                  <button
                    type="button"
                    onClick={() => void runDelete()}
                    disabled={deletePending}
                    className="rounded-full border border-red-500 bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletePending ? 'Tar bort...' : 'Ja, ta bort material'}
                  </button>
                </div>
              </>
            )}

            {deleteError ? (
              <p className="text-xs font-semibold text-red-700">{deleteError}</p>
            ) : null}
          </div>
        ) : null}

        <MaterialCalculationsWorkspace material={material} canWrite={canWrite} />
      </div>
    </div>
  );
}
