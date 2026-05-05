import api from "./api.js";

function buildClientPayload(payload) {
  return {
    name: payload.name?.trim(),
    email: payload.email?.trim() || null,
    phone: payload.phone?.trim() || null,
  };
}

export async function getClients(month) {
  const response = await api.get("/clients", {
    params: month ? { month } : {},
  });

  return response.data;
}

export async function blockClient(id) {
  const response = await api.patch(`/clients/${id}/block`);
  return response.data;
}

export async function unblockClient(id) {
  const response = await api.patch(`/clients/${id}/unblock`);
  return response.data;
}

export async function deleteClient(id) {
  const response = await api.delete(`/clients/${id}`);
  return response.data;
}

export async function updateClient(id, payload) {
  const response = await api.put(`/clients/${id}`, buildClientPayload(payload));
  return response.data;
}
