import type { MaterialCategory } from '@/types/material';

const categoryLabels: Record<string, string> = {
  PLA: 'PLA',
  PETG: 'PETG',
  ABS: 'ABS',
  Nylon: 'Nylon',
  TPU: 'TPU',
  Resin: 'Resin',
};

export function getCategoryLabel(category: MaterialCategory) {
  const normalized = category.trim();
  if (normalized.length === 0) {
    return 'Ej angiven';
  }

  return categoryLabels[normalized] ?? normalized;
}
