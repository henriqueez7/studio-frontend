import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createInvestment,
  deleteInvestment,
  getInvestments,
  updateInvestment,
} from "../services/investmentService.js";
import { getErrorMessage } from "../utils/errors.js";

export default function useInvestments() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadInvestments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getInvestments();
      const list = Array.isArray(response)
        ? response
        : response?.investments ?? response?.data ?? [];
      setInvestments(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível carregar os investimentos."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvestments();
  }, [loadInvestments]);

  const saveInvestment = useCallback(
    async (payload) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        if (payload.id) {
          const { id, ...body } = payload;
          const updatedInvestment = await updateInvestment(id, body);

          setInvestments((prev) =>
            prev.map((item) =>
              String(item.id ?? item._id) === String(id) ? updatedInvestment : item,
            ),
          );

          setSuccess("Investimento atualizado com sucesso.");
          return updatedInvestment;
        }

        const createdInvestment = await createInvestment(payload);
        setInvestments((prev) => [createdInvestment, ...prev]);
        setSuccess("Investimento cadastrado com sucesso.");
        return createdInvestment;
      } catch (err) {
        setError(getErrorMessage(err, "Não foi possível salvar o investimento."));
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  const removeInvestment = useCallback(async (investmentId) => {
    setDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteInvestment(investmentId);
      setInvestments((prev) =>
        prev.filter((item) => String(item.id ?? item._id) !== String(investmentId)),
      );
      setSuccess("Investimento removido com sucesso.");
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível remover o investimento."));
      throw err;
    } finally {
      setDeleting(false);
    }
  }, []);

  const totalInvested = useMemo(
    () =>
      investments.reduce(
        (sum, item) => sum + (Number(item.value ?? item.amount ?? 0) || 0),
        0,
      ),
    [investments],
  );

  const recentInvestmentsCount = useMemo(() => {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 30);

    return investments.filter((item) => {
      const date = new Date(item.date);
      return date >= threshold;
    }).length;
  }, [investments]);

  const recentInvestments = useMemo(() => {
    return investments
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [investments]);

  return {
    investments,
    loading,
    submitting,
    deleting,
    error,
    success,
    totalInvested,
    recentInvestmentsCount,
    recentInvestments,
    refetch: loadInvestments,
    saveInvestment,
    removeInvestment,
    clearError: () => setError(null),
    clearSuccess: () => setSuccess(null),
  };
}
