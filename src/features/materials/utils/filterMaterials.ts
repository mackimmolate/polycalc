import type { Material } from '@/types/material';
import type { Manufacturer } from '@/types/manufacturer';

export type MaterialSortOption = 'temperature-desc' | 'price-asc' | 'name-asc' | 'manufacturer-asc';

export interface MaterialQuery {
  searchTerm: string;
  category: string;
  manufacturer: Manufacturer | 'all';
  sort: MaterialSortOption;
  includeArchived?: boolean;
}

export function queryMaterials(materials: Material[], query: MaterialQuery) {
  const searchTerms = query.searchTerm
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 0);

  const filtered = materials.filter((material) => {
    const searchableParts = [
      material.name,
      material.manufacturer ?? '',
      material.category,
      material.notes,
      material.maxTemperature?.toString() ?? '',
    ];
    const searchableText = searchableParts.join(' ').toLowerCase();
    const matchesSearch =
      searchTerms.length === 0 || searchTerms.every((token) => searchableText.includes(token));

    const matchesCategory = query.category === 'all' || material.category === query.category;
    const matchesManufacturer =
      query.manufacturer === 'all' || material.manufacturer === query.manufacturer;
    const matchesVisibility = query.includeArchived ? true : material.status === 'active';

    return matchesSearch && matchesCategory && matchesManufacturer && matchesVisibility;
  });

  return filtered.sort((left, right) => {
    switch (query.sort) {
      case 'temperature-desc':
        return (right.maxTemperature ?? 0) - (left.maxTemperature ?? 0);
      case 'price-asc':
        return (
          (left.pricePerKg ?? Number.MAX_SAFE_INTEGER) -
          (right.pricePerKg ?? Number.MAX_SAFE_INTEGER)
        );
      case 'manufacturer-asc':
        return (left.manufacturer ?? '').localeCompare(right.manufacturer ?? '', 'sv-SE');
      case 'name-asc':
      default:
        return left.name.localeCompare(right.name, 'sv-SE');
    }
  });
}
