import api from "./api.js";

function normalizeExpensePayload(payload) {
  return {
    description: payload.description,
    category: payload.category,
    amount: payload.value,
    expenseDate: payload.date,
    notes: payload.observation,
  };
}

export async function getExpenses() {
  const response = await api.get("/expenses");
  return response.data;
}

export async function createExpense(payload) {
  const response = await api.post("/expenses", normalizeExpensePayload(payload));
  return response.data;
}

export async function updateExpense(id, payload) {
  const response = await api.put(`/expenses/${id}`, normalizeExpensePayload(payload));
  return response.data;
}

export async function deleteExpense(id) {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
}
