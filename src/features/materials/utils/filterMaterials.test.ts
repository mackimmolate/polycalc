import { describe, expect, it } from 'vitest';
import { queryMaterials, type MaterialSort } from '@/features/materials/utils/filterMaterials';
import type { Material } from '@/types/material';

const baseSort: MaterialSort = {
  field: 'name',
  direction: 'asc',
};

function createMaterial(overrides: Partial<Material>): Material {
  return {
    id: 'material-1',
    categoryId: 'category-1',
    manufacturerId: 'manufacturer-1',
    name: 'Nylon CF',
    category: 'Nylon',
    manufacturer: 'Bambu Lab',
    pricePerKgEur: 42.5,
    maxTemperatureC: 280,
    timePerLayerSeconds: 75,
    timePerLayerReferenceAngleDeg: 45,
    notes: 'Styv och tålig',
    createdAt: '2026-03-06T00:00:00.000Z',
    updatedAt: '2026-03-06T00:00:00.000Z',
    ...overrides,
  };
}

describe('filterMaterials', () => {
  it('matches search across name, manufacturer, category, notes, and numeric fields', () => {
    const materials = [
      createMaterial({
        id: 'material-1',
        name: 'Nylon CF',
        manufacturer: 'Bambu Lab',
        category: 'Nylon',
        notes: 'Styv och tålig',
        maxTemperatureC: 280,
      }),
      createMaterial({
        id: 'material-2',
        name: 'PLA Vit',
        manufacturer: 'SUNLU',
        category: 'PLA',
        notes: 'Snabb prototyp',
        maxTemperatureC: 210,
      }),
    ];

    expect(
      queryMaterials(materials, {
        searchTerm: 'sunlu prototyp 210',
        sort: baseSort,
      }),
    ).toHaveLength(1);
  });

  it('sorts by descending max temperature when requested', () => {
    const materials = [
      createMaterial({ id: 'cool', name: 'Cool', maxTemperatureC: 200 }),
      createMaterial({ id: 'hot', name: 'Hot', maxTemperatureC: 320 }),
    ];

    const result = queryMaterials(materials, {
      searchTerm: '',
      sort: { field: 'maxTemperatureC', direction: 'desc' },
    });

    expect(result.map((material) => material.id)).toEqual(['hot', 'cool']);
  });

  it('sorts by ascending time per layer when requested', () => {
    const materials = [
      createMaterial({ id: 'slow', name: 'Slow', timePerLayerSeconds: 120 }),
      createMaterial({ id: 'fast', name: 'Fast', timePerLayerSeconds: 30 }),
    ];

    const result = queryMaterials(materials, {
      searchTerm: '',
      sort: { field: 'timePerLayerSeconds', direction: 'asc' },
    });

    expect(result.map((material) => material.id)).toEqual(['fast', 'slow']);
  });

  it('handles multiple search tokens as AND matching', () => {
    const materials = [
      createMaterial({
        id: 'match',
        name: 'PETG Svart',
        manufacturer: 'Polymaker',
        notes: 'Värmetålig funktion',
      }),
      createMaterial({
        id: 'no-match',
        name: 'PETG Blå',
        manufacturer: 'SUNLU',
        notes: 'Dekorativ',
      }),
    ];

    const result = queryMaterials(materials, {
      searchTerm: 'petg polymaker värmetålig',
      sort: baseSort,
    });

    expect(result.map((material) => material.id)).toEqual(['match']);
  });
});
