import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  createProduct,
  deleteProduct,
  getAdminProducts,
  getProducts,
  updateProduct,
} from "../services/productService.js";
import { ROLE_ADMIN, normalizeRole } from "../utils/auth.js";
import { getErrorMessage } from "../utils/errors.js";

export default function useProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const isAdmin = normalizeRole(user?.role) === ROLE_ADMIN;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = isAdmin ? await getAdminProducts() : await getProducts();
      const list = Array.isArray(response)
        ? response
        : response?.products ?? response?.data ?? [];

      setProducts(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível carregar os produtos."));
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createItem = useCallback(
    async (payload) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        await createProduct(payload);
        setSuccess("Produto cadastrado com sucesso.");
        await fetchProducts();
      } catch (err) {
        setError(getErrorMessage(err, "Não foi possível cadastrar o produto."));
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchProducts],
  );

  const updateItem = useCallback(
    async (id, payload) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        await updateProduct(id, payload);
        setSuccess("Produto atualizado com sucesso.");
        await fetchProducts();
      } catch (err) {
        setError(getErrorMessage(err, "Nao foi possivel atualizar o produto."));
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchProducts],
  );

  const removeItem = useCallback(
    async (id) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        await deleteProduct(id);
        setSuccess("Produto removido com sucesso.");
        await fetchProducts();
      } catch (err) {
        setError(getErrorMessage(err, "Nao foi possivel remover o produto."));
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchProducts],
  );

  const categories = useMemo(() => {
    const set = new Set();

    products.forEach((product) => {
      const category =
        product.category || product.type || product.brand || "Sem categoria";
      if (category) set.add(category);
    });

    return Array.from(set);
  }, [products]);

  const lowStockCount = useMemo(
    () =>
      products.filter((product) => {
        const stock = Number(
          product.stockQuantity ?? product.stock ?? product.quantity ?? 0,
        );
        const minimum = Number(product.minimumStock ?? product.minStock ?? 0);
        return minimum > 0 && stock <= minimum;
      }).length,
    [products],
  );

  return {
    products,
    loading,
    submitting,
    error,
    success,
    categories,
    lowStockCount,
    refetch: fetchProducts,
    createItem,
    updateItem,
    removeItem,
    clearError: () => setError(null),
    clearSuccess: () => setSuccess(null),
  };
}
