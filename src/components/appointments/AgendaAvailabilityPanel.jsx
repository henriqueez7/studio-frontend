import { CalendarClock, CheckCircle2, Clock3 } from "lucide-react";
import { formatTimeLabel } from "../../utils/appointments.js";
import {
  buildWeeklySchedule,
  formatWeekDayLabel,
  summarizeAvailabilityWindows,
} from "../../utils/schedule.js";

function StatCard({ label, value, tone = "slate" }) {
  const tones = {
    slate: "border border-slate-200 bg-white text-slate-900",
    emerald: "border border-emerald-200 bg-emerald-50 text-emerald-800",
    amber: "border border-amber-200 bg-amber-50 text-amber-800",
  };

  return (
    <div className={`rounded-[24px] p-4 shadow-sm ${tones[tone] || tones.slate}`}>
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function AgendaAvailabilityPanel({
  title,
  description,
  availabilities = [],
  appointments = [],
  emptyMessage = "Nenhuma disponibilidade ativa configurada.",
}) {
  const activeWindows = summarizeAvailabilityWindows(availabilities);
  const { entries, summary } = buildWeeklySchedule(availabilities, appointments, 7);

  if (!activeWindows.length) {
    return (
      <section className="rounded-[32px] border border-slate-200 bg-[#eef2f7] p-8 shadow-[0_20px_50px_rgba(56,65,84,0.06)]">
        <p className="text-sm uppercase tracking-[0.24em] text-[#6d4cad]">Disponibilidade</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900">{title}</h2>
        {description ? (
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 sm:text-base">{description}</p>
        ) : null}
        <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-8 text-slate-500">
          {emptyMessage}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[32px] border border-slate-200 bg-[#eef2f7] p-8 shadow-[0_20px_50px_rgba(56,65,84,0.06)]">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.24em] text-[#6d4cad]">Disponibilidade</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">{title}</h2>
          {description ? (
            <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">{description}</p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[420px]">
          <StatCard label="Janelas ativas" value={summary.availabilityBlocks} />
          <StatCard label="Espaços livres" value={summary.freeSlots} tone="emerald" />
          <StatCard label="Espaços ocupados" value={summary.occupiedSlots} tone="amber" />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {activeWindows.map((window) => (
          <div
            key={window.id}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600"
          >
            <span className="font-semibold text-slate-900">{window.dayLabel}</span>
            <span className="mx-2 text-slate-400">•</span>
            <span>{window.timeLabel}</span>
            <span className="mx-2 text-slate-400">•</span>
            <span>{window.intervalLabel}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        {entries.map((entry) => (
          <article
            key={entry.date}
            className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_28px_rgba(56,65,84,0.05)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  {formatWeekDayLabel(entry.windows[0]?.dayOfWeek) || entry.dayLabel}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{entry.fullDateLabel}</h3>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                  {entry.freeCount} livres
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">
                  {entry.occupiedCount} ocupados
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
              {entry.windows.length ? (
                entry.windows.map((window) => (
                  <span
                    key={window.id}
                    className="rounded-full border border-slate-200 bg-[#f3f6fa] px-3 py-1"
                  >
                    <Clock3 className="mr-1 inline h-3.5 w-3.5" />
                    {formatTimeLabel(window.startTime)} - {formatTimeLabel(window.endTime)}
                  </span>
                ))
              ) : (
                <span className="rounded-full border border-slate-200 bg-[#f3f6fa] px-3 py-1">
                  Sem expediente configurado
                </span>
              )}
            </div>

            {entry.slots.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {entry.slots.map((slot) => (
                  <div
                    key={slot.key}
                    className={
                      slot.status === "occupied"
                        ? "rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
                        : "rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800"
                    }
                    title={
                      slot.appointment
                        ? `${slot.appointment.clientName} • ${slot.appointment.serviceLabel}`
                        : "Horário livre"
                    }
                  >
                    <div className="flex items-center gap-2">
                      {slot.status === "occupied" ? (
                        <CalendarClock className="h-3.5 w-3.5" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      <span className="font-semibold">{slot.time}</span>
                    </div>
                    <p className="mt-1 max-w-[140px] truncate text-[11px] opacity-80">
                      {slot.appointment ? slot.appointment.clientName : "Disponível"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-[20px] border border-dashed border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm text-slate-500">
                Sem horários disponíveis neste dia.
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
