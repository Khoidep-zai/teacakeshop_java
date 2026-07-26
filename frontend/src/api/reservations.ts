import api from './axios';
import type { Reservation, Page } from '../types';

/**
 * Kiểm tra khung giờ còn chỗ.
 * BE expect: reservationTime (ISO LocalDateTime), numberOfPeople (number)
 */
export const checkAvailability = (reservationTime: string, numberOfPeople: number) =>
  api.get('/reservations/availability', { params: { reservationTime, numberOfPeople } }).then(r => r.data);

export const createReservation = (data: any) =>
  api.post<Reservation>('/reservations', data).then(r => r.data);

export const getReservation = (code: string) =>
  api.get<Reservation>(`/reservations/${code}`).then(r => r.data);

export const cancelReservation = (code: string) =>
  api.patch(`/reservations/${code}/cancel`).then(r => r.data);

/**
 * Lấy danh sách đặt bàn của user (Page<ReservationResponse>).
 * Trả về mảng .content thay vì Page object.
 */
export const getMyReservations = (page = 0, size = 50) =>
  api.get<Page<Reservation>>('/customer/reservations', { params: { page, size } })
    .then(r => r.data.content ?? []);

export const getAdminReservations = (params?: any) =>
  api.get('/admin/reservations', { params }).then(r => r.data);

export const updateReservationStatus = (id: number, status: string) =>
  api.patch(`/admin/reservations/${id}/status`, { status }).then(r => r.data);
