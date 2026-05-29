import apiClient, { API_ORIGIN, unwrapList, unwrapResponse } from './api-client';

function resolvePhotoUrl(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_ORIGIN}${url}`;
}

function mapFieldReport(report) {
  if (!report) return null;
  const photos = (report.photos || []).map(resolvePhotoUrl).filter(Boolean);
  return {
    id: report.id,
    type: report.type,
    description: report.description,
    status: report.status,
    photos,
    createdAt: report.createdAt || report.created_at,
    resolvedAt: report.resolvedAt || report.resolved_at || null,
    serviceOrderId: report.serviceOrderId || report.service_order_id,
    propertyId: report.propertyId || report.property_id,
    provider: report.provider?.name || null,
    property: report.property?.name || null,
    propertyAddress: report.property?.address || null,
  };
}

export async function list(params = {}) {
  const response = await apiClient.get('/field-reports', { params });
  const { items, meta } = unwrapList(response);
  return { items: items.map(mapFieldReport), meta };
}

export async function resolve(id) {
  const response = await apiClient.patch(`/field-reports/${id}/resolve`);
  const result = unwrapResponse(response);
  return mapFieldReport(result.report);
}

export async function create({ serviceOrderId, type, description, photos = [] }) {
  const formData = new FormData();
  formData.append('serviceOrderId', serviceOrderId);
  formData.append('type', type);
  formData.append('description', description);
  photos.forEach((file) => {
    if (file instanceof File) {
      formData.append('photos', file);
    }
  });

  const response = await apiClient.post('/field-reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const result = unwrapResponse(response);
  return mapFieldReport(result.report);
}

export { mapFieldReport };
