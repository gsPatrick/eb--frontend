import apiClient, { unwrapList, unwrapResponse } from './api-client';
import { mapServiceExtra, mapServiceOrder } from './mappers';

export async function list(params = {}) {
  const response = await apiClient.get('/service-orders', { params });
  const { items, meta } = unwrapList(response);
  return { items: items.map(mapServiceOrder), meta };
}

export async function getById(id) {
  const response = await apiClient.get(`/service-orders/${id}`);
  const result = unwrapResponse(response);
  return mapServiceOrder(result.order);
}

export async function assign(id, providerId) {
  const response = await apiClient.patch(`/service-orders/${id}/assign`, { providerId });
  const result = unwrapResponse(response);
  return mapServiceOrder(result.order);
}

export async function create(payload) {
  const response = await apiClient.post('/service-orders', payload);
  const result = unwrapResponse(response);
  return mapServiceOrder(result.order);
}

export async function update(id, payload) {
  const response = await apiClient.patch(`/service-orders/${id}`, payload);
  const result = unwrapResponse(response);
  return mapServiceOrder(result.order);
}

export async function requestExtra(id, extraId) {
  const response = await apiClient.post(`/service-orders/${id}/request-extras`, { extraId });
  const result = unwrapResponse(response);
  return mapServiceOrder(result.order);
}

export async function updatePayments(id, payload) {
  const response = await apiClient.patch(`/service-orders/${id}/payments`, payload);
  const result = unwrapResponse(response);
  return mapServiceOrder(result.order);
}

export async function createInvoice(id) {
  const response = await apiClient.post(`/service-orders/${id}/invoice`);
  const result = unwrapResponse(response);
  return {
    order: mapServiceOrder(result.order),
    invoiceUrl: result.invoiceUrl,
    invoiceNumber: result.invoiceNumber,
  };
}

export async function sendReminder(id) {
  const response = await apiClient.post(`/service-orders/${id}/reminder`);
  return unwrapResponse(response);
}

export async function getFinancialSummary() {
  const response = await apiClient.get('/service-orders/financial/summary');
  const result = unwrapResponse(response);
  return result.summary;
}

function buildOrderFormData({ lat, long, photos = [] }) {
  const formData = new FormData();
  formData.append('lat', String(lat));
  formData.append('long', String(long));
  photos.forEach((file) => {
    if (file instanceof File) {
      formData.append('photos', file);
    }
  });
  return formData;
}

export async function checkIn(id, { lat, long, photos }) {
  const formData = buildOrderFormData({ lat, long, photos });
  const response = await apiClient.post(`/service-orders/${id}/check-in`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const result = unwrapResponse(response);
  return mapServiceOrder(result.order);
}

export async function checkOut(id, { lat, long, photos }) {
  const formData = buildOrderFormData({ lat, long, photos });
  const response = await apiClient.post(`/service-orders/${id}/check-out`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const result = unwrapResponse(response);
  return mapServiceOrder(result.order);
}

export async function addExtra(id, extraId) {
  const response = await apiClient.post(`/service-orders/${id}/extras`, { extraId });
  const result = unwrapResponse(response);
  return mapServiceOrder(result.order);
}

/** Catálogo de serviços extras */
export async function listExtras(params = {}) {
  const response = await apiClient.get('/service-extras', { params });
  const { items, meta } = unwrapList(response);
  return { items: items.map(mapServiceExtra), meta };
}

export async function createExtra(payload) {
  const response = await apiClient.post('/service-extras', payload);
  const result = unwrapResponse(response);
  return mapServiceExtra(result.extra || result.serviceExtra);
}

export async function updateExtra(id, payload) {
  const response = await apiClient.put(`/service-extras/${id}`, payload);
  const result = unwrapResponse(response);
  return mapServiceExtra(result.extra || result.serviceExtra);
}

export async function removeExtra(id) {
  await apiClient.delete(`/service-extras/${id}`);
}
