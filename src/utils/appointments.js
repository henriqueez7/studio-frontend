import { formatDisplayDate } from "./date.js";

function asNumber(value) {
  const number = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(number) ? number : 0;
}

export function normalizeServiceItem(service) {
  return {
    id: service?.id ?? service?._id ?? null,
    name: service?.name || service?.title || service?.serviceName || "Servico",
    duration: asNumber(
      service?.durationInMinutes ?? service?.duration ?? service?.time ?? service?.length,
    ),
    price: asNumber(service?.price ?? service?.value ?? service?.cost),
    category: service?.category || service?.type || "Padrao",
  };
}

export function getAppointmentServices(appointment) {
  const list =
    appointment?.services ||
    appointment?.serviceList ||
    appointment?.items ||
    (appointment?.service ? [appointment.service] : []);

  return Array.isArray(list) ? list.map(normalizeServiceItem) : [];
}

export function getAppointmentDate(appointment) {
  return (
    appointment?.appointmentDate ||
    appointment?.date ||
    appointment?.datetime ||
    appointment?.startDate ||
    appointment?.startAt ||
    null
  );
}

export function getAppointmentStartTime(appointment) {
  return (
    appointment?.startTime ||
    appointment?.time ||
    appointment?.hour ||
    appointment?.start ||
    null
  );
}

export function getAppointmentEndTime(appointment) {
  return appointment?.endTime || appointment?.finishTime || appointment?.end || null;
}

export function getAppointmentTotalDuration(appointment) {
  const direct = asNumber(
    appointment?.totalDurationInMinutes ??
      appointment?.totalDuration ??
      appointment?.duration ??
      appointment?.estimatedDuration,
  );

  if (direct > 0) return direct;

  return getAppointmentServices(appointment).reduce(
    (sum, service) => sum + asNumber(service.duration),
    0,
  );
}

export function getAppointmentTotalPrice(appointment) {
  const direct = asNumber(
    appointment?.totalPrice ?? appointment?.price ?? appointment?.amount ?? appointment?.value,
  );

  if (direct > 0) return direct;

  return getAppointmentServices(appointment).reduce(
    (sum, service) => sum + asNumber(service.price),
    0,
  );
}

export function formatCurrency(value) {
  return asNumber(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatDuration(value) {
  const total = asNumber(value);

  if (!total) return "--";
  if (total < 60) return `${total} min`;

  const hours = Math.floor(total / 60);
  const minutes = total % 60;

  if (!minutes) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}

export function formatDateLabel(value) {
  return formatDisplayDate(value, "Data não informada");
}

export function formatTimeLabel(value) {
  if (!value) return "Horário não informado";

  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) {
    return value.slice(0, 5);
  }

  if (/^\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  return value;
}

export function buildAppointmentPayload({
  clientId,
  barberId,
  serviceIds,
  appointmentDate,
  startTime,
  notes,
}) {
  return {
    clientId,
    barberId,
    serviceIds,
    appointmentDate,
    startTime: /^\d{2}:\d{2}$/.test(startTime) ? `${startTime}:00` : startTime,
    notes: notes?.trim() || "",
  };
}
