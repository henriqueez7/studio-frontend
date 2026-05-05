import { useCallback, useEffect, useState } from "react";
import {
  getStoreBusinessHours,
  updateStoreBusinessHour,
} from "../services/storeBusinessHoursService.js";
import { getErrorMessage } from "../utils/errors.js";

function normalizeItems(response) {
  const list = Array.isArray(response) ? response : response?.data ?? response?.items ?? [];
  if (!Array.isArray(list)) return [];

  return list.map((item) => ({
    id: item.id,
    dayOfWeek: item.dayOfWeek,
    startTime: item.startTime || "09:00:00",
    endTime: item.endTime || "20:00:00",
    active: Boolean(item.active),
  }));
}

export default function useStoreBusinessHours() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getStoreBusinessHours();
      setItems(normalizeItems(response));
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível carregar o expediente da loja."));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const saveItem = useCallback(
    async (id, payload) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      try {
        await updateStoreBusinessHour(id, payload);
        setSuccess("Expediente da loja atualizado com sucesso.");
        await loadItems();
      } catch (err) {
        setError(getErrorMessage(err, "Não foi possível atualizar o expediente da loja."));
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [loadItems],
  );

  return {
    items,
    loading,
    submitting,
    error,
    success,
    refetch: loadItems,
    saveItem,
    clearError: () => setError(null),
    clearSuccess: () => setSuccess(null),
  };
}
