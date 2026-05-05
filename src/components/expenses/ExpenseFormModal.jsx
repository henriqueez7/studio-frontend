import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronDown, PlusCircle } from "lucide-react";
import SlideOver from "../ui/SlideOver.jsx";
import { formatDisplayDate } from "../../utils/date.js";

const expenseSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(3, "Descrição deve ter ao menos 3 caracteres"),
  category: z.string().min(2, "Categoria deve ser informada"),
  value: z.preprocess((val) => {
    if (typeof val === "string") {
      return Number(val.replace(/\./g, "").replace(/,/g, "."));
    }
    return val;
  }, z.number().positive("Valor deve ser maior que zero")),
  date: z.string().min(1, "Data é obrigatória"),
  observation: z.string().max(300).optional(),
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
  if (!Number.isFinite(number)) {
    return "R$ 0,00";
  }
  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10";

const expenseCategories = [
  {
    value: "Custos",
    description:
      "Custos específicos da realização do serviço, como materiais utilizados no atendimento.",
  },
  {
    value: "Administracao geral",
    description:
      "Despesas administrativas do estúdio, como aluguel, sistemas, contador e rotinas internas.",
  },
  {
    value: "Comercial",
    description:
      "Gastos com divulgação, campanhas, parcerias e ações para atrair ou reter clientes.",
  },
  {
    value: "Operacao",
    description:
      "Itens para manter a operação funcionando no dia a dia, como limpeza, reposição e suporte.",
  },
  {
    value: "Equipe",
    description:
      "Despesas ligadas ao time, treinamentos, benefícios, ajuda de custo ou incentivos.",
  },
];

export default function ExpenseFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
  submitting,
  submitError,
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      id: "",
      description: "",
      category: "",
      value: 0,
      date: formatDateInput(),
      observation: "",
    },
  });

  const [categoryOptionsOpen, setCategoryOptionsOpen] = useState(false);

  const watchDescription = watch("description");
  const watchCategory = watch("category");
  const watchValue = watch("value");
  const watchDate = watch("date");
  const watchObservation = watch("observation");

  useEffect(() => {
    if (open) {
      setCategoryOptionsOpen(false);
      reset({
        id: initialData?.id ?? initialData?._id ?? "",
        description: initialData?.description ?? "",
        category: initialData?.category ?? "",
        value: Number(initialData?.value ?? initialData?.amount ?? 0),
        date: formatDateInput(initialData?.date ?? initialData?.expenseDate),
        observation: initialData?.observation ?? initialData?.notes ?? "",
      });
    }
  }, [open, initialData, reset]);

  if (!open) return null;

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      eyebrow={initialData ? "Editar despesa" : "Nova despesa"}
      title={
        initialData
          ? "Atualize os detalhes da despesa"
          : "Registre uma nova despesa"
      }
      size="lg"
    >
      <div className="grid gap-5 p-4 sm:p-6">
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-[24px] border border-slate-200 bg-white">
            <div className="grid gap-5 p-5">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Descrição
                <input
                  type="text"
                  {...register("description")}
                  className={inputClass}
                />
                {errors.description ? (
                  <span className="text-sm text-rose-500">
                    {errors.description.message}
                  </span>
                ) : null}
              </label>

              <div className="space-y-3 text-sm text-slate-700">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">Categoria</span>
                  <span className="text-xs text-slate-500">
                    Clique para expandir
                  </span>
                </div>

                <input type="hidden" {...register("category")} />
                <button
                  type="button"
                  onClick={() => setCategoryOptionsOpen((current) => !current)}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-left text-slate-900 transition hover:border-[#6d4cad]/20"
                >
                  <div>
                    <p className="font-semibold">
                      {watchCategory || "Selecionar categoria"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {watchCategory
                        ? expenseCategories.find(
                            (categoryOption) => categoryOption.value === watchCategory,
                          )?.description
                        : "Veja opções como custos, administração geral e comercial."}
                    </p>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-500 transition ${
                      categoryOptionsOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {categoryOptionsOpen ? (
                  <div className="grid gap-3">
                    {expenseCategories.map((categoryOption) => {
                      const isSelected = watchCategory === categoryOption.value;

                      return (
                        <button
                          key={categoryOption.value}
                          type="button"
                          onClick={() => {
                            setValue("category", categoryOption.value, {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            });
                            setCategoryOptionsOpen(false);
                          }}
                          className={`rounded-2xl border px-4 py-4 text-left transition ${
                            isSelected
                              ? "border-[#6d4cad]/25 bg-[#f4effd]"
                              : "border-slate-200 bg-white hover:border-[#6d4cad]/20 hover:bg-[#faf8fe]"
                          }`}
                        >
                          <p className="text-sm font-semibold text-slate-900">
                            {categoryOption.value}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {categoryOption.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                {errors.category ? (
                  <span className="text-sm text-rose-500">
                    {errors.category.message}
                  </span>
                ) : null}
              </div>

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
                    <span className="text-sm text-rose-500">
                      {errors.value.message}
                    </span>
                  ) : null}
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Data
                  <input type="date" {...register("date")} className={inputClass} />
                  {errors.date ? (
                    <span className="text-sm text-rose-500">
                      {errors.date.message}
                    </span>
                  ) : null}
                </label>
              </div>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                Observações
                <textarea
                  rows="4"
                  {...register("observation")}
                  className={inputClass}
                />
              </label>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[24px] border border-slate-200 bg-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6d4cad]">
                Resumo
              </p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <span className="font-medium text-slate-500">Descrição</span>
                  <span className="text-right font-semibold text-slate-900">
                    {watchDescription || "Não informada"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <span className="font-medium text-slate-500">Categoria</span>
                  <span className="text-right">{watchCategory || "Pendente"}</span>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <span className="font-medium text-slate-500">Valor</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(watchValue)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <span className="font-medium text-slate-500">Data</span>
                  <span>{formatDisplayDate(watchDate, "Não definida")}</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="font-medium text-slate-500">Observações</span>
                  <span className="max-w-[70%] text-right">
                    {watchObservation || "Sem observações"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {submitError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {submitError}
            </div>
          ) : null}

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
                  ? "Atualizar despesa"
                  : "Cadastrar despesa"}
              <PlusCircle className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </SlideOver>
  );
}
