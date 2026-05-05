import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle } from "lucide-react";
import SlideOver from "../ui/SlideOver.jsx";
import { formatDisplayDate } from "../../utils/date.js";

const investmentSchema = z.object({
  id: z.preprocess((value) => {
    if (value == null || value === "") return undefined;
    return String(value);
  }, z.string().optional()),
  description: z.string().min(3, "Descrição deve ter ao menos 3 caracteres"),
  value: z.preprocess((val) => {
    if (typeof val === "string") {
      return Number(val.replace(/\./g, "").replace(/,/g, "."));
    }
    return val;
  }, z.number().positive("Valor deve ser maior que zero")),
  date: z.string().min(1, "Data é obrigatória"),
  note: z.string().max(300).optional(),
});

function formatDateInput(value) {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
}

function formatCurrency(value) {
  const number = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(number)) return "R$ 0,00";
  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10";

export default function InvestmentFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
  submitting,
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      id: "",
      description: "",
      value: 0,
      date: formatDateInput(),
      note: "",
    },
  });

  const watchDescription = watch("description");
  const watchValue = watch("value");
  const watchDate = watch("date");
  const watchNote = watch("note");

  useEffect(() => {
    if (open) {
      reset({
        id: initialData?.id ?? initialData?._id ?? "",
        description: initialData?.description ?? "",
        value: Number(initialData?.value ?? initialData?.amount ?? 0),
        date: formatDateInput(initialData?.date),
        note: initialData?.note ?? initialData?.observation ?? "",
      });
    }
  }, [open, initialData, reset]);

  if (!open) return null;

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      eyebrow={initialData ? "Editar investimento" : "Novo investimento"}
      title={initialData ? "Ajuste os detalhes do investimento" : "Registre um novo aporte"}
      size="lg"
    >
      <div className="grid gap-5 p-4 sm:p-6">
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register("id")} />

          <div className="rounded-[24px] border border-slate-200 bg-white">
            <div className="grid gap-5 p-5">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Descrição
                <input type="text" {...register("description")} className={inputClass} />
                {errors.description ? (
                  <span className="text-sm text-rose-500">{errors.description.message}</span>
                ) : null}
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Valor
                  <input
                    type="number"
                    step="0.01"
                    {...register("value", { valueAsNumber: true })}
                    className={inputClass}
                  />
                  {errors.value ? (
                    <span className="text-sm text-rose-500">{errors.value.message}</span>
                  ) : null}
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Data
                  <input type="date" {...register("date")} className={inputClass} />
                  {errors.date ? (
                    <span className="text-sm text-rose-500">{errors.date.message}</span>
                  ) : null}
                </label>
              </div>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                Observações
                <textarea rows="4" {...register("note")} className={inputClass} />
              </label>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6d4cad]">
              Resumo
            </p>
            <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-100 bg-[#f8fafc] px-4 py-4">
                <span className="font-medium text-slate-500">Descrição</span>
                <p className="mt-2 font-semibold text-slate-900">
                  {watchDescription || "Não informada"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-[#f8fafc] px-4 py-4">
                <span className="font-medium text-slate-500">Valor</span>
                <p className="mt-2 font-semibold text-slate-900">
                  {formatCurrency(watchValue)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-[#f8fafc] px-4 py-4">
                <span className="font-medium text-slate-500">Data</span>
                <p className="mt-2 font-semibold text-slate-900">
                  {formatDisplayDate(watchDate, "Não definida")}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-[#f8fafc] px-4 py-4">
                <span className="font-medium text-slate-500">Observações</span>
                <p className="mt-2 break-words font-medium text-slate-900">
                  {watchNote || "Sem observações"}
                </p>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 flex flex-col gap-3 border-t border-slate-200 bg-[#f8fafc] pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#6d4cad]/20 hover:text-[#6d4cad]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#6d4cad] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Salvando..."
                : initialData
                  ? "Atualizar investimento"
                  : "Cadastrar investimento"}
              <PlusCircle className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </SlideOver>
  );
}
