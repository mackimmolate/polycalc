import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PageHeading } from '@/components/ui/PageHeading';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { MaterialList } from '@/features/materials/components/MaterialList';
import {
  queryMaterials,
  type MaterialSort,
  type SortDirection,
  type MaterialSortField,
} from '@/features/materials/utils/filterMaterials';
import { listMaterials } from '@/services/materials/materialsService';
import type { Material } from '@/types/material';

interface NavigationState {
  successMessage?: string;
}

export function MaterialsListPage() {
  const location = useLocation();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState<MaterialSort>({ field: 'name', direction: 'asc' });

  const successMessage = (location.state as NavigationState | null)?.successMessage ?? null;

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const databaseMaterials = await listMaterials();
        if (isMounted) {
          setMaterials(databaseMaterials);
        }
      } catch (caughtError) {
        if (isMounted) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : 'Det gick inte att läsa in material från databasen.',
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
        sort,
      }),
    [materials, searchTerm, sort],
  );

  const onSortChange = (field: MaterialSortField) => {
    setSort((current) => {
      if (current.field === field) {
        return { field, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }

      const defaultDirection: SortDirection =
        field === 'pricePerKgEur' || field === 'maxTemperatureC' ? 'desc' : 'asc';
      return { field, direction: defaultDirection };
    });
  };

  return (
    <div className="space-y-6">
      <PageHeading
        title="Material"
        description="Sök snabbt och sortera direkt i rubrikerna för att hitta rätt material för jobbet."
      />

      <SurfaceCard className="space-y-3">
        <label htmlFor="materials-search" className="sr-only">
          Sök material
        </label>
        <input
          id="materials-search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          aria-label="Sök material"
          placeholder="Sök namn, tillverkare, kategori, notering eller temperatur"
          className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
        />
        <p className="text-xs text-[var(--muted)]">
          {filteredMaterials.length} av {materials.length} material visas
        </p>
      </SurfaceCard>

      {successMessage ? (
        <SurfaceCard>
          <p className="text-sm font-semibold text-emerald-700">{successMessage}</p>
        </SurfaceCard>
      ) : null}

      {loading ? (
        <SurfaceCard>
          <p className="text-sm text-[var(--muted)]">Läser in material...</p>
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
            Inga material matchar sökningen.
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Testa ett annat sökord eller skapa ett nytt material.
          </p>
        </SurfaceCard>
      ) : null}

      {!loading && !error && filteredMaterials.length > 0 ? (
        <MaterialList materials={filteredMaterials} sort={sort} onSortChange={onSortChange} />
      ) : null}
    </div>
  );
}
