import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/app/providers/useAuth';
import { AuthRequiredState } from '@/components/ui/AuthRequiredState';
import { PageHeading } from '@/components/ui/PageHeading';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { getCategoryLabel } from '@/features/materials/utils/materialLabels';
import { deleteMaterial, getMaterialById } from '@/services/materials/materialsService';
import { formatDurationSeconds, formatHours } from '@/utils/duration';
import { formatCurrency } from '@/utils/formatters';
import { useEffect } from 'react';
import type { Material } from '@/types/material';

function parseInputNumber(value: string) {
  const normalized = value.trim().replace(',', '.');
  if (normalized.length === 0) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function MaterialDetailPage() {
  const { materialId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [kgMaterialInput, setKgMaterialInput] = useState('');
  const [printHoursInput, setPrintHoursInput] = useState('');

  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const successMessage =
    (location.state as { successMessage?: string } | null)?.successMessage ?? null;

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!materialId) {
        setError('Saknar material-id i URL.');
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
            caughtError instanceof Error
              ? caughtError.message
              : 'Det gick inte att läsa materialdetaljer.',
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

  const kgMaterial = parseInputNumber(kgMaterialInput);
  const printHours = parseInputNumber(printHoursInput);

  const materialCost = useMemo(() => {
    if (!material || kgMaterial === null) {
      return null;
    }

    return material.pricePerKgEur * kgMaterial;
  }, [material, kgMaterial]);

  const onDelete = async () => {
    if (!material) {
      return;
    }

    setDeletePending(true);
    setDeleteError(null);
    try {
      await deleteMaterial(material.id);
      navigate('/materials', {
        replace: true,
        state: { successMessage: 'Materialet togs bort.' },
      });
    } catch (caughtError) {
      setDeleteError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Det gick inte att ta bort materialet.',
      );
      setDeletePending(false);
    }
  };

  if (loading) {
    return (
      <SurfaceCard>
        <p className="text-sm text-[var(--muted)]">Läser materialdetaljer...</p>
      </SurfaceCard>
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
              onClick={() => setDeleteStep(1)}
              className="rounded-full border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              Ta bort material
            </button>
          </div>
        }
      />

      {successMessage ? (
        <SurfaceCard>
          <p className="text-sm font-semibold text-emerald-700">{successMessage}</p>
        </SurfaceCard>
      ) : null}

      <SurfaceCard className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Namn</p>
          <p className="mt-1 text-sm font-semibold text-[var(--ink)]">{material.name}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Tillverkare
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--ink)]">{material.manufacturer}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Kategori
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
            {getCategoryLabel(material.category)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Pris per kg
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
            {formatCurrency(material.pricePerKgEur)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Maxtemperatur
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
            {material.maxTemperatureC === null ? 'Ej angivet' : `${material.maxTemperatureC} °C`}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Tid per lager vid 45°
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
            {formatDurationSeconds(material.timePerLayer45DegSeconds)}
          </p>
        </div>
      </SurfaceCard>

      <SurfaceCard className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Kalkyl
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Fasta värden kommer från materialet. Ange egna indata för att räkna ut materialkostnad.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-[var(--ink)]">Kg material (inmatning)</span>
            <input
              inputMode="decimal"
              value={kgMaterialInput}
              onChange={(event) => setKgMaterialInput(event.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
              placeholder="0,50"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-semibold text-[var(--ink)]">
              Utskriftstid i timmar (inmatning)
            </span>
            <input
              inputMode="decimal"
              value={printHoursInput}
              onChange={(event) => setPrintHoursInput(event.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
              placeholder="2,5"
            />
          </label>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Formel
          </p>
          <p className="mt-1 text-sm text-[var(--ink)]">
            {formatCurrency(material.pricePerKgEur)} × {kgMaterial === null ? 'kg' : kgMaterial} ={' '}
            <span className="font-semibold text-[var(--accent)]">
              {materialCost === null ? 'Ange kg för att räkna' : formatCurrency(materialCost)}
            </span>
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Fast värde: pris/kg
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
              {formatCurrency(material.pricePerKgEur)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Inmatning: utskriftstid
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
              {formatHours(printHours)} h
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Beräknat: materialkostnad
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--accent)]">
              {materialCost === null ? 'Ange kg material' : formatCurrency(materialCost)}
            </p>
          </div>
        </div>
      </SurfaceCard>

      {deleteStep > 0 ? (
        <SurfaceCard className="border-red-200 bg-red-50/70">
          {!user ? (
            <AuthRequiredState
              title="Inloggning krävs för att ta bort material"
              description="Logga in först och försök sedan igen."
            />
          ) : null}

          {user && deleteStep === 1 ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-red-700">Är du säker?</p>
              <p className="text-sm text-[var(--muted)]">
                Du håller på att ta bort materialet <strong>{material.name}</strong>.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteStep(0)}
                  className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-soft)]"
                >
                  Avbryt
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteStep(2)}
                  className="rounded-full border border-red-300 bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-200"
                >
                  Fortsätt
                </button>
              </div>
            </div>
          ) : null}

          {user && deleteStep === 2 ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-red-700">
                Bekräfta borttagning en gång till
              </p>
              <p className="text-sm text-[var(--muted)]">
                Den här åtgärden är permanent och kan inte ångras.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteStep(0)}
                  className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-soft)]"
                >
                  Avbryt
                </button>
                <button
                  type="button"
                  onClick={() => void onDelete()}
                  disabled={deletePending}
                  className="rounded-full border border-red-400 bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletePending ? 'Tar bort...' : 'Ja, ta bort material'}
                </button>
              </div>
            </div>
          ) : null}

          {deleteError ? (
            <p className="mt-3 text-sm font-semibold text-red-700">{deleteError}</p>
          ) : null}
        </SurfaceCard>
      ) : null}
    </div>
  );
}
