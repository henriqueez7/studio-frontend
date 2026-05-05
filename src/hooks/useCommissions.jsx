import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createCommissionPayment,
  deleteCommissionPayment,
  getAllCommissions,
  getBarberCommissions,
  payCommission,
  updateCommissionPayment,
} from "../services/commissionService.js";
import { useAuth } from "../context/AuthContext.jsx";
import { ROLE_ADMIN, normalizeRole } from "../utils/auth.js";
import { formatDisplayDate } from "../utils/date.js";
import { getErrorMessage } from "../utils/errors.js";

function getAmount(item) {
  return Number(item.totalAmount ?? item.value ?? item.amount ?? 0) || 0;
}

function normalizeStatus(status) {
  const value = String(status || "").toUpperCase();
  if (value === "PAID" || value === "PAGO") return "PAID";
  if (value === "PENDING" || value === "PENDENTE") return "PENDING";
  return value || "PENDING";
}

export default function useCommissions() {
  const { user } = useAuth();
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [payingId, setPayingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const role = normalizeRole(user?.role);
  const canMarkAsPaid = role === ROLE_ADMIN;

  const loadCommissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response =
        role === ROLE_ADMIN
          ? await getAllCommissions()
          : await getBarberCommissions(user?.id);
      const list = Array.isArray(response)
        ? response
        : response?.commissions ?? response?.data ?? [];
      setCommissions(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao carregar as comissões."));
    } finally {
      setLoading(false);
    }
  }, [role, user?.id]);

  useEffect(() => {
    loadCommissions();
  }, [loadCommissions]);

  const createPayment = useCallback(
    async (payload) => {
      if (!canMarkAsPaid) return;

      setSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        await createCommissionPayment(payload);
        setSuccess("Comissão gerada com sucesso.");
        await loadCommissions();
      } catch (err) {
        setError(getErrorMessage(err, "Não foi possível gerar a comissão."));
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [canMarkAsPaid, loadCommissions],
  );

  const markAsPaid = useCallback(
    async (id) => {
      if (!canMarkAsPaid) return;

      setPayingId(id);
      setError(null);
      setSuccess(null);

      try {
        await payCommission(id);
        setSuccess("Comissão marcada como paga com sucesso.");
        await loadCommissions();
      } catch (err) {
        setError(getErrorMessage(err, "Não foi possível marcar a comissão como paga."));
        throw err;
      } finally {
        setPayingId(null);
      }
    },
    [canMarkAsPaid, loadCommissions],
  );

  const updatePayment = useCallback(
    async (id, payload) => {
      if (!canMarkAsPaid) return;

      setEditingId(id);
      setError(null);
      setSuccess(null);

      try {
        await updateCommissionPayment(id, payload);
        setSuccess("Comissão atualizada com sucesso.");
        await loadCommissions();
      } catch (err) {
        setError(getErrorMessage(err, "Não foi possível atualizar a comissão."));
        throw err;
      } finally {
        setEditingId(null);
      }
    },
    [canMarkAsPaid, loadCommissions],
  );

  const removePayment = useCallback(
    async (id) => {
      if (!canMarkAsPaid) return;

      setDeletingId(id);
      setError(null);
      setSuccess(null);

      try {
        await deleteCommissionPayment(id);
        setSuccess("Comissão removida com sucesso.");
        await loadCommissions();
      } catch (err) {
        setError(getErrorMessage(err, "Não foi possível remover a comissão."));
        throw err;
      } finally {
        setDeletingId(null);
      }
    },
    [canMarkAsPaid, loadCommissions],
  );

  const totalCommissions = useMemo(
    () => commissions.reduce((sum, item) => sum + getAmount(item), 0),
    [commissions],
  );

  const paidCount = useMemo(
    () => commissions.filter((item) => normalizeStatus(item.status) === "PAID").length,
    [commissions],
  );

  const pendingCount = useMemo(
    () => commissions.filter((item) => normalizeStatus(item.status) !== "PAID").length,
    [commissions],
  );

  const groupedByBarber = useMemo(() => {
    const groups = new Map();

    commissions.forEach((item) => {
      const barber =
        item.barber?.name || item.barberName || item.barber || user?.name || "Sem barbeiro";
      const start = item.periodStart;
      const end = item.periodEnd;
      const description =
        item.description ||
        (start && end
          ? `Período ${formatDisplayDate(start)} a ${formatDisplayDate(end)}`
          : "Comissão do período");
      const key = barber.toString();
      const existing = groups.get(key) || {
        barber,
        totalValue: 0,
        commissions: [],
      };

      const amount = getAmount(item);
      existing.totalValue += amount;
      existing.commissions.push({
        ...item,
        description,
        note: item.notes ?? item.note ?? item.observation,
        status: normalizeStatus(item.status),
        amount,
        percentage: Number(item.commissionPercentage ?? item.percentage ?? item.rate ?? 0),
      });
      groups.set(key, existing);
    });

    return Array.from(groups.values());
  }, [commissions, user?.name]);

  return {
    commissions,
    loading,
    submitting,
    payingId,
    editingId,
    deletingId,
    error,
    success,
    totalCommissions,
    paidCount,
    pendingCount,
    groupedByBarber,
    canMarkAsPaid,
    refetch: loadCommissions,
    createPayment,
    markAsPaid,
    updatePayment,
    removePayment,
    clearError: () => setError(null),
    clearSuccess: () => setSuccess(null),
  };
}
