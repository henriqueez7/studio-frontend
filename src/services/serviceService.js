import api from "./api.js";

function buildServicePayload(payload) {
  return {
    name: payload.name?.trim(),
    description: payload.description?.trim(),
    price: Number(payload.price ?? 0),
    durationInMinutes: Number(payload.durationInMinutes ?? payload.duration ?? 0),
  };
}

export async function getServices() {
  const response = await api.get("/services");
  return response.data;
}

export async function createService(payload) {
  const response = await api.post("/services", buildServicePayload(payload));
  return response.data;
}

export async function updateService(id, payload) {
  const response = await api.put(`/services/${id}`, buildServicePayload(payload));
  return response.data;
}

export async function deleteService(id) {
  const response = await api.delete(`/services/${id}`);
  return response.data;
}
