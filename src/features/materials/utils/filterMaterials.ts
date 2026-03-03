import type { Material } from '@/types/material';

export type MaterialSortOption = 'name-asc' | 'price-asc' | 'temperature-desc';

export interface MaterialQuery {
  searchTerm: string;
  category: string;
  sort: MaterialSortOption;
  includeArchived?: boolean;
}

export function queryMaterials(materials: Material[], query: MaterialQuery) {
  const normalizedSearch = query.searchTerm.trim().toLowerCase();

  const filtered = materials.filter((material) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      material.name.toLowerCase().includes(normalizedSearch) ||
      (material.manufacturer ?? '').toLowerCase().includes(normalizedSearch);

    const matchesCategory = query.category === 'all' || material.category === query.category;
    const matchesVisibility = query.includeArchived ? true : material.status === 'active';

    return matchesSearch && matchesCategory && matchesVisibility;
  });

  return filtered.sort((left, right) => {
    switch (query.sort) {
      case 'name-asc':
        return left.name.localeCompare(right.name, 'sv-SE');
      case 'price-asc':
        return (
          (left.pricePerKg ?? Number.MAX_SAFE_INTEGER) -
          (right.pricePerKg ?? Number.MAX_SAFE_INTEGER)
        );
      case 'temperature-desc':
      default:
        return (right.maxTemperature ?? 0) - (left.maxTemperature ?? 0);
    }
  });
}
