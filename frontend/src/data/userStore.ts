import type { Order, Reservation, UserProfile } from '../types';

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
export const getUserOrders = (): Order[] => loadStorage('store_orders', []);

export const addOrder = (orderData: Partial<Order>): Order => {
  const orders = getUserOrders();
  const existingIdx = orderData.orderCode ? orders.findIndex(o => o.orderCode === orderData.orderCode) : -1;

  const newOrder: Order = {
    id: orderData.id || Date.now(),
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
    createdAt: orderData.createdAt || new Date().toISOString(),
    updatedAt: orderData.updatedAt || new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    orders[existingIdx] = { ...orders[existingIdx], ...newOrder };
  } else {
    orders.unshift(newOrder);
  }

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
export const getUserReservations = (): Reservation[] => loadStorage('store_reservations', []);

export const addReservation = (resData: Partial<Reservation>): Reservation => {
  const list = getUserReservations();
  const existingIdx = resData.reservationCode ? list.findIndex(r => r.reservationCode === resData.reservationCode) : -1;

  const newRes: Reservation = {
    id: resData.id || Date.now(),
    reservationCode: resData.reservationCode || `RES-LOCAL-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: resData.customerName || '',
    customerPhone: resData.customerPhone || '',
    customerEmail: resData.customerEmail || '',
    // reservationTime là ISO datetime từ BE hoặc ghép từ local store
    reservationTime: resData.reservationTime || `${resData.reservationDate || new Date().toISOString().slice(0, 10)}T18:00:00`,
    reservationDate: resData.reservationDate,
    numberOfPeople: resData.numberOfPeople ?? resData.partySize ?? 2,
    partySize: resData.partySize ?? resData.numberOfPeople ?? 2,
    note: resData.note || 'Đặt bàn Lounge',
    status: resData.status || 'PENDING',
    createdAt: resData.createdAt || new Date().toISOString()
  };

  if (existingIdx >= 0) {
    list[existingIdx] = { ...list[existingIdx], ...newRes };
  } else {
    list.unshift(newRes);
  }

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
export const getUserAccounts = (): UserProfile[] => loadStorage('store_users', []);

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
