import { lazy, Suspense, useState } from "react";
import { Activity, ClipboardCheck, DollarSign, Wallet } from "lucide-react";
import ErrorState from "../components/ui/ErrorState.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import PageIntro from "../components/ui/PageIntro.jsx";
import SectionCard from "../components/ui/SectionCard.jsx";
import SkeletonBlock from "../components/ui/SkeletonBlock.jsx";
import useDashboardData from "../hooks/useDashboardData.jsx";
import useAppointmentNotificationSettings from "../hooks/useAppointmentNotificationSettings.jsx";

const FinancialChart = lazy(() => import("../components/dashboard/FinancialChart.jsx"));

const metricsMap = [
  { key: "totalRevenue", label: "Receita", icon: Wallet },
  { key: "estimatedProfit", label: "Lucro estimado", icon: DollarSign },
  { key: "totalExpenses", label: "Despesas", icon: ClipboardCheck },
  { key: "totalInvested", label: "Investimentos", icon: Activity },
];

function formatCurrency(value) {
  return typeof value === "number"
    ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : value;
}

function formatMonthLabel(monthKey) {
  if (!monthKey) return "";
  const [year, month] = String(monthKey).split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1, 1);
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  const { dashboard, chartData, loading, error } = useDashboardData(selectedMonth);
  const { settings: notificationSettings } = useAppointmentNotificationSettings();
  const [financialView, setFinancialView] = useState("summary");

  return (
    <div className="space-y-6">
      <PageHeader>
        <PageIntro eyebrow="Resumo financeiro" title="Controle financeiro do studio em leitura rápida." />
      </PageHeader>

      <section className="rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(52,60,78,0.06)]">
        <div className="grid gap-0 md:grid-cols-2 xl:grid-cols-4">
          {metricsMap.map((item, index) => (
            <article
              key={item.key}
              className={`px-5 py-5 ${index !== metricsMap.length - 1 ? "border-b border-slate-200 xl:border-b-0 xl:border-r" : ""} md:[&:nth-child(2)]:border-r-0 md:[&:nth-child(2)]:xl:border-r md:[&:nth-child(1)]:border-r md:[&:nth-child(3)]:border-r md:[&:nth-child(4)]:border-r-0`}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f4effd] text-[#6d4cad]">
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">
                    {formatCurrency(dashboard.metrics[item.key])}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <SectionCard className="h-full">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.26em] text-[#6d4cad]">Financeiro</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                {financialView === "summary" ? "Resumo do período" : "Fluxo do mês"}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 outline-none"
              />
              <button
                type="button"
                onClick={() => setFinancialView("summary")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  financialView === "summary"
                    ? "bg-[#6d4cad] text-white"
                    : "border border-slate-200 bg-white text-slate-600"
                }`}
              >
                Resumo
              </button>
              <button
                type="button"
                onClick={() => setFinancialView("daily")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  financialView === "daily"
                    ? "bg-[#6d4cad] text-white"
                    : "border border-slate-200 bg-white text-slate-600"
                }`}
              >
                Fluxo do mês
              </button>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 space-y-4">
              <SkeletonBlock className="h-72" />
              <SkeletonBlock className="h-24" />
            </div>
          ) : error ? (
            <div className="mt-6">
              <ErrorState title="Falha ao carregar o resumo financeiro" message={error} />
            </div>
          ) : financialView === "summary" ? (
            <div className="mt-6 space-y-5">
              <div className="rounded-[24px] border border-slate-200 bg-[#f8fafc] p-5">
                <div className="flex items-center justify-between gap-4 text-sm text-slate-500">
                  <span>Receita projetada</span>
                  <span>{formatCurrency(dashboard.metrics.revenue)}</span>
                </div>
                <div className="mt-5 h-64 min-w-0">
                  {chartData.length > 0 ? (
                    <Suspense fallback={<SkeletonBlock className="h-full" />}>
                      <FinancialChart data={chartData} />
                    </Suspense>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-[20px] border border-dashed border-slate-300 bg-white px-6 text-center text-sm text-slate-500">
                      Sem dados suficientes para montar o gráfico.
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Comissão média</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {formatCurrency(dashboard.metrics.commissionAverage)}
                  </p>
                </div>
                <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Valor do estoque</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {formatCurrency(dashboard.metrics.stockValue)}
                  </p>
                </div>
                <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Produtos em estoque</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{dashboard.metrics.productCount}</p>
                </div>
                <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">WhatsApp</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {notificationSettings?.whatsappConfigured ? "Configurado" : "Pronto para configurar"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              <div className="rounded-[20px] border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm text-slate-600">
                Mês selecionado:{" "}
                <span className="font-semibold text-slate-900">
                  {formatMonthLabel(dashboard.dailyCashFlow.monthKey)}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Entradas previstas do mês</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {formatCurrency(dashboard.dailyCashFlow.scheduledRevenue)}
                  </p>
                </div>
                <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Entradas concluídas do mês</p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-700">
                    {formatCurrency(dashboard.dailyCashFlow.completedRevenue)}
                  </p>
                </div>
                <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">A receber no mês</p>
                  <p className="mt-2 text-2xl font-semibold text-amber-700">
                    {formatCurrency(dashboard.dailyCashFlow.pendingRevenue)}
                  </p>
                </div>
                <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Ticket médio do mês</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {formatCurrency(dashboard.dailyCashFlow.averageTicket)}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[22px] border border-slate-200 bg-[#f8fafc] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Despesas do mês</p>
                  <p className="mt-2 text-xl font-semibold text-rose-600">
                    {formatCurrency(dashboard.dailyCashFlow.expenses)}
                  </p>
                </div>
                <div className="rounded-[22px] border border-slate-200 bg-[#f8fafc] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Investimentos do mês</p>
                  <p className="mt-2 text-xl font-semibold text-amber-700">
                    {formatCurrency(dashboard.dailyCashFlow.investments)}
                  </p>
                </div>
                <div className="rounded-[22px] border border-slate-200 bg-[#f8fafc] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Comissões pagas no mês</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    {formatCurrency(dashboard.dailyCashFlow.commissionsPaid)}
                  </p>
                </div>
                <div className="rounded-[22px] border border-slate-200 bg-[#f8fafc] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Caixa líquido do mês</p>
                  <p
                    className={`mt-2 text-xl font-semibold ${
                      dashboard.dailyCashFlow.netCash >= 0 ? "text-emerald-700" : "text-rose-600"
                    }`}
                  >
                    {formatCurrency(dashboard.dailyCashFlow.netCash)}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-slate-200 bg-[#f8fafc] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Atendimentos do mês</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    {dashboard.dailyCashFlow.appointments}
                  </p>
                </div>
                <div className="rounded-[22px] border border-slate-200 bg-[#f8fafc] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Concluídos no mês</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    {dashboard.dailyCashFlow.completedAppointments}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
                <div className="max-h-[620px] overflow-y-auto overflow-x-auto">
                  <div className="min-w-[720px]">
                    <div className="sticky top-0 z-10 grid grid-cols-[84px_minmax(180px,1fr)_minmax(180px,1fr)_minmax(190px,1fr)] border-b border-slate-200 bg-[#f8fafc] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      <span>Dia</span>
                      <span>Receita</span>
                      <span>Despesa</span>
                      <span>Resultado</span>
                    </div>

                    <div className="divide-y divide-slate-200">
                      {(dashboard.dailyCashFlow.entries ?? []).map((entry) => (
                        <div
                          key={entry.date}
                          className="grid grid-cols-[84px_minmax(180px,1fr)_minmax(180px,1fr)_minmax(190px,1fr)] items-stretch px-5 text-sm text-slate-700"
                        >
                          <div className="flex items-center py-4 font-semibold text-slate-900">
                            {String(entry.day).padStart(2, "0")}
                          </div>
                          <div className="flex items-center py-4 whitespace-nowrap">
                            {formatCurrency(entry.revenue)}
                          </div>
                          <div className="flex items-center py-4 whitespace-nowrap">
                            {formatCurrency(entry.expense)}
                          </div>
                          <div
                            className={`my-2 flex items-center rounded-2xl px-4 py-3 font-semibold whitespace-nowrap ${
                              entry.result > 0
                                ? "bg-emerald-500 text-white"
                                : entry.result < 0
                                  ? "bg-rose-500 text-white"
                                  : "bg-slate-100 text-slate-900"
                            }`}
                          >
                            {formatCurrency(entry.result)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SectionCard>
      </section>
    </div>
  );
}
