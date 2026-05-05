import { Check, Scissors, Timer, X } from "lucide-react";
import {
  formatCurrency,
  formatDuration,
  normalizeServiceItem,
} from "../../utils/appointments.js";

export default function ServiceMultiSelect({
  services,
  selectedIds,
  onToggle,
  error,
  disabled = false,
}) {
  return (
    <div className="grid gap-3">
      {services.map((item) => {
        const service = normalizeServiceItem(item);
        const selected = selectedIds.includes(String(service.id));

        return (
          <button
            key={service.id}
            type="button"
            onClick={() => onToggle(String(service.id))}
            disabled={disabled}
            className={`rounded-[22px] border p-3.5 text-left transition sm:rounded-[24px] sm:p-4 ${
              selected
                ? "border-[#6d4cad]/25 bg-[#6d4cad] text-white shadow-[0_16px_28px_rgba(109,76,173,0.18)]"
                : "border-slate-200 bg-[#eef2f7] text-slate-900 hover:border-[#6d4cad]/18 hover:bg-white"
            } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-base font-semibold sm:text-lg">{service.name}</p>
                <div className="mt-2.5 flex flex-wrap gap-2 text-sm sm:mt-3">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-2 ${
                      selected ? "bg-white/12 text-white" : "bg-white text-slate-600"
                    }`}
                  >
                    <Timer className="h-4 w-4" />
                    {formatDuration(service.duration)}
                  </span>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-2 ${
                      selected ? "bg-white/12 text-white" : "bg-white text-slate-600"
                    }`}
                  >
                    <Scissors className="h-4 w-4" />
                    {formatCurrency(service.price)}
                  </span>
                </div>
              </div>

              <span
                className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl sm:h-10 sm:w-10 ${
                  selected ? "bg-white text-[#6d4cad]" : "bg-white text-slate-500"
                }`}
              >
                {selected ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
              </span>
            </div>
          </button>
        );
      })}

      {error ? <p className="text-sm font-medium text-rose-400">{error}</p> : null}
    </div>
  );
}
