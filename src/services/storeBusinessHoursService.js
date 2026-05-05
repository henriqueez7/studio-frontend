import api from "./api.js";

export async function getStoreBusinessHours() {
  const response = await api.get("/store-hours");
  return response.data;
}

export async function updateStoreBusinessHour(id, payload) {
  const response = await api.put(`/store-hours/${id}`, payload);
  return response.data;
}
