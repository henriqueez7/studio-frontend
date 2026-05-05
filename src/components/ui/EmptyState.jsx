import { Inbox, Sparkles } from "lucide-react";

export default function EmptyState({
  eyebrow = "Sem conteúdo",
  title = "Nada encontrado por aqui",
  description = "Quando houver dados disponíveis, eles aparecerão nesta área.",
  actionLabel,
  onAction,
  icon,
  compact = false,
  className = "",
}) {
  const ResolvedIcon = icon || Inbox;

  return (
    <div
      className={`border border-dashed border-slate-200 bg-[#fbfcfe] ${compact ? "px-5 py-6" : "px-6 py-10"} text-center ${className}`.trim()}
    >
      <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[#6d4cad]">
        <ResolvedIcon className="h-6 w-6" />
      </div>
      <p className="mt-4 text-[11px] uppercase tracking-[0.26em] text-[#6d4cad] sm:text-sm sm:tracking-[0.32em]">
        {eyebrow}
      </p>
      <h2
        className={`mt-4 font-semibold text-slate-900 ${
          compact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"
        }`}
      >
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:leading-7">
        {description}
      </p>
      {onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <Sparkles className="h-4 w-4" />
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
