import { AlertCircle, RefreshCcw } from "lucide-react";

export default function ErrorState({
  title = "Não foi possível carregar este conteúdo.",
  message = "Tente novamente em alguns instantes.",
  actionLabel = "Tentar novamente",
  onAction,
  compact = false,
  className = "",
}) {
  const paddingClass = compact ? "p-5" : "p-8";

  return (
    <div
      className={`rounded-[28px] border border-rose-500/20 bg-rose-500/10 text-rose-100 shadow-[0_16px_40px_rgba(0,0,0,0.18)] ${paddingClass} ${className}`.trim()}
      role="alert"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300 shadow-sm">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className={`font-semibold ${compact ? "text-base" : "text-lg"}`}>{title}</p>
          <p className="mt-2 text-sm leading-6 text-rose-100/90">{message}</p>
          {onAction ? (
            <button
              type="button"
              onClick={onAction}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-rose-300/20 bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20"
            >
              <RefreshCcw className="h-4 w-4" />
              {actionLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
