import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarDays, Check, Clock3, Save, X } from "lucide-react";
import useModalChrome from "../../hooks/useModalChrome.jsx";
import ModalPortal from "../ui/ModalPortal.jsx";
import StatusBanner from "../ui/StatusBanner.jsx";

const dayOptions = [
  { value: "MONDAY", label: "Segunda", fullLabel: "Segunda-feira" },
  { value: "TUESDAY", label: "Terça", fullLabel: "Terça-feira" },
  { value: "WEDNESDAY", label: "Quarta", fullLabel: "Quarta-feira" },
  { value: "THURSDAY", label: "Quinta", fullLabel: "Quinta-feira" },
  { value: "FRIDAY", label: "Sexta", fullLabel: "Sexta-feira" },
  { value: "SATURDAY", label: "Sábado", fullLabel: "Sábado" },
  { value: "SUNDAY", label: "Domingo", fullLabel: "Domingo" },
];

const businessDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

const schema = z
  .object({
    id: z.number().optional(),
    barberId: z.number().positive("Barbeiro inválido."),
    dayOfWeek: z.string().optional(),
    daysOfWeek: z.array(z.string()).default([]),
    startTime: z.string().min(1, "Informe o horário inicial."),
    endTime: z.string().min(1, "Informe o horário final."),
    slotIntervalInMinutes: z.coerce
      .number()
      .min(5, "O intervalo mínimo é de 5 minutos."),
    active: z.boolean(),
  })
  .superRefine((data, context) => {
    if (data.id) {
      if (!data.dayOfWeek?.trim()) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["dayOfWeek"],
          message: "Selecione o dia da semana.",
        });
      }

      return;
    }

    if (!Array.isArray(data.daysOfWeek) || data.daysOfWeek.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["daysOfWeek"],
        message: "Selecione pelo menos um dia da semana.",
      });
    }
  });

function ensureSeconds(value) {
  if (!value) return value;
  return /^\d{2}:\d{2}$/.test(value) ? `${value}:00` : value;
}

function toTimeInput(value) {
  if (!value) return "";
  return /^\d{2}:\d{2}:\d{2}$/.test(value) ? value.slice(0, 5) : value;
}

function formatSelectedDays(days) {
  if (!days.length) return "Nenhum dia selecionado";
  if (days.length === 7) return "Todos os dias da semana";
  if (days.length === 5 && businessDays.every((day) => days.includes(day))) {
    return "Dias úteis";
  }

  return dayOptions
    .filter((option) => days.includes(option.value))
    .map((option) => option.fullLabel)
    .join(", ");
}

const inputClass =
  "w-full min-w-0 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10";

export default function AvailabilityFormModal({
  open,
  onClose,
  onSubmit,
  barberId,
  initialData,
  submitting,
  submitError,
}) {
  useModalChrome(open);

  const isEditing = Boolean(initialData?.id);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      barberId: barberId || 0,
      dayOfWeek: "MONDAY",
      daysOfWeek: [],
      startTime: "09:00",
      endTime: "18:00",
      slotIntervalInMinutes: 30,
      active: true,
    },
  });

  useEffect(() => {
    if (!open) return;

    reset({
      id: initialData?.id,
      barberId: Number(barberId || initialData?.barberId || 0),
      dayOfWeek: initialData?.dayOfWeek || "MONDAY",
      daysOfWeek: initialData?.dayOfWeek ? [initialData.dayOfWeek] : [],
      startTime: toTimeInput(initialData?.startTime) || "09:00",
      endTime: toTimeInput(initialData?.endTime) || "18:00",
      slotIntervalInMinutes: initialData?.slotIntervalInMinutes || 30,
      active: initialData?.active ?? true,
    });
  }, [open, initialData, barberId, reset]);

  const selectedDays = watch("daysOfWeek") || [];
  const startTime = watch("startTime");
  const endTime = watch("endTime");
  const interval = watch("slotIntervalInMinutes");

  function toggleDay(dayValue) {
    const nextDays = selectedDays.includes(dayValue)
      ? selectedDays.filter((value) => value !== dayValue)
      : [...selectedDays, dayValue];

    setValue("daysOfWeek", nextDays, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  if (!open) return null;

  return (
    <ModalPortal>
    <div
      data-modal-scroll="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/52 px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-6"
    >
      <div className="flex min-h-full items-start justify-center sm:items-center">
      <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#f8fafc] shadow-[0_28px_80px_rgba(15,23,42,0.18)] sm:max-h-[calc(100dvh-3rem)]">
        <div className="border-b border-slate-200 bg-white px-5 py-5 sm:px-8 sm:py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#6d4cad]">
                Disponibilidade do barbeiro
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">
                {isEditing ? "Editar disponibilidade" : "Nova disponibilidade"}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {isEditing
                  ? "Atualize um bloco de atendimento já existente."
                  : "Selecione os dias e defina uma mesma faixa de horário para ganhar tempo no cadastro."}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-[#f8fafc] text-slate-500 transition hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit((data) =>
            onSubmit({
              ...data,
              dayOfWeek: isEditing ? data.dayOfWeek : undefined,
              daysOfWeek: isEditing ? [] : data.daysOfWeek,
              startTime: ensureSeconds(data.startTime),
              endTime: ensureSeconds(data.endTime),
            }))}
          className="grid min-h-0 gap-6 overflow-y-auto overflow-x-hidden px-5 py-5 sm:px-8 sm:py-8"
        >
          {submitError ? (
            <StatusBanner
              type="error"
              title="Não foi possível salvar"
              message={submitError}
            />
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="rounded-[28px] border border-slate-200 bg-[#eef2f7] p-5">
              {isEditing ? (
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Dia da semana
                  <select
                    {...register("dayOfWeek")}
                    className={`${inputClass} [&>option]:bg-white [&>option]:text-slate-900`}
                  >
                    {dayOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.fullLabel}
                      </option>
                    ))}
                  </select>
                  {errors.dayOfWeek ? (
                    <span className="text-sm text-rose-500">{errors.dayOfWeek.message}</span>
                  ) : null}
                </label>
              ) : (
                <div className="grid gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Dias da semana</p>
                    <p className="mt-1 text-sm text-slate-500">
                      A mesma configuração será aplicada a todos os dias selecionados.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {dayOptions.map((option) => {
                      const checked = selectedDays.includes(option.value);

                      return (
                        <label
                          key={option.value}
                          className={`inline-flex items-center justify-between gap-3 rounded-[22px] border px-4 py-3 text-sm font-semibold transition ${
                            checked
                              ? "border-[#6d4cad]/25 bg-white text-[#6d4cad]"
                              : "border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`inline-flex h-5 w-5 items-center justify-center rounded border transition ${
                                checked
                                  ? "border-[#6d4cad] bg-[#6d4cad] text-white"
                                  : "border-slate-300 bg-white text-transparent"
                              }`}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </span>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleDay(option.value)}
                              className="sr-only"
                            />
                            <span>{option.fullLabel}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <div className="rounded-[24px] border border-slate-200 bg-white p-4 text-sm text-slate-600">
                    <div className="flex items-start gap-3">
                      <CalendarDays className="mt-0.5 h-4 w-4 text-[#6d4cad]" />
                      <div>
                        <p className="font-semibold text-slate-900">
                          {selectedDays.length} dia(s) selecionado(s)
                        </p>
                        <p className="mt-1 leading-6 text-slate-500">
                          {formatSelectedDays(selectedDays)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {errors.daysOfWeek ? (
                    <span className="text-sm text-rose-500">{errors.daysOfWeek.message}</span>
                  ) : null}
                </div>
              )}
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-[#eef2f7] p-5">
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Intervalo entre atendimentos
                <div className="relative">
                  <input
                    type="number"
                    min="5"
                    step="5"
                    {...register("slotIntervalInMinutes")}
                    className={`${inputClass} pr-16`}
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                    min
                  </span>
                </div>
                {errors.slotIntervalInMinutes ? (
                  <span className="text-sm text-rose-500">
                    {errors.slotIntervalInMinutes.message}
                  </span>
                ) : null}
              </label>

              <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-4 text-sm text-slate-600">
                <p className="text-xs uppercase tracking-[0.22em] text-[#6d4cad]">
                  Resumo
                </p>
                <p className="mt-3 font-semibold text-slate-900">
                  {startTime || "--:--"} - {endTime || "--:--"}
                </p>
                <p className="mt-2 leading-6 text-slate-500">
                  Intervalo de {interval || 0} minutos entre os horários gerados.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Horário inicial
              <input type="time" {...register("startTime")} className={inputClass} />
              {errors.startTime ? (
                <span className="text-sm text-rose-500">{errors.startTime.message}</span>
              ) : null}
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Horário final
              <input type="time" {...register("endTime")} className={inputClass} />
              {errors.endTime ? (
                <span className="text-sm text-rose-500">{errors.endTime.message}</span>
              ) : null}
            </label>
          </div>

          <label className="inline-flex items-center gap-3 rounded-[24px] border border-slate-200 bg-[#eef2f7] px-4 py-4 text-sm font-semibold text-slate-700">
            <input type="checkbox" {...register("active")} className="h-4 w-4" />
            Disponibilidade ativa
          </label>

          <div className="rounded-[28px] border border-slate-200 bg-[#eef2f7] p-5 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <Clock3 className="mt-1 h-4 w-4 text-[#6d4cad]" />
              <p>
                {isEditing
                  ? "Atualize o dia e o horário deste bloco para manter a agenda alinhada com a operação."
                  : "Os dias que já possuírem disponibilidade cadastrada serão ignorados, e apenas os novos serão criados."}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#6d4cad]/20 hover:text-[#6d4cad]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6d4cad] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {submitting
                ? "Salvando..."
                : isEditing
                  ? "Atualizar disponibilidade"
                  : "Criar disponibilidade"}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
    </ModalPortal>
  );
}
