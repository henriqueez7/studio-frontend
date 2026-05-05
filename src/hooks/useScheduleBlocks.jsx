import { useCallback, useEffect, useState } from "react";
import {
  createScheduleBlock,
  deleteScheduleBlock,
  getScheduleBlocks,
  updateScheduleBlock,
} from "../services/scheduleBlockService.js";
import { getErrorMessage } from "../utils/errors.js";

function normalizeBlocks(response) {
  const list = Array.isArray(response)
    ? response
    : response?.blocks ?? response?.items ?? response?.data ?? [];

  return Array.isArray(list) ? list : [];
}

export default function useScheduleBlocks({ date, barberId, enabled = true } = {}) {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadBlocks = useCallback(async () => {
    if (!enabled || !date) {
      setBlocks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getScheduleBlocks({ date, barberId });
      setBlocks(normalizeBlocks(response));
    } catch (err) {
      setError(getErrorMessage(err, "Nao foi possivel carregar os bloqueios da agenda."));
    } finally {
      setLoading(false);
    }
  }, [barberId, date, enabled]);

  useEffect(() => {
    loadBlocks();
  }, [loadBlocks]);

  const saveBlock = useCallback(
    async (payload) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        const response = payload?.id
          ? await updateScheduleBlock(payload.id, payload)
          : await createScheduleBlock(payload);
        setSuccess(
          response?.message ||
            (payload?.id
              ? "Bloqueio atualizado com sucesso."
              : "Bloqueio criado com sucesso."),
        );
        await loadBlocks();
        return response;
      } catch (err) {
        setError(getErrorMessage(err, "Nao foi possivel criar o bloqueio."));
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [loadBlocks],
  );

  const removeBlock = useCallback(
    async (id) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        await deleteScheduleBlock(id);
        setSuccess("Bloqueio removido com sucesso.");
        await loadBlocks();
      } catch (err) {
        setError(getErrorMessage(err, "Nao foi possivel remover o bloqueio."));
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [loadBlocks],
  );

  return {
    blocks,
    loading,
    submitting,
    error,
    success,
    refetch: loadBlocks,
    saveBlock,
    removeBlock,
    clearError: () => setError(null),
    clearSuccess: () => setSuccess(null),
  };
}
