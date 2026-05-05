import { X } from "lucide-react";
import useModalChrome from "../../hooks/useModalChrome.jsx";
import ModalPortal from "./ModalPortal.jsx";

export default function SlideOver({
  open,
  onClose,
  title,
  eyebrow,
  children,
  size = "lg",
}) {
  useModalChrome(open);

  if (!open) return null;

  const widthClass =
    size === "xl"
      ? "max-w-4xl"
      : size === "md"
        ? "max-w-2xl"
        : "max-w-3xl";

  return (
    <ModalPortal>
    <div
      data-modal-scroll="true"
      className="fixed inset-0 z-50 overflow-y-auto px-3 py-3 sm:px-6 sm:py-6"
    >
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative flex min-h-full w-full items-start justify-center sm:items-center">
        <div
          className={`flex max-h-[calc(100dvh-1.5rem)] w-full ${widthClass} flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.28)] sm:max-h-[calc(100dvh-3rem)]`}
        >
          <div className="border-b border-slate-200 px-5 py-5 sm:px-7">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                {eyebrow ? (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6d4cad]">
                    {eyebrow}
                  </p>
                ) : null}
                {title ? (
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                    {title}
                  </h2>
                ) : null}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:text-rose-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-[#f8fafc]">
            {children}
          </div>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
