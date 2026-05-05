import api from "./api.js";

export async function getScheduleBlocks({ date, barberId } = {}) {
  const response = await api.get("/appointments/blocks", {
    params: {
      date,
      ...(barberId ? { barberId } : {}),
    },
  });

  return response.data;
}

export async function createScheduleBlock(payload) {
  const response = await api.post("/appointments/blocks", payload);
  return response.data;
}

export async function updateScheduleBlock(id, payload) {
  const response = await api.put(`/appointments/blocks/${id}`, payload);
  return response.data;
}

export async function deleteScheduleBlock(id) {
  const response = await api.delete(`/appointments/blocks/${id}`);
  return response.data;
}
