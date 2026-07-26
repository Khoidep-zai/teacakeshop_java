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
export interface Category { id: number; name: string; description: string; active?: boolean; productCount?: number; }

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
  soldQuantity?: number; hot?: boolean; bestSeller?: boolean; createdAt: string;
  hotScore?: number; bestSellerScore?: number;
  discountAmount?: number; finalPrice?: number; discountCampaignId?: number;
  discountCampaignName?: string; updatedAt?: string;
}
export interface ProductSuggestion { id: number; suggestedProduct: Product; reason: string; priority: number; }

// ============================================================
// COMBO
// ============================================================
export type WeatherType = 'CLOUDY' | 'COLD' | 'HOT' | 'NORMAL' | 'RAINY' | 'SUNNY';
export interface ComboItem {
  id: number; productId?: number; productName?: string; quantity: number;
  unitPrice?: number; lineTotal?: number; product?: Product;
}
export interface Combo {
  id: number; name: string; description: string; comboPrice: number;
  originalPrice: number; savingAmount: number; imageUrl: string;
  weatherType: WeatherType; active: boolean; hot?: boolean;
  bestSeller?: boolean; soldQuantity?: number; hotScore?: number;
  bestSellerScore?: number; items: ComboItem[]; createdAt: string;
  startDate?: string; endDate?: string;
  /** BE response fields */
  finalPrice?: number; campaignDiscountAmount?: number; discountCampaignName?: string;
}

// ============================================================
// CART
// ============================================================
export type CartItemType = 'PRODUCT' | 'COMBO';
export interface CartItem {
  id: number;
  itemType: CartItemType;
  productId?: number;
  comboId?: number;
  /** Tên sản phẩm hoặc combo — BE trả về field "name" chung */
  productName?: string;
  comboName?: string;
  imageUrl?: string;
  quantity: number;
  /** Giá gốc trước khuyến mãi — BE: originalUnitPrice */
  originalUnitPrice?: number;
  /** Số tiền được giảm — BE: discountAmount */
  discountAmount?: number;
  /** Giá sau khuyến mãi (giá tính tiền) — BE: finalUnitPrice */
  unitPrice: number;
  /** Thành tiền = unitPrice × quantity — BE: lineTotal */
  totalPrice: number;
  /** Tên chương trình khuyến mãi đang áp dụng */
  campaignName?: string;
  /** Số lượng tối đa có thể mua (dựa trên tồn kho BE) */
  availableQuantity?: number;
}
export interface Cart {
  token: string;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  /** Tổng số tiền được giảm trong giỏ */
  totalDiscountAmount?: number;
}

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
  voucherCode?: string;
  voucherName?: string;
  voucherDiscountAmount?: number;
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
  id: number; orderId: number; orderCode: string; transactionCode: string;
  paymentMethod: PaymentMethod; status: PaymentStatus;
  purpose: PaymentPurpose; amount: number; orderTotalAmount: number;
  paidAmount: number; outstandingAmount: number; paidAt?: string;
  note?: string; createdAt: string;
}
export interface OrderPaymentSummary {
  orderId: number; orderCode: string; orderType: OrderType; orderStatus: OrderStatus;
  totalAmount: number; depositRequired: boolean; requiredDepositAmount: number;
  paidAmount: number; outstandingAmount: number; fullyPaid: boolean;
  payments: Payment[];
}
export interface InventoryAdjustment {
  id: number; productId: number; productName: string;
  previousQuantity: number; newQuantity: number; quantityChange: number;
  note: string; adjustedBy: string; createdAt: string;
}

// ============================================================
// RESERVATION
// ============================================================
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
/**
 * Khớp chính xác với backend ReservationResponse.
 * BE trả reservationTime là ISO LocalDateTime (yyyy-MM-ddTHH:mm:ss).
 * numberOfPeople thay vì partySize.
 * reservationDate và partySize là alias tương thích ngược cho local store.
 */
export interface Reservation {
  id: number;
  reservationCode: string;
  /** BE: reservationTime dạng ISO datetime, ví dụ "2026-07-26T15:00:00" */
  reservationTime: string;
  /** alias tương thích ngược: local store dùng reservationDate (YYYY-MM-DD) */
  reservationDate?: string;
  numberOfPeople: number;
  /** alias tương thích ngược: local store dùng partySize */
  partySize?: number;
  status: ReservationStatus;
  note: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderId?: number;
  orderCode?: string;
  createdAt: string;
  updatedAt?: string;
}

// ============================================================
// DISCOUNT
// ============================================================
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';
export type DiscountScope = 'STORE' | 'CATEGORY' | 'PRODUCT' | 'COMBO';
export interface Discount {
  id: number; name: string; code: string; discountType: DiscountType;
  description?: string; discountScope: DiscountScope; discountValue: number;
  maximumDiscountAmount?: number; categoryId?: number; productId?: number;
  codeRequired?: boolean; minimumOrderAmount?: number; requiredOrderType?: OrderType;
  comboId?: number; priority: number; startAt: string; endAt: string;
  active: boolean; currentlyEffective?: boolean;
}
export interface VoucherPreview {
  campaignId: number; code: string; name: string; orderAmount: number;
  discountAmount: number; finalAmount: number; minimumOrderAmount?: number;
  requiredOrderType?: OrderType;
}

// ============================================================
// DASHBOARD
// ============================================================
export interface DashboardOverview {
  totalRevenue: number; todayRevenue: number; monthRevenue: number;
  totalOrders: number; todayOrders: number; pendingOrders: number;
  confirmedOrders: number; preparingOrders: number; completedOrders: number;
  cancelledOrders: number; totalReservations: number; todayReservations: number;
  pendingReservations: number; confirmedReservations: number;
  seatedReservations: number; completedReservations: number;
  cancelledReservations: number; noShowReservations: number;
  activeProducts: number; lowStockProducts: number; generatedAt: string;
}
export interface DailyRevenue { date: string; revenue: number; orderCount: number; }
export interface TopProduct { itemId: number; itemName: string; itemType: CartItemType; soldQuantity: number; revenue: number; }
export interface LowStockProduct { productId: number; productName: string; categoryId: number; categoryName: string; stockQuantity: number; active: boolean; }

// ============================================================
// PAGEABLE
// ============================================================
export interface Page<T> { content: T[]; totalElements: number; totalPages: number; size: number; number: number; }
export interface ApiError { timestamp: string; status: number; error: string; message: string; path: string; }
