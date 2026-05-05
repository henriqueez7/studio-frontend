import { useEffect, useMemo, useState } from "react";
import { fetchDashboard } from "../services/dashboardService.js";
import { getErrorMessage } from "../utils/errors.js";

const defaultDashboard = {
  metrics: {
    revenue: 0,
    totalRevenue: 0,
    estimatedProfit: 0,
    totalExpenses: 0,
    totalCommissions: 0,
    totalInvested: 0,
    stockValue: 0,
    productCount: 0,
    appointments: 0,
    servicesActive: 0,
    commissionAverage: 0,
    newClients: 0,
    todayAppointments: 0,
  },
  performance: [],
  revenueTrend: [],
  expenseTrend: [],
  upcomingAppointments: [],
  dailyCashFlow: {
    monthKey: null,
    scheduledRevenue: 0,
    completedRevenue: 0,
    pendingRevenue: 0,
    expenses: 0,
    investments: 0,
    commissionsPaid: 0,
    outflow: 0,
    netCash: 0,
    appointments: 0,
    completedAppointments: 0,
    averageTicket: 0,
    entries: [],
  },
};

export default function useDashboardData(selectedMonth) {
  const [dashboard, setDashboard] = useState(defaultDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchDashboard(selectedMonth);
        if (!isMounted) return;

        setDashboard((prev) => ({
          ...prev,
          metrics: {
            revenue: data.metrics?.revenue ?? prev.metrics.revenue,
            totalRevenue:
              data.metrics?.totalRevenue ??
              data.metrics?.revenue ??
              prev.metrics.totalRevenue,
            estimatedProfit:
              data.metrics?.estimatedProfit ?? prev.metrics.estimatedProfit,
            totalExpenses:
              data.metrics?.totalExpenses ?? prev.metrics.totalExpenses,
            totalCommissions:
              data.metrics?.totalCommissions ?? prev.metrics.totalCommissions,
            totalInvested:
              data.metrics?.totalInvested ?? prev.metrics.totalInvested,
            stockValue: data.metrics?.stockValue ?? prev.metrics.stockValue,
            productCount: data.metrics?.productCount ?? prev.metrics.productCount,
            appointments: data.metrics?.appointments ?? prev.metrics.appointments,
            servicesActive:
              data.metrics?.servicesActive ?? prev.metrics.servicesActive,
            commissionAverage:
              data.metrics?.commissionAverage ?? prev.metrics.commissionAverage,
            newClients: data.metrics?.newClients ?? prev.metrics.newClients,
            todayAppointments:
              data.metrics?.todayAppointments ?? prev.metrics.todayAppointments,
          },
          performance: data.performance ?? prev.performance,
          revenueTrend: data.revenueTrend ?? prev.revenueTrend,
          expenseTrend: data.expenseTrend ?? prev.expenseTrend,
          upcomingAppointments:
            data.upcomingAppointments ?? prev.upcomingAppointments,
          dailyCashFlow: data.dailyCashFlow ?? prev.dailyCashFlow,
        }));
      } catch (err) {
        if (!isMounted) return;
        setError(getErrorMessage(err, "Não foi possível carregar o dashboard."));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [selectedMonth]);

  const chartData = useMemo(() => {
    const hasTrendData =
      dashboard.revenueTrend.length > 0 || dashboard.expenseTrend.length > 0;

    if (hasTrendData) {
      const periods = new Map();

      dashboard.revenueTrend.forEach((item, index) => {
        const name = item.label || `Período ${index + 1}`;
        periods.set(name, {
          name,
          revenue: item.value ?? item.revenue ?? 0,
          expenses: 0,
        });
      });

      dashboard.expenseTrend.forEach((item, index) => {
        const name = item.label || `Período ${index + 1}`;
        const existing = periods.get(name) ?? {
          name,
          revenue: 0,
          expenses: 0,
        };

        periods.set(name, {
          ...existing,
          expenses: item.value ?? item.expenses ?? 0,
        });
      });

      return Array.from(periods.values());
    }

    if (dashboard.performance.length > 0) {
      return dashboard.performance.map((item, index) => ({
        name: item.label || `Semana ${index + 1}`,
        revenue: item.revenue ?? item.value ?? 0,
        expenses: item.expenses ?? 0,
      }));
    }

    return [
      {
        name: "Receita",
        revenue: dashboard.metrics.totalRevenue,
        expenses: 0,
      },
      {
        name: "Despesas",
        revenue: 0,
        expenses: dashboard.metrics.totalExpenses,
      },
      {
        name: "Comissões",
        revenue: 0,
        expenses: dashboard.metrics.totalCommissions,
      },
      {
        name: "Investimentos",
        revenue: 0,
        expenses: dashboard.metrics.totalInvested,
      },
    ].filter((item) => item.revenue > 0 || item.expenses > 0);
  }, [dashboard]);

  return {
    dashboard,
    chartData,
    loading,
    error,
  };
}
