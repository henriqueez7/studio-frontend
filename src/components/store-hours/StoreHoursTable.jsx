import { PencilLine } from "lucide-react";

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

export default function StoreHoursTable({ items, onEdit }) {
  return (
    <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white">
      <div className="hidden grid-cols-[1.2fr_1fr_1fr_0.8fr_0.8fr] border-b border-slate-200 bg-[#f8fafc] px-6 py-4 text-sm uppercase tracking-[0.2em] text-slate-500 lg:grid">
        <span>Dia</span>
        <span>Início</span>
        <span>Fim</span>
        <span>Status</span>
        <span>Ações</span>
      </div>

      <div className="divide-y divide-slate-200">
        {items.map((item) => (
          <div key={item.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[1.2fr_1fr_1fr_0.8fr_0.8fr] lg:items-center lg:px-6">
            <div className="text-sm font-semibold text-slate-900">
              {dayLabels[item.dayOfWeek] || item.dayOfWeek}
            </div>
            <div className="text-slate-700">{formatTime(item.startTime)}</div>
            <div className="text-slate-700">{formatTime(item.endTime)}</div>
            <div>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  item.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                }`}
              >
                {item.active ? "Ativo" : "Fechado"}
              </span>
            </div>
            <div>
              <button
                type="button"
                onClick={() => onEdit(item)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#6d4cad]/20 hover:text-[#6d4cad]"
              >
                <PencilLine className="h-4 w-4" />
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
