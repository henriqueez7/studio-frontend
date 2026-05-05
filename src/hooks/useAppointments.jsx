import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  cancelAppointment,
  confirmAppointment,
  createAppointment,
  deleteAppointment,
  finishAppointment,
  getAppointments,
  updateAppointment,
} from "../services/appointmentService.js";
import { ROLE_ADMIN, ROLE_BARBER, normalizeRole } from "../utils/auth.js";
import { getErrorMessage } from "../utils/errors.js";
import {
  getAppointmentDate,
  getAppointmentEndTime,
  getAppointmentServices,
  getAppointmentStartTime,
  getAppointmentTotalDuration,
  getAppointmentTotalPrice,
} from "../utils/appointments.js";

function normalizeAppointments(response) {
  const list = Array.isArray(response)
    ? response
    : response?.appointments ?? response?.data ?? [];

  if (!Array.isArray(list)) return [];

  return list.map((appointment) => ({
    ...appointment,
    services: getAppointmentServices(appointment),
    appointmentDate: getAppointmentDate(appointment),
    startTime: getAppointmentStartTime(appointment),
    endTime: getAppointmentEndTime(appointment),
    totalDuration: getAppointmentTotalDuration(appointment),
    totalPrice: getAppointmentTotalPrice(appointment),
  }));
}

export default function useAppointments({
  autoLoad = true,
  scope = "auto",
  targetBarberId,
  targetClientId,
} = {}) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(autoLoad);
  const [submitting, setSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const role = normalizeRole(user?.role);
  const effectiveScope =
    scope !== "auto"
      ? scope
      : role === ROLE_ADMIN
        ? "admin"
        : role === ROLE_BARBER
          ? "barber"
          : "client";

  const effectiveBarberId = targetBarberId ?? user?.id;
  const effectiveClientId =
    effectiveScope === "client" && targetClientId == null
      ? null
      : targetClientId ?? user?.id;

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAppointments({
        scope: effectiveScope,
        barberId: effectiveBarberId,
        clientId: effectiveClientId,
      });
      setAppointments(normalizeAppointments(response));
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível carregar os agendamentos."));
    } finally {
      setLoading(false);
    }
  }, [effectiveBarberId, effectiveClientId, effectiveScope]);

  useEffect(() => {
    if (!autoLoad) return;
    loadAppointments();
  }, [autoLoad, loadAppointments]);

  const saveAppointment = useCallback(
    async (payload) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        const response = await createAppointment(payload);
        setSuccess(response?.message || "Agendamento criado com sucesso.");
        await loadAppointments();
        return response;
      } catch (err) {
        setError(getErrorMessage(err, "Não foi possível criar o agendamento."));
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [loadAppointments],
  );

  const updateAppointmentAction = useCallback(
    async (appointmentId, payload) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        const response = await updateAppointment(appointmentId, payload);
        setSuccess(response?.message || "Agendamento atualizado com sucesso.");
        await loadAppointments();
        return response;
      } catch (err) {
        setError(getErrorMessage(err, "Não foi possível atualizar o agendamento."));
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [loadAppointments],
  );

  const deleteAppointmentAction = useCallback(
    async (appointmentId) => {
      setProcessingId(appointmentId);
      setError(null);
      setSuccess(null);

      try {
        const response = await deleteAppointment(appointmentId);
        setSuccess(response?.message || "Agendamento excluído com sucesso.");
        await loadAppointments();
        return response;
      } catch (err) {
        setError(getErrorMessage(err, "Não foi possível excluir o agendamento."));
        throw err;
      } finally {
        setProcessingId(null);
      }
    },
    [loadAppointments],
  );

  const runStatusAction = useCallback(
    async (appointmentId, action, fallbackSuccess, fallbackError) => {
      setProcessingId(appointmentId);
      setError(null);
      setSuccess(null);

      try {
        const response = await action(appointmentId);
        setSuccess(response?.message || fallbackSuccess);
        await loadAppointments();
        return response;
      } catch (err) {
        setError(getErrorMessage(err, fallbackError));
        throw err;
      } finally {
        setProcessingId(null);
      }
    },
    [loadAppointments],
  );

  const confirmAppointmentAction = useCallback(
    (appointmentId) =>
      runStatusAction(
        appointmentId,
        confirmAppointment,
        "Agendamento confirmado com sucesso.",
        "Não foi possível confirmar o agendamento.",
      ),
    [runStatusAction],
  );

  const cancelAppointmentAction = useCallback(
    (appointmentId) =>
      runStatusAction(
        appointmentId,
        cancelAppointment,
        "Agendamento cancelado com sucesso.",
        "Não foi possível cancelar o agendamento.",
      ),
    [runStatusAction],
  );

  const finishAppointmentAction = useCallback(
    (appointmentId) =>
      runStatusAction(
        appointmentId,
        finishAppointment,
        "Atendimento concluído com sucesso.",
        "Não foi possível concluir o atendimento.",
      ),
    [runStatusAction],
  );

  const upcomingAppointments = useMemo(() => {
    return appointments.slice().sort((a, b) => {
      const aDate = new Date(`${a.appointmentDate || ""}T${a.startTime || "00:00:00"}`);
      const bDate = new Date(`${b.appointmentDate || ""}T${b.startTime || "00:00:00"}`);
      return aDate - bDate;
    });
  }, [appointments]);

  return {
    appointments,
    upcomingAppointments,
    loading,
    submitting,
    processingId,
    error,
    success,
    refetch: loadAppointments,
    saveAppointment,
    updateAppointment: updateAppointmentAction,
    deleteAppointment: deleteAppointmentAction,
    confirmAppointment: confirmAppointmentAction,
    cancelAppointment: cancelAppointmentAction,
    finishAppointment: finishAppointmentAction,
    clearError: () => setError(null),
    clearSuccess: () => setSuccess(null),
  };
}
