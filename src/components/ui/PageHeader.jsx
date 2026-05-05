export default function PageHeader({
  children,
  actions,
  className = "",
}) {
  return (
    <section
      className={`rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(52,60,78,0.06)] sm:p-6 lg:p-8 ${className}`.trim()}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        {children}
        {actions ? (
          <div className="grid w-full shrink-0 grid-cols-1 gap-3 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
}
