import api from "./api.js";

export async function createCommissionPayment(payload) {
  const response = await api.post("/commissions/payments", payload);
  return response.data;
}

export async function getAllCommissions() {
  const response = await api.get("/commissions/payments");
  return response.data;
}

export async function getBarberCommissions(barberId) {
  const response = await api.get(`/commissions/payments/barber/${barberId}`);
  return response.data;
}

export async function payCommission(id) {
  const response = await api.put(`/commissions/payments/${id}/pay`);
  return response.data;
}

export async function updateCommissionPayment(id, payload) {
  const response = await api.put(`/commissions/payments/${id}`, payload);
  return response.data;
}

export async function deleteCommissionPayment(id) {
  const response = await api.delete(`/commissions/payments/${id}`);
  return response.data;
}
