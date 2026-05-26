import apiClient, { unwrapList, unwrapResponse } from './api-client';

function mapSchedule(schedule) {
  if (!schedule) return null;
  return {
    id: schedule.id,
    propertyId: schedule.propertyId || schedule.property_id,
    property: schedule.property?.name || null,
    providerId: schedule.providerId || schedule.provider_id || null,
    provider: schedule.provider?.name || null,
    cleaningType: schedule.cleaningType || schedule.cleaning_type,
    estimatedDurationMinutes:
      schedule.estimatedDurationMinutes ?? schedule.estimated_duration_minutes ?? null,
    frequency: schedule.frequency,
    dayOfWeek: schedule.dayOfWeek ?? schedule.day_of_week ?? null,
    dayOfMonth: schedule.dayOfMonth ?? schedule.day_of_month ?? null,
    startDate: schedule.startDate || schedule.start_date,
    endDate: schedule.endDate || schedule.end_date || null,
    nextRunDate: schedule.nextRunDate || schedule.next_run_date,
    basePrice: Number(schedule.basePrice ?? schedule.base_price ?? 0),
    active: Boolean(schedule.active),
  };
}

export async function list(params = {}) {
  const response = await apiClient.get('/recurring-schedules', { params });
  const { items, meta } = unwrapList(response);
  return { items: items.map(mapSchedule), meta };
}

export async function create(payload) {
  const response = await apiClient.post('/recurring-schedules', payload);
  const result = unwrapResponse(response);
  return mapSchedule(result.schedule);
}

export async function update(id, payload) {
  const response = await apiClient.patch(`/recurring-schedules/${id}`, payload);
  const result = unwrapResponse(response);
  return mapSchedule(result.schedule);
}

export async function remove(id) {
  await apiClient.delete(`/recurring-schedules/${id}`);
}

export async function runNow() {
  const response = await apiClient.post('/recurring-schedules/run-now');
  return unwrapResponse(response);
}

export { mapSchedule };
