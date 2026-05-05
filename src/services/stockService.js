import api from "./api.js";

export async function getStockMovements() {
  const response = await api.get("/stock-movements");
  return response.data;
}

export async function getProductStockMovements(productId) {
  const response = await api.get(`/stock-movements/product/${productId}`);
  return response.data;
}

export async function createStockMovement(payload) {
  const response = await api.post("/stock-movements", payload);
  return response.data;
}
