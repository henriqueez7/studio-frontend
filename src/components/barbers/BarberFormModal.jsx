import { useEffect, useState } from "react";
import { z } from "zod";
import { Save, X } from "lucide-react";
import useModalChrome from "../../hooks/useModalChrome.jsx";
import ModalPortal from "../ui/ModalPortal.jsx";
import {
  isValidPhoneNumber,
  normalizeEmail,
  normalizePhone,
} from "../../utils/contactValidation.js";

const inputClass =
  "w-full min-w-0 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10";

function createSchema(isEditing) {
  return z
    .object({
      name: z.string().trim().min(3, "Informe o nome do profissional."),
      email: z.string().trim().email("Informe um e-mail valido."),
      password: z.string().trim().optional(),
      phone: z
        .string()
        .trim()
        .max(20, "Telefone muito longo.")
        .optional()
        .refine(
          (value) => !value || isValidPhoneNumber(value),
          "Informe um telefone valido com DDD.",
        ),
      commissionPercentage: z.coerce
        .number()
        .min(0, "A comissão deve ser maior ou igual a zero.")
        .max(100, "A comissão deve ser menor ou igual a 100."),
    })
    .superRefine((data, context) => {
      if (!isEditing && (!data.password || data.password.length < 6)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "A senha precisa ter pelo menos 6 caracteres.",
        });
      }

      if (isEditing && data.password && data.password.length < 6) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "A senha precisa ter pelo menos 6 caracteres.",
        });
      }
    });
}

export default function BarberFormModal({
  open,
  onClose,
  onSubmit,
  submitting,
  initialData = null,
  error = null,
  success = null,
}) {
  useModalChrome(open);

  const isEditing = Boolean(initialData?.id);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    commissionPercentage: 40,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) {
      setForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        commissionPercentage: 40,
      });
      setErrors({});
      return;
    }

    setForm({
      name: initialData?.name ?? "",
      email: normalizeEmail(initialData?.email ?? ""),
      password: "",
      phone: normalizePhone(initialData?.phone ?? ""),
      commissionPercentage: Number(initialData?.commissionPercentage ?? 40),
    });
    setErrors({});
  }, [initialData, open]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const result = createSchema(isEditing).safeParse(form);
    if (!result.success) {
      const fieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    await onSubmit(result.data);
  };

  if (!open) return null;

  return (
    <ModalPortal>
    <div
      data-modal-scroll="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/52 px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-6"
    >
      <div className="flex min-h-full items-start justify-center sm:items-center">
      <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#f8fafc] shadow-[0_28px_80px_rgba(15,23,42,0.18)] sm:max-h-[calc(100dvh-3rem)]">
        <div className="border-b border-slate-200 bg-white px-5 py-5 sm:px-8 sm:py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#6d4cad]">
                {isEditing ? "Editar profissional" : "Novo barbeiro"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">
                {isEditing ? "Atualizar profissional" : "Cadastrar barbeiro no sistema"}
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

        <form onSubmit={handleFormSubmit} className="grid min-h-0 gap-6 overflow-y-auto overflow-x-hidden px-5 py-5 sm:px-8 sm:py-8">
          {error ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {success}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Nome
              <input
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className={inputClass}
              />
              {errors.name ? <span className="text-sm text-rose-500">{errors.name}</span> : null}
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              E-mail
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => updateField("email", normalizeEmail(event.target.value))}
                className={inputClass}
              />
              {errors.email ? <span className="text-sm text-rose-500">{errors.email}</span> : null}
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              {isEditing ? "Nova senha (opcional)" : "Senha inicial"}
              <input
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                className={inputClass}
              />
              {errors.password ? <span className="text-sm text-rose-500">{errors.password}</span> : null}
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Telefone
              <input
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(event) => updateField("phone", normalizePhone(event.target.value))}
                className={inputClass}
              />
              {errors.phone ? <span className="text-sm text-rose-500">{errors.phone}</span> : null}
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Comissão (%)
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.commissionPercentage}
                onChange={(event) => updateField("commissionPercentage", event.target.value)}
                className={inputClass}
              />
              {errors.commissionPercentage ? (
                <span className="text-sm text-rose-500">{errors.commissionPercentage}</span>
              ) : null}
            </label>
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
              {submitting ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar barbeiro"}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
    </ModalPortal>
  );
}
