import apiClient, { unwrapList, unwrapResponse } from './api-client';
import { mapProperty } from './mappers';

export async function list(params = {}) {
  const response = await apiClient.get('/properties', { params });
  const { items, meta } = unwrapList(response);
  return { items: items.map(mapProperty), meta };
}

export async function getById(id) {
  const response = await apiClient.get(`/properties/${id}`);
  const result = unwrapResponse(response);
  return mapProperty(result.property);
}

export async function create(payload) {
  const response = await apiClient.post('/properties', payload);
  const result = unwrapResponse(response);
  return mapProperty(result.property);
}

export async function updateAccess(id, payload) {
  const response = await apiClient.patch(`/properties/${id}/access`, payload);
  const result = unwrapResponse(response);
  return mapProperty(result.property);
}

export async function update(id, payload) {
  const response = await apiClient.put(`/properties/${id}`, payload);
  const result = unwrapResponse(response);
  return mapProperty(result.property);
}

export async function remove(id) {
  await apiClient.delete(`/properties/${id}`);
}

export async function syncCalendar(id) {
  const response = await apiClient.post(`/properties/${id}/sync-calendar`);
  return unwrapResponse(response);
}
