import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import {
  createMaterialCalculation,
  deleteMaterialCalculation,
  listMaterialCalculations,
  updateMaterialCalculation,
} from '@/services/material-calculations/materialCalculationsService';
import type { Material } from '@/types/material';
import type { MaterialCalculation } from '@/types/materialCalculation';
import { cn } from '@/utils/cn';
import { formatHours } from '@/utils/duration';
import { formatCurrency } from '@/utils/formatters';

interface MaterialCalculationsWorkspaceProps {
  material: Material;
  canWrite: boolean;
}

interface CalculationDraft {
  id: string;
  label: string;
  kgMaterialInput: string;
  printTimeHoursInput: string;
  savedLabel: string;
  savedKgMaterialInput: string;
  savedPrintTimeHoursInput: string;
  isEditing: boolean;
  saving: boolean;
  deleting: boolean;
  error: string | null;
}

function parseDecimalInput(value: string) {
  const normalized = value.trim().replace(',', '.');
  if (normalized.length === 0) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function formatInputDecimal(value: number, maxFractionDigits: number) {
  return new Intl.NumberFormat('sv-SE', {
    useGrouping: false,
    maximumFractionDigits: maxFractionDigits,
  }).format(value);
}

function toDraft(calculation: MaterialCalculation, isEditing = false): CalculationDraft {
  const label = calculation.label;
  const kgMaterialInput = formatInputDecimal(calculation.kgMaterial, 3);
  const printTimeHoursInput = formatInputDecimal(calculation.printTimeHours, 2);

  return {
    id: calculation.id,
    label,
    kgMaterialInput,
    printTimeHoursInput,
    savedLabel: label,
    savedKgMaterialInput: kgMaterialInput,
    savedPrintTimeHoursInput: printTimeHoursInput,
    isEditing,
    saving: false,
    deleting: false,
    error: null,
  };
}

function getCalculationLabel(label: string, index: number) {
  const trimmed = label.trim();
  return trimmed.length > 0 ? trimmed : `Kalkyl ${index + 1}`;
}

export function MaterialCalculationsWorkspace({
  material,
  canWrite,
}: MaterialCalculationsWorkspaceProps) {
  const [drafts, setDrafts] = useState<CalculationDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createPending, setCreatePending] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadCalculations = async () => {
      setLoading(true);
      setError(null);

      try {
        const calculations = await listMaterialCalculations(material.id);
        if (isMounted) {
          setDrafts(calculations.map((calculation) => toDraft(calculation)));
        }
      } catch (caughtError) {
        if (isMounted) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : 'Det gick inte att läsa in kalkyler.',
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadCalculations();
    return () => {
      isMounted = false;
    };
  }, [material.id]);

  const nextCalculationLabel = useMemo(() => {
    return `Kalkyl ${drafts.length + 1}`;
  }, [drafts.length]);

  const updateDraft = (id: string, updater: (current: CalculationDraft) => CalculationDraft) => {
    setDrafts((currentDrafts) =>
      currentDrafts.map((draft) => (draft.id === id ? updater(draft) : draft)),
    );
  };

  const startEdit = (id: string) => {
    updateDraft(id, (current) => ({
      ...current,
      isEditing: true,
      error: null,
    }));
  };

  const cancelEdit = (id: string) => {
    updateDraft(id, (current) => ({
      ...current,
      label: current.savedLabel,
      kgMaterialInput: current.savedKgMaterialInput,
      printTimeHoursInput: current.savedPrintTimeHoursInput,
      isEditing: false,
      error: null,
    }));
  };

  const createCalculation = async () => {
    if (!canWrite) {
      return;
    }

    setCreatePending(true);
    setError(null);

    try {
      const created = await createMaterialCalculation(material.id, {
        label: nextCalculationLabel,
        kgMaterial: 0,
        printTimeHours: 0,
      });

      setDrafts((current) => [...current, toDraft(created, true)]);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Det gick inte att skapa en ny kalkyl.',
      );
    } finally {
      setCreatePending(false);
    }
  };

  const saveCalculation = async (draft: CalculationDraft) => {
    if (!canWrite) {
      return;
    }

    const kgMaterial = parseDecimalInput(draft.kgMaterialInput);
    const printTimeHours = parseDecimalInput(draft.printTimeHoursInput);
    const label = draft.label.trim();

    if (kgMaterial === null || Number.isNaN(kgMaterial) || kgMaterial < 0) {
      updateDraft(draft.id, (current) => ({
        ...current,
        error: 'Ange kg material som 0 eller högre.',
      }));
      return;
    }

    if (printTimeHours === null || Number.isNaN(printTimeHours) || printTimeHours < 0) {
      updateDraft(draft.id, (current) => ({
        ...current,
        error: 'Ange utskriftstid i timmar som 0 eller högre.',
      }));
      return;
    }

    updateDraft(draft.id, (current) => ({
      ...current,
      saving: true,
      error: null,
    }));

    try {
      const updated = await updateMaterialCalculation(draft.id, {
        label,
        kgMaterial,
        printTimeHours,
      });

      const updatedLabel = updated.label;
      const updatedKg = formatInputDecimal(updated.kgMaterial, 3);
      const updatedHours = formatInputDecimal(updated.printTimeHours, 2);

      updateDraft(draft.id, (current) => ({
        ...current,
        label: updatedLabel,
        kgMaterialInput: updatedKg,
        printTimeHoursInput: updatedHours,
        savedLabel: updatedLabel,
        savedKgMaterialInput: updatedKg,
        savedPrintTimeHoursInput: updatedHours,
        isEditing: false,
        saving: false,
        error: null,
      }));
    } catch (caughtError) {
      updateDraft(draft.id, (current) => ({
        ...current,
        saving: false,
        error:
          caughtError instanceof Error ? caughtError.message : 'Det gick inte att spara kalkylen.',
      }));
    }
  };

  const removeCalculation = async (draft: CalculationDraft) => {
    if (!canWrite) {
      return;
    }

    const shouldDelete = window.confirm('Ta bort den här kalkylen?');
    if (!shouldDelete) {
      return;
    }

    updateDraft(draft.id, (current) => ({
      ...current,
      deleting: true,
      error: null,
    }));

    try {
      await deleteMaterialCalculation(draft.id);
      setDrafts((current) => current.filter((item) => item.id !== draft.id));
    } catch (caughtError) {
      updateDraft(draft.id, (current) => ({
        ...current,
        deleting: false,
        error:
          caughtError instanceof Error
            ? caughtError.message
            : 'Det gick inte att ta bort kalkylen.',
      }));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[var(--ink)]">Kalkyler</p>
          <p className="text-xs text-[var(--muted)]">
            Flera scenarier per material med egna inmatningar.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void createCalculation()}
          disabled={!canWrite || createPending}
          className={cn(
            'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
            canWrite
              ? 'border-[var(--accent)] bg-[var(--accent)] text-white hover:bg-teal-700'
              : 'cursor-not-allowed border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]',
          )}
        >
          {createPending ? 'Skapar...' : 'Ny kalkyl'}
        </button>
      </div>

      {!canWrite ? (
        <p className="text-xs text-[var(--muted)]">
          Logga in för att skapa, spara eller ta bort kalkyler.{' '}
          <Link
            to="/auth"
            className="font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Gå till inloggning
          </Link>
          .
        </p>
      ) : null}

      {loading ? (
        <SurfaceCard>
          <p className="text-sm text-[var(--muted)]">Läser in kalkyler...</p>
        </SurfaceCard>
      ) : null}

      {!loading && error ? (
        <SurfaceCard>
          <p className="text-sm font-semibold text-red-700">Det gick inte att läsa kalkyler.</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{error}</p>
        </SurfaceCard>
      ) : null}

      {!loading && !error && drafts.length === 0 ? (
        <SurfaceCard>
          <p className="text-sm font-semibold text-[var(--ink)]">Inga kalkyler än.</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Lägg till en kalkyl för att jämföra scenarier för det här materialet.
          </p>
        </SurfaceCard>
      ) : null}

      {!loading && !error && drafts.length > 0 ? (
        <ul className="space-y-3">
          {drafts.map((draft, index) => {
            const kgMaterial = parseDecimalInput(draft.kgMaterialInput);
            const printTimeHours = parseDecimalInput(draft.printTimeHoursInput);
            const normalizedPrintTimeHours =
              printTimeHours === null || Number.isNaN(printTimeHours) ? null : printTimeHours;
            const printTimeLabel =
              normalizedPrintTimeHours === null
                ? 'Ej angivet'
                : `${formatHours(normalizedPrintTimeHours)} h`;
            const materialCost =
              kgMaterial === null || Number.isNaN(kgMaterial)
                ? null
                : material.pricePerKgEur * kgMaterial;

            return (
              <li key={draft.id}>
                <SurfaceCard className="space-y-3 border-[var(--border)] bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[var(--ink)]">
                        {getCalculationLabel(draft.label, index)}
                      </p>
                      {!draft.isEditing ? (
                        <span className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--muted)]">
                          Sparad
                        </span>
                      ) : null}
                    </div>
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1.5 text-sm font-semibold text-[var(--accent)]">
                      {materialCost === null ? 'Ange kg för kostnad' : formatCurrency(materialCost)}
                    </div>
                  </div>

                  {draft.isEditing ? (
                    <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
                      <label className="space-y-1 text-sm">
                        <span className="font-medium text-[var(--ink)]">Namn på kalkyl</span>
                        <input
                          value={draft.label}
                          onChange={(event) =>
                            updateDraft(draft.id, (current) => ({
                              ...current,
                              label: event.target.value,
                              error: null,
                            }))
                          }
                          disabled={!canWrite || draft.saving || draft.deleting}
                          className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-[var(--surface-soft)]"
                          placeholder={`Kalkyl ${index + 1}`}
                        />
                      </label>

                      <label className="space-y-1 text-sm">
                        <span className="font-medium text-[var(--ink)]">Kg material</span>
                        <input
                          value={draft.kgMaterialInput}
                          inputMode="decimal"
                          onChange={(event) =>
                            updateDraft(draft.id, (current) => ({
                              ...current,
                              kgMaterialInput: event.target.value,
                              error: null,
                            }))
                          }
                          disabled={!canWrite || draft.saving || draft.deleting}
                          className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-[var(--surface-soft)]"
                          placeholder="0,85"
                        />
                      </label>

                      <label className="space-y-1 text-sm">
                        <span className="font-medium text-[var(--ink)]">Printtid (h)</span>
                        <input
                          value={draft.printTimeHoursInput}
                          inputMode="decimal"
                          onChange={(event) =>
                            updateDraft(draft.id, (current) => ({
                              ...current,
                              printTimeHoursInput: event.target.value,
                              error: null,
                            }))
                          }
                          disabled={!canWrite || draft.saving || draft.deleting}
                          className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-[var(--surface-soft)]"
                          placeholder="2,5"
                        />
                      </label>

                      <div className="flex items-end gap-2 lg:justify-end">
                        <button
                          type="button"
                          onClick={() => void saveCalculation(draft)}
                          disabled={!canWrite || draft.saving || draft.deleting}
                          className="rounded-full border border-[var(--accent)] bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {draft.saving ? 'Sparar...' : 'Spara'}
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelEdit(draft.id)}
                          disabled={!canWrite || draft.saving || draft.deleting}
                          className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Avbryt
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="space-y-1 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                          Kg material
                        </p>
                        <p className="text-sm font-semibold text-[var(--ink)]">
                          {kgMaterial === null || Number.isNaN(kgMaterial)
                            ? 'Ej angivet'
                            : formatInputDecimal(kgMaterial, 3)}
                        </p>
                      </div>
                      <div className="space-y-1 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                          Printtid
                        </p>
                        <p className="text-sm font-semibold text-[var(--ink)]">{printTimeLabel}</p>
                      </div>
                      <div className="space-y-1 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                          Materialkostnad
                        </p>
                        <p className="text-sm font-semibold text-[var(--accent)]">
                          {materialCost === null
                            ? 'Ange kg material'
                            : formatCurrency(materialCost)}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                      Formel
                    </p>
                    <p className="text-sm text-[var(--ink)]">
                      {formatCurrency(material.pricePerKgEur)} ×{' '}
                      {kgMaterial === null || Number.isNaN(kgMaterial) ? 'kg' : kgMaterial} ={' '}
                      <span className="font-semibold text-[var(--accent)]">
                        {materialCost === null ? 'Ange kg material' : formatCurrency(materialCost)}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {!draft.isEditing ? (
                      <button
                        type="button"
                        onClick={() => startEdit(draft.id)}
                        disabled={!canWrite || draft.saving || draft.deleting}
                        className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Redigera
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => void removeCalculation(draft)}
                      disabled={!canWrite || draft.saving || draft.deleting}
                      className="rounded-full border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {draft.deleting ? 'Tar bort...' : 'Ta bort'}
                    </button>
                  </div>

                  {draft.error ? (
                    <p className="text-xs font-semibold text-red-700">{draft.error}</p>
                  ) : null}
                </SurfaceCard>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
