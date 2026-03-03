import { materialPreviewData } from '@/features/materials/data/materialPreviewData';
import type { Material } from '@/types/material';

export async function getMaterialPreviewList(): Promise<Material[]> {
  return Promise.resolve(materialPreviewData);
}

export async function getMaterialPreviewById(materialId: string): Promise<Material | null> {
  const material = materialPreviewData.find((entry) => entry.id === materialId) ?? null;
  return Promise.resolve(material);
}
