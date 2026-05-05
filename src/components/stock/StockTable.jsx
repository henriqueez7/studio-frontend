import EmptyState from "../ui/EmptyState.jsx";
import { formatDisplayDateTime } from "../../utils/date.js";

function formatMovementType(type) {
  if (type === "ENTRY") return "Entrada";
  if (type === "EXIT") return "Saida";
  return "Ajuste";
}

function getMovementKey(movement) {
  return (
    movement.id ??
    movement._id ??
    `${movement.productId ?? movement.productName ?? "produto"}-${movement.date ?? movement.createdAt ?? "data"}`
  );
}

function getMovementDate(movement) {
  return movement.date ?? movement.createdAt ?? movement.updatedAt ?? null;
}

function getMovementProductName(movement) {
  return movement.product?.name ?? movement.productName ?? movement.productId ?? "Produto";
}

function getMovementCategory(movement) {
  return movement.product?.category ?? movement.category ?? "Sem categoria";
}

export default function StockTable({ movements }) {
  if (movements.length === 0) {
    return (
      <EmptyState
        eyebrow="Sem movimentações"
        title="Nenhuma movimentacao de estoque registrada ainda"
        description="Registre entradas, saidas ou ajustes para comecar a acompanhar o historico de estoque."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white">
      <div className="hidden grid-cols-[2.1fr_1fr_0.8fr_1.5fr_1.2fr] border-b border-slate-200 bg-[#f8fafc] px-6 py-4 text-sm uppercase tracking-[0.2em] text-slate-500 md:grid">
        <span>Produto</span>
        <span>Tipo</span>
        <span>Quantidade</span>
        <span>Motivo</span>
        <span>Data</span>
      </div>

      <div className="divide-y divide-slate-200">
        {movements.map((movement) => (
          <div
            key={getMovementKey(movement)}
            className="grid gap-4 px-5 py-5 md:grid-cols-[2.1fr_1fr_0.8fr_1.5fr_1.2fr] md:items-center md:px-6"
          >
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-slate-900">
                {getMovementProductName(movement)}
              </span>
              <span className="text-xs text-slate-500">{getMovementCategory(movement)}</span>
            </div>

            <span
              className={`inline-flex h-9 w-fit min-w-[104px] items-center justify-center rounded-full px-3 text-xs font-semibold ${
                movement.type === "ENTRY"
                  ? "bg-emerald-100 text-emerald-700"
                  : movement.type === "EXIT"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-amber-100 text-amber-700"
              }`}
            >
              {formatMovementType(movement.type)}
            </span>

            <span className="font-semibold text-slate-900">{movement.quantity}</span>

            <span className="text-slate-500">{movement.reason ?? "Não informado"}</span>

            <span className="text-slate-500">
              {formatDisplayDateTime(getMovementDate(movement), "Não informada")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
