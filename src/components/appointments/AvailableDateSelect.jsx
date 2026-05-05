import { formatDateLabel } from "../../utils/appointments.js";

export default function AvailableDateSelect({
  dates,
  value,
  onChange,
  loading,
  disabled,
  error,
}) {
  const formatCalendarParts = (date) => {
    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    return {
      weekday: new Intl.DateTimeFormat("pt-BR", { weekday: "short" })
        .format(parsedDate)
        .replace(".", "")
        .toUpperCase(),
      day: new Intl.DateTimeFormat("pt-BR", { day: "2-digit" }).format(parsedDate),
      month: new Intl.DateTimeFormat("pt-BR", { month: "short" })
        .format(parsedDate)
        .replace(".", "")
        .toUpperCase(),
      year: new Intl.DateTimeFormat("pt-BR", { year: "numeric" }).format(parsedDate),
    };
  };

  const renderDate = (date) => {
    const calendarParts = formatCalendarParts(date);

    if (calendarParts) {
      return (
        <>
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-current/75">
            {calendarParts.weekday}
          </span>
          <span className="mt-2 text-2xl font-semibold leading-none tracking-tight sm:text-[1.75rem]">
            {calendarParts.day}
          </span>
          <span className="mt-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-current/75">
            {calendarParts.month}
          </span>
          <span className="mt-1 text-xs font-medium text-current/70">
            {calendarParts.year}
          </span>
        </>
      );
    }

    const label = formatDateLabel(date);
    const parts = label.split("/");

    if (parts.length !== 3) {
      return <p className="text-sm font-semibold leading-5 tracking-tight">{label}</p>;
    }

    return (
      <>
        <p className="text-lg font-semibold leading-none tracking-tight">
          {parts[0]}/{parts[1]}
        </p>
        <p className="mt-2 text-sm font-semibold leading-none text-white/80">
          {parts[2]}
        </p>
      </>
    );
  };

  return (
    <div className="grid gap-3 text-sm font-semibold text-slate-800">
      <div>
        <p>Data disponível</p>
        <p className="mt-1 text-sm font-normal text-slate-500">
          As datas abaixo já respeitam a disponibilidade configurada e os serviços escolhidos.
        </p>
      </div>

      {disabled ? (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-[#f8fafc] p-4 text-sm font-normal text-slate-500">
          Primeiro escolha barbeiro e serviços para liberar as datas.
        </div>
      ) : loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-14 rounded-[20px] bg-slate-200/80" />
          <div className="h-14 rounded-[20px] bg-slate-200/80" />
        </div>
      ) : dates.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-[#f8fafc] p-4 text-sm font-normal text-slate-500">
          Nenhuma data disponível para essa combinação no momento.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2.5 sm:gap-3">
          {dates.map((date) => {
            const selected = value === date;
            return (
              <button
                key={date}
                type="button"
                onClick={() => onChange(date)}
                aria-pressed={selected}
                className={
                  selected
                    ? "flex min-h-[118px] w-[94px] shrink-0 flex-col items-center justify-center rounded-[22px] border border-[#6d4cad]/20 bg-[#6d4cad] px-3 py-3.5 text-center text-white shadow-[0_16px_28px_rgba(109,76,173,0.2)] ring-1 ring-[#6d4cad]/15 sm:min-h-[128px] sm:w-[102px] sm:rounded-[24px] sm:py-4"
                    : "flex min-h-[118px] w-[94px] shrink-0 flex-col items-center justify-center rounded-[22px] border border-slate-200 bg-white px-3 py-3.5 text-center text-slate-700 shadow-[0_10px_22px_rgba(15,23,42,0.06)] transition hover:border-[#6d4cad]/25 hover:bg-[#f8fafc] sm:min-h-[128px] sm:w-[102px] sm:rounded-[24px] sm:py-4"
                }
              >
                {renderDate(date)}
              </button>
            );
          })}
        </div>
      )}

      <p className="text-xs font-normal text-slate-500">
        {dates.length > 0 ? `${dates.length} data(s) encontrada(s)` : "Sem datas liberadas ainda"}
      </p>

      {error ? <span className="text-sm text-rose-400">{error}</span> : null}
    </div>
  );
}
