import { useCallback, useEffect, useState } from "react";
import {
  createBarberAvailability,
  deleteBarberAvailability,
  getBarberAvailability,
  updateBarberAvailability,
} from "../services/availabilityService.js";
import { getErrorMessage } from "../utils/errors.js";

function normalizeAvailability(response) {
  const list = Array.isArray(response)
    ? response
    : response?.availabilities ?? response?.data ?? [];

  if (!Array.isArray(list)) return [];

  return list.map((item) => ({
    id: item.id ?? item._id,
    barberId: item.barberId ?? item.barber?.id ?? null,
    dayOfWeek: item.dayOfWeek || item.weekDay || "MONDAY",
    startTime: item.startTime || "09:00:00",
    endTime: item.endTime || "18:00:00",
    slotIntervalInMinutes:
      Number(
        item.slotIntervalInMinutes ?? item.slotInterval ?? item.intervalInMinutes ?? 30,
      ) || 30,
    active: Boolean(item.active ?? true),
  }));
}

export default function useBarberAvailability(barberId, { enabled = true } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadAvailability = useCallback(async () => {
    if (!enabled || !barberId) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getBarberAvailability(barberId);
      setItems(normalizeAvailability(response));
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível carregar a disponibilidade."));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [barberId, enabled]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const saveAvailability = useCallback(
    async (payload) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        if (payload.id) {
          const { id, ...body } = payload;
          await updateBarberAvailability(id, body);
          setSuccess("Disponibilidade atualizada com sucesso.");
        } else {
          const requestedDays = Array.isArray(payload.daysOfWeek)
            ? [...new Set(payload.daysOfWeek.filter(Boolean))]
            : [payload.dayOfWeek].filter(Boolean);
          const existingDays = new Set(items.map((item) => item.dayOfWeek));
          const daysToCreate = requestedDays.filter((day) => !existingDays.has(day));
          const skippedDays = requestedDays.filter((day) => existingDays.has(day));

          if (!daysToCreate.length) {
            throw new Error(
              requestedDays.length > 1
                ? "Os dias selecionados já possuem disponibilidade cadastrada."
                : "Já existe disponibilidade cadastrada para este dia.",
            );
          }

          await Promise.all(
            daysToCreate.map((dayOfWeek) =>
              createBarberAvailability({
                barberId: payload.barberId,
                dayOfWeek,
                startTime: payload.startTime,
                endTime: payload.endTime,
                slotIntervalInMinutes: payload.slotIntervalInMinutes,
                active: payload.active,
              }),
            ),
          );

          if (daysToCreate.length > 1) {
            setSuccess(
              skippedDays.length
                ? `Disponibilidade criada para ${daysToCreate.length} dias. Os dias já cadastrados foram ignorados.`
                : `Disponibilidade criada para ${daysToCreate.length} dias com sucesso.`,
            );
          } else {
            setSuccess(
              skippedDays.length
                ? "Disponibilidade criada com sucesso. Dias já cadastrados foram ignorados."
                : "Disponibilidade criada com sucesso.",
            );
          }
        }

        await loadAvailability();
      } catch (err) {
        setError(getErrorMessage(err, "Não foi possível salvar a disponibilidade."));
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [items, loadAvailability],
  );

  const removeAvailability = useCallback(
    async (id) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        await deleteBarberAvailability(id);
        setSuccess("Disponibilidade removida com sucesso.");
        await loadAvailability();
      } catch (err) {
        setError(getErrorMessage(err, "Não foi possível remover a disponibilidade."));
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [loadAvailability],
  );

  return {
    items,
    loading,
    submitting,
    error,
    success,
    refetch: loadAvailability,
    saveAvailability,
    removeAvailability,
    clearError: () => setError(null),
    clearSuccess: () => setSuccess(null),
  };
}
