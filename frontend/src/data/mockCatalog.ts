import type { Product, Combo, Category } from '../types';

export interface DiscountItem {
  id: number;
  code: string;
  name: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  scope: 'ALL_PRODUCTS' | 'SPECIFIC_CATEGORY' | 'SPECIFIC_PRODUCT';
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// Default initial datasets
const initialCategories: Category[] = [
  { id: 1, name: 'Bánh ngọt Pháp', description: 'Bánh mousse, chiffon, tart thủ công cao cấp nướng nguyên liệu Pháp.', productCount: 3 },
  { id: 2, name: 'Trà Ủ Lạnh (Cold Brew)', description: 'Trà thảo mộc hữu cơ ngâm lạnh 12 tiếng đượm hậu vị thanh nhẹ.', productCount: 3 },
  { id: 3, name: 'Set Combo Pass', description: 'Gói ưu đãi kết hợp hoàn hảo giữa Trà Ủ Lạnh & Bánh ngọt.', productCount: 3 },
];

const initialProducts: Product[] = [
  {
    id: 1,
    name: 'Bánh Matcha Mousse Layered 2026',
    description: 'Bánh mousse trà xanh Matcha Uji Nhật Bản 3 lớp mềm mịn phủ lá vàng 24k nghệ thuật.',
    price: 75000,
    productType: 'CAKE',
    categoryId: 1,
    categoryName: 'Bánh ngọt Pháp',
    stockQuantity: 25,
    taste: 'Ngọt nhẹ, đắng thanh',
    temperatureType: 'BOTH',
    season: 'ALL',
    imageUrl: '/images/products/matcha_cake.png',
    active: true,
    hotScore: 99,
    bestSellerScore: 95,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Bánh Earl Grey Chiffon Lavender',
    description: 'Cốt bánh chiffon trà Earl Grey thơm nồng hòa quyện lớp kem tươi lavender và dâu tây Pháp.',
    price: 82000,
    productType: 'CAKE',
    categoryId: 1,
    categoryName: 'Bánh ngọt Pháp',
    stockQuantity: 18,
    taste: 'Hương trà thơm ngát',
    temperatureType: 'BOTH',
    season: 'ALL',
    imageUrl: '/images/products/earl_grey.png',
    active: true,
    hotScore: 92,
    bestSellerScore: 90,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Trà Sakura Lychee Rose Ủ Lạnh',
    description: 'Chiết xuất hoa anh đào Nhật Bản kết hợp vải thiều mọng nước và nụ hoa hồng hữu cơ ngâm đá.',
    price: 68000,
    productType: 'TEA',
    categoryId: 2,
    categoryName: 'Trà Ủ Lạnh (Cold Brew)',
    stockQuantity: 30,
    taste: 'Thanh mát, thơm ngọt',
    temperatureType: 'COLD',
    season: 'SUMMER',
    imageUrl: '/images/products/sakura_tea.png',
    active: true,
    hotScore: 96,
    bestSellerScore: 94,
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    name: 'Trà Oolong Kim Tuyên Hoàng Gia',
    description: 'Trà Oolong núi cao hương sữa tự nhiên ủ lạnh trong suốt 12 tiếng giữ trọn vị ngọt đượm hậu vị.',
    price: 65000,
    productType: 'TEA',
    categoryId: 2,
    categoryName: 'Trà Ủ Lạnh (Cold Brew)',
    stockQuantity: 28,
    taste: 'Đượm hậu vị',
    temperatureType: 'COLD',
    season: 'ALL',
    imageUrl: '/images/products/oolong_tea.png',
    active: true,
    hotScore: 94,
    bestSellerScore: 92,
    createdAt: new Date().toISOString()
  },
  {
    id: 5,
    name: 'Tart Chocolate Truffle Đắng 70%',
    description: 'Lớp nhân chocolate Bỉ đắng nồng nàn hòa quyện vỏ tart giòn tan bơ Pháp cao cấp.',
    price: 88000,
    productType: 'CAKE',
    categoryId: 1,
    categoryName: 'Bánh ngọt Pháp',
    stockQuantity: 15,
    taste: 'Đậm đà nồng nàn',
    temperatureType: 'BOTH',
    season: 'ALL',
    imageUrl: '/images/products/truffle_tart.png',
    active: true,
    hotScore: 90,
    bestSellerScore: 88,
    createdAt: new Date().toISOString()
  },
  {
    id: 6,
    name: 'Trà Jasmine Blossom Ủ Thạch Hữu Cơ',
    description: 'Trà nhài đồi cao ngâm hoa nhài tươi kết hợp thạch giòn sần sật thanh nhiệt cơ thể.',
    price: 62000,
    productType: 'TEA',
    categoryId: 2,
    categoryName: 'Trà Ủ Lạnh (Cold Brew)',
    stockQuantity: 35,
    taste: 'Thanh nhẹ dịu mát',
    temperatureType: 'COLD',
    season: 'SUMMER',
    imageUrl: '/images/products/jasmine_tea.png',
    active: true,
    hotScore: 88,
    bestSellerScore: 85,
    createdAt: new Date().toISOString()
  }
];

const initialCombos: Combo[] = [
  {
    id: 1,
    name: 'Set Trà Chiều Royal Afternoon Tea Pass',
    description: 'Bộ đôi Trà Oolong Kim Tuyên Hoàng Gia & Bánh Matcha Mousse Layered 2026 lá vàng sang trọng.',
    originalPrice: 165000,
    comboPrice: 135000,
    savingAmount: 30000,
    imageUrl: '/images/combos/royal_tea_set.png',
    active: true,
    weatherType: 'SUNNY',
    hotScore: 99,
    bestSellerScore: 98,
    createdAt: new Date().toISOString(),
    items: [
      { id: 101, quantity: 1, product: initialProducts[0] },
      { id: 102, quantity: 1, product: initialProducts[3] }
    ]
  },
  {
    id: 2,
    name: 'Set Thư Thái Đêm Mưa Cyber Chill',
    description: 'Trà Sakura Lychee Rose Ủ Lạnh ngọt ngào kèm Bánh Earl Grey Chiffon Lavender thơm nồng.',
    originalPrice: 170000,
    comboPrice: 139000,
    savingAmount: 31000,
    imageUrl: '/images/combos/combo_rainy.png',
    active: true,
    weatherType: 'RAINY',
    hotScore: 95,
    bestSellerScore: 93,
    createdAt: new Date().toISOString(),
    items: [
      { id: 201, quantity: 1, product: initialProducts[2] },
      { id: 202, quantity: 1, product: initialProducts[1] }
    ]
  },
  {
    id: 3,
    name: 'Set Năng Lượng Đột Phá Interstellar',
    description: 'Trà Jasmine Blossom Ủ Thạch Hữu Cơ kết hợp Tart Chocolate Truffle Đắng 70% đậm đà.',
    originalPrice: 180000,
    comboPrice: 145000,
    savingAmount: 35000,
    imageUrl: '/images/combos/combo_energy.png',
    active: true,
    weatherType: 'COLD',
    hotScore: 92,
    bestSellerScore: 90,
    createdAt: new Date().toISOString(),
    items: [
      { id: 301, quantity: 1, product: initialProducts[5] },
      { id: 302, quantity: 1, product: initialProducts[4] }
    ]
  }
];

const initialDiscounts: DiscountItem[] = [
  {
    id: 1,
    code: 'WELCOME2026',
    name: 'Ưu đãi chào mừng thành viên mới 2026',
    discountType: 'PERCENTAGE',
    value: 20,
    scope: 'ALL_PRODUCTS',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    isActive: true
  },
  {
    id: 2,
    code: 'CYBERCHILL',
    name: 'Voucher Đêm Mưa Chill Giảm 30K',
    discountType: 'FIXED_AMOUNT',
    value: 30000,
    scope: 'ALL_PRODUCTS',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 15 * 86400000).toISOString(),
    isActive: true
  },
  {
    id: 3,
    code: 'ROYALTEA',
    name: 'Giảm 15% cho Set Trà Chiều Hoàng Gia',
    discountType: 'PERCENTAGE',
    value: 15,
    scope: 'ALL_PRODUCTS',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 60 * 86400000).toISOString(),
    isActive: true
  }
];

// LocalStorage Persistence Helpers
const loadStorage = <T,>(key: string, defaultVal: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
};

const saveStorage = <T,>(key: string, val: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    window.dispatchEvent(new Event('catalog_updated'));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

// Exported Active Datasets
export const getCatalogProducts = (): Product[] => loadStorage('admin_products', initialProducts);
export const getCatalogCombos = (): Combo[] => loadStorage('admin_combos', initialCombos);
export const getCatalogCategories = (): Category[] => loadStorage('admin_categories', initialCategories);
export const getCatalogDiscounts = (): DiscountItem[] => loadStorage('admin_discounts', initialDiscounts);

// CRUD Helpers for Products
export const saveProduct = (productData: Partial<Product>): Product => {
  const products = getCatalogProducts();
  let updated: Product;
  if (productData.id) {
    const idx = products.findIndex(p => p.id === productData.id);
    updated = { ...products[idx], ...productData } as Product;
    if (idx >= 0) products[idx] = updated;
  } else {
    updated = {
      id: Date.now(),
      name: productData.name || 'Sản phẩm mới',
      description: productData.description || '',
      price: productData.price || 50000,
      productType: productData.productType || 'CAKE',
      categoryId: productData.categoryId || 1,
      categoryName: productData.categoryName || 'Bánh ngọt Pháp',
      stockQuantity: productData.stockQuantity || 20,
      taste: productData.taste || 'Thơm ngon',
      temperatureType: productData.temperatureType || 'BOTH',
      season: 'ALL',
      imageUrl: productData.imageUrl || '/images/products/matcha_cake.png',
      active: productData.active ?? true,
      hotScore: 90,
      bestSellerScore: 90,
      createdAt: new Date().toISOString()
    };
    products.push(updated);
  }
  saveStorage('admin_products', products);
  return updated;
};

export const deleteCatalogProduct = (id: number) => {
  const products = getCatalogProducts().filter(p => p.id !== id);
  saveStorage('admin_products', products);
};

// CRUD Helpers for Combos
export const saveCombo = (comboData: Partial<Combo>): Combo => {
  const combos = getCatalogCombos();
  let updated: Combo;
  if (comboData.id) {
    const idx = combos.findIndex(c => c.id === comboData.id);
    updated = { ...combos[idx], ...comboData } as Combo;
    if (idx >= 0) combos[idx] = updated;
  } else {
    updated = {
      id: Date.now(),
      name: comboData.name || 'Set Combo Mới 2026',
      description: comboData.description || '',
      comboPrice: comboData.comboPrice || 120000,
      originalPrice: comboData.originalPrice || 150000,
      savingAmount: (comboData.originalPrice || 150000) - (comboData.comboPrice || 120000),
      imageUrl: comboData.imageUrl || '/images/combos/royal_tea_set.png',
      weatherType: comboData.weatherType || 'SUNNY',
      active: comboData.active ?? true,
      hotScore: 90,
      bestSellerScore: 90,
      items: comboData.items || [],
      createdAt: new Date().toISOString()
    };
    combos.push(updated);
  }
  saveStorage('admin_combos', combos);
  return updated;
};

export const deleteCatalogCombo = (id: number) => {
  const combos = getCatalogCombos().filter(c => c.id !== id);
  saveStorage('admin_combos', combos);
};

// CRUD Helpers for Categories
export const saveCategory = (catData: Partial<Category>): Category => {
  const categories = getCatalogCategories();
  let updated: Category;
  if (catData.id) {
    const idx = categories.findIndex(c => c.id === catData.id);
    updated = { ...categories[idx], ...catData } as Category;
    if (idx >= 0) categories[idx] = updated;
  } else {
    updated = {
      id: Date.now(),
      name: catData.name || 'Danh mục mới',
      description: catData.description || '',
      productCount: 0
    };
    categories.push(updated);
  }
  saveStorage('admin_categories', categories);
  return updated;
};

export const deleteCatalogCategory = (id: number) => {
  const categories = getCatalogCategories().filter(c => c.id !== id);
  saveStorage('admin_categories', categories);
};

// CRUD Helpers for Discounts
export const saveDiscount = (discData: Partial<DiscountItem>): DiscountItem => {
  const discounts = getCatalogDiscounts();
  let updated: DiscountItem;
  if (discData.id) {
    const idx = discounts.findIndex(d => d.id === discData.id);
    updated = { ...discounts[idx], ...discData } as DiscountItem;
    if (idx >= 0) discounts[idx] = updated;
  } else {
    updated = {
      id: Date.now(),
      code: (discData.code || 'VOUCHER2026').toUpperCase(),
      name: discData.name || 'Voucher Khuyến Mãi Mới',
      discountType: discData.discountType || 'PERCENTAGE',
      value: discData.value || 10,
      scope: discData.scope || 'ALL_PRODUCTS',
      startDate: discData.startDate || new Date().toISOString(),
      endDate: discData.endDate || new Date(Date.now() + 30 * 86400000).toISOString(),
      isActive: discData.isActive ?? true
    };
    discounts.push(updated);
  }
  saveStorage('admin_discounts', discounts);
  return updated;
};

export const deleteCatalogDiscount = (id: number) => {
  const discounts = getCatalogDiscounts().filter(d => d.id !== id);
  saveStorage('admin_discounts', discounts);
};

// Export legacy static arrays for fallback initialization
export const fallbackProducts = getCatalogProducts();
export const fallbackCombos = getCatalogCombos();
