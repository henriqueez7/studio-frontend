import { Plus, RefreshCcw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import ExpenseFormModal from "../components/expenses/ExpenseFormModal.jsx";
import ExpenseTable from "../components/expenses/ExpenseTable.jsx";
import SkeletonBlock from "../components/ui/SkeletonBlock.jsx";
import StatusBanner from "../components/ui/StatusBanner.jsx";
import useExpenses from "../hooks/useExpenses.jsx";
import { confirmDelete, confirmEditSave } from "../utils/confirmAction.js";

export default function ExpensesPage() {
  const {
    expenses,
    loading,
    submitting,
    error,
    success,
    totalExpenses,
    expensesMonth,
    largestRecentExpense,
    categories,
    refetch,
    saveExpense,
    removeExpense,
    clearError,
    clearSuccess,
  } = useExpenses();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const filteredExpenses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return expenses.filter((expense) => {
      const description = (expense.description || "").toLowerCase();
      const category = (expense.category || "").toLowerCase();
      const observation = (expense.observation || "").toLowerCase();

      const matchesSearch =
        query === "" ||
        description.includes(query) ||
        category.includes(query) ||
        observation.includes(query);

      const matchesCategory =
        selectedCategory === "" || category === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchQuery, selectedCategory]);

  const openNewExpense = () => {
    setEditingExpense(null);
    setModalOpen(true);
  };

  const openEditExpense = (expense) => {
    setEditingExpense(expense);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingExpense(null);
    clearError();
    clearSuccess();
  };

  const handleSave = async (data) => {
    try {
      if (editingExpense && !confirmEditSave(`a despesa "${editingExpense.description}"`)) return;
      await saveExpense(data);
      closeModal();
    } catch {
      // Erro tratado no hook
    }
  };

  const handleDelete = async (expense) => {
    const confirmed = confirmDelete(`a despesa "${expense.description}"`);

    if (!confirmed) return;

    try {
      await removeExpense(expense.id);
    } catch {
      // Erro tratado no hook
    }
  };

  const formatCurrency = (value) => {
    const number = typeof value === "string" ? Number(value) : value;
    if (!Number.isFinite(number)) {
      return "R$ 0,00";
    }
    return number.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(52,60,78,0.06)]">
        <div className="flex flex-col gap-5 border-b border-slate-200 px-5 py-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6d4cad]">
              Despesas
            </p>
            <p className="hidden">
              O foco fica na leitura rápida da movimentação. Cadastro e edição
              abrem em drawer lateral, no mesmo padrão operacional do resto do
              sistema.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={refetch}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-[#6d4cad]/20 hover:text-[#6d4cad]"
              aria-label="Atualizar"
              title="Atualizar"
            >
              <RefreshCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={openNewExpense}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#6d4cad] px-4 text-sm font-semibold text-white transition hover:brightness-105"
            >
              <Plus className="h-4 w-4" />
              Nova
            </button>
          </div>
        </div>

        <div className="grid gap-3 border-b border-slate-200 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span className="inline-flex rounded-full bg-[#f4effd] px-3 py-1.5 font-semibold text-[#6d4cad]">
              Total {formatCurrency(totalExpenses)}
            </span>
            <span>Mês atual {formatCurrency(expensesMonth)}</span>
            <span>
              Maior recente{" "}
              <strong className="font-semibold text-slate-700">
                {formatCurrency(largestRecentExpense?.value ?? 0)}
              </strong>
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
            <label className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm text-slate-500 lg:w-[330px]">
              <Search className="h-4 w-4 shrink-0" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar descrição, categoria ou observação"
                className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </label>

            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none"
            >
              <option value="">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && !modalOpen ? (
          <div className="px-5 pt-5">
            <StatusBanner
              type="error"
              title="Erro ao carregar despesas"
              message={error}
            />
          </div>
        ) : null}

        {success ? (
          <div className="px-5 pt-5">
            <StatusBanner type="success" title="Sucesso" message={success} />
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-3 px-5 py-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBlock
                key={index}
                className="h-20 rounded-[22px] bg-[#f8fafc]"
                lines={2}
              />
            ))}
          </div>
        ) : (
          <div className="px-5 py-5">
            <ExpenseTable
              expenses={filteredExpenses}
              onEdit={openEditExpense}
              onDelete={handleDelete}
              deleting={submitting}
            />
          </div>
        )}
      </section>

      <ExpenseFormModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSave}
        initialData={editingExpense}
        submitting={submitting}
        submitError={modalOpen ? error : null}
      />
    </div>
  );
}
