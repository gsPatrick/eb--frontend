import { CURRENT_ADMIN } from '@/constants/adminMockData';
import { CURRENT_CLIENT } from '@/constants/clientMockData';
import { CURRENT_PROVIDER } from '@/constants/providerMockData';

export function getDefaultUserByRole(role) {
  if (role === 'client') return CURRENT_CLIENT;
  if (role === 'provider') return CURRENT_PROVIDER;
  return CURRENT_ADMIN;
}

export function loadProfileUser(fallbackUser = CURRENT_ADMIN) {
  if (typeof window === 'undefined') return fallbackUser;

  try {
    const saved = localStorage.getItem('eb_user');
    if (!saved) return fallbackUser;

    const parsed = JSON.parse(saved);
    const base =
      parsed.role === 'client'
        ? CURRENT_CLIENT
        : parsed.role === 'provider'
          ? CURRENT_PROVIDER
          : CURRENT_ADMIN;

    return {
      ...base,
      ...parsed,
      firstName: parsed.name?.split(' ')[0] || base.firstName,
      roleLabel: base.roleLabel,
      avatar: parsed.avatar || base.avatar || null,
    };
  } catch {
    return fallbackUser;
  }
}

import { saveAuthSession } from '@/services/auth.service';

export function persistProfileUser(user, token) {
  if (typeof window === 'undefined') return;

  if (token) {
    saveAuthSession(token, user);
    return;
  }

  localStorage.setItem('eb_user', JSON.stringify(user));
}
