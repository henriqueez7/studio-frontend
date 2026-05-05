import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createBarber,
  deleteBarber,
  getBarbers,
  updateBarber,
} from "../services/barberService.js";
import { getErrorMessage } from "../utils/errors.js";

function normalizeBarbers(response) {
  const list = Array.isArray(response)
    ? response
    : response?.barbers ?? response?.items ?? response?.data ?? [];

  return Array.isArray(list) ? list : [];
}

export default function useBarbers() {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadBarbers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getBarbers();
      setBarbers(normalizeBarbers(response));
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível carregar os barbeiros."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBarbers();
  }, [loadBarbers]);

  const createItem = useCallback(
    async (payload) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        const createdBarber = await createBarber(payload);

        if (createdBarber && typeof createdBarber === "object") {
          setBarbers((current) => {
            const withoutDuplicate = current.filter(
              (item) => String(item.id) !== String(createdBarber.id),
            );

            return [createdBarber, ...withoutDuplicate];
          });
        }

        setSuccess("Barbeiro cadastrado com sucesso.");

        try {
          await loadBarbers();
        } catch {
          // Mantem o barbeiro recém-criado na tela mesmo se a listagem falhar.
        }
      } catch (err) {
        setError(getErrorMessage(err, "Não foi possível cadastrar o barbeiro."));
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [loadBarbers],
  );

  const removeItem = useCallback(
    async (id) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        await deleteBarber(id);
        setSuccess("Barbeiro removido do sistema com sucesso.");
        await loadBarbers();
      } catch (err) {
        setError(getErrorMessage(err, "Não foi possível remover o barbeiro."));
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [loadBarbers],
  );

  const updateItem = useCallback(
    async (id, payload) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        const updatedBarber = await updateBarber(id, payload);

        if (updatedBarber && typeof updatedBarber === "object") {
          setBarbers((current) =>
            current.map((item) =>
              String(item.id) === String(id) ? { ...item, ...updatedBarber } : item,
            ),
          );
        }

        setSuccess("Profissional atualizado com sucesso.");

        try {
          await loadBarbers();
        } catch {
          // Mantem a atualizacao local mesmo se a listagem falhar.
        }
      } catch (err) {
        setError(getErrorMessage(err, "Não foi possível atualizar o profissional."));
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [loadBarbers],
  );

  const activeCount = useMemo(
    () => barbers.filter((barber) => barber.active !== false).length,
    [barbers],
  );

  return {
    barbers,
    loading,
    submitting,
    error,
    success,
    activeCount,
    refetch: loadBarbers,
    createItem,
    updateItem,
    removeItem,
    clearError: () => setError(null),
    clearSuccess: () => setSuccess(null),
  };
}
