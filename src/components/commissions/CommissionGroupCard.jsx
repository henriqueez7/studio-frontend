import { ArrowRight, CheckCircle2 } from "lucide-react";

function formatCurrency(value) {
  const amount = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(amount)) return "R$ 0,00";

  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatPercent(value) {
  const number = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(number)) return "0%";
  return `${number.toFixed(0)}%`;
}

function formatStatus(status) {
  return status === "PAID" ? "Pago" : "Pendente";
}

export default function CommissionGroupCard({
  group,
  onMarkPaid,
  payingId,
  canMarkAsPaid = true,
}) {
  const paidCount = group.commissions.filter((item) => item.status === "PAID").length;
  const pendingCount = group.commissions.length - paidCount;

  return (
    <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-[#f8fafc] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#6d4cad]">Barbeiro</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{group.barber}</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {formatCurrency(group.totalValue)}
            </p>
          </div>
          <div className="border-l border-slate-200 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Pagas</p>
            <p className="mt-2 text-lg font-semibold text-emerald-800">{paidCount}</p>
          </div>
          <div className="border-l border-slate-200 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Pendentes</p>
            <p className="mt-2 text-lg font-semibold text-amber-800">{pendingCount}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr] border-b border-slate-200 bg-white px-6 py-4 text-sm uppercase tracking-[0.2em] text-slate-500">
            <span>Descrição</span>
            <span>Valor</span>
            <span>Percentual</span>
            <span>Status</span>
            <span>Ação</span>
          </div>
          <div className="divide-y divide-slate-200">
            {group.commissions.map((commission) => (
              <div
                key={commission.id ?? commission._id ?? commission.description}
                className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr] items-center px-6 py-5 text-sm text-slate-600"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">{commission.description}</p>
                  <p className="text-xs text-slate-500">
                    {commission.note ?? commission.observation ?? "Detalhes da comissão"}
                  </p>
                </div>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(commission.amount)}
                </span>
                <span>{formatPercent(commission.percentage ?? commission.rate ?? 0)}</span>
                <span
                  className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${
                    commission.status === "PAID"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {formatStatus(commission.status)}
                </span>
                {canMarkAsPaid ? (
                  <button
                    type="button"
                    disabled={commission.status === "PAID" || payingId === commission.id}
                    onClick={() => onMarkPaid(commission)}
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#6d4cad] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {commission.status === "PAID" ? (
                      <span className="inline-flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" /> Pago
                      </span>
                    ) : payingId === commission.id ? (
                      "Pagando..."
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        Marcar pago
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </button>
                ) : (
                  <span className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500">
                    Somente leitura
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
