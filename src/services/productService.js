import api from "./api.js";

function buildProductPayload(payload) {
  return {
    name: payload.name?.trim(),
    description: payload.description?.trim(),
    category: payload.category?.trim(),
    purchasePrice: Number(payload.purchasePrice ?? 0),
    salePrice: Number(payload.salePrice ?? 0),
    stockQuantity: Number(payload.stockQuantity ?? payload.stock ?? 0),
    minimumStock: Number(payload.minimumStock ?? 0),
  };
}

export async function getProducts() {
  const response = await api.get("/products");
  return response.data;
}

export async function getAdminProducts() {
  const response = await api.get("/products/admin/all");
  return response.data;
}

export async function createProduct(payload) {
  const response = await api.post("/products", buildProductPayload(payload));
  return response.data;
}

export async function updateProduct(id, payload) {
  const response = await api.put(`/products/${id}`, buildProductPayload(payload));
  return response.data;
}

export async function deleteProduct(id) {
  const response = await api.delete(`/products/${id}`);
  return response.data;
}
