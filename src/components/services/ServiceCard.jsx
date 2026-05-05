import { Scissors, Tag, Timer } from "lucide-react";

function formatPrice(price) {
  const value = typeof price === "string" ? Number(price) : price;
  if (Number.isFinite(value)) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }
  return "R$ 0,00";
}

export default function ServiceCard({ service }) {
  const title = service.name || service.title || service.serviceName || "Serviço";
  const description =
    service.description || service.summary || "Nenhuma descrição disponível.";
  const price = service.price ?? service.value ?? service.cost;
  const duration =
    service.durationInMinutes || service.duration || service.time || service.length;
  const category = service.category || service.type || "Padrão";
  const active = service.active ?? service.enabled ?? true;

  return (
    <article className="overflow-hidden rounded-[26px] border border-slate-200 bg-white transition hover:border-[#6d4cad]/18">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-[#f8fafc] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 text-[#6d4cad]">
            <Scissors className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-xs text-slate-500">{category}</p>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
          }`}
        >
          {active ? "Ativo" : "Inativo"}
        </span>
      </div>

      <div className="px-5 py-4">
        <p className="text-sm leading-6 text-slate-500">{description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-[#f8fafc] px-3 py-2">
            <Tag className="h-4 w-4" /> {category}
          </span>
          {duration ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-[#f8fafc] px-3 py-2">
              <Timer className="h-4 w-4" /> {duration} min
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#6d4cad]">Preço</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{formatPrice(price)}</p>
        </div>
      </div>
    </article>
  );
}
