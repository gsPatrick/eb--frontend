import apiClient, { API_ORIGIN, unwrapList, unwrapResponse } from './api-client';

function resolveAttachmentUrl(url) {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`;
}

function mapMessage(message) {
  if (!message) return null;
  return {
    id: message.id,
    subject: message.subject,
    body: message.body,
    messageType: message.messageType || message.message_type || 'general',
    attachmentUrl: resolveAttachmentUrl(message.attachmentUrl || message.attachment_url),
    attachmentName: message.attachmentName || message.attachment_name || null,
    readAt: message.readAt || message.read_at || null,
    createdAt: message.createdAt || message.created_at,
    serviceOrderId: message.serviceOrderId || message.service_order_id || null,
    propertyId: message.propertyId || message.property_id || null,
    sender: message.sender
      ? {
          id: message.sender.id,
          name: message.sender.name,
          email: message.sender.email,
          role: message.sender.role,
        }
      : null,
    recipient: message.recipient
      ? {
          id: message.recipient.id,
          name: message.recipient.name,
          email: message.recipient.email,
          role: message.recipient.role,
        }
      : null,
    property: message.property
      ? { id: message.property.id, name: message.property.name }
      : null,
  };
}

export async function list(params = {}) {
  const response = await apiClient.get('/messages', { params });
  const { items, meta } = unwrapList(response);
  return { items: items.map(mapMessage), meta };
}

export async function getUnreadCount() {
  const response = await apiClient.get('/messages/unread-count');
  const result = unwrapResponse(response);
  return result.unreadCount ?? 0;
}

export async function create(payload, attachmentFile) {
  if (attachmentFile) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value != null && value !== '') {
        formData.append(key, value);
      }
    });
    formData.append('attachment', attachmentFile);

    const response = await apiClient.post('/messages', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const result = unwrapResponse(response);
    return mapMessage(result.message);
  }

  const response = await apiClient.post('/messages', payload);
  const result = unwrapResponse(response);
  return mapMessage(result.message);
}

export async function markRead(id) {
  const response = await apiClient.patch(`/messages/${id}/read`);
  const result = unwrapResponse(response);
  return mapMessage(result.message);
}

export { mapMessage };
