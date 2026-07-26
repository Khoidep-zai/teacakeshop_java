// ============================================================
// AUTH
// ============================================================
export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { fullName: string; email: string; phone: string; password: string; }
export interface AuthResponse { accessToken: string; refreshToken: string; tokenType: string; expiresIn: number; }
export interface UserProfile { id: number; fullName: string; email: string; phone: string; role: 'ADMIN' | 'CUSTOMER' | 'STAFF'; active: boolean; createdAt: string; }

// ============================================================
// CATEGORY
// ============================================================
export interface Category { id: number; name: string; description: string; productCount?: number; }

// ============================================================
// PRODUCT
// ============================================================
export type ProductType = 'TEA' | 'CAKE';
export type TemperatureType = 'HOT' | 'COLD' | 'BOTH';
export interface Product {
  id: number; name: string; description: string; price: number;
  productType: ProductType; categoryId: number; categoryName: string;
  imageUrl: string; stockQuantity: number; taste: string;
  temperatureType: TemperatureType; season: string; active: boolean;
  hotScore: number; bestSellerScore: number; createdAt: string;
}
export interface ProductSuggestion { id: number; suggestedProduct: Product; reason: string; priority: number; }

// ============================================================
// COMBO
// ============================================================
export type WeatherType = 'CLOUDY' | 'COLD' | 'HOT' | 'NORMAL' | 'RAINY' | 'SUNNY';
export interface ComboItem { id: number; product: Product; quantity: number; }
export interface Combo {
  id: number; name: string; description: string; comboPrice: number;
  originalPrice: number; savingAmount: number; imageUrl: string;
  weatherType: WeatherType; active: boolean; hotScore: number;
  bestSellerScore: number; items: ComboItem[]; createdAt: string;
}

// ============================================================
// CART
// ============================================================
export type CartItemType = 'PRODUCT' | 'COMBO';
export interface CartItem {
  id: number; itemType: CartItemType; productId?: number; comboId?: number;
  productName?: string; comboName?: string; imageUrl?: string;
  quantity: number; unitPrice: number; totalPrice: number;
}
export interface Cart { token: string; items: CartItem[]; totalAmount: number; itemCount: number; }

// ============================================================
// ORDER
// ============================================================
export type OrderType = 'NORMAL' | 'RESERVATION_COMBO' | 'TAKEAWAY_PREORDER';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'COMPLETED' | 'CANCELLED';

/**
 * Khớp chính xác với backend OrderItemResponse.
 * Các field alias (name, totalPrice) để tương thích ngược với local store.
 */
export interface OrderItem {
  id: number;
  itemType: CartItemType;
  itemId?: number;
  itemName: string;       // BE: itemName
  name?: string;          // alias ngược: local store dùng name
  imageUrl?: string;
  originalUnitPrice?: number;
  discountAmount?: number;
  unitPrice: number;
  quantity: number;
  lineTotal: number;      // BE: lineTotal
  totalPrice?: number;    // alias ngược: local store dùng totalPrice
  discountCode?: string;
  discountName?: string;
}

/**
 * Khớp với backend OrderResponse.
 * discountAmount / finalAmount là computed fields cho local store.
 */
export interface Order {
  id: number;
  orderCode: string;
  orderType: OrderType;
  status: OrderStatus;
  totalAmount: number;
  depositRequired?: boolean;
  depositAmount?: number;
  remainingAmount?: number;
  shippingAddress?: string;
  pickupTime?: string;
  note?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  // Computed / local store fields
  discountAmount?: number;
  finalAmount?: number;
}

// ============================================================
// PAYMENT
// ============================================================
export type PaymentMethod = 'CASH_ON_DELIVERY' | 'BANK_TRANSFER' | 'MOMO_SIMULATION' | 'VNPAY_SIMULATION';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentPurpose = 'FULL' | 'DEPOSIT' | 'REMAINING';
export interface Payment {
  id: number; paymentMethod: PaymentMethod; status: PaymentStatus;
  purpose: PaymentPurpose; amount: number; paidAt?: string; createdAt: string;
}

// ============================================================
// RESERVATION
// ============================================================
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export interface Reservation {
  id: number; reservationCode: string; reservationDate: string; reservationTime: string;
  partySize: number; status: ReservationStatus; note: string;
  customerName: string; customerEmail: string; customerPhone: string;
  createdAt: string;
}

// ============================================================
// DISCOUNT
// ============================================================
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';
export type DiscountScope = 'STORE' | 'CATEGORY' | 'PRODUCT' | 'COMBO';
export interface Discount {
  id: number; name: string; code: string; discountType: DiscountType;
  discountScope: DiscountScope; discountValue: number; minOrderAmount: number;
  maxDiscountAmount?: number; startDate: string; endDate: string; active: boolean;
}

// ============================================================
// DASHBOARD
// ============================================================
export interface DashboardOverview {
  totalRevenue: number; totalOrders: number; totalCustomers: number;
  totalProducts: number; pendingOrders: number; todayRevenue: number;
}
export interface DailyRevenue { date: string; revenue: number; orderCount: number; }
export interface TopProduct { productId: number; productName: string; imageUrl: string; totalSold: number; revenue: number; }
export interface LowStockProduct { productId: number; productName: string; stockQuantity: number; }

// ============================================================
// PAGEABLE
// ============================================================
export interface Page<T> { content: T[]; totalElements: number; totalPages: number; size: number; number: number; }
export interface ApiError { timestamp: string; status: number; error: string; message: string; path: string; }
