import api from "./api.js";
import { buildAppointmentPayload } from "../utils/appointments.js";

export async function getAppointments({
  scope = "admin",
  barberId,
  clientId,
} = {}) {
  let response;

  if (scope === "barber") {
    response = await api.get(`/appointments/barber/${barberId}`);
  } else if (scope === "client") {
    response = clientId ? await api.get(`/appointments/client/${clientId}`) : await api.get("/appointments/me");
  } else {
    response = await api.get("/appointments");
  }

  return response.data;
}

export async function createAppointment(payload) {
  const response = await api.post("/appointments", buildAppointmentPayload(payload));
  return response.data;
}

export async function updateAppointment(id, payload) {
  const response = await api.put(`/appointments/${id}`, buildAppointmentPayload(payload));
  return response.data;
}

export async function deleteAppointment(id) {
  const response = await api.delete(`/appointments/${id}`);
  return response.data;
}

export async function confirmAppointment(id) {
  const response = await api.put(`/appointments/${id}/confirm`);
  return response.data;
}

export async function cancelAppointment(id) {
  const response = await api.put(`/appointments/${id}/cancel`);
  return response.data;
}

export async function finishAppointment(id) {
  const response = await api.put(`/appointments/${id}/finish`);
  return response.data;
}
