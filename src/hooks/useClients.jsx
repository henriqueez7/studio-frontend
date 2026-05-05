import { useCallback, useEffect, useMemo, useState } from "react";
import {
  blockClient,
  deleteClient,
  getClients,
  unblockClient,
  updateClient,
} from "../services/clientService.js";
import { getErrorMessage } from "../utils/errors.js";

function normalizeClients(response) {
  const list = Array.isArray(response)
    ? response
    : response?.clients ?? response?.items ?? response?.data ?? [];

  return Array.isArray(list) ? list : [];
}

export default function useClients(month) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadClients = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getClients(month);
      setClients(normalizeClients(response));
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível carregar os clientes."));
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const blockItem = useCallback(
    async (id) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        await blockClient(id);
        setSuccess("Cliente bloqueado com sucesso.");
        await loadClients();
      } catch (err) {
        setError(getErrorMessage(err, "Não foi possível bloquear o cliente."));
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [loadClients],
  );

  const unblockItem = useCallback(
    async (id) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        await unblockClient(id);
        setSuccess("Cliente desbloqueado com sucesso.");
        await loadClients();
      } catch (err) {
        setError(getErrorMessage(err, "Não foi possível desbloquear o cliente."));
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [loadClients],
  );

  const updateItem = useCallback(
    async (id, payload) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        const updatedClient = await updateClient(id, payload);

        if (updatedClient && typeof updatedClient === "object") {
          setClients((current) =>
            current.map((item) =>
              String(item.id) === String(id) ? { ...item, ...updatedClient } : item,
            ),
          );
        }

        setSuccess("Cliente atualizado com sucesso.");

        try {
          await loadClients();
        } catch {
          // Mantem a atualizacao local mesmo se a listagem falhar.
        }
      } catch (err) {
        setError(getErrorMessage(err, "Não foi possível atualizar o cliente."));
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [loadClients],
  );

  const removeItem = useCallback(
    async (id) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        await deleteClient(id);
        setClients((current) => current.filter((item) => String(item.id) !== String(id)));
        setSuccess("Cliente excluido com sucesso.");

        try {
          await loadClients();
        } catch {
          // Mantem a remocao local mesmo se a listagem falhar.
        }
      } catch (err) {
        setError(getErrorMessage(err, "Nao foi possivel excluir o cliente."));
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [loadClients],
  );

  const activeCount = useMemo(
    () => clients.filter((client) => client.active !== false).length,
    [clients],
  );

  return {
    clients,
    loading,
    submitting,
    error,
    success,
    activeCount,
    refetch: loadClients,
    blockItem,
    unblockItem,
    updateItem,
    removeItem,
    clearError: () => setError(null),
    clearSuccess: () => setSuccess(null),
  };
}
