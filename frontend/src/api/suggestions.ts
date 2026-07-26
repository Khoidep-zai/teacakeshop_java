import type { Product, ProductSuggestion } from '../types';

type RawProductSuggestion = Partial<ProductSuggestion> & {
  suggestedProductId?: number;
  suggestedProductName?: string;
  suggestedProductType?: Product['productType'];
  suggestedProductImageUrl?: string;
  suggestedProductPrice?: number;
  createdAt?: string;
};

const normalizeSuggestion = (
  raw: RawProductSuggestion,
): ProductSuggestion | null => {
  if (raw?.suggestedProduct?.id && raw.suggestedProduct.name) {
    return raw as ProductSuggestion;
  }

  const id = Number(raw?.suggestedProductId);
  const name = raw?.suggestedProductName?.trim();
  const price = Number(raw?.suggestedProductPrice);

  if (!Number.isFinite(id) || id <= 0 || !name || !Number.isFinite(price)) {
    return null;
  }

  const suggestedProduct: Product = {
    id,
    name,
    description: raw.reason || '',
    price,
    finalPrice: price,
    productType: raw.suggestedProductType || 'TEA',
    categoryId: 0,
    categoryName: 'Gợi ý phối vị',
    imageUrl: raw.suggestedProductImageUrl || '',
    stockQuantity: 1,
    taste: '',
    temperatureType: 'BOTH',
    season: 'ALL',
    active: true,
    createdAt: raw.createdAt || '',
  };

  return {
    id: Number(raw.id) || id,
    suggestedProduct,
    reason: raw.reason || '',
    priority: Number(raw.priority) || 0,
  };
};

export const normalizeProductSuggestions = (
  data: unknown,
): ProductSuggestion[] => {
  if (!Array.isArray(data)) return [];

  return data
    .map(item => normalizeSuggestion(item as RawProductSuggestion))
    .filter((item): item is ProductSuggestion => item !== null);
};
