export type ClothingCategory = 'top' | 'bottom' | 'shoes' | 'accessory' | 'fullbody_outerwear' | 'uncategorized';

export interface ClothingItem {
  file: File;
  base64: string;
  category: ClothingCategory;
}

export interface StorableClothingItem {
  id: string;
  name: string;
  size: number;
  base64: string;
  mimeType: string;
  category: ClothingCategory;
}

export interface StyleOption {
  value: string;
  label: string;
  description: string;
}

export interface Look {
  id: string;
  description: string;
  image: string | null;
  isFavorited: boolean;
}

export interface Avatar {
  id: string;
  src: string;
  alt: string;
}
