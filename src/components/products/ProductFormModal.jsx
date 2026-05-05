import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, X } from "lucide-react";
import useModalChrome from "../../hooks/useModalChrome.jsx";
import ModalPortal from "../ui/ModalPortal.jsx";

const schema = z.object({
  name: z.string().min(2, "Informe o nome do produto."),
  description: z.string().min(4, "Descreva o produto."),
  category: z.string().min(2, "Informe a categoria."),
  purchasePrice: z.coerce.number().min(0, "O preco de compra deve ser maior ou igual a zero."),
  salePrice: z.coerce.number().min(0, "O preco deve ser maior ou igual a zero."),
  stockQuantity: z.coerce.number().min(0, "O estoque deve ser maior ou igual a zero."),
  minimumStock: z.coerce.number().min(0, "O estoque minimo deve ser maior ou igual a zero."),
});

const inputClass =
  "w-full min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10";

export default function ProductFormModal({
  open,
  onClose,
  onSubmit,
  submitting,
  initialData = null,
}) {
  useModalChrome(open);

  const isEditing = Boolean(initialData?.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      purchasePrice: 0,
      salePrice: 0,
      stockQuantity: 0,
      minimumStock: 0,
    },
  });

  useEffect(() => {
    if (!open) {
      reset({
        name: "",
        description: "",
        category: "",
        purchasePrice: 0,
        salePrice: 0,
        stockQuantity: 0,
        minimumStock: 0,
      });
      return;
    }

    reset({
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      category: initialData?.category ?? "",
      purchasePrice: Number(initialData?.purchasePrice ?? 0),
      salePrice: Number(initialData?.salePrice ?? 0),
      stockQuantity: Number(initialData?.stockQuantity ?? initialData?.stock ?? 0),
      minimumStock: Number(initialData?.minimumStock ?? 0),
    });
  }, [initialData, open, reset]);

  if (!open) return null;

  return (
    <ModalPortal>
    <div
      data-modal-scroll="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/52 px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-6"
    >
      <div className="flex min-h-full items-start justify-center pt-2 sm:items-center sm:pt-4">
        <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.2)] sm:max-h-[calc(100dvh-3rem)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#6d4cad]">
              {isEditing ? "Editar produto" : "Novo produto"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              {isEditing ? "Atualizar produto" : "Cadastrar produto"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid min-h-0 gap-5 overflow-y-auto overflow-x-hidden px-6 py-6">
          <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Nome
              <input {...register("name")} className={inputClass} />
              {errors.name ? <span className="text-sm text-rose-500">{errors.name.message}</span> : null}
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Categoria
              <input {...register("category")} className={inputClass} />
              {errors.category ? <span className="text-sm text-rose-500">{errors.category.message}</span> : null}
            </label>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Descricao
            <textarea
              rows={4}
              {...register("description")}
              className="rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10"
            />
            {errors.description ? <span className="text-sm text-rose-500">{errors.description.message}</span> : null}
          </label>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="grid min-w-0 gap-2 text-sm font-semibold text-slate-700">
              Compra
              <input type="number" min="0" step="0.01" {...register("purchasePrice")} className={inputClass} />
              {errors.purchasePrice ? <span className="text-sm text-rose-500">{errors.purchasePrice.message}</span> : null}
            </label>

            <label className="grid min-w-0 gap-2 text-sm font-semibold text-slate-700">
              Venda
              <input type="number" min="0" step="0.01" {...register("salePrice")} className={inputClass} />
              {errors.salePrice ? <span className="text-sm text-rose-500">{errors.salePrice.message}</span> : null}
            </label>

            <label className="grid min-w-0 gap-2 text-sm font-semibold text-slate-700">
              Estoque
              <input type="number" min="0" {...register("stockQuantity")} className={inputClass} />
              {errors.stockQuantity ? <span className="text-sm text-rose-500">{errors.stockQuantity.message}</span> : null}
            </label>

            <label className="grid min-w-0 gap-2 text-sm font-semibold text-slate-700">
              Minimo
              <input type="number" min="0" {...register("minimumStock")} className={inputClass} />
              {errors.minimumStock ? <span className="text-sm text-rose-500">{errors.minimumStock.message}</span> : null}
            </label>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#6d4cad] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {submitting ? "Salvando..." : isEditing ? "Salvar alteracoes" : "Cadastrar produto"}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
