import apiClient, { unwrapList, unwrapResponse } from './api-client';
import { mapReview } from './mappers';

export async function list(params = {}) {
  const response = await apiClient.get('/reviews', { params });
  const { items, meta } = unwrapList(response);
  return { items: items.map(mapReview), meta };
}

export async function getById(id) {
  const response = await apiClient.get(`/reviews/${id}`);
  const result = unwrapResponse(response);
  return mapReview(result.review);
}

export async function create(payload) {
  const response = await apiClient.post('/reviews', payload);
  const result = unwrapResponse(response);
  return mapReview(result.review);
}

export async function update(id, payload) {
  const response = await apiClient.put(`/reviews/${id}`, payload);
  const result = unwrapResponse(response);
  return mapReview(result.review);
}

export async function remove(id) {
  await apiClient.delete(`/reviews/${id}`);
}
