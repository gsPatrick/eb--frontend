const AUTH_COOKIE = 'eb_auth';
const AUTH_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function saveAuthSession(token, user) {
  if (typeof window === 'undefined') return;

  localStorage.setItem('eb_token', token);
  localStorage.setItem('eb_user', JSON.stringify(user));

  const payload = encodeURIComponent(JSON.stringify({ token, role: user?.role || 'client' }));
  document.cookie = `${AUTH_COOKIE}=${payload}; path=/; max-age=${AUTH_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('eb_token');
  localStorage.removeItem('eb_user');
  localStorage.removeItem('eb_locale');
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function getAuthRedirectPath(role) {
  if (role === 'client') return '/client/properties';
  if (role === 'provider') return '/provider/schedule';
  return '/dashboard';
}
