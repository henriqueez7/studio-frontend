import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function FinancialChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.42} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="gradientExpenses" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.42} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#d8dfeb" strokeDasharray="4 4" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="#64748b"
          tickLine={false}
          axisLine={false}
          fontSize={12}
        />
        <YAxis
          stroke="#94a3b8"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          tickFormatter={(value) => formatCurrency(value)}
        />
        <Tooltip
          formatter={(value, name) => [
            formatCurrency(value),
            name === "revenue" ? "Entrada" : "Saída",
          ]}
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 18,
            color: "#0f172a",
            boxShadow: "0 16px 36px rgba(15,23,42,0.12)",
          }}
          labelStyle={{ color: "#475569", fontWeight: 600 }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          name="Entrada"
          stroke="#10b981"
          fill="url(#gradientRevenue)"
          strokeWidth={3}
          activeDot={{ r: 5 }}
        />
        <Area
          type="monotone"
          dataKey="expenses"
          name="Saída"
          stroke="#ef4444"
          fill="url(#gradientExpenses)"
          strokeWidth={3}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
