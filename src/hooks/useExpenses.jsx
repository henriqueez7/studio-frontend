import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from "../services/expenseService.js";
import { getErrorMessage } from "../utils/errors.js";

function normalizeExpense(expense) {
  return {
    ...expense,
    value: Number(expense?.value ?? expense?.amount ?? 0),
    date: expense?.date ?? expense?.expenseDate ?? "",
    observation: expense?.observation ?? expense?.notes ?? "",
  };
}

export default function useExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getExpenses();
      const list = Array.isArray(response)
        ? response
        : response?.expenses ?? response?.data ?? [];
      setExpenses(Array.isArray(list) ? list.map(normalizeExpense) : []);
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível carregar as despesas."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const saveExpense = useCallback(
    async (payload) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        if (payload.id) {
          const { id, ...body } = payload;
          await updateExpense(id, body);
          setSuccess("Despesa atualizada com sucesso.");
        } else {
          await createExpense(payload);
          setSuccess("Despesa cadastrada com sucesso.");
        }
        await loadExpenses();
      } catch (err) {
        setError(getErrorMessage(err, "Não foi possível salvar a despesa."));
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [loadExpenses],
  );

  const removeExpense = useCallback(
    async (id) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        await deleteExpense(id);
        setSuccess("Despesa removida com sucesso.");
        await loadExpenses();
      } catch (err) {
        setError(getErrorMessage(err, "Nao foi possivel remover a despesa."));
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [loadExpenses],
  );

  const totalExpenses = useMemo(
    () =>
      expenses.reduce(
        (sum, expense) =>
          sum + Number(expense.value ?? expense.amount ?? 0) || 0,
        0,
      ),
    [expenses],
  );

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const expensesMonth = useMemo(
    () =>
      expenses
        .filter((expense) => {
          const date = new Date(expense.date);
          return (
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
          );
        })
        .reduce(
          (sum, expense) =>
            sum + Number(expense.value ?? expense.amount ?? 0) || 0,
          0,
        ),
    [expenses, currentMonth, currentYear],
  );

  const largestRecentExpense = useMemo(() => {
    const recent = expenses
      .filter((expense) => {
        const date = new Date(expense.date);
        const threshold = new Date();
        threshold.setDate(threshold.getDate() - 30);
        return date >= threshold;
      })
      .sort(
        (a, b) =>
          Number(b.value ?? b.amount ?? 0) - Number(a.value ?? a.amount ?? 0),
      );

    return recent.length ? recent[0] : null;
  }, [expenses]);

  const categories = useMemo(() => {
    const set = new Set();
    expenses.forEach((expense) => {
      const category = expense.category || "Sem categoria";
      set.add(category);
    });
    return Array.from(set);
  }, [expenses]);

  return {
    expenses,
    loading,
    submitting,
    error,
    success,
    totalExpenses,
    expensesMonth,
    largestRecentExpense,
    categories,
    refetch: loadExpenses,
    saveExpense,
    removeExpense,
    clearError: () => setError(null),
    clearSuccess: () => setSuccess(null),
  };
}
