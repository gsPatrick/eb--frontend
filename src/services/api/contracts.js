import apiClient, { unwrapList, unwrapResponse } from './api-client';
import { mapContract } from './mappers';

export async function list(params = {}) {
  const response = await apiClient.get('/contracts', { params });
  const { items, meta } = unwrapList(response);
  return { items: items.map((item) => mapContract(item)), meta };
}

export async function getById(id) {
  const response = await apiClient.get(`/contracts/${id}`);
  const result = unwrapResponse(response);
  return mapContract(result.contract);
}

export async function create(payload) {
  const response = await apiClient.post('/contracts', payload);
  const result = unwrapResponse(response);
  return mapContract(result.contract);
}

export async function update(id, payload) {
  const response = await apiClient.put(`/contracts/${id}`, payload);
  const result = unwrapResponse(response);
  return mapContract(result.contract);
}

export async function remove(id) {
  await apiClient.delete(`/contracts/${id}`);
}

export async function accept(id) {
  const response = await apiClient.post(`/contracts/${id}/accept`);
  const result = unwrapResponse(response);
  return result.acceptance || result;
}

export async function myAcceptances() {
  const response = await apiClient.get('/contracts/acceptances/me');
  const { items } = unwrapList(response);
  return items;
}

export async function listAcceptances(params = {}) {
  const response = await apiClient.get('/contracts/acceptances', { params });
  const { items, meta } = unwrapList(response);
  return { items, meta };
}

export async function listWithAcceptanceStatus() {
  const [contractsRes, acceptances] = await Promise.all([list(), myAcceptances()]);
  const acceptanceByContract = new Map(
    acceptances.map((item) => [item.contractId || item.contract?.id, item])
  );

  return contractsRes.items.map((contract) =>
    mapContract(contract, acceptanceByContract.get(contract.id))
  );
}
