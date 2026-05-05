export default function InvestmentSummaryCard({ title, value, description }) {
  return (
    <div className="border-b border-slate-200 px-5 py-5 last:border-b-0 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.24em] text-[#6d4cad]">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}
