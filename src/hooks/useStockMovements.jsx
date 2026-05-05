import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createStockMovement,
  getProductStockMovements,
  getStockMovements,
} from "../services/stockService.js";
import { getErrorMessage } from "../utils/errors.js";

export default function useStockMovements() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadMovements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getStockMovements();
      const list = Array.isArray(response)
        ? response
        : response?.movements ?? response?.data ?? [];
      setMovements(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao carregar movimentações de estoque."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMovements();
  }, [loadMovements]);

  const createMovement = useCallback(
    async (payload) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      try {
        await createStockMovement(payload);
        setSuccess("Movimentação registrada com sucesso.");
        await loadMovements();
      } catch (err) {
        setError(getErrorMessage(err, "Erro ao registrar movimentação."));
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [loadMovements],
  );

  const fetchProductMovements = useCallback(async (productId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProductStockMovements(productId);
      const list = Array.isArray(response)
        ? response
        : response?.movements ?? response?.data ?? [];
      setMovements(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao carregar movimentações do produto."));
    } finally {
      setLoading(false);
    }
  }, []);

  const totalMovements = movements.length;
  const lastMovements = useMemo(() => movements.slice(0, 8), [movements]);

  return {
    movements,
    loading,
    submitting,
    error,
    success,
    totalMovements,
    lastMovements,
    loadMovements,
    refetch: loadMovements,
    createMovement,
    fetchProductMovements,
    clearSuccess: () => setSuccess(null),
    clearError: () => setError(null),
  };
}
