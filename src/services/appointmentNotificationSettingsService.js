import api from "./api.js";

export async function getAppointmentNotificationSettings() {
  const response = await api.get("/admin/appointment-notifications");
  return response.data;
}

export async function updateAppointmentNotificationSettings(payload) {
  const response = await api.put("/admin/appointment-notifications", payload);
  return response.data;
}
