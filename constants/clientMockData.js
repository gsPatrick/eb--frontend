import { MOCK_ORDERS, MOCK_PROPERTIES } from '@/constants/adminMockData';

export const CURRENT_CLIENT = {
  id: 'u1',
  name: 'Maria Silva',
  firstName: 'Maria',
  email: 'maria@example.com',
  phone: '+55 11 98888-1111',
  role: 'client',
  roleLabel: 'Cliente',
  lastLoginAt: '2026-05-20T09:30:00Z',
  avatar: null,
};

export const CLEAN_STATUS = {
  clean: { variant: 'success' },
  dirty: { variant: 'warning' },
  scheduled: { variant: 'info' },
};

export const CLIENT_PROPERTIES = MOCK_PROPERTIES
  .filter((property) => property.client === CURRENT_CLIENT.name)
  .map((property, index) => ({
    ...property,
    cleanStatus: index === 0 ? 'clean' : 'scheduled',
    lastCleaningAt: index === 0 ? '2026-05-20T13:30:00Z' : '2026-05-15T11:00:00Z',
    nextCleaningAt: index === 0 ? '2026-05-25T10:00:00Z' : '2026-05-22T10:00:00Z',
  }));

export const CLIENT_INVENTORY = [
  {
    id: 'inv1',
    propertyId: 'p1',
    property: 'Apto Copacabana 402',
    item: 'Papel higiênico',
    quantity: 2,
    minQuantity: 6,
    unit: 'rolos',
    status: 'critical',
  },
  {
    id: 'inv2',
    propertyId: 'p1',
    property: 'Apto Copacabana 402',
    item: 'Sabonete líquido',
    quantity: 4,
    minQuantity: 3,
    unit: 'un.',
    status: 'ok',
  },
  {
    id: 'inv3',
    propertyId: 'p1',
    property: 'Apto Copacabana 402',
    item: 'Detergente',
    quantity: 1,
    minQuantity: 2,
    unit: 'un.',
    status: 'low',
  },
  {
    id: 'inv4',
    propertyId: 'p3',
    property: 'Studio Leblon 12',
    item: 'Papel higiênico',
    quantity: 8,
    minQuantity: 6,
    unit: 'rolos',
    status: 'ok',
  },
  {
    id: 'inv5',
    propertyId: 'p3',
    property: 'Studio Leblon 12',
    item: 'Lençóis extras',
    quantity: 1,
    minQuantity: 4,
    unit: 'jogos',
    status: 'critical',
  },
  {
    id: 'inv6',
    propertyId: 'p3',
    property: 'Studio Leblon 12',
    item: 'Shampoo',
    quantity: 2,
    minQuantity: 2,
    unit: 'un.',
    status: 'low',
  },
];

export const CLIENT_CONTRACTS = [
  {
    id: 'c1',
    title: 'Contrato EB Services — Limpeza e Manutenção',
    version: '2.1',
    status: 'accepted',
    signedAt: '2026-01-15T14:22:00Z',
    pdfUrl: '#',
  },
  {
    id: 'c2',
    title: 'Aditivo — Serviços Extras Premium',
    version: '1.0',
    status: 'pending',
    signedAt: null,
    pdfUrl: '#',
  },
];

export const CLIENT_SERVICE_HISTORY = MOCK_ORDERS.filter(
  (order) => order.client === CURRENT_CLIENT.name && order.status === 'completed'
).map((order) => ({
  id: order.id,
  property: order.property,
  provider: order.provider,
  date: order.scheduledDate,
  finishedAt: order.finishedAt,
  beforePhotos: order.beforePhotos || [],
  afterPhotos: order.afterPhotos || [],
  totalPrice: order.totalPrice,
  reviewed: ['os4', 'os10'].includes(order.id),
}));

export const CLIENT_BILLING_SUMMARY = {
  currentMonth: { label: 'Maio 2026', total: 1725, orderCount: 4 },
  previousMonth: { label: 'Abril 2026', total: 1480, orderCount: 3 },
};

export const CLIENT_BILLING_ORDERS = MOCK_ORDERS.filter(
  (order) =>
    order.client === CURRENT_CLIENT.name &&
    ['completed', 'billed'].includes(order.status)
).map((order) => ({
  id: order.id,
  property: order.property,
  provider: order.provider,
  date: order.scheduledDate,
  finishedAt: order.finishedAt,
  basePrice: order.basePrice || order.totalPrice,
  extrasTotalPrice: order.extrasTotalPrice || 0,
  totalPrice: order.totalPrice,
  status: order.status,
}));

export const CLIENT_PENDING_REVIEWS = CLIENT_SERVICE_HISTORY.filter((entry) => !entry.reviewed);
