/**
 * Lấy đường dẫn ảnh cho sản phẩm.
 * Ưu tiên ảnh backend, sau đó chỉ dùng ảnh minh họa tĩnh.
 */
export const getProductImageUrl = (product: {
  id: number;
  imageUrl?: string | null;
  name: string;
}): string => {
  // Nếu backend trả về imageUrl hợp lệ, dùng luôn
  if (product.imageUrl && product.imageUrl !== '/favicon.svg') {
    return product.imageUrl;
  }

  // Match theo tên sản phẩm
  const lower = product.name.toLowerCase();
  if (lower.includes('matcha') || lower.includes('xanh')) {
    return '/images/products/matcha_cake.png';
  }
  if (lower.includes('earl') || lower.includes('bá tước')) {
    return '/images/products/earl_grey.png';
  }
  if (lower.includes('sakura') || lower.includes('hoa anh đào')) {
    return '/images/products/sakura_tea.png';
  }
  if (lower.includes('oolong') || lower.includes('ô long')) {
    return '/images/products/oolong_tea.png';
  }
  if (lower.includes('truffle') || lower.includes('tart') || lower.includes('nấm')) {
    return '/images/products/truffle_tart.png';
  }
  if (lower.includes('jasmine') || lower.includes('nhài') || lower.includes('lài')) {
    return '/images/products/jasmine_tea.png';
  }

  // Fallback mặc định
  return '/images/products/matcha_cake.png';
};

/**
 * Lấy đường dẫn ảnh cho combo.
 * Ưu tiên ảnh backend, sau đó chỉ dùng ảnh minh họa tĩnh.
 */
export const getComboImageUrl = (combo: {
  id: number;
  imageUrl?: string | null;
  name?: string;
}): string => {
  // Nếu backend trả về imageUrl hợp lệ, dùng luôn
  if (combo.imageUrl && combo.imageUrl !== '/favicon.svg') {
    return combo.imageUrl;
  }

  // Match theo tên nếu có
  if (combo.name) {
    const lower = combo.name.toLowerCase();
    if (lower.includes('rain') || lower.includes('mưa')) {
      return '/images/combos/combo_rainy.png';
    }
    if (lower.includes('energy') || lower.includes('năng lượng')) {
      return '/images/combos/combo_energy.png';
    }
  }

  // Fallback mặc định
  return '/images/combos/royal_tea_set.png';
};

/**
 * Lấy đường dẫn ảnh cho cart item.
 * Hỗ trợ cả product và combo.
 */
export const getCartItemImageUrl = (item: {
  itemType: 'PRODUCT' | 'COMBO';
  imageUrl?: string | null;
  productName?: string;
  comboName?: string;
  productId?: number;
  comboId?: number;
}): string => {
  if (item.itemType === 'COMBO') {
    return getComboImageUrl({
      id: item.comboId || 0,
      imageUrl: item.imageUrl,
      name: item.comboName,
    });
  } else {
    return getProductImageUrl({
      id: item.productId || 0,
      imageUrl: item.imageUrl,
      name: item.productName || '',
    });
  }
};
