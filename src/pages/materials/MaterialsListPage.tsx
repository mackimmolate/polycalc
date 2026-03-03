import { useEffect, useMemo, useState } from 'react';
import { PageHeading } from '@/components/ui/PageHeading';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { MaterialList } from '@/features/materials/components/MaterialList';
import { getCategoryLabel } from '@/features/materials/utils/materialLabels';
import {
  queryMaterials,
  type MaterialSortOption,
} from '@/features/materials/utils/filterMaterials';
import { getMaterialPreviewList } from '@/services/materials/materialsService';
import type { Material, MaterialCategory } from '@/types/material';

export function MaterialsListPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<MaterialSortOption>('name-asc');

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const previewMaterials = await getMaterialPreviewList();
        if (isMounted) {
          setMaterials(previewMaterials);
        }
      } catch (caughtError) {
        if (isMounted) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : 'Det gick inte att läsa in förhandsdata för material.',
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
  }, []);

  const filteredMaterials = useMemo(
    () =>
      queryMaterials(materials, {
        searchTerm,
        category,
        sort,
      }),
    [materials, searchTerm, category, sort],
  );

  const categories = useMemo<Array<'all' | MaterialCategory>>(
    () => ['all', ...new Set(materials.map((material) => material.category))],
    [materials],
  );

  return (
    <div className="space-y-6">
      <PageHeading
        title="Material"
        description="Översikten visar det viktigaste direkt: namn, tillverkare, kategori, pris, temperatur och anteckningar."
      />

      <SurfaceCard className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label htmlFor="materials-search" className="sr-only">
              Sök material
            </label>
            <input
              id="materials-search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Sök material"
              placeholder="Sök material eller tillverkare"
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="materials-category" className="sr-only">
              Filtrera på kategori
            </label>
            <select
              id="materials-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              aria-label="Filtrera på kategori"
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
            >
              {categories.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'Alla kategorier' : getCategoryLabel(option)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="materials-sort" className="sr-only">
              Sortering
            </label>
            <select
              id="materials-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as MaterialSortOption)}
              aria-label="Sortering"
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
            >
              <option value="name-asc">Namn (A-Ö)</option>
              <option value="price-asc">Pris (lägst först)</option>
              <option value="temperature-desc">Maxtemperatur (högst först)</option>
            </select>
          </div>
        </div>

        <p className="text-xs text-[var(--muted)]">
          {filteredMaterials.length} av{' '}
          {materials.filter((material) => material.status === 'active').length} aktiva material
          visas
        </p>
      </SurfaceCard>

      {loading ? (
        <SurfaceCard>
          <p className="text-sm text-[var(--muted)]">Läser in förhandsdata för material...</p>
        </SurfaceCard>
      ) : null}

      {!loading && error ? (
        <SurfaceCard>
          <p className="text-sm font-semibold text-red-700">Det gick inte att läsa in material.</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{error}</p>
        </SurfaceCard>
      ) : null}

      {!loading && !error && filteredMaterials.length === 0 ? (
        <SurfaceCard>
          <p className="text-sm font-semibold text-[var(--ink)]">
            Inga material matchar dina filter.
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Justera filtren eller lägg till ett nytt material via navigeringen.
          </p>
        </SurfaceCard>
      ) : null}

      {!loading && !error && filteredMaterials.length > 0 ? (
        <MaterialList materials={filteredMaterials} />
      ) : null}
    </div>
  );
}
