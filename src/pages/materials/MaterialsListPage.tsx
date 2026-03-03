import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeading } from '@/components/ui/PageHeading';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { MaterialList } from '@/features/materials/components/MaterialList';
import {
  queryMaterials,
  type MaterialSortOption,
} from '@/features/materials/utils/filterMaterials';
import { getMaterialPreviewList } from '@/services/materials/materialsService';
import type { Material, MaterialStatus } from '@/types/material';

export function MaterialsListPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<MaterialStatus | 'all'>('all');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<MaterialSortOption>('updated-desc');

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
              : 'Unable to load materials preview data.',
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
        status,
        category,
        sort,
      }),
    [materials, searchTerm, status, category, sort],
  );

  const categories = useMemo(
    () => ['all', ...new Set(materials.map((material) => material.category))],
    [materials],
  );

  return (
    <div className="space-y-6">
      <PageHeading
        title="Materials"
        description="Scan, filter, and navigate your material library quickly. This phase uses local preview data while Supabase CRUD is wired in the next phase."
        actions={
          <Link
            to="/materials/new"
            className="rounded-full border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            Add Material
          </Link>
        }
      />

      <SurfaceCard className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-[var(--ink)]">Search</span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Name, display name, manufacturer..."
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-semibold text-[var(--ink)]">Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as MaterialStatus | 'all')}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-semibold text-[var(--ink)]">Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
            >
              {categories.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'All categories' : option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-semibold text-[var(--ink)]">Sort</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as MaterialSortOption)}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
            >
              <option value="updated-desc">Most recently updated</option>
              <option value="name-asc">Name (A to Z)</option>
              <option value="price-asc">Price (low to high)</option>
              <option value="temperature-desc">Max temperature (high to low)</option>
            </select>
          </label>
        </div>

        <p className="text-xs text-[var(--muted)]">
          {filteredMaterials.length} of {materials.length} materials shown
        </p>
      </SurfaceCard>

      {loading ? (
        <SurfaceCard>
          <p className="text-sm text-[var(--muted)]">Loading preview materials...</p>
        </SurfaceCard>
      ) : null}

      {!loading && error ? (
        <SurfaceCard>
          <p className="text-sm font-semibold text-red-700">Could not load materials.</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{error}</p>
        </SurfaceCard>
      ) : null}

      {!loading && !error && filteredMaterials.length === 0 ? (
        <SurfaceCard>
          <p className="text-sm font-semibold text-[var(--ink)]">
            No materials match your filters.
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Adjust filters or add a new material to start building the library.
          </p>
        </SurfaceCard>
      ) : null}

      {!loading && !error && filteredMaterials.length > 0 ? (
        <MaterialList materials={filteredMaterials} />
      ) : null}
    </div>
  );
}
