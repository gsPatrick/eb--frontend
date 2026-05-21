import apiClient, { unwrapResponse } from './api-client';

export async function reverse(latitude, longitude) {
  const response = await apiClient.get('/geocoding/reverse', {
    params: { lat: latitude, lng: longitude },
  });
  return unwrapResponse(response);
}

export async function search(query, limit = 5) {
  const response = await apiClient.get('/geocoding/search', {
    params: { q: query, limit },
  });
  const result = unwrapResponse(response);
  return Array.isArray(result) ? result : result.items || [];
}
