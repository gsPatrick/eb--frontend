import apiClient, { unwrapResponse } from './api-client';

export async function get() {
  const response = await apiClient.get('/financial-settings');
  const result = unwrapResponse(response);
  return result.settings;
}

export async function update(payload) {
  const response = await apiClient.patch('/financial-settings', payload);
  const result = unwrapResponse(response);
  return result.settings;
}
