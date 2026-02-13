import axios from 'utils/axios';
import type {
  Notification,
  NotificationListParams,
  NotificationListResponse,
  NotificationCountResponse,
  CreateNotificationPayload
} from '../types/notifications';

/**
 * Lista notificações do usuário autenticado
 */
export async function listNotifications(params?: NotificationListParams): Promise<NotificationListResponse> {
  const queryParams: Record<string, string> = {};

  if (params?.page) queryParams.page = params.page.toString();
  if (params?.limit) queryParams.limit = params.limit.toString();
  if (params?.search) queryParams.search = params.search;
  if (params?.read !== undefined) queryParams.read = params.read.toString();
  if (params?.entity) queryParams.entity = params.entity;
  if (params?.sortBy) queryParams.sortBy = params.sortBy;
  if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;

  const { data } = await axios.get<NotificationListResponse>('/notifications', { params: queryParams });
  return data;
}

/**
 * Busca uma notificação específica
 */
export async function getNotification(id: string): Promise<Notification> {
  const { data } = await axios.get<{ message: string; data: Notification }>(`/notifications/${id}`);
  return data.data;
}

/**
 * Cria uma nova notificação
 */
export async function createNotification(payload: CreateNotificationPayload): Promise<Notification> {
  const { data } = await axios.post<{ message: string; data: Notification }>('/notifications', payload);
  return data.data;
}

/**
 * Marca uma notificação como lida ou não lida
 */
export async function markNotificationRead(id: string, read: boolean): Promise<Notification> {
  const { data } = await axios.patch<{ message: string; data: Notification }>(`/notifications/${id}/read`, { read });
  return data.data;
}

/**
 * Marca todas as notificações como lidas
 */
export async function markAllNotificationsRead(): Promise<{ message: string }> {
  const { data } = await axios.post<{ message: string }>('/notifications/mark-all-read');
  return data;
}

/**
 * Conta notificações não lidas
 */
export async function getUnreadCount(entity?: string): Promise<number> {
  const params = entity ? { entity } : undefined;
  const { data } = await axios.get<NotificationCountResponse>('/notifications/unread/count', { params });
  return data.data.count;
}

/**
 * Remove uma notificação
 */
export async function deleteNotification(id: string): Promise<{ message: string }> {
  const { data } = await axios.delete<{ message: string }>(`/notifications/${id}`);
  return data;
}
