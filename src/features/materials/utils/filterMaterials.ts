import type { Material } from '@/types/material';
export type MaterialSortField =
  | 'name'
  | 'manufacturer'
  | 'category'
  | 'pricePerKgEur'
  | 'maxTemperatureC'
  | 'timePerLayer45DegSeconds';
export type SortDirection = 'asc' | 'desc';

export interface MaterialSort {
  field: MaterialSortField;
  direction: SortDirection;
}

export interface MaterialQuery {
  searchTerm: string;
  sort: MaterialSort;
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
      material.manufacturer,
      material.category,
      material.notes,
      material.maxTemperatureC?.toString() ?? '',
      material.pricePerKgEur.toString(),
      material.timePerLayer45DegSeconds.toString(),
    ];
    const searchableText = searchableParts.join(' ').toLowerCase();
    const matchesSearch =
      searchTerms.length === 0 || searchTerms.every((token) => searchableText.includes(token));

    return matchesSearch;
  });

  return filtered.sort((left, right) => {
    const factor = query.sort.direction === 'asc' ? 1 : -1;

    switch (query.sort.field) {
      case 'manufacturer':
        return left.manufacturer.localeCompare(right.manufacturer, 'sv-SE') * factor;
      case 'category':
        return left.category.localeCompare(right.category, 'sv-SE') * factor;
      case 'pricePerKgEur':
        return (left.pricePerKgEur - right.pricePerKgEur) * factor;
      case 'maxTemperatureC':
        return ((left.maxTemperatureC ?? -1) - (right.maxTemperatureC ?? -1)) * factor;
      case 'timePerLayer45DegSeconds':
        return (left.timePerLayer45DegSeconds - right.timePerLayer45DegSeconds) * factor;
      case 'name':
      default:
        return left.name.localeCompare(right.name, 'sv-SE') * factor;
    }
  });
}
