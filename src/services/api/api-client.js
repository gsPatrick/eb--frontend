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

let isRedirectingToLogin = false;
let lastUnauthorizedRedirectAt = 0;

function shouldRedirectToLogin(requestUrl = '') {
  if (typeof window === 'undefined' || isRedirectingToLogin) {
    return false;
  }

  const path = window.location.pathname;
  if (path === '/login' || path === '/register' || path === '/forgot-password') {
    return false;
  }

  if (String(requestUrl).includes('/users/login')) {
    return false;
  }

  const now = Date.now();
  if (now - lastUnauthorizedRedirectAt < 5000) {
    return false;
  }

  return true;
}

function redirectToLogin() {
  isRedirectingToLogin = true;
  lastUnauthorizedRedirectAt = Date.now();
  clearAuthSession();
  window.location.replace('/login');
}

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
    const requestUrl = error.config?.url || '';

    if (status === 401 && shouldRedirectToLogin(requestUrl)) {
      redirectToLogin();
    }

    const data = error.response?.data;
    let message =
      data?.message ||
      data?.error?.message ||
      error.message ||
      'Erro inesperado. Tente novamente.';

    if (status === 429) {
      message = 'Muitas requisições. Aguarde alguns minutos e tente novamente.';
    }

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
