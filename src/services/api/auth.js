import apiClient, { unwrapResponse } from './api-client';
import { mapUser } from './mappers';
import { saveAuthSession } from '@/utils/authSession';

export async function login(credentials) {
  const response = await apiClient.post('/users/login', credentials);
  const result = unwrapResponse(response);
  const token = result.token;
  const user = mapUser(result.user);

  if (token && user) {
    saveAuthSession(token, user);
  }

  return { token, user };
}

export async function register(payload) {
  const response = await apiClient.post('/users/register', payload);
  const result = unwrapResponse(response);
  return { user: mapUser(result.user) };
}

export async function me() {
  const response = await apiClient.get('/users/me');
  const result = unwrapResponse(response);
  return mapUser(result.user);
}

export async function updateMe(payload) {
  const response = await apiClient.patch('/users/me', payload);
  const result = unwrapResponse(response);
  return mapUser(result.user);
}

export async function updateAvatar(file) {
  const formData = new FormData();
  formData.append('avatar', file);
  const response = await apiClient.patch('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const result = unwrapResponse(response);
  return mapUser(result.user);
}
