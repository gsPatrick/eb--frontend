import { ORDER_STATUS } from '@/constants/adminMockData';

export function getOrderStatusBadge(status, t) {
  const config = ORDER_STATUS[status] || ORDER_STATUS.pending;

  if (typeof t === 'function') {
    return {
      variant: config.variant,
      label: t(`status.order.${status}`, { defaultValue: config.label }),
    };
  }

  return config;
}

export function getRoleLabel(role, t) {
  if (typeof t === 'function') {
    return t(`roles.${role}`, { defaultValue: role });
  }

  const labels = { admin: 'Administrador', client: 'Cliente', provider: 'Prestador' };
  return labels[role] || role;
}
