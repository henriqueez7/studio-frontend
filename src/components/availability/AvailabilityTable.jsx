import { AlertCircle, Clock3, PencilLine, Trash2 } from "lucide-react";

const dayLabels = {
  MONDAY: "Segunda-feira",
  TUESDAY: "Terça-feira",
  WEDNESDAY: "Quarta-feira",
  THURSDAY: "Quinta-feira",
  FRIDAY: "Sexta-feira",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

function formatTime(value) {
  if (!value) return "--";
  return /^\d{2}:\d{2}:\d{2}$/.test(value) ? value.slice(0, 5) : value;
}

export default function AvailabilityTable({ items, onEdit, onDelete, deleting }) {
  if (!items.length) {
    return (
      <div className="border border-dashed border-slate-200 bg-[#fbfcfe] p-10 text-center text-slate-500">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[#6d4cad]">
          <AlertCircle className="h-6 w-6" />
        </div>
        <p className="mt-5 text-sm uppercase tracking-[0.32em] text-[#6d4cad]">
          Nenhuma disponibilidade
        </p>
        <p className="mt-3 text-xl font-semibold text-slate-900">
          Ainda não existe horário configurado.
        </p>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
          Crie blocos de atendimento para definir dias, horários e intervalo entre os atendimentos.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white">
      <div className="hidden grid-cols-[1.2fr_1fr_1fr_0.8fr_1fr] border-b border-slate-200 bg-[#f8fafc] px-6 py-4 text-sm uppercase tracking-[0.2em] text-slate-500 lg:grid">
        <span>Dia</span>
        <span>Início</span>
        <span>Fim</span>
        <span>Intervalo</span>
        <span>Ações</span>
      </div>

      <div className="divide-y divide-slate-200">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid gap-4 px-5 py-5 lg:grid-cols-[1.2fr_1fr_1fr_0.8fr_1fr] lg:items-center lg:px-6"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {dayLabels[item.dayOfWeek] || item.dayOfWeek}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {item.active ? "Bloco ativo" : "Bloco inativo"}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 text-slate-700">
              <Clock3 className="h-4 w-4 text-[#6d4cad]" />
              <span>{formatTime(item.startTime)}</span>
            </div>

            <span className="text-slate-700">{formatTime(item.endTime)}</span>

            <span className="text-slate-700">{item.slotIntervalInMinutes} min</span>

            <div className="flex flex-wrap items-center gap-2 lg:justify-start">
              <button
                type="button"
                onClick={() => onEdit(item)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#6d4cad]/20 hover:text-[#6d4cad]"
              >
                <PencilLine className="h-4 w-4" />
                Editar
              </button>
              <button
                type="button"
                onClick={() => onDelete(item)}
                disabled={deleting}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
