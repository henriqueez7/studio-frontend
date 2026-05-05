export default function PageIntro({
  eyebrow,
  title,
  description,
  className = "",
}) {
  return (
    <div className={`max-w-3xl ${className}`.trim()}>
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6d4cad] sm:text-sm sm:tracking-[0.32em]">
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <h1 className="mt-3 text-2xl font-semibold leading-tight text-slate-900 sm:mt-4 sm:text-3xl lg:text-[2.7rem]">
          {title}
        </h1>
      ) : null}
      {description ? (
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:mt-4 sm:text-base sm:leading-7">
          {description}
        </p>
      ) : null}
    </div>
  );
}
