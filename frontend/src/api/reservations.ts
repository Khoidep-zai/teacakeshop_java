import api from './axios';
import type { Reservation } from '../types';
export const checkAvailability = (date: string, time: string) => api.get('/reservations/availability', { params: { date, time } }).then(r => r.data);
export const createReservation = (data: any) => api.post<Reservation>('/reservations', data).then(r => r.data);
export const getReservation = (code: string) => api.get<Reservation>(`/reservations/${code}`).then(r => r.data);
export const cancelReservation = (code: string) => api.patch(`/reservations/${code}/cancel`).then(r => r.data);
export const getMyReservations = () => api.get<Reservation[]>('/customer/reservations').then(r => r.data);
export const getAdminReservations = (params?: any) => api.get('/admin/reservations', { params }).then(r => r.data);
export const updateReservationStatus = (id: number, status: string) => api.patch(`/admin/reservations/${id}/status`, { status }).then(r => r.data);
