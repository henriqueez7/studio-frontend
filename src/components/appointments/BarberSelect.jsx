export default function BarberSelect({
  barbers,
  value,
  onChange,
  disabled = false,
  loading = false,
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      Barbeiro
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled || loading}
        className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10 [&>option]:bg-white [&>option]:text-slate-900"
      >
        <option value="">
          {loading ? "Carregando barbeiros..." : "Selecione o barbeiro"}
        </option>
        {barbers.map((barber) => (
          <option key={barber.id} value={barber.id}>
            {barber.name}
          </option>
        ))}
      </select>
    </label>
  );
}
