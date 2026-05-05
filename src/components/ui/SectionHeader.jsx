export default function SectionHeader({
  eyebrow,
  title,
  description,
  aside,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between ${className}`.trim()}
    >
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#6d4cad] sm:text-xs">
            {eyebrow}
          </p>
        ) : null}
        {title ? (
          <h2 className="mt-3 text-xl font-semibold text-slate-900">{title}</h2>
        ) : null}
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
            {description}
          </p>
        ) : null}
      </div>
      {aside ? <div>{aside}</div> : null}
    </div>
  );
}
