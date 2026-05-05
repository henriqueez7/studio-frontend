import { AlertCircle, CheckCircle2, Info } from "lucide-react";

const toneMap = {
  success: {
    wrapper: "border-emerald-200 bg-emerald-50 text-emerald-900",
    icon: "bg-emerald-100 text-emerald-600",
    Icon: CheckCircle2,
    defaultTitle: "Tudo certo",
  },
  error: {
    wrapper: "border-rose-200 bg-rose-50 text-rose-900",
    icon: "bg-rose-100 text-rose-600",
    Icon: AlertCircle,
    defaultTitle: "Algo deu errado",
  },
  info: {
    wrapper: "border-sky-200 bg-sky-50 text-sky-900",
    icon: "bg-sky-100 text-sky-600",
    Icon: Info,
    defaultTitle: "Aviso importante",
  },
};

export default function StatusBanner({
  type = "info",
  title,
  message,
  className = "",
}) {
  const tone = toneMap[type] || toneMap.info;
  const Icon = tone.Icon;

  return (
    <div
      className={`rounded-[22px] border p-3.5 shadow-[0_10px_24px_rgba(52,60,78,0.08)] sm:p-4 ${tone.wrapper} ${className}`.trim()}
      role={type === "error" ? "alert" : "status"}
    >
      <div className="flex items-start gap-3">
        <div className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl sm:h-10 sm:w-10 ${tone.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold">{title || tone.defaultTitle}</p>
          {message ? <p className="mt-1 text-sm leading-6 text-inherit/90">{message}</p> : null}
        </div>
      </div>
    </div>
  );
}
