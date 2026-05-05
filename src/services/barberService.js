import api from "./api.js";

function buildBarberPayload(payload) {
  return {
    name: payload.name?.trim(),
    email: payload.email?.trim(),
    ...(payload.password ? { password: payload.password } : {}),
    phone: payload.phone?.trim() || null,
    commissionPercentage: Number(payload.commissionPercentage ?? 0),
  };
}

export async function getBarbers() {
  const endpoints = ["/barbers", "/barbers/available"];
  let lastError;

  for (const endpoint of endpoints) {
    try {
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      lastError = error;

      const status = error?.response?.status;
      if (status && ![404, 405].includes(status) && status < 500) {
        throw error;
      }
    }
  }

  throw lastError;
}

export async function createBarber(payload) {
  const response = await api.post("/barbers", buildBarberPayload(payload));
  return response.data;
}

export async function deleteBarber(id) {
  const response = await api.delete(`/barbers/${id}`);
  return response.data;
}

export async function updateBarber(id, payload) {
  const response = await api.put(`/barbers/${id}`, buildBarberPayload(payload));
  return response.data;
}
