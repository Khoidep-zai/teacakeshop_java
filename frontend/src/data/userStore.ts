import type { Order, Reservation, UserProfile } from '../types';

// Initial sample data if storage is empty
const initialOrders: Order[] = [
  {
    id: 1,
    orderCode: 'ORD-2026-8801',
    orderType: 'NORMAL',
    status: 'CONFIRMED',
    totalAmount: 143000,
    discountAmount: 0,
    finalAmount: 143000,
    note: 'Giao hàng nhanh giúp tôi nhé!',
    customerName: 'Khoi Nguyen',
    customerEmail: 'nguyenkhoidk2005@gmail.com',
    customerPhone: '0902094421',
    items: [
      {
        id: 1,
        itemType: 'PRODUCT',
        itemName: 'Bánh Matcha Mousse Layered 2026', // field chính (khớp BE)
        name: 'Bánh Matcha Mousse Layered 2026',     // alias tương thích ngược
        imageUrl: '/images/products/matcha_cake.png',
        quantity: 1,
        unitPrice: 75000,
        lineTotal: 75000,    // field chính (khớp BE)
        totalPrice: 75000    // alias tương thích ngược
      },
      {
        id: 2,
        itemType: 'PRODUCT',
        itemName: 'Trà Sakura Lychee Rose Ủ Lạnh',
        name: 'Trà Sakura Lychee Rose Ủ Lạnh',
        imageUrl: '/images/products/sakura_tea.png',
        quantity: 1,
        unitPrice: 68000,
        lineTotal: 68000,
        totalPrice: 68000
      }
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const initialReservations: Reservation[] = [
  {
    id: 1,
    reservationCode: 'RES-2026-9901',
    customerName: 'Khoi Nguyen',
    customerPhone: '0902094421',
    customerEmail: 'nguyenkhoidk2005@gmail.com',
    reservationDate: new Date().toISOString().slice(0, 10),
    reservationTime: '18:30',
    partySize: 2,
    note: 'Góc Trà Chill Ban Công Cyber - Bàn cạnh cửa sổ',
    status: 'CONFIRMED',
    createdAt: new Date(Date.now() - 7200000).toISOString()
  }
];

const initialUsers: UserProfile[] = [
  {
    id: 1,
    fullName: 'Khoi Nguyen',
    email: 'nguyenkhoidk2005@gmail.com',
    phone: '0902094421',
    role: 'CUSTOMER',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    fullName: 'Admin Manager',
    email: 'admin@teacakeshop.com',
    phone: '0900000000',
    role: 'ADMIN',
    active: true,
    createdAt: new Date().toISOString()
  }
];

const loadStorage = <T,>(key: string, fallbackVal: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallbackVal;
  } catch {
    return fallbackVal;
  }
};

const saveStorage = <T,>(key: string, val: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    window.dispatchEvent(new Event('user_store_updated'));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

// Orders CRUD
export const getUserOrders = (): Order[] => loadStorage('store_orders', initialOrders);

export const addOrder = (orderData: Partial<Order>): Order => {
  const orders = getUserOrders();
  const newOrder: Order = {
    id: Date.now(),
    orderCode: orderData.orderCode || `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    orderType: orderData.orderType || 'NORMAL',
    status: orderData.status || 'PENDING',
    totalAmount: orderData.totalAmount || 0,
    discountAmount: orderData.discountAmount || 0,
    finalAmount: orderData.finalAmount || orderData.totalAmount || 0,
    note: orderData.note || '',
    customerName: orderData.customerName || '',
    customerEmail: orderData.customerEmail || '',
    customerPhone: orderData.customerPhone || '',
    shippingAddress: orderData.shippingAddress,
    // Normalize items: đảm bảo cả itemName/name và lineTotal/totalPrice đều có giá trị
    items: (orderData.items || []).map(i => ({
      ...i,
      itemName: (i as any).itemName || i.name || 'Sản phẩm',
      name: i.name || (i as any).itemName || 'Sản phẩm',
      lineTotal: (i as any).lineTotal ?? i.totalPrice ?? 0,
      totalPrice: i.totalPrice ?? (i as any).lineTotal ?? 0,
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  orders.unshift(newOrder);
  saveStorage('store_orders', orders);
  return newOrder;
};

export const updateOrderStatus = (orderId: number, status: Order['status']) => {
  const orders = getUserOrders();
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx >= 0) {
    orders[idx].status = status;
    orders[idx].updatedAt = new Date().toISOString();
    saveStorage('store_orders', orders);
  }
};

// Reservations CRUD
export const getUserReservations = (): Reservation[] => loadStorage('store_reservations', initialReservations);

export const addReservation = (resData: Partial<Reservation>): Reservation => {
  const list = getUserReservations();
  const newRes: Reservation = {
    id: Date.now(),
    reservationCode: resData.reservationCode || `RES-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: resData.customerName || 'Khoi Nguyen',
    customerPhone: resData.customerPhone || '0902094421',
    customerEmail: resData.customerEmail || 'nguyenkhoidk2005@gmail.com',
    reservationDate: resData.reservationDate || new Date().toISOString().slice(0, 10),
    reservationTime: resData.reservationTime || '18:00',
    partySize: resData.partySize || 2,
    note: resData.note || 'Đặt bàn Lounge 2026',
    status: resData.status || 'CONFIRMED',
    createdAt: new Date().toISOString()
  };
  list.unshift(newRes);
  saveStorage('store_reservations', list);
  return newRes;
};

export const updateReservationStatus = (resId: number, status: Reservation['status']) => {
  const list = getUserReservations();
  const idx = list.findIndex(r => r.id === resId);
  if (idx >= 0) {
    list[idx].status = status;
    saveStorage('store_reservations', list);
  }
};

// Users CRUD
export const getUserAccounts = (): UserProfile[] => loadStorage('store_users', initialUsers);

export const addUserAccount = (userData: Partial<UserProfile>): UserProfile => {
  const list = getUserAccounts();
  const existing = list.find(u => u.email.toLowerCase() === (userData.email || '').toLowerCase());
  if (existing) return existing;

  const newUser: UserProfile = {
    id: Date.now(),
    fullName: userData.fullName || 'Khoi Nguyen',
    email: userData.email || 'nguyenkhoidk2005@gmail.com',
    phone: userData.phone || '0902094421',
    role: userData.role || 'CUSTOMER',
    active: true,
    createdAt: new Date().toISOString()
  };
  list.unshift(newUser);
  saveStorage('store_users', list);
  return newUser;
};
