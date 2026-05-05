import { CalendarRange, Clock3, Scissors } from "lucide-react";
import {
  formatCurrency,
  formatDateLabel,
  formatDuration,
  formatTimeLabel,
  normalizeServiceItem,
} from "../../utils/appointments.js";

export default function AppointmentSummaryCard({
  barber,
  services,
  appointmentDate,
  startTime,
  compact = false,
}) {
  const normalizedServices = services.map(normalizeServiceItem);
  const totalDuration = normalizedServices.reduce(
    (sum, service) => sum + (service.duration || 0),
    0,
  );
  const totalPrice = normalizedServices.reduce(
    (sum, service) => sum + (service.price || 0),
    0,
  );

  return (
    <section
      className={`rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)] ${
        compact ? "p-5" : "p-6 sm:p-8"
      }`}
    >
      <p className="text-sm uppercase tracking-[0.24em] text-[#6d4cad]">
        Resumo do agendamento
      </p>
      <h2 className={`mt-3 font-semibold text-slate-900 ${compact ? "text-lg" : "text-xl sm:text-2xl"}`}>
        Seu atendimento no studio
      </h2>

      <div
        className={`mt-6 grid gap-3 rounded-[24px] border border-slate-200 bg-[#f8fafc] text-sm text-slate-700 ${
          compact ? "p-4" : "p-5"
        }`}
      >
        <div className="flex items-center gap-3">
          <Scissors className="h-4 w-4 text-[#6d4cad]" />
          <span>Barbeiro: {barber?.name || "Selecione um barbeiro"}</span>
        </div>
        <div className="flex items-center gap-3">
          <CalendarRange className="h-4 w-4 text-[#6d4cad]" />
          <span>Data: {appointmentDate ? formatDateLabel(appointmentDate) : "Selecione a data"}</span>
        </div>
        <div className="flex items-center gap-3">
          <Clock3 className="h-4 w-4 text-[#6d4cad]" />
          <span>Horário: {startTime ? formatTimeLabel(startTime) : "Selecione o horário"}</span>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {normalizedServices.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-slate-200 bg-[#f8fafc] p-5 text-sm text-slate-500">
            Escolha um ou mais serviços para montar o atendimento.
          </div>
        ) : (
          normalizedServices.slice(0, compact ? 2 : normalizedServices.length).map((service) => (
            <article
              key={service.id}
              className="rounded-[24px] border border-slate-200 bg-[#f8fafc] p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{service.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatDuration(service.duration)}
                  </p>
                </div>
                <strong className="text-slate-900">{formatCurrency(service.price)}</strong>
              </div>
            </article>
          ))
        )}
        {compact && normalizedServices.length > 2 ? (
          <div className="rounded-[20px] border border-dashed border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm text-slate-500">
            +{normalizedServices.length - 2} serviço(s) no resumo completo
          </div>
        ) : null}
      </div>

      <div className={`mt-6 grid gap-4 ${compact ? "grid-cols-2" : "sm:grid-cols-2"}`}>
        <div className="rounded-[24px] border border-slate-200 bg-[#f8fafc] p-5 text-slate-900 shadow-[0_12px_24px_rgba(15,23,42,0.06)]">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
            Duração total
          </p>
          <p className={`mt-3 font-semibold ${compact ? "text-xl" : "text-2xl"}`}>{formatDuration(totalDuration)}</p>
        </div>
        <div className="rounded-[24px] border border-[#6d4cad]/10 bg-[#6d4cad] p-5 text-white shadow-[0_16px_28px_rgba(109,76,173,0.22)]">
          <p className="text-sm uppercase tracking-[0.2em] text-white/80">
            Valor estimado
          </p>
          <p className={`mt-3 font-semibold ${compact ? "text-xl" : "text-2xl"}`}>{formatCurrency(totalPrice)}</p>
        </div>
      </div>
    </section>
  );
}
