export default function SectionCard({ children, className = "" }) {
  return (
    <section
      className={`min-w-0 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(52,60,78,0.06)] sm:p-6 lg:p-8 ${className}`.trim()}
    >
      {children}
    </section>
  );
}
