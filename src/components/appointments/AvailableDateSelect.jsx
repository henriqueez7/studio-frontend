import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatDateLabel } from "../../utils/appointments.js";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

const toLocalDate = (value) => {
  const parsedDate = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const addMonths = (date, amount) =>
  new Date(date.getFullYear(), date.getMonth() + amount, 1);

const sameMonth = (left, right) =>
  left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();

const getMonthDays = (monthDate) => {
  const firstDay = startOfMonth(monthDate);
  const firstGridDay = new Date(firstDay);
  firstGridDay.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(firstGridDay);
    day.setDate(firstGridDay.getDate() + index);
    return day;
  });
};

export default function AvailableDateSelect({
  dates,
  value,
  onChange,
  loading,
  disabled,
  error,
}) {
  const normalizedDates = useMemo(
    () =>
      [...dates]
        .filter((date) => toLocalDate(date))
        .sort((left, right) => left.localeCompare(right)),
    [dates],
  );

  const availableDateSet = useMemo(
    () => new Set(normalizedDates),
    [normalizedDates],
  );

  const selectedDate = value ? toLocalDate(value) : null;
  const firstAvailableDate = normalizedDates[0]
    ? toLocalDate(normalizedDates[0])
    : null;
  const lastAvailableDate = normalizedDates[normalizedDates.length - 1]
    ? toLocalDate(normalizedDates[normalizedDates.length - 1])
    : null;

  const initialMonth = startOfMonth(selectedDate || firstAvailableDate || new Date());
  const [currentMonth, setCurrentMonth] = useState(initialMonth);

  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(startOfMonth(selectedDate));
      return;
    }

    if (firstAvailableDate) {
      setCurrentMonth(startOfMonth(firstAvailableDate));
    }
  }, [value, normalizedDates[0]]);

  const calendarDays = useMemo(
    () => getMonthDays(currentMonth),
    [currentMonth],
  );

  const monthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(currentMonth);

  const currentMonthAvailableDates = normalizedDates.filter((date) => {
    const parsedDate = toLocalDate(date);
    return parsedDate && sameMonth(parsedDate, currentMonth);
  });

  const canGoPrevious =
    firstAvailableDate && addMonths(currentMonth, -1) >= startOfMonth(firstAvailableDate);
  const canGoNext =
    lastAvailableDate && addMonths(currentMonth, 1) <= startOfMonth(lastAvailableDate);

  return (
    <div className="grid gap-3 text-sm font-semibold text-slate-800">
      <div>
        <p>Data disponivel</p>
        <p className="mt-1 text-sm font-normal text-slate-500">
          Escolha a data no calendario. Apenas os dias liberados podem ser selecionados.
        </p>
      </div>

      {disabled ? (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-[#f8fafc] p-4 text-sm font-normal text-slate-500">
          Primeiro escolha barbeiro e servicos para liberar as datas.
        </div>
      ) : loading ? (
        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
          <div className="mb-4 h-9 rounded-2xl bg-slate-200/80" />
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }, (_, index) => (
              <div key={index} className="aspect-square rounded-2xl bg-slate-200/80" />
            ))}
          </div>
        </div>
      ) : normalizedDates.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-[#f8fafc] p-4 text-sm font-normal text-slate-500">
          Nenhuma data disponivel para essa combinacao no momento.
        </div>
      ) : (
        <div className="rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_12px_28px_rgba(15,23,42,0.06)] sm:p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentMonth((month) => addMonths(month, -1))}
              disabled={!canGoPrevious}
              aria-label="Mes anterior"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-[#f8fafc] text-slate-600 transition hover:border-[#6d4cad]/30 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="min-w-0 text-center">
              <p className="truncate text-base font-semibold capitalize text-slate-900">
                {monthLabel}
              </p>
              <p className="mt-0.5 text-xs font-normal text-slate-500">
                {currentMonthAvailableDates.length > 0
                  ? `${currentMonthAvailableDates.length} dia(s) disponivel(is)`
                  : "Sem dias disponiveis neste mes"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCurrentMonth((month) => addMonths(month, 1))}
              disabled={!canGoNext}
              aria-label="Proximo mes"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-[#f8fafc] text-slate-600 transition hover:border-[#6d4cad]/30 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center sm:gap-2">
            {WEEKDAYS.map((weekday) => (
              <div
                key={weekday}
                className="py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400"
              >
                {weekday}
              </div>
            ))}

            {calendarDays.map((day) => {
              const dateKey = toDateKey(day);
              const isCurrentMonth = sameMonth(day, currentMonth);
              const isAvailable = availableDateSet.has(dateKey);
              const isSelected = value === dateKey;

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => isAvailable && onChange(dateKey)}
                  disabled={!isAvailable}
                  aria-pressed={isSelected}
                  aria-label={formatDateLabel(dateKey)}
                  className={
                    isSelected
                      ? "flex aspect-square min-h-10 items-center justify-center rounded-2xl bg-[#6d4cad] text-sm font-semibold text-white shadow-[0_12px_24px_rgba(109,76,173,0.24)] ring-2 ring-[#6d4cad]/15 sm:min-h-12 sm:text-base"
                      : isAvailable
                        ? "flex aspect-square min-h-10 items-center justify-center rounded-2xl border border-[#6d4cad]/20 bg-[#f8f5ff] text-sm font-semibold text-[#6d4cad] transition hover:border-[#6d4cad]/40 hover:bg-white sm:min-h-12 sm:text-base"
                        : `flex aspect-square min-h-10 items-center justify-center rounded-2xl border border-transparent text-sm font-medium sm:min-h-12 sm:text-base ${
                            isCurrentMonth
                              ? "bg-[#f8fafc] text-slate-300"
                              : "bg-transparent text-slate-200"
                          }`
                  }
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-xs font-normal text-slate-500">
        {normalizedDates.length > 0
          ? `${normalizedDates.length} data(s) encontrada(s)`
          : "Sem datas liberadas ainda"}
      </p>

      {error ? <span className="text-sm text-rose-400">{error}</span> : null}
    </div>
  );
}
