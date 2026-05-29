import apiClient, { unwrapList, unwrapResponse } from './api-client';

function mapNotification(notification) {
  if (!notification) return null;
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: notification.data || {},
    readAt: notification.readAt || notification.read_at || null,
    createdAt: notification.createdAt || notification.created_at,
  };
}

export async function list(params = {}) {
  const response = await apiClient.get('/notifications', { params });
  const { items, meta } = unwrapList(response);
  return { items: items.map(mapNotification), meta };
}

export async function getUnreadCount() {
  const response = await apiClient.get('/notifications/unread-count');
  const result = unwrapResponse(response);
  return result.unreadCount ?? 0;
}

export async function markRead(id) {
  const response = await apiClient.patch(`/notifications/${id}/read`);
  const result = unwrapResponse(response);
  return mapNotification(result.notification);
}

export async function markAllRead() {
  await apiClient.patch('/notifications/read-all');
}

export { mapNotification };
