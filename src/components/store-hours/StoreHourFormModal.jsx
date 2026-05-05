import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, X } from "lucide-react";
import useModalChrome from "../../hooks/useModalChrome.jsx";
import ModalPortal from "../ui/ModalPortal.jsx";
import StatusBanner from "../ui/StatusBanner.jsx";

const dayOptions = [
  { value: "MONDAY", label: "Segunda-feira" },
  { value: "TUESDAY", label: "Terça-feira" },
  { value: "WEDNESDAY", label: "Quarta-feira" },
  { value: "THURSDAY", label: "Quinta-feira" },
  { value: "FRIDAY", label: "Sexta-feira" },
  { value: "SATURDAY", label: "Sábado" },
  { value: "SUNDAY", label: "Domingo" },
];

const schema = z.object({
  id: z.number(),
  dayOfWeek: z.string().min(1, "Selecione o dia."),
  startTime: z.string().min(1, "Informe o horário inicial."),
  endTime: z.string().min(1, "Informe o horário final."),
  active: z.boolean(),
});

function ensureSeconds(value) {
  if (!value) return value;
  return /^\d{2}:\d{2}$/.test(value) ? `${value}:00` : value;
}

function toTimeInput(value) {
  if (!value) return "";
  return /^\d{2}:\d{2}:\d{2}$/.test(value) ? value.slice(0, 5) : value;
}

const inputClass =
  "w-full min-w-0 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10";

export default function StoreHourFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
  submitting,
  submitError,
}) {
  useModalChrome(open);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      id: 0,
      dayOfWeek: "MONDAY",
      startTime: "09:00",
      endTime: "20:00",
      active: true,
    },
  });

  const activeValue = watch("active");
  const currentDayLabel = useMemo(
    () => dayOptions.find((option) => option.value === initialData?.dayOfWeek)?.label || "--",
    [initialData],
  );

  useEffect(() => {
    if (!open || !initialData) return;

    reset({
      id: Number(initialData.id),
      dayOfWeek: initialData.dayOfWeek,
      startTime: toTimeInput(initialData.startTime) || "09:00",
      endTime: toTimeInput(initialData.endTime) || "20:00",
      active: initialData.active ?? true,
    });
  }, [open, initialData, reset]);

  if (!open || !initialData) return null;

  return (
    <ModalPortal>
    <div
      data-modal-scroll="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/52 px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-6"
    >
      <div className="flex min-h-full items-start justify-center sm:items-center">
      <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#f8fafc] shadow-[0_28px_80px_rgba(15,23,42,0.18)] sm:max-h-[calc(100dvh-3rem)]">
        <div className="border-b border-slate-200 bg-white px-5 py-5 sm:px-8 sm:py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#6d4cad]">
                Expediente da loja
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">
                Editar horário da loja
              </h2>
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
            onSubmit(data.id, {
              dayOfWeek: data.dayOfWeek,
              startTime: ensureSeconds(data.startTime),
              endTime: ensureSeconds(data.endTime),
              active: data.active,
            }),
          )}
          className="grid min-h-0 gap-5 overflow-y-auto overflow-x-hidden px-5 py-5 sm:px-8 sm:py-8"
        >
          {submitError ? (
            <StatusBanner type="error" title="Não foi possível salvar" message={submitError} />
          ) : null}

          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Dia da semana
              <input
                type="text"
                value={currentDayLabel}
                readOnly
                className={`${inputClass} cursor-not-allowed bg-slate-50 text-slate-500`}
              />
              <input type="hidden" {...register("dayOfWeek")} />
              {errors.dayOfWeek ? (
                <span className="text-sm text-rose-500">{errors.dayOfWeek.message}</span>
              ) : null}
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Horário inicial
              <input type="time" {...register("startTime")} className={inputClass} />
              {errors.startTime ? <span className="text-sm text-rose-500">{errors.startTime.message}</span> : null}
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Horário final
              <input type="time" {...register("endTime")} className={inputClass} />
              {errors.endTime ? <span className="text-sm text-rose-500">{errors.endTime.message}</span> : null}
            </label>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Status do dia
            <select
              value={activeValue ? "true" : "false"}
              onChange={(event) => setValue("active", event.target.value === "true")}
              className={inputClass}
            >
              <option value="true">Aberto</option>
              <option value="false">Fechado</option>
            </select>
          </label>

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
              {submitting ? "Salvando..." : "Salvar expediente"}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
    </ModalPortal>
  );
}
