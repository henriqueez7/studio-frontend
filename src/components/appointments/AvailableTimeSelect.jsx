import { formatTimeLabel } from "../../utils/appointments.js";

export default function AvailableTimeSelect({
  times,
  value,
  onChange,
  loading,
  disabled,
  error,
}) {
  return (
    <div className="grid gap-3 text-sm font-semibold text-slate-800">
      <div>
        <p>Horário disponível</p>
        <p className="mt-1 text-sm font-normal text-slate-500">
          Os horários livres são calculados a partir da agenda do barbeiro e dos atendimentos já reservados.
        </p>
      </div>

      {disabled ? (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-[#f8fafc] p-4 text-sm font-normal text-slate-500">
          Escolha uma data disponível para ver os horários livres.
        </div>
      ) : loading ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="h-14 rounded-[20px] bg-slate-200/80" />
          <div className="h-14 rounded-[20px] bg-slate-200/80" />
          <div className="h-14 rounded-[20px] bg-slate-200/80" />
        </div>
      ) : times.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-[#f8fafc] p-4 text-sm font-normal text-slate-500">
          Nenhum horário disponível nesta data.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2.5 sm:gap-3">
          {times.map((time) => {
            const selected = value === time;
            return (
              <button
                key={time}
                type="button"
                onClick={() => onChange(time)}
                aria-pressed={selected}
                className={
                  selected
                    ? "flex min-h-[72px] w-[76px] shrink-0 items-center justify-center rounded-[20px] border border-[#6d4cad]/20 bg-[#6d4cad] px-3 py-3 text-center text-white shadow-[0_16px_28px_rgba(109,76,173,0.2)] ring-1 ring-[#6d4cad]/15 sm:min-h-[88px] sm:w-[82px] sm:rounded-[22px] sm:py-4"
                    : "flex min-h-[72px] w-[76px] shrink-0 items-center justify-center rounded-[20px] border border-slate-200 bg-[#f8fafc] px-3 py-3 text-center text-slate-700 shadow-[0_10px_22px_rgba(15,23,42,0.06)] transition hover:border-[#6d4cad]/25 hover:bg-white sm:min-h-[88px] sm:w-[82px] sm:rounded-[22px] sm:py-4"
                }
              >
                <p className="whitespace-nowrap text-base font-semibold leading-none tracking-tight sm:text-lg">
                  {formatTimeLabel(time)}
                </p>
              </button>
            );
          })}
        </div>
      )}

      <p className="text-xs font-normal text-slate-500">
        {times.length > 0 ? `${times.length} horário(s) livre(s)` : "Os horários aparecem depois da data"}
      </p>

      {error ? <span className="text-sm text-rose-400">{error}</span> : null}
    </div>
  );
}
