import { Edit3, Trash2 } from "lucide-react";
import EmptyState from "../ui/EmptyState.jsx";
import { formatDisplayDate } from "../../utils/date.js";

function formatCurrency(value) {
  const number = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(number)) return "R$ 0,00";
  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function ExpenseTable({ expenses, onEdit, onDelete, deleting }) {
  if (expenses.length === 0) {
    return (
      <EmptyState
        eyebrow="Sem despesas"
        title="Nenhuma despesa encontrada"
        description="Registre sua primeira despesa para acompanhar o fluxo financeiro."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white">
      <div className="hidden grid-cols-[minmax(240px,3fr)_minmax(180px,1.4fr)_minmax(120px,0.9fr)_minmax(150px,1fr)_120px] gap-6 border-b border-slate-200 bg-[#f8fafc] px-6 py-4 text-sm uppercase tracking-[0.2em] text-slate-500 md:grid">
        <span>Descrição</span>
        <span>Categoria</span>
        <span>Valor</span>
        <span>Data</span>
        <span className="text-center">Ações</span>
      </div>

      <div className="divide-y divide-slate-200">
        {expenses.map((expense) => (
          <div
            key={expense.id ?? expense._id ?? expense.description}
            className="grid gap-4 px-5 py-5 md:grid-cols-[minmax(240px,3fr)_minmax(180px,1.4fr)_minmax(120px,0.9fr)_minmax(150px,1fr)_120px] md:items-center md:gap-6 md:px-6"
          >
            <div className="space-y-1">
              <p className="font-semibold text-slate-900">{expense.description}</p>
              <p className="text-xs text-slate-500">
                {expense.observation ?? "Sem observação"}
              </p>
            </div>

            <span className="text-sm leading-6 text-slate-600">{expense.category}</span>

            <span className="whitespace-nowrap text-sm font-semibold text-slate-900">
              {formatCurrency(expense.value ?? expense.amount ?? 0)}
            </span>

            <span className="whitespace-nowrap text-sm text-slate-500">
              {formatDisplayDate(expense.date)}
            </span>

            <div className="flex items-center gap-2 md:justify-center">
              <button
                type="button"
                onClick={() => onEdit(expense)}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-600 transition hover:border-[#6d4cad]/20 hover:text-[#6d4cad]"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(expense)}
                disabled={deleting}
                className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-white px-3 py-2 text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
