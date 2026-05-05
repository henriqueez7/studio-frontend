const WEEK_DAY_KEYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

export const WEEK_DAY_LABELS = {
  SUNDAY: "Domingo",
  MONDAY: "Segunda",
  TUESDAY: "Terca",
  WEDNESDAY: "Quarta",
  THURSDAY: "Quinta",
  FRIDAY: "Sexta",
  SATURDAY: "Sabado",
};

function pad(value) {
  return String(value).padStart(2, "0");
}

function toLocalDateString(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function getWeekDayKeyFromDate(date) {
  return WEEK_DAY_KEYS[date.getDay()] || "MONDAY";
}

export function formatWeekDayLabel(dayOfWeek) {
  return WEEK_DAY_LABELS[dayOfWeek] || dayOfWeek || "Dia";
}

export function timeToMinutes(value) {
  if (!value || typeof value !== "string") return 0;

  const [hours = "0", minutes = "0"] = value.split(":");
  return Number(hours) * 60 + Number(minutes);
}

export function minutesToTimeLabel(value) {
  const total = Number(value) || 0;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${pad(hours)}:${pad(minutes)}`;
}

function getAppointmentEndMinutes(appointment) {
  const explicitEnd = appointment?.endTime;
  if (explicitEnd) return timeToMinutes(explicitEnd);

  const start = timeToMinutes(appointment?.startTime);
  const duration = Number(appointment?.totalDuration || 0);
  return start + duration;
}

function normalizeAppointmentForSchedule(appointment) {
  return {
    ...appointment,
    appointmentDate: appointment?.appointmentDate || null,
    startMinutes: timeToMinutes(appointment?.startTime),
    endMinutes: getAppointmentEndMinutes(appointment),
    clientName:
      appointment?.client?.name ||
      appointment?.clientName ||
      appointment?.customerName ||
      "Cliente",
    serviceLabel:
      (appointment?.services || []).map((service) => service.name).join(" + ") ||
      "Atendimento",
  };
}

function buildSlotsForWindow(windowConfig, dayAppointments) {
  const slotStart = timeToMinutes(windowConfig.startTime);
  const slotEnd = timeToMinutes(windowConfig.endTime);
  const interval = Number(windowConfig.slotIntervalInMinutes || 30) || 30;
  const slots = [];

  for (let cursor = slotStart; cursor + interval <= slotEnd; cursor += interval) {
    const overlappingAppointment = dayAppointments.find(
      (appointment) => cursor >= appointment.startMinutes && cursor < appointment.endMinutes,
    );

    slots.push({
      key: `${windowConfig.id || windowConfig.dayOfWeek}-${cursor}`,
      time: minutesToTimeLabel(cursor),
      status: overlappingAppointment ? "occupied" : "free",
      appointment: overlappingAppointment || null,
    });
  }

  return slots;
}

export function summarizeAvailabilityWindows(availabilities) {
  return [...availabilities]
    .filter((item) => item?.active)
    .sort((a, b) => WEEK_DAY_KEYS.indexOf(a.dayOfWeek) - WEEK_DAY_KEYS.indexOf(b.dayOfWeek))
    .map((item) => ({
      id: item.id,
      dayLabel: formatWeekDayLabel(item.dayOfWeek),
      timeLabel: `${minutesToTimeLabel(timeToMinutes(item.startTime))} - ${minutesToTimeLabel(timeToMinutes(item.endTime))}`,
      intervalLabel: `${item.slotIntervalInMinutes} min`,
    }));
}

export function buildFallbackAvailableDates(
  availabilities,
  minimumDuration = 0,
  daysAhead = 45,
  limit = 12,
) {
  const activeAvailability = (availabilities || []).filter((item) => {
    if (!item?.active) return false;

    const startMinutes = timeToMinutes(item.startTime);
    const endMinutes = timeToMinutes(item.endTime);
    const windowDuration = endMinutes - startMinutes;

    return windowDuration > 0 && windowDuration >= Number(minimumDuration || 0);
  });

  if (activeAvailability.length === 0) return [];

  const allowedDays = new Set(activeAvailability.map((item) => item.dayOfWeek));
  const dates = [];
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  for (let offset = 0; offset <= daysAhead && dates.length < limit; offset += 1) {
    const currentDate = new Date(baseDate);
    currentDate.setDate(baseDate.getDate() + offset);

    if (allowedDays.has(getWeekDayKeyFromDate(currentDate))) {
      dates.push(toLocalDateString(currentDate));
    }
  }

  return dates;
}

export function buildWeeklySchedule(availabilities, appointments, days = 7) {
  const activeAvailability = (availabilities || []).filter((item) => item?.active);
  const normalizedAppointments = (appointments || []).map(normalizeAppointmentForSchedule);
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  const entries = Array.from({ length: days }, (_, index) => {
    const currentDate = new Date(baseDate);
    currentDate.setDate(baseDate.getDate() + index);

    const dateKey = toLocalDateString(currentDate);
    const dayOfWeek = getWeekDayKeyFromDate(currentDate);
    const windows = activeAvailability.filter((item) => item.dayOfWeek === dayOfWeek);
    const dayAppointments = normalizedAppointments.filter(
      (appointment) => appointment.appointmentDate === dateKey,
    );

    const slots = windows.flatMap((windowConfig) => buildSlotsForWindow(windowConfig, dayAppointments));

    return {
      date: dateKey,
      dateLabel: currentDate.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
      fullDateLabel: currentDate.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      }),
      dayLabel: formatWeekDayLabel(dayOfWeek),
      windows,
      appointments: dayAppointments,
      slots,
      freeCount: slots.filter((slot) => slot.status === "free").length,
      occupiedCount: slots.filter((slot) => slot.status === "occupied").length,
    };
  });

  const totalSlots = entries.reduce((sum, entry) => sum + entry.slots.length, 0);
  const occupiedSlots = entries.reduce((sum, entry) => sum + entry.occupiedCount, 0);
  const freeSlots = entries.reduce((sum, entry) => sum + entry.freeCount, 0);

  return {
    entries,
    summary: {
      days,
      totalSlots,
      occupiedSlots,
      freeSlots,
      availabilityBlocks: activeAvailability.length,
    },
  };
}
