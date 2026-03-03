import type { Material, MaterialStatus } from '@/types/material';

export type MaterialSortOption = 'updated-desc' | 'name-asc' | 'price-asc' | 'temperature-desc';

export interface MaterialQuery {
  searchTerm: string;
  status: MaterialStatus | 'all';
  category: string;
  sort: MaterialSortOption;
}

export function queryMaterials(materials: Material[], query: MaterialQuery) {
  const normalizedSearch = query.searchTerm.trim().toLowerCase();

  const filtered = materials.filter((material) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      material.displayName.toLowerCase().includes(normalizedSearch) ||
      material.name.toLowerCase().includes(normalizedSearch) ||
      (material.manufacturer ?? '').toLowerCase().includes(normalizedSearch);

    const matchesStatus = query.status === 'all' || material.status === query.status;
    const matchesCategory = query.category === 'all' || material.category === query.category;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return filtered.sort((left, right) => {
    switch (query.sort) {
      case 'name-asc':
        return left.displayName.localeCompare(right.displayName);
      case 'price-asc':
        return (
          (left.pricePerKg ?? Number.MAX_SAFE_INTEGER) -
          (right.pricePerKg ?? Number.MAX_SAFE_INTEGER)
        );
      case 'temperature-desc':
        return (right.maxTemperature ?? 0) - (left.maxTemperature ?? 0);
      case 'updated-desc':
      default:
        return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    }
  });
}
