import api from "./api.js";

function asNumber(value) {
  const parsed = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(parsed) ? parsed : 0;
}

function pickNumber(source, keys) {
  for (const key of keys) {
    const value = source?.[key];
    if (value != null && value !== "") return asNumber(value);
  }
  return 0;
}

function normalizeSummary(data) {
  return {
    appointments: pickNumber(data, ["appointments", "totalAppointments"]),
    servicesActive: pickNumber(data, ["servicesActive", "activeServices"]),
    productCount: pickNumber(data, ["productCount", "products", "totalProducts"]),
    todayAppointments: pickNumber(data, ["todayAppointments", "appointmentsToday"]),
    newClients: pickNumber(data, ["newClients", "clients"]),
    upcomingAppointments:
      data?.upcomingAppointments ??
      data?.appointmentsList ??
      data?.nextAppointments ??
      [],
  };
}

function getAppointmentDateValue(appointment) {
  return (
    appointment?.appointmentDate ??
    appointment?.date ??
    appointment?.scheduledDate ??
    null
  );
}

function getAppointmentTimeValue(appointment) {
  return (
    appointment?.startTime ??
    appointment?.time ??
    appointment?.hour ??
    "00:00:00"
  );
}

function normalizeAppointmentStatus(status) {
  return String(status || "").trim().toUpperCase();
}

function isCountableAppointment(appointment) {
  const status = normalizeAppointmentStatus(appointment?.status);
  return !["CANCELED", "CANCELLED"].includes(status);
}

function isSameLocalDate(dateA, dateB) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function normalizeAppointmentsList(data) {
  const list = Array.isArray(data)
    ? data
    : data?.appointments ?? data?.data ?? [];

  if (!Array.isArray(list)) return [];

  return list
    .filter(isCountableAppointment)
    .map((appointment) => {
      const appointmentDate = getAppointmentDateValue(appointment);
      const startTime = getAppointmentTimeValue(appointment);

      return {
        raw: appointment,
        appointmentDate,
        startTime,
        time: appointment?.time ?? appointment?.startTime ?? appointment?.hour ?? "--:--",
        amount: asNumber(
          appointment?.totalPrice ??
            appointment?.price ??
            appointment?.amount ??
            appointment?.totalAmount ??
            0,
        ),
        status: normalizeAppointmentStatus(appointment?.status),
        service:
          appointment?.service ??
          appointment?.serviceName ??
          appointment?.title ??
          appointment?.services?.map?.((service) => service?.name).filter(Boolean).join(" + ") ??
          "Serviço",
        client:
          appointment?.client?.name ??
          appointment?.clientName ??
          appointment?.customerName ??
          appointment?.client ??
          "Não informado",
      };
    });
}

function getProductStockQuantity(product) {
  return asNumber(
    product?.stockQuantity ?? product?.stock ?? product?.quantity ?? 0,
  );
}

function getProductUnitValue(product) {
  return asNumber(
    product?.salePrice ??
      product?.price ??
      product?.purchasePrice ??
      product?.costPrice ??
      0,
  );
}

function normalizeProductsList(data) {
  const list = Array.isArray(data)
    ? data
    : data?.products ?? data?.data ?? [];

  if (!Array.isArray(list)) return [];

  return list.map((product) => ({
    ...product,
    stockQuantity: getProductStockQuantity(product),
    unitValue: getProductUnitValue(product),
  }));
}

function getCommissionAmount(item) {
  return asNumber(item?.totalAmount ?? item?.value ?? item?.amount ?? 0);
}

function normalizeCommissionsList(data) {
  const list = Array.isArray(data)
    ? data
    : data?.commissions ?? data?.data ?? [];

  if (!Array.isArray(list)) return [];

  return list.map((item) => ({
    ...item,
    amount: getCommissionAmount(item),
  }));
}

function deriveTodayAppointmentsCount(appointments) {
  const today = new Date();

  return appointments.filter((appointment) => {
    if (!appointment.appointmentDate) return false;

    const parsed = new Date(`${appointment.appointmentDate}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return false;

    return isSameLocalDate(parsed, today);
  }).length;
}

function getTodayAppointments(appointments) {
  const today = new Date();

  return appointments.filter((appointment) => {
    if (!appointment.appointmentDate) return false;

    const parsed = new Date(`${appointment.appointmentDate}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return false;

    return isSameLocalDate(parsed, today);
  });
}

function sortAppointments(appointments) {
  return appointments.slice().sort((a, b) => {
    const aDate = new Date(`${a.appointmentDate || ""}T${a.startTime || "00:00:00"}`);
    const bDate = new Date(`${b.appointmentDate || ""}T${b.startTime || "00:00:00"}`);
    return aDate - bDate;
  });
}

function normalizeFinancial(data) {
  return {
    totalRevenue: pickNumber(data, ["totalRevenue", "revenue"]),
    estimatedProfit: pickNumber(data, ["estimatedProfit", "profit", "netProfit"]),
    totalExpenses: pickNumber(data, ["totalExpenses", "expenses"]),
    stockValue: pickNumber(data, ["stockValue", "inventoryValue"]),
    revenueTrend: data?.revenueTrend ?? data?.revenueHistory ?? data?.revenues ?? [],
    expenseTrend: data?.expenseTrend ?? data?.expenseHistory ?? data?.expensesHistory ?? [],
  };
}

function normalizeExpensesList(data) {
  const list = Array.isArray(data)
    ? data
    : data?.expenses ?? data?.data ?? [];

  if (!Array.isArray(list)) return [];

  return list.map((item) => ({
    ...item,
    amount: asNumber(item?.amount ?? item?.value ?? 0),
    expenseDate: item?.expenseDate ?? item?.date ?? null,
    createdAt: item?.createdAt ?? null,
  }));
}

function getComparableDateValue(value) {
  if (!value) return null;
  const normalized =
    /^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? `${value}T00:00:00` : value;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function isCurrentMonthValue(value) {
  const parsed = getComparableDateValue(value);
  if (!parsed) return false;

  const now = new Date();
  return (
    parsed.getFullYear() === now.getFullYear() &&
    parsed.getMonth() === now.getMonth()
  );
}

function isInMonthValue(value, monthKey) {
  const parsed = getComparableDateValue(value);
  if (!parsed) return false;

  if (!monthKey || !/^\d{4}-\d{2}$/.test(String(monthKey))) {
    return isCurrentMonthValue(value);
  }

  const [year, month] = String(monthKey).split("-").map(Number);
  return parsed.getFullYear() === year && parsed.getMonth() === month - 1;
}

function getMonthMeta(monthKey) {
  if (monthKey && /^\d{4}-\d{2}$/.test(String(monthKey))) {
    const [year, month] = String(monthKey).split("-").map(Number);
    return { year, monthIndex: month - 1 };
  }

  const now = new Date();
  return { year: now.getFullYear(), monthIndex: now.getMonth() };
}

export async function fetchDashboard(monthKey) {
  const [
    summary,
    financial,
    stockAlerts,
    commissionsSummary,
    investments,
    expenses,
    appointments,
    commissionPayments,
    adminProducts,
    publicProducts,
  ] =
    await Promise.allSettled([
      api.get("/dashboard/summary"),
      api.get("/dashboard/financial"),
      api.get("/dashboard/stock-alerts"),
      api.get("/dashboard/commissions"),
      api.get("/dashboard/investments"),
      api.get("/expenses"),
      api.get("/appointments"),
      api.get("/commissions/payments"),
      api.get("/products/admin/all"),
      api.get("/products"),
    ]);

  const results = [
    summary,
    financial,
    stockAlerts,
    commissionsSummary,
    investments,
    expenses,
    appointments,
    commissionPayments,
    adminProducts,
    publicProducts,
  ];
  const rejected = results.every((result) => result.status === "rejected");

  if (rejected) {
    throw (
      summary.reason ??
      financial.reason ??
      commissionsSummary.reason ??
      investments.reason
    );
  }

  const summaryData =
    summary.status === "fulfilled" ? normalizeSummary(summary.value.data) : {};
  const financialData =
    financial.status === "fulfilled" ? normalizeFinancial(financial.value.data) : {};
  const expensesData =
    expenses.status === "fulfilled" ? normalizeExpensesList(expenses.value.data) : [];
  const stockAlertsData =
    stockAlerts.status === "fulfilled"
      ? stockAlerts.value.data?.alerts ??
        stockAlerts.value.data?.items ??
        stockAlerts.value.data ??
        []
      : [];
  const appointmentsData =
    appointments.status === "fulfilled"
      ? normalizeAppointmentsList(appointments.value.data)
      : [];
  const commissionPaymentsData =
    commissionPayments.status === "fulfilled"
      ? normalizeCommissionsList(commissionPayments.value.data)
      : [];
  const productsData =
    adminProducts.status === "fulfilled"
      ? normalizeProductsList(adminProducts.value.data)
      : publicProducts.status === "fulfilled"
        ? normalizeProductsList(publicProducts.value.data)
        : [];

  const todayAppointmentsList = sortAppointments(getTodayAppointments(appointmentsData));
  const { year, monthIndex } = getMonthMeta(monthKey);
  const selectedMonthAppointments = appointmentsData.filter((appointment) =>
    isInMonthValue(appointment.appointmentDate, monthKey),
  );
  const selectedMonthCompletedAppointments = selectedMonthAppointments.filter(
    (appointment) => appointment.status === "CONCLUIDO",
  );
  const selectedMonthScheduledRevenue = selectedMonthAppointments.reduce(
    (sum, appointment) => sum + asNumber(appointment.amount),
    0,
  );
  const selectedMonthCompletedRevenue = selectedMonthCompletedAppointments.reduce(
    (sum, appointment) => sum + asNumber(appointment.amount),
    0,
  );
  const selectedMonthAverageTicket =
    selectedMonthAppointments.length > 0
      ? selectedMonthScheduledRevenue / selectedMonthAppointments.length
      : 0;
  const selectedMonthExpenses = expensesData
    .filter((expense) => isInMonthValue(expense.expenseDate ?? expense.createdAt, monthKey))
    .reduce((sum, expense) => sum + asNumber(expense.amount), 0);
  const selectedMonthInvestmentsValue =
    investments.status === "fulfilled" && Array.isArray(investments.value.data)
      ? investments.value.data
          .map((item) => ({
            value: asNumber(item?.estimatedValue ?? item?.value ?? item?.amount ?? 0),
            date: item?.expectedDate ?? item?.date ?? item?.createdAt ?? null,
          }))
          .filter((item) => isInMonthValue(item.date, monthKey))
          .reduce((sum, item) => sum + item.value, 0)
      : 0;
  const selectedMonthPaidCommissions = commissionPaymentsData
    .filter(
      (item) =>
        normalizeAppointmentStatus(item?.status) === "PAGO" &&
        isInMonthValue(item?.paymentDate ?? item?.updatedAt ?? item?.createdAt, monthKey),
    )
    .reduce((sum, item) => sum + asNumber(item.amount), 0);
  const selectedMonthAllCommissions = commissionPaymentsData
    .filter((item) =>
      isInMonthValue(item?.paymentDate ?? item?.updatedAt ?? item?.createdAt, monthKey),
    )
    .reduce((sum, item) => sum + asNumber(item.amount), 0);
  const selectedMonthCommissionCount = commissionPaymentsData.filter((item) =>
    isInMonthValue(item?.paymentDate ?? item?.updatedAt ?? item?.createdAt, monthKey),
  ).length;
  const selectedMonthOutflow =
    selectedMonthExpenses + selectedMonthInvestmentsValue + selectedMonthPaidCommissions;
  const selectedMonthNetCash = selectedMonthCompletedRevenue - selectedMonthOutflow;
  const selectedMonthAppointmentsCount = selectedMonthAppointments.length;
  const selectedMonthCommissionAverage =
    selectedMonthCommissionCount > 0
      ? selectedMonthAllCommissions /
        selectedMonthCommissionCount
      : 0;
  const selectedMonthProjectedProfit =
    selectedMonthScheduledRevenue -
    selectedMonthExpenses -
    selectedMonthAllCommissions -
    selectedMonthInvestmentsValue;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const dailyEntriesMap = new Map();

  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    dailyEntriesMap.set(key, {
      date: key,
      day: String(day).padStart(2, "0"),
      revenue: 0,
      expense: 0,
      result: 0,
    });
  }

  selectedMonthCompletedAppointments.forEach((appointment) => {
    const key = appointment.appointmentDate;
    const existing = dailyEntriesMap.get(key);
    if (!existing) return;
    existing.revenue += asNumber(appointment.amount);
    existing.result = existing.revenue - existing.expense;
  });

  expensesData
    .filter((expense) => isInMonthValue(expense.expenseDate ?? expense.createdAt, monthKey))
    .forEach((expense) => {
      const key = expense.expenseDate ?? String(expense.createdAt).slice(0, 10);
      const existing = dailyEntriesMap.get(key);
      if (!existing) return;
      existing.expense += asNumber(expense.amount);
      existing.result = existing.revenue - existing.expense;
    });

  if (investments.status === "fulfilled" && Array.isArray(investments.value.data)) {
    investments.value.data
      .map((item) => ({
        value: asNumber(item?.estimatedValue ?? item?.value ?? item?.amount ?? 0),
        date: item?.expectedDate ?? item?.date ?? item?.createdAt ?? null,
      }))
      .filter((item) => isInMonthValue(item.date, monthKey))
      .forEach((item) => {
        const key = String(item.date).slice(0, 10);
        const existing = dailyEntriesMap.get(key);
        if (!existing) return;
        existing.expense += item.value;
        existing.result = existing.revenue - existing.expense;
      });
  }

  commissionPaymentsData
    .filter(
      (item) =>
        normalizeAppointmentStatus(item?.status) === "PAGO" &&
        isInMonthValue(item?.paymentDate ?? item?.updatedAt ?? item?.createdAt, monthKey),
    )
    .forEach((item) => {
      const rawDate = item?.paymentDate ?? item?.updatedAt ?? item?.createdAt;
      const key = String(rawDate).slice(0, 10);
      const existing = dailyEntriesMap.get(key);
      if (!existing) return;
      existing.expense += asNumber(item.amount);
      existing.result = existing.revenue - existing.expense;
    });

  const dailyEntries = Array.from(dailyEntriesMap.values());

  const upcomingAppointments =
    todayAppointmentsList.length > 0
      ? todayAppointmentsList.slice(0, 5)
      : Array.isArray(summaryData.upcomingAppointments) &&
          summaryData.upcomingAppointments.length > 0
      ? summaryData.upcomingAppointments.map((appointment) => ({
          time:
            appointment?.time ??
            appointment?.startTime ??
            appointment?.hour ??
            "--:--",
          service:
            appointment?.service ??
            appointment?.serviceName ??
            appointment?.title ??
            "Serviço",
          client:
            appointment?.client?.name ??
            appointment?.clientName ??
            appointment?.customerName ??
            appointment?.client ??
            "Não informado",
        }))
      : [];

  const todayAppointmentsCount =
    summaryData.todayAppointments > 0
      ? summaryData.todayAppointments
      : deriveTodayAppointmentsCount(appointmentsData);
  const productCount =
    summaryData.productCount > 0
      ? summaryData.productCount
      : productsData.length;
  const stockValue =
    financialData.stockValue > 0
      ? financialData.stockValue
      : productsData.reduce(
          (sum, product) => sum + product.stockQuantity * product.unitValue,
          0,
        );

  return {
    metrics: {
      revenue: selectedMonthScheduledRevenue,
      totalRevenue: selectedMonthScheduledRevenue,
      estimatedProfit: selectedMonthProjectedProfit,
      totalExpenses: selectedMonthExpenses,
      totalCommissions: selectedMonthAllCommissions,
      totalInvested: selectedMonthInvestmentsValue,
      stockValue,
      productCount,
      appointments: selectedMonthAppointmentsCount,
      servicesActive: summaryData.servicesActive,
      commissionAverage: selectedMonthCommissionAverage,
      newClients: summaryData.newClients,
      todayAppointments: todayAppointmentsCount,
      stockAlerts: Array.isArray(stockAlertsData) ? stockAlertsData.length : 0,
    },
    performance: [],
    revenueTrend: financialData.revenueTrend,
    expenseTrend: financialData.expenseTrend,
    upcomingAppointments,
    dailyCashFlow: {
      monthKey: `${year}-${String(monthIndex + 1).padStart(2, "0")}`,
      scheduledRevenue: selectedMonthScheduledRevenue,
      completedRevenue: selectedMonthCompletedRevenue,
      pendingRevenue: Math.max(
        selectedMonthScheduledRevenue - selectedMonthCompletedRevenue,
        0,
      ),
      expenses: selectedMonthExpenses,
      investments: selectedMonthInvestmentsValue,
      commissionsPaid: selectedMonthPaidCommissions,
      outflow: selectedMonthOutflow,
      netCash: selectedMonthNetCash,
      appointments: selectedMonthAppointments.length,
      completedAppointments: selectedMonthCompletedAppointments.length,
      averageTicket: selectedMonthAverageTicket,
      entries: dailyEntries,
    },
  };
}
