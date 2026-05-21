import apiClient, { unwrapList, unwrapResponse } from './api-client';
import { mapInventoryItem } from './mappers';

export async function list(params = {}) {
  const response = await apiClient.get('/inventory', { params });
  const { items, meta } = unwrapList(response);
  return { items: items.map(mapInventoryItem), meta };
}

export async function getById(id) {
  const response = await apiClient.get(`/inventory/${id}`);
  const result = unwrapResponse(response);
  return mapInventoryItem(result.item || result.inventory);
}

export async function create(payload) {
  const response = await apiClient.post('/inventory', payload);
  const result = unwrapResponse(response);
  return mapInventoryItem(result.item || result.inventory);
}

export async function update(id, payload) {
  const response = await apiClient.put(`/inventory/${id}`, payload);
  const result = unwrapResponse(response);
  return mapInventoryItem(result.item || result.inventory);
}

export async function remove(id) {
  await apiClient.delete(`/inventory/${id}`);
}

export async function updateQuantity(id, quantity) {
  const response = await apiClient.patch(`/inventory/${id}/quantity`, { quantity });
  const result = unwrapResponse(response);
  return mapInventoryItem(result.item || result.inventory);
}
