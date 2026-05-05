export default function SkeletonBlock({
  className = "",
  lines = 0,
  animate = true,
}) {
  return (
    <div
      className={`rounded-[28px] border border-slate-200/90 bg-white ${animate ? "animate-pulse" : ""} ${className}`.trim()}
      aria-hidden="true"
    >
      {lines > 0 ? (
        <div className="space-y-3 p-5">
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={`h-4 rounded-full bg-slate-200/80 ${
                index === lines - 1 ? "w-2/3" : "w-full"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
