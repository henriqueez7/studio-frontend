import { useCallback, useEffect, useState } from "react";
import {
  getAppointmentNotificationSettings,
  updateAppointmentNotificationSettings,
} from "../services/appointmentNotificationSettingsService.js";
import { getErrorMessage } from "../utils/errors.js";

export default function useAppointmentNotificationSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAppointmentNotificationSettings();
      setSettings(response);
    } catch (err) {
      setError(
        getErrorMessage(err, "Nao foi possivel carregar as configuracoes de mensagem."),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = useCallback(async (payload) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await updateAppointmentNotificationSettings(payload);
      setSettings(response);
      setSuccess("Mensagem automatica atualizada com sucesso.");
      return response;
    } catch (err) {
      setError(
        getErrorMessage(err, "Nao foi possivel salvar as configuracoes de mensagem."),
      );
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    settings,
    loading,
    saving,
    error,
    success,
    refetch: loadSettings,
    saveSettings,
    clearError: () => setError(null),
    clearSuccess: () => setSuccess(null),
  };
}
