import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createService,
  deleteService,
  getServices,
  updateService,
} from "../services/serviceService.js";
import { getErrorMessage } from "../utils/errors.js";

const initialServiceState = {
  services: [],
  loading: true,
  error: null,
};

export default function useServices() {
  const [services, setServices] = useState(initialServiceState.services);
  const [loading, setLoading] = useState(initialServiceState.loading);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(initialServiceState.error);
  const [success, setSuccess] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getServices();
      const list = Array.isArray(result)
        ? result
        : result?.services ?? result?.data ?? [];

      setServices(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao carregar os serviços."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const createItem = useCallback(
    async (payload) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        await createService(payload);
        setSuccess("Serviço cadastrado com sucesso.");
        await fetchItems();
      } catch (err) {
        setError(getErrorMessage(err, "Não foi possível cadastrar o serviço."));
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchItems],
  );

  const updateItem = useCallback(
    async (id, payload) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        await updateService(id, payload);
        setSuccess("Servico atualizado com sucesso.");
        await fetchItems();
      } catch (err) {
        setError(getErrorMessage(err, "Não foi possível atualizar o serviço."));
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchItems],
  );

  const removeItem = useCallback(
    async (id) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        await deleteService(id);
        setSuccess("Servico removido com sucesso.");
        await fetchItems();
      } catch (err) {
        setError(getErrorMessage(err, "Não foi possível remover o serviço."));
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchItems],
  );

  const activeCount = useMemo(() => services.length, [services]);

  return {
    services,
    loading,
    submitting,
    error,
    success,
    activeCount,
    refetch: fetchItems,
    createItem,
    updateItem,
    removeItem,
    clearError: () => setError(null),
    clearSuccess: () => setSuccess(null),
  };
}
