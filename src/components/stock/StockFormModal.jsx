import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertTriangle,
  PlusCircle,
  X,
} from "lucide-react";
import useModalChrome from "../../hooks/useModalChrome.jsx";
import ModalPortal from "../ui/ModalPortal.jsx";

const stockSchema = z.object({
  productId: z.string().min(1, "Selecione um produto"),
  type: z.enum(["ENTRY", "EXIT", "ADJUSTMENT"], {
    errorMap: () => ({ message: "Selecione o tipo de movimentacao" }),
  }),
  quantity: z.number().min(1, "Quantidade deve ser maior que zero"),
  reason: z.string().min(3, "Descreva o motivo da movimentacao"),
});

const motionLabel = {
  ENTRY: "Entrada",
  EXIT: "Saida",
  ADJUSTMENT: "Ajuste",
};

const inputClass =
  "w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10";

export default function StockFormModal({
  open,
  onClose,
  onSubmit,
  products,
  submitting,
}) {
  useModalChrome(open);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(stockSchema),
    defaultValues: {
      productId: "",
      type: "ENTRY",
      quantity: 1,
      reason: "",
    },
  });

  const selectedProductId = watch("productId");
  const selectedType = watch("type");
  const quantity = watch("quantity") || 0;
  const reason = watch("reason");

  const selectedProduct = products.find(
    (product) =>
      String(product.id ?? product._id ?? product.name) ===
      String(selectedProductId),
  );

  const currentStock = Number(
    selectedProduct?.stockQuantity ??
      selectedProduct?.stock ??
      selectedProduct?.quantity ??
      0,
  );
  const minimumStock = Number(
    selectedProduct?.minimumStock ?? selectedProduct?.minStock ?? 0,
  );

  const projectedStock =
    selectedType === "ENTRY"
      ? currentStock + quantity
      : selectedType === "EXIT"
        ? currentStock - quantity
        : currentStock;

  const stockWarning =
    selectedProductId && minimumStock > 0 && projectedStock <= minimumStock;
  const hasLowStock =
    selectedProductId && minimumStock > 0 && currentStock <= minimumStock;

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const submit = (data) => {
    onSubmit(data);
  };

  if (!open) return null;

  return (
    <ModalPortal>
    <div
      data-modal-scroll="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/52 px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-6"
    >
      <div className="flex min-h-full items-start justify-center sm:items-center">
      <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#f8fafc] shadow-[0_28px_80px_rgba(15,23,42,0.18)] sm:max-h-[calc(100dvh-3rem)]">
        <div className="border-b border-slate-200 bg-white px-5 py-5 sm:px-8 sm:py-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#6d4cad]">
                Nova movimentacao de estoque
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">
                Movimentacao de estoque
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

        <div className="grid min-h-0 gap-6 overflow-y-auto overflow-x-hidden px-5 py-5 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
          <form className="space-y-6" onSubmit={handleSubmit(submit)}>
            <div className="rounded-[28px] border border-slate-200 bg-[#eef2f7] p-6">
              <p className="text-sm uppercase tracking-[0.32em] text-[#6d4cad]">
                Dados da movimentacao
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-700">
                  Produto
                  <select {...register("productId")} className={inputClass}>
                    <option value="">Selecione um produto</option>
                    {products.map((product) => (
                      <option
                        key={product.id ?? product._id ?? product.name}
                        value={product.id ?? product._id ?? product.name}
                      >
                        {product.name || product.title || product.productName}
                      </option>
                    ))}
                  </select>
                  {errors.productId && (
                    <span className="text-sm text-rose-500">
                      {errors.productId.message}
                    </span>
                  )}
                </label>

                <label className="space-y-2 text-sm text-slate-700">
                  Tipo de movimentacao
                  <select {...register("type")} className={inputClass}>
                    <option value="ENTRY">Entrada</option>
                    <option value="EXIT">Saida</option>
                    <option value="ADJUSTMENT">Ajuste</option>
                  </select>
                  {errors.type && (
                    <span className="text-sm text-rose-500">
                      {errors.type.message}
                    </span>
                  )}
                </label>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-700">
                  Quantidade
                  <input
                    type="number"
                    {...register("quantity", { valueAsNumber: true })}
                    min="1"
                    className={inputClass}
                  />
                  {errors.quantity && (
                    <span className="text-sm text-rose-500">
                      {errors.quantity.message}
                    </span>
                  )}
                </label>

                <label className="space-y-2 text-sm text-slate-700">
                  Motivo
                  <input type="text" {...register("reason")} className={inputClass} />
                  {errors.reason && (
                    <span className="text-sm text-rose-500">
                      {errors.reason.message}
                    </span>
                  )}
                </label>
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
                {submitting
                  ? "Salvando movimentacao..."
                  : "Confirmar movimentacao"}
                <PlusCircle className="h-4 w-4" />
              </button>
            </div>
          </form>

          <aside className="space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-[#eef2f7] p-6">
              <p className="text-sm uppercase tracking-[0.32em] text-[#6d4cad]">
                Preview do estoque
              </p>
              {selectedProduct ? (
                <div className="mt-6 space-y-5">
                  <div className="rounded-[28px] bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {selectedProduct.name ||
                            selectedProduct.title ||
                            selectedProduct.productName}
                        </h3>
                        <p className="mt-1 text-sm text-[#6d4cad]">
                          {selectedProduct.category ??
                            "Categoria nao informada"}
                        </p>
                      </div>
                      <span className="inline-flex rounded-full border border-slate-200 bg-[#f8fafc] px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                        Atual
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[28px] border border-slate-200 bg-[#f8fafc] p-4">
                        <p className="text-xs uppercase tracking-[0.32em] text-[#6d4cad]">
                          Quantidade disponivel
                        </p>
                        <p className="mt-3 text-3xl font-semibold text-slate-900">
                          {currentStock}
                        </p>
                      </div>
                      <div className="rounded-[28px] border border-slate-200 bg-[#f8fafc] p-4">
                        <p className="text-xs uppercase tracking-[0.32em] text-[#6d4cad]">
                          Estoque minimo
                        </p>
                        <p
                          className={`mt-3 text-3xl font-semibold ${hasLowStock ? "text-rose-700" : "text-slate-900"}`}
                        >
                          {minimumStock}
                        </p>
                      </div>
                    </div>

                    {hasLowStock && (
                      <div className="mt-5 rounded-[28px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          <span>
                            Este produto ja esta abaixo do estoque minimo.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm uppercase tracking-[0.32em] text-[#6d4cad]">
                      Resumo da movimentacao
                    </p>
                    <div className="mt-5 space-y-4">
                      <div className="grid gap-3 rounded-3xl bg-[#f8fafc] p-4 text-sm text-slate-600 sm:grid-cols-2">
                        <span className="font-semibold text-slate-900">
                          Tipo
                        </span>
                        <span>{motionLabel[selectedType]}</span>
                      </div>
                      <div className="grid gap-3 rounded-3xl bg-[#f8fafc] p-4 text-sm text-slate-600 sm:grid-cols-2">
                        <span className="font-semibold text-slate-900">
                          Quantidade
                        </span>
                        <span>{quantity}</span>
                      </div>
                      <div className="grid gap-3 rounded-3xl bg-[#f8fafc] p-4 text-sm text-slate-600 sm:grid-cols-2">
                        <span className="font-semibold text-slate-900">
                          Motivo
                        </span>
                        <span>{reason || "Nenhum motivo informado"}</span>
                      </div>
                      <div className="grid gap-3 rounded-3xl bg-[#f8fafc] p-4 text-sm text-slate-600 sm:grid-cols-2">
                        <span className="font-semibold text-slate-900">
                          Estoque previsto
                        </span>
                        <span
                          className={
                            stockWarning ? "text-rose-700" : "text-slate-900"
                          }
                        >
                          {projectedStock}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                null
              )}
            </div>
          </aside>
        </div>
      </div>
      </div>
    </div>
    </ModalPortal>
  );
}
