import axios from 'axios';
import { clearAuthSession } from '@/utils/authSession';

const DEFAULT_API_ORIGIN = 'https://sistema-api.a8v108.easypanel.host';

function resolveApiOrigin() {
  if (process.env.NEXT_PUBLIC_API_ORIGIN) {
    return process.env.NEXT_PUBLIC_API_ORIGIN.replace(/\/$/, '');
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    return apiUrl.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
  }

  return DEFAULT_API_ORIGIN;
}

/** Base URL da API (configurável via NEXT_PUBLIC_API_URL no build/deploy) */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || `${DEFAULT_API_ORIGIN}/api/v1`;

/** Origem para assets (uploads, avatars) */
export const API_ORIGIN = resolveApiOrigin();

/** URL do WebSocket */
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || API_ORIGIN;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('eb_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 && typeof window !== 'undefined') {
      clearAuthSession();
      window.location.href = '/login';
    }

    const data = error.response?.data;
    const message =
      data?.message ||
      data?.error?.message ||
      error.message ||
      'Erro inesperado. Tente novamente.';

    const apiError = new Error(message);
    apiError.code = data?.error?.code || data?.code;
    apiError.details = data?.error?.details || data?.details;
    apiError.status = status;

    return Promise.reject(apiError);
  }
);

export function unwrapResponse(response) {
  return response.data?.data ?? response.data;
}

export function unwrapList(response) {
  const body = response.data;
  return {
    items: body?.data ?? [],
    meta: body?.meta ?? null,
  };
}

export default apiClient;
