import api from "./api.js";

function normalizeInvestment(item) {
  if (!item) return item;

  const description =
    item.description?.trim() ||
    item.title?.trim() ||
    "";
  const note =
    item.note?.trim() ||
    item.observation?.trim() ||
    item.notes?.trim() ||
    "";

  return {
    ...item,
    description,
    value: item.value ?? item.amount ?? item.estimatedValue ?? 0,
    date: item.date ?? item.expectedDate ?? item.createdAt ?? null,
    note,
  };
}

function buildInvestmentPayload(payload) {
  return {
    title: payload.title?.trim() || payload.description?.trim(),
    description: payload.details?.trim() || payload.fullDescription?.trim() || "",
    estimatedValue: Number(payload.value ?? payload.amount ?? payload.estimatedValue ?? 0),
    priority: payload.priority ?? "MEDIA",
    expectedDate: payload.date ?? payload.expectedDate ?? null,
    notes: payload.note?.trim() || payload.observation?.trim() || payload.notes?.trim() || "",
  };
}

export async function getInvestments() {
  const response = await api.get("/investments", {
    params: {
      t: Date.now(),
    },
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });
  const list = Array.isArray(response.data)
    ? response.data
    : response.data?.investments ?? response.data?.data ?? [];

  return Array.isArray(list) ? list.map(normalizeInvestment) : [];
}

export async function createInvestment(payload) {
  const response = await api.post("/investments", buildInvestmentPayload(payload));
  return normalizeInvestment(response.data);
}

export async function updateInvestment(id, payload) {
  const response = await api.put(`/investments/${id}`, buildInvestmentPayload(payload));
  return normalizeInvestment(response.data);
}

export async function deleteInvestment(id) {
  const response = await api.delete(`/investments/${id}`);
  return response.data;
}
