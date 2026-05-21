import apiClient, { unwrapResponse } from './api-client';
import { mapServiceOrder } from './mappers';

export async function getBillingReport(params = {}) {
  const { startDate, endDate, clientId, ...rest } = params;
  const query = {
    ...rest,
    start_date: startDate ?? rest.start_date,
    end_date: endDate ?? rest.end_date,
    client_id: clientId ?? rest.client_id,
  };

  const response = await apiClient.get('/reports/billing', { params: query });
  const result = unwrapResponse(response);
  const orders = result.orders || result.serviceOrders || [];

  return {
    ...result,
    orders: orders.map(mapServiceOrder),
    totalAmount: Number(result.totalAmount || 0),
    orderCount: Number(result.orderCount || 0),
  };
}
