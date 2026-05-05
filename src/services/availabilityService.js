import api from "./api.js";

export async function getAvailableBarbers() {
  const response = await api.get("/barbers/available");
  return response.data;
}

export async function getAvailableDates(barberId, serviceIds) {
  const params = new URLSearchParams();
  serviceIds.forEach((serviceId) => {
    params.append("serviceIds", String(serviceId));
  });

  const response = await api.get(`/appointments/availability/${barberId}/dates`, {
    params,
  });
  return response.data;
}

export async function getAvailableTimes(barberId, date, serviceIds, appointmentId) {
  const params = new URLSearchParams();
  params.set("date", date);
  serviceIds.forEach((serviceId) => {
    params.append("serviceIds", String(serviceId));
  });
  if (appointmentId) {
    params.set("appointmentId", String(appointmentId));
  }

  const response = await api.get(`/appointments/availability/${barberId}/times`, {
    params,
  });
  return response.data;
}

export async function getBarberAvailability(barberId) {
  const response = await api.get(`/barber-availability/${barberId}`);
  return response.data;
}

export async function createBarberAvailability(payload) {
  const response = await api.post("/barber-availability", payload);
  return response.data;
}

export async function updateBarberAvailability(id, payload) {
  const response = await api.put(`/barber-availability/${id}`, payload);
  return response.data;
}

export async function deleteBarberAvailability(id) {
  const response = await api.delete(`/barber-availability/${id}`);
  return response.data;
}
