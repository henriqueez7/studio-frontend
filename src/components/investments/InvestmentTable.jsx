import { ArrowRight, Trash2 } from "lucide-react";
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

export default function InvestmentTable({ investments, onEdit, onDelete, deleting }) {
  if (investments.length === 0) {
    return (
      <EmptyState
        eyebrow="Sem investimentos"
        title="Nenhum investimento registrado ainda"
        description="Registre um novo investimento para acompanhar seus aportes."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white">
      <div className="hidden grid-cols-[3fr_1fr_1fr_1.3fr] border-b border-slate-200 bg-[#f8fafc] px-6 py-4 text-sm uppercase tracking-[0.2em] text-slate-500 md:grid">
        <span>Descrição</span>
        <span>Valor</span>
        <span>Data</span>
        <span>Ações</span>
      </div>

      <div className="divide-y divide-slate-200">
        {investments.map((investment) => (
          <div
            key={investment.id ?? investment._id ?? investment.description}
            className="grid gap-4 px-5 py-5 md:grid-cols-[3fr_1fr_1fr_1.3fr] md:items-center md:px-6"
          >
            <div className="space-y-1 pr-4">
              <p className="font-semibold text-slate-900">{investment.description}</p>
              <p className="text-xs text-slate-500">
                {investment.note ?? investment.observation ?? "Sem observação"}
              </p>
            </div>

            <span className="font-semibold text-slate-900">
              {formatCurrency(investment.value ?? investment.amount ?? 0)}
            </span>

            <span className="text-slate-500">{formatDisplayDate(investment.date)}</span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEdit(investment)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#6d4cad] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
              >
                Editar
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(investment)}
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
