import {
  MOCK_EXTRAS,
  MOCK_ORDERS,
  MOCK_PROPERTIES,
} from '@/constants/adminMockData';
import { CLIENT_INVENTORY } from '@/constants/clientMockData';

export const CURRENT_PROVIDER = {
  id: 'u2',
  name: 'João Prestador',
  firstName: 'João',
  email: 'joao@example.com',
  phone: '+55 11 97777-2222',
  role: 'provider',
  roleLabel: 'Prestador',
  lastLoginAt: '2026-05-21T07:15:00Z',
  avatar: null,
  averageRating: 4.8,
};

const TODAY = '2026-05-21';

function enrichOrder(order) {
  const property = MOCK_PROPERTIES.find((item) => item.name === order.property);

  return {
    ...order,
    propertyId: property?.id,
    propertyAddress: property?.address ?? order.propertyAddress,
    propertyPhoto: property?.photo,
    propertyLat: property?.latitude ?? order.propertyLat,
    propertyLong: property?.longitude ?? order.propertyLong,
    geofenceRadiusM: 200,
  };
}

export const PROVIDER_ASSIGNED_ORDERS = MOCK_ORDERS.filter(
  (order) => order.provider === CURRENT_PROVIDER.name
).map(enrichOrder);

export const PROVIDER_TODAY_ORDERS = [
  ...MOCK_ORDERS.filter(
    (order) =>
      order.provider === CURRENT_PROVIDER.name &&
      order.scheduledDate === TODAY &&
      ['pending', 'in_progress'].includes(order.status)
  ),
  {
    id: 'os13',
    property: 'Studio Leblon 12',
    propertyAddress: 'Rua Dias Ferreira, 80 — Leblon, RJ',
    provider: CURRENT_PROVIDER.name,
    client: 'Maria Silva',
    status: 'pending',
    scheduledDate: TODAY,
    scheduledTime: '14:00',
    startedAt: null,
    finishedAt: null,
    basePrice: 150,
    extrasTotalPrice: 0,
    totalPrice: 150,
    propertyLat: -22.983,
    propertyLong: -43.224,
    beforePhotos: [],
    afterPhotos: [],
    extras: [],
  },
].map(enrichOrder);

export const PROVIDER_EXTRAS_CATALOG = MOCK_EXTRAS;

export const PROVIDER_INVENTORY_ITEMS = CLIENT_INVENTORY.filter(
  (item) => item.propertyId === 'p1' || item.propertyId === 'p3'
).map((item) => ({
  ...item,
  serviceOrderId: item.propertyId === 'p1' ? 'os1' : 'os13',
}));

export const PROVIDER_CONTRACTS = [
  {
    id: 'pc1',
    title: 'Contrato de Prestação de Serviços — EB',
    version: '3.0',
    status: 'accepted',
    signedAt: '2026-02-01T10:00:00Z',
    pdfUrl: '#',
  },
  {
    id: 'pc2',
    title: 'Termo de Confidencialidade e LGPD',
    version: '1.2',
    status: 'pending',
    signedAt: null,
    pdfUrl: '#',
  },
];

export function getProviderOrderById(orderId) {
  return PROVIDER_ASSIGNED_ORDERS.find((order) => order.id === orderId)
    || PROVIDER_TODAY_ORDERS.find((order) => order.id === orderId)
    || enrichOrder(MOCK_ORDERS.find((order) => order.id === orderId));
}
