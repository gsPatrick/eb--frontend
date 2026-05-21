import { API_ORIGIN } from './api-client';

import { resolveInventoryStockStatus } from '@/utils/inventoryHelpers';

export function resolveMediaUrl(url) {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`;
}

export function mapUser(user) {
  if (!user) return null;

  const name = user.name || '';
  const firstName = name.split(' ')[0] || name;

  return {
    id: user.id,
    name,
    firstName,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    active: user.active ?? true,
    avatar: resolveMediaUrl(user.avatarUrl || user.avatar),
    lastLoginAt: user.lastLoginAt || user.updatedAt,
    locale: user.locale,
  };
}

export function mapProperty(property) {
  if (!property) return null;

  return {
    id: property.id,
    name: property.name,
    address: property.address,
    description: property.description,
    status: property.status,
    clientId: property.clientId,
    client: property.client?.name || property.clientName,
    photo: resolveMediaUrl(property.metadata?.photo || property.photo),
    latitude: property.latitude != null ? Number(property.latitude) : null,
    longitude: property.longitude != null ? Number(property.longitude) : null,
    icalUrl: property.icalUrl,
    defaultCleaningPrice: Number(property.defaultCleaningPrice || 0),
    cleanStatus: property.metadata?.cleanStatus || 'scheduled',
    lastCleaningAt: property.metadata?.lastCleaningAt || null,
    nextCleaningAt: property.metadata?.nextCleaningAt || null,
  };
}

export function mapServiceOrder(order) {
  if (!order) return null;

  const property = order.property || {};
  const provider = order.provider || {};
  const client = property.client || order.client || {};

  return {
    id: order.id,
    propertyId: order.propertyId,
    property: property.name || order.propertyName || '—',
    propertyAddress: property.address || order.propertyAddress || '',
    propertyPhoto: resolveMediaUrl(property.metadata?.photo || property.photo),
    propertyLat: property.latitude != null ? Number(property.latitude) : null,
    propertyLong: property.longitude != null ? Number(property.longitude) : null,
    providerId: order.providerId,
    provider: provider.name || order.providerName || null,
    client: typeof client === 'string' ? client : client.name || order.clientName || '—',
    status: order.status,
    scheduledDate: order.scheduledDate,
    scheduledTime: order.metadata?.scheduledTime || order.scheduledTime || null,
    startedAt: order.startedAt,
    finishedAt: order.finishedAt,
    checkinLat: order.checkinLat != null ? Number(order.checkinLat) : null,
    checkinLong: order.checkinLong != null ? Number(order.checkinLong) : null,
    checkoutLat: order.checkoutLat != null ? Number(order.checkoutLat) : null,
    checkoutLong: order.checkoutLong != null ? Number(order.checkoutLong) : null,
    beforePhotos: (order.beforePhotos || []).map(resolveMediaUrl),
    afterPhotos: (order.afterPhotos || []).map(resolveMediaUrl),
    basePrice: Number(order.basePrice || 0),
    extrasTotalPrice: Number(order.extrasTotalPrice || 0),
    totalPrice: Number(order.totalPrice || 0),
    extras: (order.extras || []).map((extra) => ({
      id: extra.id || extra.serviceExtraId,
      extraId: extra.serviceExtraId || extra.serviceExtra?.id,
      name: extra.serviceExtra?.name || extra.name,
      defaultPrice: Number(extra.serviceExtra?.defaultPrice || extra.price || 0),
      estimatedTime: extra.serviceExtra?.estimatedTime || extra.estimatedTime,
    })),
    geofenceRadiusM: 200,
  };
}

export function mapInventoryItem(item) {
  if (!item) return null;

  const quantity = Number(item.currentQuantity ?? item.quantity ?? 0);
  const minQuantity = Number(item.criticalLevel ?? item.minQuantity ?? 0);
  const status = resolveInventoryStockStatus(quantity, minQuantity);

  return {
    id: item.id,
    propertyId: item.propertyId,
    property: item.property?.name || item.propertyName || '—',
    item: item.name || item.item,
    quantity,
    minQuantity,
    unit: item.unit || 'un.',
    status,
    isCritical: item.is_critical ?? status === 'critical',
  };
}

export function mapContract(contract, acceptance) {
  if (!contract) return null;

  const signed = acceptance || contract.acceptance;

  return {
    id: contract.id,
    title: contract.title || contract.name,
    version: contract.version,
    type: contract.type,
    status: signed ? 'accepted' : 'pending',
    signedAt: signed?.acceptedAt || signed?.signedAt || null,
    pdfUrl: resolveMediaUrl(contract.pdfUrl),
    body: contract.body || contract.content,
  };
}

export function mapReview(review) {
  if (!review) return null;

  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    provider: review.provider?.name || review.providerName,
    client: review.client?.name || review.clientName,
    property: review.property?.name || review.propertyName,
    createdAt: review.createdAt,
  };
}

export function mapServiceExtra(extra) {
  if (!extra) return null;

  return {
    id: extra.id,
    name: extra.name,
    description: extra.description,
    defaultPrice: Number(extra.defaultPrice || 0),
    estimatedTime: extra.estimatedTime,
    active: extra.active ?? true,
  };
}
