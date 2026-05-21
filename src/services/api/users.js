import apiClient, { unwrapList, unwrapResponse } from './api-client';
import { mapUser } from './mappers';

export async function list(params = {}) {
  const response = await apiClient.get('/users', { params });
  const { items, meta } = unwrapList(response);
  return { items: items.map(mapUser), meta };
}

export async function getById(id) {
  const response = await apiClient.get(`/users/${id}`);
  const result = unwrapResponse(response);
  return mapUser(result.user);
}

export async function createAdmin(payload) {
  const response = await apiClient.post('/users/admin', payload);
  const result = unwrapResponse(response);
  return mapUser(result.user);
}

export async function updateStatus(id, active) {
  const response = await apiClient.patch(`/users/${id}/status`, { active });
  const result = unwrapResponse(response);
  return mapUser(result.user);
}

export async function updateRole(id, role) {
  const response = await apiClient.patch(`/users/${id}/role`, { role });
  const result = unwrapResponse(response);
  return mapUser(result.user);
}

export async function getProviderRating(id) {
  const response = await apiClient.get(`/users/${id}/average-rating`);
  return unwrapResponse(response);
}
