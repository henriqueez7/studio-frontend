import { ChevronDown } from "lucide-react";

export default function CollapsibleSection({
  title,
  eyebrow,
  description,
  open,
  onToggle,
  children,
  aside = null,
  toggleOnHeader = true,
}) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
      <div
        className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition sm:px-6 ${
          toggleOnHeader ? "hover:bg-[#fafbfe]" : ""
        }`}
      >
        <div
          className={`min-w-0 ${toggleOnHeader ? "cursor-pointer" : ""}`}
          onClick={toggleOnHeader ? onToggle : undefined}
        >
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6d4cad]">
              {eyebrow}
            </p>
          ) : null}
          <h3 className="mt-1 text-lg font-semibold text-slate-900">{title}</h3>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {aside}
          <button
            type="button"
            onClick={onToggle}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition ${
              open ? "rotate-180 text-[#6d4cad]" : ""
            }`}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden border-t border-slate-200 bg-[#fbfcfe]">
          {children}
        </div>
      </div>
    </section>
  );
}
