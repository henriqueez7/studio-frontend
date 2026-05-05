import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, X } from "lucide-react";
import useModalChrome from "../../hooks/useModalChrome.jsx";
import ModalPortal from "../ui/ModalPortal.jsx";
import { isValidPhoneNumber, normalizeEmail, normalizePhone } from "../../utils/contactValidation.js";

const schema = z.object({
  name: z.string().min(2, "Informe o nome do cliente."),
  email: z
    .string()
    .optional()
    .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "Informe um e-mail valido."),
  phone: z
    .string()
    .max(20, "Telefone muito longo.")
    .optional()
    .refine((value) => !value || isValidPhoneNumber(value), "Informe um telefone valido com DDD."),
});

const inputClass =
  "w-full min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10";

export default function ClientFormModal({
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
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (!open) {
      reset({
        name: "",
        email: "",
        phone: "",
      });
      return;
    }

    reset({
      name: initialData?.name ?? initialData?.fullName ?? "",
      email: initialData?.email ?? "",
      phone: normalizePhone(initialData?.phone ?? ""),
    });
  }, [initialData, open, reset]);

  if (!open) return null;

  return (
    <ModalPortal>
    <div
      data-modal-scroll="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/52 px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-6"
    >
      <div className="flex min-h-full items-start justify-center sm:items-center">
      <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.2)] sm:max-h-[calc(100dvh-3rem)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#6d4cad]">
              {isEditing ? "Editar cliente" : "Novo cliente"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              {isEditing ? "Atualizar cliente" : "Cadastrar cliente"}
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
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Nome
              <input {...register("name")} className={inputClass} />
              {errors.name ? <span className="text-sm text-rose-500">{errors.name.message}</span> : null}
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Telefone
              <input
                {...register("phone", {
                  onChange: (event) => {
                    event.target.value = normalizePhone(event.target.value);
                  },
                })}
                className={inputClass}
              />
              {errors.phone ? <span className="text-sm text-rose-500">{errors.phone.message}</span> : null}
            </label>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            E-mail
            <input
              type="email"
              {...register("email", {
                onChange: (event) => {
                  event.target.value = normalizeEmail(event.target.value);
                },
              })}
              className={inputClass}
            />
            {errors.email ? <span className="text-sm text-rose-500">{errors.email.message}</span> : null}
          </label>

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
              {submitting ? "Salvando..." : "Salvar alteracoes"}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
    </ModalPortal>
  );
}
