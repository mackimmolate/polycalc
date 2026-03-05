import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { getCategoryLabel } from '@/features/materials/utils/materialLabels';
import {
  type MaterialFormErrors,
  type MaterialFormValues,
  validateMaterialForm,
} from '@/features/materials/utils/materialValidation';
import {
  createMaterialCategory,
  createMaterialManufacturer,
  deactivateMaterialCategory,
  deactivateMaterialManufacturer,
  listMaterialCategories,
  listMaterialManufacturers,
} from '@/services/material-options/materialOptionsService';
import type { Material, MaterialMutationInput } from '@/types/material';
import type { MaterialOption, MaterialOptionUpsertStatus } from '@/types/materialOption';

interface MaterialFormScaffoldProps {
  mode: 'create' | 'edit';
  initialMaterial?: Material;
  submitting?: boolean;
  serverError?: string | null;
  onSubmit: (input: MaterialMutationInput) => Promise<void>;
}

function normalizeOptionLabel(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function toFormValues(material?: Material): MaterialFormValues {
  const timePerLayerMinutes =
    material && material.timePerLayerSeconds > 0
      ? new Intl.NumberFormat('sv-SE', {
          useGrouping: false,
          maximumFractionDigits: 2,
        }).format(material.timePerLayerSeconds / 60)
      : '';

  return {
    name: material?.name ?? '',
    categoryId: material?.categoryId ?? '',
    manufacturerId: material?.manufacturerId ?? '',
    pricePerKgEur: material ? material.pricePerKgEur.toString() : '',
    maxTemperatureC: material?.maxTemperatureC?.toString() ?? '',
    timePerLayerMinutes,
    timePerLayerReferenceAngleDeg: material
      ? material.timePerLayerReferenceAngleDeg.toString()
      : '45',
    notes: material?.notes ?? '',
  };
}

function asErrorMessage(caughtError: unknown, fallback: string) {
  return caughtError instanceof Error ? caughtError.message : fallback;
}

function statusToMessage(
  status: MaterialOptionUpsertStatus,
  entityLabel: 'kategori' | 'tillverkare',
) {
  if (status === 'created') {
    return entityLabel === 'kategori'
      ? 'Kategorin skapades och valdes.'
      : 'Tillverkaren skapades och valdes.';
  }

  if (status === 'reactivated') {
    return entityLabel === 'kategori'
      ? 'Kategorin återaktiverades och valdes.'
      : 'Tillverkaren återaktiverades och valdes.';
  }

  return entityLabel === 'kategori'
    ? 'Kategorin fanns redan och valdes.'
    : 'Tillverkaren fanns redan och valdes.';
}

function FieldError({ error }: { error?: string }) {
  if (!error) {
    return null;
  }

  return <p className="text-xs font-medium text-red-700">{error}</p>;
}

export function MaterialFormScaffold({
  mode,
  initialMaterial,
  submitting = false,
  serverError,
  onSubmit,
}: MaterialFormScaffoldProps) {
  const [formValues, setFormValues] = useState<MaterialFormValues>(() =>
    toFormValues(initialMaterial),
  );
  const [fieldErrors, setFieldErrors] = useState<MaterialFormErrors>({});

  const [categories, setCategories] = useState<MaterialOption[]>([]);
  const [manufacturers, setManufacturers] = useState<MaterialOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsLoadError, setOptionsLoadError] = useState<string | null>(null);

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState('');
  const [categoryDraftError, setCategoryDraftError] = useState<string | null>(null);
  const [categoryActionPending, setCategoryActionPending] = useState(false);
  const [categoryActionError, setCategoryActionError] = useState<string | null>(null);
  const [categoryActionInfo, setCategoryActionInfo] = useState<string | null>(null);

  const [showRemoveCategory, setShowRemoveCategory] = useState(false);
  const [categoryToRemoveId, setCategoryToRemoveId] = useState('');

  const [showAddManufacturer, setShowAddManufacturer] = useState(false);
  const [manufacturerDraft, setManufacturerDraft] = useState('');
  const [manufacturerDraftError, setManufacturerDraftError] = useState<string | null>(null);
  const [manufacturerActionPending, setManufacturerActionPending] = useState(false);
  const [manufacturerActionError, setManufacturerActionError] = useState<string | null>(null);
  const [manufacturerActionInfo, setManufacturerActionInfo] = useState<string | null>(null);

  const [showRemoveManufacturer, setShowRemoveManufacturer] = useState(false);
  const [manufacturerToRemoveId, setManufacturerToRemoveId] = useState('');

  const loadOptionLists = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setOptionsLoading(true);
    }
    setOptionsLoadError(null);

    try {
      const [fetchedCategories, fetchedManufacturers] = await Promise.all([
        listMaterialCategories({ includeInactive: true }),
        listMaterialManufacturers({ includeInactive: true }),
      ]);

      setCategories(fetchedCategories);
      setManufacturers(fetchedManufacturers);
    } catch (caughtError) {
      setOptionsLoadError(
        asErrorMessage(caughtError, 'Det gick inte att läsa kategorier och tillverkare.'),
      );
    } finally {
      if (showLoader) {
        setOptionsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadOptionLists(true);
  }, [loadOptionLists]);

  const parsedLayerDuration = useMemo(() => {
    const numeric = Number(formValues.timePerLayerMinutes.replace(',', '.'));
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return 'Ange tid i minuter';
    }

    return `${new Intl.NumberFormat('sv-SE', {
      maximumFractionDigits: 2,
    }).format(numeric)} min`;
  }, [formValues.timePerLayerMinutes]);

  const categorySelectOptions = useMemo(
    () =>
      categories.filter(
        (option) => option.isActive || (mode === 'edit' && option.id === formValues.categoryId),
      ),
    [categories, formValues.categoryId, mode],
  );

  const manufacturerSelectOptions = useMemo(
    () =>
      manufacturers.filter(
        (option) => option.isActive || (mode === 'edit' && option.id === formValues.manufacturerId),
      ),
    [formValues.manufacturerId, manufacturers, mode],
  );

  const removableCategoryOptions = useMemo(
    () => categories.filter((option) => option.isActive),
    [categories],
  );
  const removableManufacturerOptions = useMemo(
    () => manufacturers.filter((option) => option.isActive),
    [manufacturers],
  );

  const addCategory = async () => {
    const label = normalizeOptionLabel(categoryDraft);
    if (label.length < 2) {
      setCategoryDraftError('Ange minst 2 tecken för kategori.');
      return;
    }

    setCategoryActionPending(true);
    setCategoryDraftError(null);
    setCategoryActionError(null);
    setCategoryActionInfo(null);

    try {
      const result = await createMaterialCategory(label);
      setFormValues((current) => ({ ...current, categoryId: result.option.id }));
      setFieldErrors((current) => ({ ...current, categoryId: undefined }));
      setCategoryActionInfo(statusToMessage(result.status, 'kategori'));
      setCategoryDraft('');
      setShowAddCategory(false);
      await loadOptionLists(false);
    } catch (caughtError) {
      setCategoryActionError(
        asErrorMessage(caughtError, 'Det gick inte att skapa eller välja kategorin.'),
      );
    } finally {
      setCategoryActionPending(false);
    }
  };

  const removeCategory = async () => {
    if (!categoryToRemoveId) {
      setCategoryActionError('Välj en kategori att ta bort.');
      return;
    }

    setCategoryActionPending(true);
    setCategoryActionError(null);
    setCategoryActionInfo(null);

    try {
      await deactivateMaterialCategory(categoryToRemoveId);
      if (formValues.categoryId === categoryToRemoveId) {
        setFormValues((current) => ({ ...current, categoryId: '' }));
      }
      setCategoryActionInfo('Kategorin inaktiverades och togs bort från nya val.');
      setCategoryToRemoveId('');
      setShowRemoveCategory(false);
      await loadOptionLists(false);
    } catch (caughtError) {
      setCategoryActionError(asErrorMessage(caughtError, 'Det gick inte att ta bort kategorin.'));
    } finally {
      setCategoryActionPending(false);
    }
  };

  const addManufacturer = async () => {
    const label = normalizeOptionLabel(manufacturerDraft);
    if (label.length < 2) {
      setManufacturerDraftError('Ange minst 2 tecken för tillverkare.');
      return;
    }

    setManufacturerActionPending(true);
    setManufacturerDraftError(null);
    setManufacturerActionError(null);
    setManufacturerActionInfo(null);

    try {
      const result = await createMaterialManufacturer(label);
      setFormValues((current) => ({ ...current, manufacturerId: result.option.id }));
      setFieldErrors((current) => ({ ...current, manufacturerId: undefined }));
      setManufacturerActionInfo(statusToMessage(result.status, 'tillverkare'));
      setManufacturerDraft('');
      setShowAddManufacturer(false);
      await loadOptionLists(false);
    } catch (caughtError) {
      setManufacturerActionError(
        asErrorMessage(caughtError, 'Det gick inte att skapa eller välja tillverkaren.'),
      );
    } finally {
      setManufacturerActionPending(false);
    }
  };

  const removeManufacturer = async () => {
    if (!manufacturerToRemoveId) {
      setManufacturerActionError('Välj en tillverkare att ta bort.');
      return;
    }

    setManufacturerActionPending(true);
    setManufacturerActionError(null);
    setManufacturerActionInfo(null);

    try {
      await deactivateMaterialManufacturer(manufacturerToRemoveId);
      if (formValues.manufacturerId === manufacturerToRemoveId) {
        setFormValues((current) => ({ ...current, manufacturerId: '' }));
      }
      setManufacturerActionInfo('Tillverkaren inaktiverades och togs bort från nya val.');
      setManufacturerToRemoveId('');
      setShowRemoveManufacturer(false);
      await loadOptionLists(false);
    } catch (caughtError) {
      setManufacturerActionError(
        asErrorMessage(caughtError, 'Det gick inte att ta bort tillverkaren.'),
      );
    } finally {
      setManufacturerActionPending(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { input, errors } = validateMaterialForm(formValues);
    setFieldErrors(errors);

    if (!input) {
      return;
    }

    await onSubmit(input);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <SurfaceCard className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2 space-y-2">
          {optionsLoading ? (
            <p className="text-sm text-[var(--muted)]">
              Läser delade kategorier och tillverkare...
            </p>
          ) : null}
          {optionsLoadError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-semibold text-red-700">
                Det gick inte att läsa kategorier och tillverkare.
              </p>
              <p className="mt-1 text-sm text-red-800">{optionsLoadError}</p>
              <button
                type="button"
                onClick={() => void loadOptionLists(true)}
                className="mt-2 rounded-full border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
              >
                Försök igen
              </button>
            </div>
          ) : null}
        </div>

        <label className="space-y-1 text-sm">
          <span className="font-semibold text-[var(--ink)]">Materialnamn</span>
          <input
            required
            value={formValues.name}
            onChange={(event) =>
              setFormValues((current) => ({ ...current, name: event.target.value }))
            }
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
            placeholder="SUNLU PLA+ Svart"
          />
          <FieldError error={fieldErrors.name} />
        </label>

        <div className="space-y-1 text-sm">
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-[var(--ink)]">Kategori</span>
            <select
              value={formValues.categoryId}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  categoryId: event.target.value,
                }))
              }
              disabled={optionsLoading || categoryActionPending}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-[var(--surface-soft)]"
            >
              <option value="">Välj kategori</option>
              {categorySelectOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {getCategoryLabel(category.label)}
                  {!category.isActive ? ' (inaktiv)' : ''}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setShowAddCategory((current) => !current);
                setShowRemoveCategory(false);
                setCategoryDraftError(null);
                setCategoryActionError(null);
                setCategoryActionInfo(null);
              }}
              disabled={optionsLoading || categoryActionPending}
              className="text-xs font-semibold text-[var(--accent)] underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:text-[var(--muted)] disabled:no-underline"
            >
              + Lägg till ny kategori
            </button>
            <button
              type="button"
              onClick={() => {
                setShowRemoveCategory((current) => !current);
                setShowAddCategory(false);
                setCategoryActionError(null);
                setCategoryActionInfo(null);
              }}
              disabled={
                optionsLoading || categoryActionPending || removableCategoryOptions.length === 0
              }
              className="text-xs font-semibold text-red-700 underline-offset-2 hover:underline hover:text-red-800 disabled:cursor-not-allowed disabled:text-[var(--muted)] disabled:no-underline"
            >
              - Ta bort kategori
            </button>
          </div>

          {showAddCategory ? (
            <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
              <input
                value={categoryDraft}
                onChange={(event) => {
                  setCategoryDraft(event.target.value);
                  setCategoryDraftError(null);
                }}
                className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
                placeholder="t.ex. PC Blend"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void addCategory()}
                  disabled={categoryActionPending}
                  className="rounded-full border border-[var(--accent)] bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Lägg till
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCategory(false);
                    setCategoryDraft('');
                    setCategoryDraftError(null);
                  }}
                  className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink)] transition hover:bg-[var(--surface)]"
                >
                  Avbryt
                </button>
              </div>
              {categoryDraftError ? (
                <p className="text-xs font-medium text-red-700">{categoryDraftError}</p>
              ) : null}
            </div>
          ) : null}

          {showRemoveCategory ? (
            <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
              <select
                value={categoryToRemoveId}
                onChange={(event) => {
                  setCategoryToRemoveId(event.target.value);
                  setCategoryActionError(null);
                }}
                className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
              >
                <option value="">Välj kategori att ta bort</option>
                {removableCategoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {getCategoryLabel(category.label)}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void removeCategory()}
                  disabled={categoryActionPending}
                  className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Ta bort
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRemoveCategory(false);
                    setCategoryToRemoveId('');
                    setCategoryActionError(null);
                  }}
                  className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink)] transition hover:bg-[var(--surface)]"
                >
                  Avbryt
                </button>
              </div>
              <p className="text-xs text-[var(--muted)]">
                Tar inte bort data från befintliga material. Valet markeras i stället som inaktivt.
              </p>
            </div>
          ) : null}

          {categoryActionInfo ? (
            <p className="text-xs font-medium text-emerald-700">{categoryActionInfo}</p>
          ) : null}
          {categoryActionError ? (
            <p className="text-xs font-medium text-red-700">{categoryActionError}</p>
          ) : null}
          {!optionsLoading && categorySelectOptions.length === 0 ? (
            <p className="text-xs text-[var(--muted)]">Inga kategorier finns ännu. Lägg till en.</p>
          ) : null}
          <FieldError error={fieldErrors.categoryId} />
        </div>

        <div className="space-y-1 text-sm">
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-[var(--ink)]">Tillverkare</span>
            <select
              value={formValues.manufacturerId}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  manufacturerId: event.target.value,
                }))
              }
              disabled={optionsLoading || manufacturerActionPending}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-[var(--surface-soft)]"
            >
              <option value="">Välj tillverkare</option>
              {manufacturerSelectOptions.map((manufacturer) => (
                <option key={manufacturer.id} value={manufacturer.id}>
                  {manufacturer.label}
                  {!manufacturer.isActive ? ' (inaktiv)' : ''}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setShowAddManufacturer((current) => !current);
                setShowRemoveManufacturer(false);
                setManufacturerDraftError(null);
                setManufacturerActionError(null);
                setManufacturerActionInfo(null);
              }}
              disabled={optionsLoading || manufacturerActionPending}
              className="text-xs font-semibold text-[var(--accent)] underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:text-[var(--muted)] disabled:no-underline"
            >
              + Lägg till ny tillverkare
            </button>
            <button
              type="button"
              onClick={() => {
                setShowRemoveManufacturer((current) => !current);
                setShowAddManufacturer(false);
                setManufacturerActionError(null);
                setManufacturerActionInfo(null);
              }}
              disabled={
                optionsLoading ||
                manufacturerActionPending ||
                removableManufacturerOptions.length === 0
              }
              className="text-xs font-semibold text-red-700 underline-offset-2 hover:underline hover:text-red-800 disabled:cursor-not-allowed disabled:text-[var(--muted)] disabled:no-underline"
            >
              - Ta bort tillverkare
            </button>
          </div>

          {showAddManufacturer ? (
            <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
              <input
                value={manufacturerDraft}
                onChange={(event) => {
                  setManufacturerDraft(event.target.value);
                  setManufacturerDraftError(null);
                }}
                className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
                placeholder="t.ex. FormFutura"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void addManufacturer()}
                  disabled={manufacturerActionPending}
                  className="rounded-full border border-[var(--accent)] bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Lägg till
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddManufacturer(false);
                    setManufacturerDraft('');
                    setManufacturerDraftError(null);
                  }}
                  className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink)] transition hover:bg-[var(--surface)]"
                >
                  Avbryt
                </button>
              </div>
              {manufacturerDraftError ? (
                <p className="text-xs font-medium text-red-700">{manufacturerDraftError}</p>
              ) : null}
            </div>
          ) : null}

          {showRemoveManufacturer ? (
            <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
              <select
                value={manufacturerToRemoveId}
                onChange={(event) => {
                  setManufacturerToRemoveId(event.target.value);
                  setManufacturerActionError(null);
                }}
                className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
              >
                <option value="">Välj tillverkare att ta bort</option>
                {removableManufacturerOptions.map((manufacturer) => (
                  <option key={manufacturer.id} value={manufacturer.id}>
                    {manufacturer.label}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void removeManufacturer()}
                  disabled={manufacturerActionPending}
                  className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Ta bort
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRemoveManufacturer(false);
                    setManufacturerToRemoveId('');
                    setManufacturerActionError(null);
                  }}
                  className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink)] transition hover:bg-[var(--surface)]"
                >
                  Avbryt
                </button>
              </div>
              <p className="text-xs text-[var(--muted)]">
                Tar inte bort data från befintliga material. Valet markeras i stället som inaktivt.
              </p>
            </div>
          ) : null}

          {manufacturerActionInfo ? (
            <p className="text-xs font-medium text-emerald-700">{manufacturerActionInfo}</p>
          ) : null}
          {manufacturerActionError ? (
            <p className="text-xs font-medium text-red-700">{manufacturerActionError}</p>
          ) : null}
          {!optionsLoading && manufacturerSelectOptions.length === 0 ? (
            <p className="text-xs text-[var(--muted)]">
              Inga tillverkare finns ännu. Lägg till en.
            </p>
          ) : null}
          <FieldError error={fieldErrors.manufacturerId} />
        </div>

        <label className="space-y-1 text-sm">
          <span className="font-semibold text-[var(--ink)]">Pris per kg (EUR)</span>
          <input
            required
            inputMode="decimal"
            value={formValues.pricePerKgEur}
            onChange={(event) =>
              setFormValues((current) => ({ ...current, pricePerKgEur: event.target.value }))
            }
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
            placeholder="24,50"
          />
          <FieldError error={fieldErrors.pricePerKgEur} />
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-semibold text-[var(--ink)]">Maxtemperatur (°C)</span>
          <input
            inputMode="numeric"
            value={formValues.maxTemperatureC}
            onChange={(event) =>
              setFormValues((current) => ({ ...current, maxTemperatureC: event.target.value }))
            }
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
            placeholder="260"
          />
          <FieldError error={fieldErrors.maxTemperatureC} />
        </label>

        <div className="space-y-1 text-sm">
          <span className="font-semibold text-[var(--ink)]">Referenstid per lager</span>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <select
              value={formValues.timePerLayerReferenceAngleDeg}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  timePerLayerReferenceAngleDeg: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
            >
              <option value="45">45°</option>
              <option value="90">90°</option>
            </select>

            <input
              required
              inputMode="decimal"
              value={formValues.timePerLayerMinutes}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  timePerLayerMinutes: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
              placeholder="1,25"
            />
          </div>
          <p className="text-xs text-[var(--muted)]">
            Referens: {formValues.timePerLayerReferenceAngleDeg}°. Visas som {parsedLayerDuration}.
          </p>
          <FieldError error={fieldErrors.timePerLayerReferenceAngleDeg} />
          <FieldError error={fieldErrors.timePerLayerMinutes} />
        </div>

        <label className="space-y-1 text-sm md:col-span-2">
          <span className="font-semibold text-[var(--ink)]">Anteckningar</span>
          <textarea
            value={formValues.notes}
            onChange={(event) =>
              setFormValues((current) => ({ ...current, notes: event.target.value }))
            }
            className="min-h-24 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
            placeholder="Skriv utprofiler, torkkrav eller användningsområde..."
          />
          <FieldError error={fieldErrors.notes} />
        </label>
      </SurfaceCard>

      {serverError ? (
        <SurfaceCard>
          <p className="text-sm font-semibold text-red-700">Det gick inte att spara materialet.</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{serverError}</p>
        </SurfaceCard>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--muted)]">
          {mode === 'create'
            ? 'Materialet sparas direkt i Supabase när formuläret skickas.'
            : 'Ändringar sparas direkt i Supabase när formuläret skickas.'}
        </p>
        <div className="flex items-center gap-2">
          <Link
            to="/materials"
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-soft)]"
          >
            Avbryt
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Sparar...' : mode === 'create' ? 'Spara material' : 'Uppdatera material'}
          </button>
        </div>
      </div>
    </form>
  );
}
