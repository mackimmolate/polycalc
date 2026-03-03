import type { MaterialCategory } from '@/types/material';

const categoryLabels: Record<MaterialCategory, string> = {
  PLA: 'PLA',
  PETG: 'PETG',
  ABS: 'ABS',
  Nylon: 'Nylon',
  TPU: 'TPU',
  Resin: 'Resin',
  Other: 'Övrigt',
};

export function getCategoryLabel(category: MaterialCategory) {
  return categoryLabels[category];
}
