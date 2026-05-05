import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock3,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  RefreshCcw,
  Scissors,
  Trash2,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import EmptyState from "../components/ui/EmptyState.jsx";
import ModalPortal from "../components/ui/ModalPortal.jsx";
import SkeletonBlock from "../components/ui/SkeletonBlock.jsx";
import StatusBanner from "../components/ui/StatusBanner.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import useAppointments from "../hooks/useAppointments.jsx";
import useAvailability from "../hooks/useAvailability.jsx";
import useClients from "../hooks/useClients.jsx";
import useModalChrome from "../hooks/useModalChrome.jsx";
import useScheduleBlocks from "../hooks/useScheduleBlocks.jsx";
import useServices from "../hooks/useServices.jsx";
import { ROLE_BARBER, normalizeRole } from "../utils/auth.js";
import {
  formatCurrency,
  formatDateLabel,
  formatDuration,
  formatTimeLabel,
  normalizeServiceItem,
} from "../utils/appointments.js";
import { confirmDelete, confirmEditSave } from "../utils/confirmAction.js";

const statusToneMap = {
  PENDENTE: "border-l-amber-400 bg-amber-50/60",
  CONFIRMADO: "border-l-sky-400 bg-sky-50/60",
  CONCLUIDO: "border-l-emerald-400 bg-emerald-50/60",
  CANCELADO: "border-l-rose-400 bg-rose-50/60",
};

function getAppointmentBarberId(appointment) {
  return String(
    appointment.barber?.id ?? appointment.barberId ?? appointment.barber?.userId ?? "",
  );
}

function getBlockBarberId(block) {
  return String(block.barberId ?? block.barber?.id ?? "");
}

function getAppointmentKey(appointment, index = 0) {
  return String(
    appointment.id ??
      appointment._id ??
      `${appointment.appointmentDate || "date"}-${appointment.startTime || "time"}-${appointment.client?.name || appointment.clientName || index}`,
  );
}

function getBlockKey(block, index = 0) {
  return String(
    block.id ??
      block._id ??
      `${block.blockDate || "date"}-${block.startTime || "start"}-${block.title || "block"}-${index}`,
  );
}

function getStatusTone(status) {
  return statusToneMap[String(status || "PENDENTE").toUpperCase()] ?? statusToneMap.PENDENTE;
}

function getTodayDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthAnchor(dateKey) {
  if (!dateKey) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const parsed = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return new Date(parsed.getFullYear(), parsed.getMonth(), 1);
}

function shiftMonth(baseDate, amount) {
  return new Date(baseDate.getFullYear(), baseDate.getMonth() + amount, 1);
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildCalendarDays(monthDate) {
  const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const startWeekday = (start.getDay() + 6) % 7;
  const gridStart = new Date(start);
  gridStart.setDate(start.getDate() - startWeekday);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);

    return {
      key: formatDateKey(date),
      dayNumber: date.getDate(),
      inCurrentMonth: date.getMonth() === monthDate.getMonth(),
    };
  });
}

function buildWeekDays(dateKey) {
  const baseDate = dateKey ? new Date(`${dateKey}T00:00:00`) : new Date();
  const mondayOffset = (baseDate.getDay() + 6) % 7;
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() - mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    return {
      key: formatDateKey(date),
      dayLabel: new Intl.DateTimeFormat("pt-BR", { weekday: "short" })
        .format(date)
        .replace(".", ""),
      numberLabel: new Intl.DateTimeFormat("pt-BR", { day: "2-digit" }).format(date),
    };
  });
}

function formatMonthLabel(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getWeekEndKey(dateKey) {
  if (!dateKey) return "";
  const date = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() + (6 - day));
  return formatDateKey(date);
}

function timeToMinutes(value) {
  if (!value) return null;
  const match = String(value).match(/^(\d{2}):(\d{2})/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function minutesToTime(value) {
  const hours = String(Math.floor(value / 60)).padStart(2, "0");
  const minutes = String(value % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function getAppointmentEndMinutes(appointment) {
  const explicitEnd = timeToMinutes(appointment.endTime);
  if (explicitEnd != null) return explicitEnd;

  const start = timeToMinutes(appointment.startTime);
  const duration = Number(appointment.totalDuration || 0);

  if (start == null) return null;
  return start + Math.max(duration || 30, 30);
}

function getBlockStartMinutes(block) {
  return timeToMinutes(block.startTime);
}

function getBlockEndMinutes(block) {
  return timeToMinutes(block.endTime);
}

function getTimelineWindow(appointments, blocks) {
  let min = 9 * 60;
  let max = 20 * 60;

  appointments.forEach((appointment) => {
    const start = timeToMinutes(appointment.startTime);
    const end = getAppointmentEndMinutes(appointment);

    if (start != null) min = Math.min(min, Math.floor(start / 30) * 30);
    if (end != null) max = Math.max(max, Math.ceil(end / 30) * 30);
  });

  blocks.forEach((block) => {
    const start = getBlockStartMinutes(block);
    const end = getBlockEndMinutes(block);

    if (start != null) min = Math.min(min, Math.floor(start / 30) * 30);
    if (end != null) max = Math.max(max, Math.ceil(end / 30) * 30);
  });

  return {
    start: Math.min(min, 9 * 60),
    end: Math.max(max, 20 * 60),
  };
}

function sortAppointmentsByStartTime(list) {
  return list.slice().sort((a, b) => String(a.startTime || "").localeCompare(String(b.startTime || "")));
}

function sortBlocksByStartTime(list) {
  return list.slice().sort((a, b) => String(a.startTime || "").localeCompare(String(b.startTime || "")));
}

function overlapsRange(items, start, end, getStart, getEnd) {
  return items.some((item) => {
    const itemStart = getStart(item);
    const itemEnd = getEnd(item);
    if (itemStart == null || itemEnd == null) return false;
    return start < itemEnd && end > itemStart;
  });
}

function AppointmentComposerModal({
  open,
  mode = "appointment",
  role,
  barbers,
  clients,
  clientsLoading,
  services,
  composer,
  setComposer,
  availableTimes,
  loadingTimes,
  onClose,
  onSubmit,
  onFinishAppointment,
  onDeleteAppointment,
  processingId,
  submitting,
  error,
  onNotice,
}) {
  useModalChrome(open);
  const modalBodyRef = useRef(null);
  const composerDateInputRef = useRef(null);

  const [servicePickerId, setServicePickerId] = useState("");
  const isBarber = role === ROLE_BARBER;
  const isBlockMode = mode === "block";
  const isEditingAppointment = !isBlockMode && Boolean(composer.appointmentId);
  const isEditingBlock = isBlockMode && Boolean(composer.blockId);
  const canLoadTimes = Boolean(isBlockMode || (composer.barberId && composer.serviceIds.length));
  const selectedServices = services.filter((service) =>
    composer.serviceIds.includes(String(service.id)),
  );
  const normalizedSelectedServices = selectedServices.map(normalizeServiceItem);
  const totalSelectedDuration = normalizedSelectedServices.reduce(
    (sum, service) => sum + Number(service.duration || 0),
    0,
  );
  const totalSelectedPrice = normalizedSelectedServices.reduce(
    (sum, service) => sum + Number(service.price || 0),
    0,
  );
  const weekdayOptions = [
    { value: "MONDAY", label: "Seg" },
    { value: "TUESDAY", label: "Ter" },
    { value: "WEDNESDAY", label: "Qua" },
    { value: "THURSDAY", label: "Qui" },
    { value: "FRIDAY", label: "Sex" },
    { value: "SATURDAY", label: "Sab" },
    { value: "SUNDAY", label: "Dom" },
  ];
  const timeOptions = Array.from(
    new Set([
      ...((!isBlockMode && isEditingAppointment && composer.time) ? [composer.time] : []),
      ...availableTimes,
    ].filter(Boolean)),
  );
  const timePlaceholder = isBlockMode
    ? ""
    : !composer.barberId
      ? "Selecione o profissional primeiro"
      : composer.serviceIds.length === 0
        ? "Selecione pelo menos 1 servico"
        : timeOptions.length === 0 && !loadingTimes
          ? "Nenhum horario disponivel"
          : "Selecione um horario";
  const composerTitle = isBlockMode
    ? isEditingBlock
      ? "Editar bloqueio"
      : "Criar bloqueio"
    : isEditingAppointment
      ? "Editar atendimento"
      : "Criar atendimento";

  useEffect(() => {
    if (!open) return;

    const frame = window.requestAnimationFrame(() => {
      if (modalBodyRef.current) {
        modalBodyRef.current.scrollTop = 0;
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open, isBlockMode, composer.appointmentId, composer.blockId]);

  if (!open) return null;

  return (
    <ModalPortal>
    <div
      data-modal-scroll="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/48 px-3 py-3 backdrop-blur-[2px] sm:px-6 sm:py-6"
      onClick={onClose}
    >
      <div className="flex min-h-full items-start justify-center">
        <form
          onSubmit={onSubmit}
          onClick={(event) => event.stopPropagation()}
          className={`flex w-full flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.22)] ${
            isBlockMode
              ? "max-w-[820px] max-h-[calc(100dvh-24px)] sm:max-h-[calc(100dvh-48px)]"
              : "max-w-[760px] max-h-[calc(100dvh-24px)] sm:max-h-[calc(100dvh-48px)]"
          }`}
        >
          <div className="border-b border-slate-200 px-5 py-3.5 sm:px-6 sm:py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#6d4cad]">
                  {isBlockMode ? "Novo bloqueio" : isEditingAppointment ? "Editar atendimento" : "Novo agendamento"}
                </p>
                <h3 className="text-[16px] font-semibold text-slate-950 sm:text-[17px]">
                  {composerTitle}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    tabIndex={-1}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      !isBlockMode ? "bg-white text-[#6d4cad] shadow-sm" : "text-slate-400"
                    }`}
                  >
                    Agendamento
                  </button>
                  <button
                    type="button"
                    tabIndex={-1}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      isBlockMode ? "bg-white text-[#6d4cad] shadow-sm" : "text-slate-400"
                    }`}
                  >
                    Bloqueio
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:text-rose-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={modalBodyRef}
            className="min-h-0 flex-1 overflow-y-auto px-5 py-3 sm:px-6 sm:py-4"
          >
            <div className="grid gap-5">
              {isBlockMode ? (
                <div className="grid gap-3 md:grid-cols-4">
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Data
                    <input
                      type="date"
                      value={composer.date}
                      onChange={(event) =>
                        setComposer((current) => ({
                          ...current,
                          date: event.target.value,
                          time: current.time,
                        }))
                      }
                      className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Horario inicial
                    <input
                      type="time"
                      value={composer.time}
                      onChange={(event) =>
                        setComposer((current) => ({ ...current, time: event.target.value }))
                      }
                      className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Horario final
                    <input
                      type="time"
                      value={composer.endTime}
                      onChange={(event) =>
                        setComposer((current) => ({ ...current, endTime: event.target.value }))
                      }
                      className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Profissional
                    <select
                      value={composer.barberId}
                      onChange={(event) =>
                        setComposer((current) => ({
                          ...current,
                          barberId: event.target.value,
                          time: "",
                        }))
                      }
                      disabled={isBarber}
                      className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10 disabled:bg-slate-50"
                    >
                      <option value="">Selecione o profissional</option>
                      {barbers.map((barber) => (
                        <option key={barber.id} value={String(barber.id)}>
                          {barber.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ) : (
                <>
                  <div className="grid gap-4">
                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      Cliente
                      <select
                        value={composer.clientId}
                        onChange={(event) =>
                          setComposer((current) => ({ ...current, clientId: event.target.value }))
                        }
                        className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10"
                      >
                        <option value="">
                          {clientsLoading ? "Carregando clientes..." : "Selecione o cliente"}
                        </option>
                        {clients.map((client) => (
                          <option key={client.id} value={String(client.id)}>
                            {client.name || client.fullName || `Cliente #${client.id}`}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
                      <label className="grid gap-2 text-sm font-medium text-slate-700">
                        Servicos
                        <select
                          value={servicePickerId}
                          onChange={(event) => {
                            const nextServiceId = event.target.value;
                            setServicePickerId(nextServiceId);

                            if (!nextServiceId) return;

                            if (composer.serviceIds.includes(nextServiceId)) {
                              onNotice?.("Esse servico ja esta selecionado.", "warning");
                              setServicePickerId("");
                              return;
                            }

                            setComposer((current) => ({
                              ...current,
                              serviceIds: [...current.serviceIds, nextServiceId],
                              time: "",
                              date: "",
                            }));
                            setServicePickerId("");
                          }}
                          className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10"
                        >
                          <option value="">Selecione o servico</option>
                          {services.map((service) => (
                            <option key={service.id} value={String(service.id)}>
                              {service.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <div className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <span className="uppercase tracking-[0.2em] text-[11px] text-slate-400">
                            Tempo total
                          </span>
                          <strong className="font-semibold text-slate-950">
                            {formatDuration(totalSelectedDuration)}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="uppercase tracking-[0.2em] text-[11px] text-slate-400">
                            Valor total
                          </span>
                          <strong className="font-semibold text-slate-950">
                            {formatCurrency(totalSelectedPrice)}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {selectedServices.length ? (
                      <div className="space-y-2">
                        {selectedServices.map((service) => (
                          <div
                            key={service.id}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900">{service.name}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                {service.duration || 0} min
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setComposer((current) => ({
                                  ...current,
                                  serviceIds: current.serviceIds.filter(
                                    (id) => id !== String(service.id),
                                  ),
                                  time: "",
                                  date: "",
                                }))
                              }
                              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:text-rose-500"
                            >
                              Remover
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="grid gap-3 border-t border-slate-200 pt-5 md:grid-cols-3">
                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      Data
                      <div className="relative">
                        <input
                          ref={composerDateInputRef}
                          type="date"
                          value={composer.date}
                          min={getTodayDateKey()}
                          onChange={(event) =>
                            setComposer((current) => ({
                              ...current,
                              date: event.target.value,
                              time: "",
                            }))
                          }
                          className="pointer-events-none absolute opacity-0"
                          tabIndex={-1}
                          aria-hidden="true"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (composerDateInputRef.current) {
                              composerDateInputRef.current.focus();
                              if (typeof composerDateInputRef.current.showPicker === "function") {
                                composerDateInputRef.current.showPicker();
                              }
                            }
                          }}
                          className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-left text-slate-900 outline-none transition hover:border-[#6d4cad]/35 focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10"
                          aria-label="Abrir calendario"
                        >
                          <span className={composer.date ? "text-slate-900" : "text-slate-400"}>
                            {composer.date ? formatDateLabel(composer.date) : "Selecione a data"}
                          </span>
                          <CalendarDays className="h-4 w-4 text-slate-400" />
                        </button>
                      </div>
                    </label>

                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      Horario
                      <select
                        value={composer.time}
                        onChange={(event) =>
                          setComposer((current) => ({ ...current, time: event.target.value }))
                        }
                        disabled={!canLoadTimes || loadingTimes}
                        className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10 disabled:bg-slate-50"
                      >
                        <option value="">{timePlaceholder}</option>
                        {timeOptions.map((time) => (
                          <option key={time} value={time}>
                            {formatTimeLabel(time)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      Profissional
                      <select
                        value={composer.barberId}
                        onChange={(event) =>
                          setComposer((current) => ({
                            ...current,
                            barberId: event.target.value,
                            time: "",
                            date: "",
                          }))
                        }
                        disabled={isBarber}
                        className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10 disabled:bg-slate-50"
                      >
                        <option value="">Selecione o profissional</option>
                        {barbers.map((barber) => (
                          <option key={barber.id} value={String(barber.id)}>
                            {barber.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="grid gap-4 border-t border-slate-200 pt-5">
                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      Observacoes
                      <textarea
                        rows={3}
                        value={composer.notes}
                        onChange={(event) =>
                          setComposer((current) => ({ ...current, notes: event.target.value }))
                        }
                        placeholder="Observacoes do atendimento"
                        className="min-h-[88px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10"
                      />
                    </label>
                  </div>
                </>
              )}

              {isBlockMode ? (
                <div className="grid gap-4 border-t border-slate-200 pt-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      Titulo
                      <input
                        type="text"
                        value={composer.title}
                        onChange={(event) =>
                          setComposer((current) => ({ ...current, title: event.target.value }))
                        }
                        placeholder="Ex.: Almoco, reuniao, folga"
                        className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10"
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-1">
                      Observacoes
                      <input
                        type="text"
                        value={composer.notes}
                        onChange={(event) =>
                          setComposer((current) => ({ ...current, notes: event.target.value }))
                        }
                        placeholder="Detalhes do bloqueio"
                        className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10"
                      />
                    </label>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                      <label className="grid gap-2 text-sm font-medium text-slate-700">
                        Inicio
                        <input
                          type="date"
                          value={composer.repeatStart}
                          onChange={(event) =>
                            setComposer((current) => ({ ...current, repeatStart: event.target.value }))
                          }
                          className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10"
                        />
                      </label>

                      <label className="grid gap-2 text-sm font-medium text-slate-700">
                        Fim
                        <input
                          type="date"
                          value={composer.repeatUntil}
                          onChange={(event) =>
                            setComposer((current) => ({ ...current, repeatUntil: event.target.value }))
                          }
                          className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10"
                        />
                      </label>

                      <label className="grid gap-2 text-sm font-medium text-slate-700">
                        Base
                        <input
                          type="date"
                          value={composer.date}
                          onChange={(event) =>
                            setComposer((current) => ({
                              ...current,
                              date: event.target.value,
                              repeatStart: current.repeatStart || event.target.value,
                            }))
                          }
                          className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10"
                        />
                      </label>
                  </div>

                  <div className="grid gap-2 text-sm font-medium text-slate-700">
                    <span>Repetir nos dias</span>
                    <div className="flex flex-wrap gap-2">
                      {weekdayOptions.map((weekday) => {
                        const selected = composer.repeatWeekdays.includes(weekday.value);

                        return (
                          <button
                            key={weekday.value}
                            type="button"
                            onClick={() => {
                              if (selected) {
                                onNotice?.("Esse dia da semana ja esta selecionado.", "warning");
                                return;
                              }

                              setComposer((current) => ({
                                ...current,
                                repeatWeekdays: [...current.repeatWeekdays, weekday.value],
                                repeatStart: current.repeatStart || current.date,
                                repeatUntil: current.repeatUntil || getWeekEndKey(current.date),
                              }));
                            }}
                            className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                              selected
                                ? "border-[#6d4cad]/20 bg-[#ede7fb] text-[#6d4cad]"
                                : "border-slate-200 bg-white text-slate-600 hover:border-[#6d4cad]/20 hover:text-[#6d4cad]"
                            }`}
                          >
                            {weekday.label}
                          </button>
                        );
                      })}
                    </div>

                    {composer.repeatWeekdays.length ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {weekdayOptions
                          .filter((weekday) => composer.repeatWeekdays.includes(weekday.value))
                          .map((weekday) => (
                            <button
                              key={`selected-${weekday.value}`}
                              type="button"
                              onClick={() =>
                                setComposer((current) => ({
                                  ...current,
                                  repeatWeekdays: current.repeatWeekdays.filter(
                                    (item) => item !== weekday.value,
                                  ),
                                }))
                              }
                              className="inline-flex items-center gap-2 rounded-full bg-[#ede7fb] px-3 py-1.5 text-xs font-semibold text-[#6d4cad]"
                            >
                              {weekday.label}
                              <span className="text-[10px]">x</span>
                            </button>
                          ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {error ? (
                <StatusBanner
                  type="error"
                  title={
                    isBlockMode
                      ? "Nao foi possivel salvar o bloqueio"
                      : "Nao foi possivel salvar o agendamento"
                  }
                  message={error}
                />
              ) : null}
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white px-5 py-3 sm:px-6 sm:py-4">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#6d4cad]/20 hover:text-[#6d4cad]"
              >
                Fechar
              </button>

              <div className="flex flex-wrap items-center justify-end gap-2">
                {isEditingAppointment ? (
                  <>
                    <button
                      type="button"
                      onClick={onFinishAppointment}
                      disabled={submitting || processingId === Number(composer.appointmentId)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-white text-emerald-600 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                      title="Concluir agendamento"
                    >
                      <Check className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={onDeleteAppointment}
                      disabled={submitting || processingId === Number(composer.appointmentId)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-500 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      title="Excluir agendamento"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                ) : null}

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !composer.barberId ||
                    !composer.date ||
                    !composer.time ||
                    (isBlockMode
                      ? !composer.endTime || !composer.title.trim()
                      : !composer.clientId || composer.serviceIds.length === 0)
                  }
                  className="inline-flex items-center justify-center rounded-xl bg-[#6d4cad] px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Salvando..."
                    : isBlockMode
                      ? composer.blockId
                        ? "Salvar alteracoes"
                        : "Salvar bloqueio"
                      : composer.appointmentId
                        ? "Salvar alteracoes"
                        : "Salvar agendamento"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
    </ModalPortal>
  );
}

function AppointmentDetailsModal({
  open,
  appointment,
  processing,
  onClose,
  onEdit,
  onFinish,
  onDelete,
}) {
  useModalChrome(open);

  if (!open || !appointment) return null;

  const clientName =
    appointment.client?.name ||
    appointment.clientName ||
    appointment.customerName ||
    "Cliente nao informado";
  const phone = appointment.client?.phone || appointment.clientPhone || "Nao informado";
  const services =
    (appointment.services || []).map((service) => service.name).join(" + ") ||
    "Servico nao informado";
  const endMinutes = getAppointmentEndMinutes(appointment);
  const endLabel = endMinutes != null ? minutesToTime(endMinutes) : appointment.endTime;
  const canFinish = String(appointment.status || "").toUpperCase() !== "CONCLUIDO";
  const statusLabel = String(appointment.status || "PENDENTE").toLowerCase();
  const detailRows = [
    {
      icon: Clock3,
      label: "Horario",
      value: `${formatTimeLabel(appointment.startTime)}${endLabel ? ` - ${formatTimeLabel(endLabel)}` : ""}`,
      accent: "text-slate-900",
    },
    {
      icon: CalendarDays,
      label: "Data",
      value: formatDateLabel(appointment.appointmentDate),
      accent: "text-slate-700",
    },
    {
      icon: UserRound,
      label: "Cliente",
      value: clientName,
      accent: "text-slate-900",
      extra: phone,
    },
    {
      icon: Scissors,
      label: "Servicos",
      value: services,
      accent: "text-slate-700",
      extra: `${formatDuration(appointment.totalDuration || 0)} • ${formatCurrency(appointment.totalPrice || 0)}`,
    },
    {
      icon: MessageCircle,
      label: "Observacoes",
      value: appointment.notes || "Sem observacoes",
      accent: "text-slate-700",
    },
    {
      icon: Wallet,
      label: "Status",
      value: statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1),
      accent: "text-slate-700",
    },
  ];

  return (
    <ModalPortal>
    <div
      data-modal-scroll="true"
      className="fixed inset-0 z-[65] overflow-y-auto bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center">
      <div
        className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[700px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.2)] sm:max-h-[calc(100dvh-3rem)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#6d4cad]">Atendimento</p>
              <h3 className="mt-2 text-[26px] font-semibold leading-none text-slate-950">{clientName}</h3>
              <p className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">
                {statusLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-[#6d4cad]/20 hover:text-[#6d4cad]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="border-b border-slate-200 px-6 py-4 sm:px-8">
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={onEdit}
              disabled={processing}
              className="inline-flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-[#6d4cad] transition hover:border-[#6d4cad]/25 hover:bg-[#f8f6ff] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Pencil className="h-5 w-5" />
              Editar
            </button>
            <button
              type="button"
              onClick={onFinish}
              disabled={!canFinish || processing}
              className="inline-flex flex-col items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 py-4 text-sm font-semibold text-emerald-600 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check className="h-5 w-5" />
              Concluir
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={processing}
              className="inline-flex flex-col items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-4 text-sm font-semibold text-rose-500 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="h-5 w-5" />
              Excluir
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 sm:px-8">
          <div className="divide-y divide-slate-200 rounded-[24px] border border-slate-200 bg-white">
            {detailRows.map((row) => {
              const Icon = row.icon;
              return (
                <div
                  key={row.label}
                  className="grid grid-cols-[36px_1fr_auto] items-start gap-4 px-5 py-5 sm:grid-cols-[40px_1fr_auto]"
                >
                  <div className="flex items-start justify-center pt-1">
                    <Icon className="h-5 w-5 text-[#6d4cad]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {row.label}
                    </p>
                    <p className={`mt-1 text-[15px] font-medium leading-6 ${row.accent}`}>
                      {row.value}
                    </p>
                    {row.extra ? <p className="mt-1 text-sm text-[#6d4cad]">{row.extra}</p> : null}
                  </div>
                  <ChevronRight className="mt-1 h-5 w-5 text-[#6d4cad]" />
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-200 px-6 py-4 sm:px-8">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex w-full items-center justify-center rounded-2xl border border-transparent bg-white px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#6d4cad] transition hover:bg-[#f8f6ff]"
          >
            Fechar
          </button>
        </div>
      </div>
      </div>
    </div>
    </ModalPortal>
  );
}
export default function AppointmentsPage() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const isBarber = role === ROLE_BARBER;

  const [selectedBarberId, setSelectedBarberId] = useState(isBarber ? String(user?.id || "") : "");
  const [selectedDate, setSelectedDate] = useState(getTodayDateKey());
  const [calendarMonth, setCalendarMonth] = useState(() => getMonthAnchor(getTodayDateKey()));
  const [selectedAppointmentKey, setSelectedAppointmentKey] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerMode, setComposerMode] = useState("appointment");
  const [uiNotice, setUiNotice] = useState(null);
  const [composer, setComposer] = useState({
    appointmentId: "",
    blockId: "",
    clientId: "",
    barberId: isBarber ? String(user?.id || "") : "",
    serviceIds: [],
    date: getTodayDateKey(),
    time: "",
    endTime: "",
    title: "Bloqueio",
    notes: "",
    repeatWeekdays: [],
    repeatStart: "",
    repeatUntil: "",
  });

  const { clients, loading: clientsLoading } = useClients();
  const { services, loading: loadingServices } = useServices();
  const normalizedServices = useMemo(() => services.map(normalizeServiceItem), [services]);

  const { barbers, loadingBarbers } = useAvailability();

  const { availableTimes, loadingTimes } = useAvailability({
    barberId: composer.barberId,
    serviceIds: composer.serviceIds,
    date: composer.date,
    appointmentId: composer.appointmentId || undefined,
  });

  const {
    appointments,
    loading,
    submitting,
    processingId,
    error,
    success,
    refetch,
    saveAppointment,
    updateAppointment,
    deleteAppointment,
    finishAppointment,
    clearError,
    clearSuccess,
  } = useAppointments({
    scope: isBarber ? "barber" : "admin",
    targetBarberId: isBarber ? user?.id : undefined,
  });

  const {
    blocks,
    loading: loadingBlocks,
    submitting: blocksSubmitting,
    error: blockError,
    success: blockSuccess,
    saveBlock,
    removeBlock,
    clearError: clearBlockError,
    clearSuccess: clearBlockSuccess,
  } = useScheduleBlocks({
    date: selectedDate,
    barberId: selectedBarberId || undefined,
    enabled: true,
  });

  useEffect(() => {
    if (isBarber && user?.id) {
      setSelectedBarberId(String(user.id));
      setComposer((current) => ({ ...current, barberId: String(user.id) }));
    }
  }, [isBarber, user?.id]);

  useEffect(() => {
    if (!uiNotice) return undefined;

    const timeout = window.setTimeout(() => setUiNotice(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [uiNotice]);

  useEffect(() => {
    setCalendarMonth(getMonthAnchor(selectedDate));
  }, [selectedDate]);

  const appointmentDatesSet = useMemo(
    () =>
      new Set([
        ...appointments.map((appointment) => appointment.appointmentDate).filter(Boolean),
        ...blocks.map((block) => block.blockDate).filter(Boolean),
      ]),
    [appointments, blocks],
  );

  const filteredByBarberAppointments = useMemo(() => {
    if (!selectedBarberId) return appointments;
    return appointments.filter(
      (appointment) => getAppointmentBarberId(appointment) === String(selectedBarberId),
    );
  }, [appointments, selectedBarberId]);

  const filteredAppointments = useMemo(
    () => filteredByBarberAppointments.filter((appointment) => appointment.appointmentDate === selectedDate),
    [filteredByBarberAppointments, selectedDate],
  );

  const filteredBlocks = useMemo(() => {
    const byDate = blocks.filter((block) => block.blockDate === selectedDate);
    if (!selectedBarberId) return byDate;
    return byDate.filter((block) => getBlockBarberId(block) === String(selectedBarberId));
  }, [blocks, selectedBarberId, selectedDate]);

  const selectedBarber = useMemo(
    () =>
      barbers.find((barber) => String(barber.id) === String(selectedBarberId)) ||
      (isBarber ? { id: user?.id, name: user?.name || "Barbeiro" } : null),
    [barbers, isBarber, selectedBarberId, user?.id, user?.name],
  );

  const timelineBarbers = useMemo(() => {
    if (selectedBarber) {
      return [
        {
          barberId: String(selectedBarber.id),
          barberName: selectedBarber.name,
          appointments: sortAppointmentsByStartTime(filteredAppointments),
          blocks: sortBlocksByStartTime(filteredBlocks),
        },
      ];
    }

    if (barbers.length) {
      return barbers.map((barber) => ({
        barberId: String(barber.id),
        barberName: barber.name,
        appointments: sortAppointmentsByStartTime(
          filteredAppointments.filter(
            (appointment) => getAppointmentBarberId(appointment) === String(barber.id),
          ),
        ),
        blocks: sortBlocksByStartTime(
          filteredBlocks.filter((block) => getBlockBarberId(block) === String(barber.id)),
        ),
      }));
    }

    return [];
  }, [barbers, filteredAppointments, filteredBlocks, selectedBarber]);

  const timelineWindow = useMemo(
    () => getTimelineWindow(filteredAppointments, filteredBlocks),
    [filteredAppointments, filteredBlocks],
  );

  const hourMarks = useMemo(() => {
    const list = [];
    for (let minutes = timelineWindow.start; minutes <= timelineWindow.end; minutes += 60) {
      list.push(minutes);
    }
    return list;
  }, [timelineWindow]);

  const slotMarks = useMemo(() => {
    const list = [];
    for (let minutes = timelineWindow.start; minutes < timelineWindow.end; minutes += 30) {
      list.push(minutes);
    }
    return list;
  }, [timelineWindow]);

  const weekDays = useMemo(() => buildWeekDays(selectedDate), [selectedDate]);
  const calendarDays = useMemo(() => buildCalendarDays(calendarMonth), [calendarMonth]);

  const pixelsPerMinute = 1.08;
  const boardHeight = Math.max((timelineWindow.end - timelineWindow.start) * pixelsPerMinute, 440);

  const showNotice = (message, tone = "info") => {
    setUiNotice({ message, tone });
  };

  useEffect(() => {
    if (!filteredAppointments.length) {
      setSelectedAppointmentKey("");
      return;
    }

    const firstKey = getAppointmentKey(filteredAppointments[0], 0);
    setSelectedAppointmentKey((current) => current || firstKey);
  }, [filteredAppointments]);

  const openComposer = ({
    barberId = "",
    date = selectedDate,
    time = "",
    mode = "appointment",
    block = null,
    appointment = null,
  } = {}) => {
    clearError();
    clearSuccess();
    clearBlockError();
    clearBlockSuccess();
    setComposerMode(mode);
    setMenuOpen(false);

    const effectiveDate = appointment?.appointmentDate || block?.blockDate || date;
    const effectiveTime = appointment?.startTime || block?.startTime || time;
    const startMinutes = timeToMinutes(effectiveTime);
    const appointmentServices = (appointment?.services || [])
      .map((service) => String(service.id ?? service.serviceId ?? ""))
      .filter(Boolean);

    setComposer({
      appointmentId: appointment?.id ? String(appointment.id) : "",
      blockId: block?.id ? String(block.id) : "",
      clientId: appointment?.client?.id
        ? String(appointment.client.id)
        : appointment?.clientId
          ? String(appointment.clientId)
          : "",
      barberId: String(
        appointment?.barber?.id ||
          appointment?.barberId ||
          block?.barberId ||
          barberId ||
          selectedBarberId ||
          barbers[0]?.id ||
          user?.id ||
          "",
      ),
      serviceIds: appointmentServices,
      date: effectiveDate,
      time: effectiveTime,
      endTime: block?.endTime || (startMinutes != null ? minutesToTime(startMinutes + 30) : ""),
      title: block?.title || "Bloqueio",
      notes: appointment?.notes || block?.notes || "",
      repeatWeekdays: [],
      repeatStart: block?.blockDate || effectiveDate,
      repeatUntil: "",
    });
    setComposerOpen(true);
  };

  const closeAppointmentDetails = () => setSelectedAppointment(null);

  const handleOpenAppointmentDetails = (appointment, key) => {
    setSelectedAppointmentKey(key);
    setSelectedAppointment(appointment);
  };

  const handleEditSelectedAppointment = () => {
    if (!selectedAppointment) return;
    closeAppointmentDetails();
    openComposer({ mode: "appointment", appointment: selectedAppointment });
  };

  const handleFinishSelectedAppointment = async () => {
    if (!selectedAppointment) return;
    try {
      await finishAppointment(selectedAppointment.id);
      closeAppointmentDetails();
    } catch {
      return;
    }
  };

  const handleDeleteSelectedAppointment = async () => {
    if (!selectedAppointment) return;
    const clientName = selectedAppointment.client?.name || selectedAppointment.clientName || selectedAppointment.customerName || "cliente";
    if (!confirmDelete(`o agendamento de "${clientName}"`)) return;
    try {
      await deleteAppointment(selectedAppointment.id);
      closeAppointmentDetails();
    } catch {
      return;
    }
  };

  const handleComposerSubmit = async (event) => {
    event.preventDefault();

    if (composerMode === "block") {
      if (composer.blockId && !confirmEditSave(`o bloqueio "${composer.title || "Bloqueio"}"`)) return;
      await saveBlock({
        id: composer.blockId ? Number(composer.blockId) : undefined,
        barberId: Number(composer.barberId),
        blockDate: composer.date,
        startTime: composer.time,
        endTime: composer.endTime,
        title: composer.title.trim(),
        notes: composer.notes.trim() || null,
        repeatWeekdays: composer.repeatWeekdays,
        repeatStart: composer.repeatStart || composer.date,
        repeatUntil: composer.repeatUntil || null,
      });
    } else {
      const appointmentPayload = {
        clientId: Number(composer.clientId),
        barberId: Number(composer.barberId),
        serviceIds: composer.serviceIds.map((id) => Number(id)),
        appointmentDate: composer.date,
        startTime: composer.time,
        notes: composer.notes,
      };

      if (composer.appointmentId) {
        const clientName =
          clients.find((client) => String(client.id) === String(composer.clientId))?.name || "cliente";
        if (!confirmEditSave(`o agendamento de "${clientName}"`)) return;
        await updateAppointment(Number(composer.appointmentId), appointmentPayload);
      } else {
        await saveAppointment(appointmentPayload);
      }
    }

    setComposerOpen(false);
  };

  return (
    <div className="space-y-6">
      {uiNotice ? (
        <div className="fixed right-5 top-5 z-[70]">
          <div
            className={`rounded-2xl border px-4 py-3 text-sm font-medium shadow-[0_12px_30px_rgba(15,23,42,0.14)] ${
              uiNotice.tone === "warning"
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            {uiNotice.message}
          </div>
        </div>
      ) : null}

      {success ? (
        <StatusBanner type="success" title="Agenda atualizada" message={success} />
      ) : null}

      {blockSuccess ? (
        <StatusBanner type="success" title="Bloqueio atualizado" message={blockSuccess} />
      ) : null}

      {error && !composerOpen ? (
        <StatusBanner
          type="error"
          title="Nao foi possivel concluir a acao"
          message={error}
        />
      ) : null}

      {blockError && !composerOpen ? (
        <StatusBanner
          type="error"
          title="Nao foi possivel concluir a acao de bloqueio"
          message={blockError}
        />
      ) : null}

      <section className="overflow-hidden rounded-[24px] border border-slate-200/90 bg-white shadow-[0_16px_40px_rgba(52,60,78,0.08)]">
        <div className="border-b border-slate-200 bg-[#f8fafc] px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="sr-only" htmlFor="appointments-professional-filter">
                Profissional
              </label>
              <select
                id="appointments-professional-filter"
                value={selectedBarberId}
                onChange={(event) => setSelectedBarberId(event.target.value)}
                disabled={loadingBarbers || isBarber}
                className="h-11 min-w-[180px] rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10 disabled:bg-slate-50"
              >
                {!isBarber ? (
                  <option value="">
                    {loadingBarbers ? "Carregando..." : "Todos"}
                  </option>
                ) : null}
                {(isBarber && selectedBarber ? [selectedBarber] : barbers).map((barber) => (
                  <option key={barber.id} value={String(barber.id)}>
                    {barber.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  clearError();
                  clearSuccess();
                  clearBlockError();
                  clearBlockSuccess();
                  refetch();
                }}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-[#6d4cad]/20 hover:text-[#6d4cad]"
                aria-label="Atualizar agenda"
                title="Atualizar agenda"
              >
                <RefreshCcw className="h-4 w-4" />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((current) => !current)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#6d4cad] text-white shadow-[0_14px_28px_rgba(109,76,173,0.18)] transition hover:brightness-105"
                  title="Criar novo item na agenda"
                >
                  <Plus className="h-5 w-5" />
                </button>

                {menuOpen ? (
                  <div className="absolute right-0 top-[calc(100%+0.75rem)] z-20 min-w-[230px] rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                    <button
                      type="button"
                      onClick={() => openComposer({ mode: "appointment" })}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-[#f8fafc] hover:text-[#6d4cad]"
                    >
                      <Plus className="h-4 w-4" />
                      Novo agendamento
                    </button>
                    <button
                      type="button"
                      onClick={() => openComposer({ mode: "block" })}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-[#f8fafc] hover:text-[#6d4cad]"
                    >
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm border border-current text-[10px]">
                        !
                      </span>
                      Novo bloqueio
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
            {weekDays.map((day) => {
              const isActive = day.key === selectedDate;
              const hasAppointments = appointmentDatesSet.has(day.key);
              const isToday = day.key === getTodayDateKey();

              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => {
                    if (day.key === selectedDate) {
                      showNotice("Esse dia ja esta selecionado.", "warning");
                      return;
                    }
                    setSelectedDate(day.key);
                  }}
                  className={`rounded-xl border px-3 py-2 text-left transition duration-200 ${
                    isActive
                      ? "border-[#6d4cad]/10 bg-gradient-to-r from-[#6d4cad] to-[#7b57c3] text-white shadow-[0_12px_24px_rgba(109,76,173,0.18)]"
                      : "border-slate-200 bg-[#f8fafc] text-slate-700 hover:-translate-y-0.5 hover:border-[#6d4cad]/20 hover:text-[#6d4cad] hover:shadow-[0_10px_20px_rgba(148,163,184,0.12)]"
                  }`}
                >
                  <p className={`text-[11px] uppercase tracking-[0.18em] ${isActive ? "text-white/80" : "text-slate-400"}`}>
                    {day.dayLabel}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <p className="text-base font-semibold">{day.numberLabel}</p>
                    {isToday ? (
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${isActive ? "bg-white/15 text-white" : "bg-[#ede7fb] text-[#6d4cad]"}`}>
                        Hoje
                      </span>
                    ) : hasAppointments ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#6d4cad]" />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-0 xl:grid-cols-[320px,minmax(0,1fr)]">
          <aside className="border-r border-slate-200 bg-[#fbfcfe] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#6d4cad]">
                  Calendario
                </p>
                <h2 className="mt-1.5 text-base font-semibold text-slate-900">
                  {formatMonthLabel(calendarMonth)}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCalendarMonth((current) => shiftMonth(current, -1))}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-[#6d4cad]/20 hover:text-[#6d4cad]"
                >
                  {"<"}
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarMonth((current) => shiftMonth(current, 1))}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-[#6d4cad]/20 hover:text-[#6d4cad]"
                >
                  {">"}
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map((weekday) => (
                <span key={weekday}>{weekday}</span>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-7 gap-1.5">
              {calendarDays.map((day) => {
                const isActive = day.key === selectedDate;
                const isToday = day.key === getTodayDateKey();
                const hasAppointments = appointmentDatesSet.has(day.key);

                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => {
                      if (day.key === selectedDate) {
                        showNotice("Esse dia ja esta selecionado.", "warning");
                        return;
                      }
                      setSelectedDate(day.key);
                    }}
                    className={`relative flex aspect-square items-center justify-center rounded-xl text-sm font-semibold transition duration-200 ${
                      isActive
                        ? "bg-[#6d4cad] text-white shadow-[0_10px_20px_rgba(109,76,173,0.18)]"
                        : "border border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-[#6d4cad]/20 hover:text-[#6d4cad] hover:shadow-[0_8px_16px_rgba(148,163,184,0.12)]"
                    } ${day.inCurrentMonth ? "" : "opacity-45"}`}
                  >
                    {day.dayNumber}
                    {hasAppointments && !isActive ? (
                      <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-[#6d4cad]" />
                    ) : null}
                    {isToday && !isActive ? (
                      <span className="absolute inset-1 rounded-lg border border-[#6d4cad]/25" />
                    ) : null}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setSelectedDate(getTodayDateKey())}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#6d4cad]/20 hover:text-[#6d4cad]"
            >
              Ir para hoje
            </button>
          </aside>

          <section className="min-w-0">
            <div className="border-b border-slate-200 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#6d4cad]">
                Agenda do dia
              </p>
              <h2 className="mt-1.5 text-base font-semibold text-slate-900 sm:text-lg">
                {formatDateLabel(selectedDate)}
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Clique em um horario vazio para abrir o agendamento diretamente da agenda.
              </p>
            </div>

            {loading || loadingServices || loadingBlocks ? (
              <div className="space-y-4 p-4">
                <SkeletonBlock className="h-24" />
                <SkeletonBlock className="h-[520px]" />
              </div>
            ) : !timelineBarbers.length ? (
              <div className="p-4">
                <EmptyState
                  compact
                  eyebrow="Sem profissionais"
                  title="Nenhum profissional disponivel"
                  description="Cadastre ou libere barbeiros para operar a agenda."
                />
              </div>
            ) : (
              <div className="overflow-auto">
                <div className="min-w-[760px]">
                  <div
                    className="grid border-b border-slate-200 bg-[#fbfcfe]"
                    style={{
                      gridTemplateColumns: `58px repeat(${timelineBarbers.length}, minmax(180px, 1fr))`,
                    }}
                  >
                    <div className="border-r border-slate-200 px-2 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Hora
                    </div>
                    {timelineBarbers.map((barber) => (
                      <div
                        key={barber.barberId}
                        className="border-r border-slate-200 px-3 py-2.5 last:border-r-0"
                      >
                        <p className="text-sm font-semibold text-slate-900">{barber.barberName}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {barber.appointments.length} atendimento(s) e {barber.blocks.length} bloqueio(s)
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="relative" style={{ height: `${boardHeight}px` }}>
                    <div className="absolute inset-0">
                      {hourMarks.map((mark) => {
                        const top = (mark - timelineWindow.start) * pixelsPerMinute;

                        return (
                          <div
                            key={mark}
                            className="absolute inset-x-0"
                            style={{ top: `${top}px` }}
                          >
                            <div className="flex">
                              <div className="w-[58px] border-r border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-400">
                                {minutesToTime(mark)}
                              </div>
                              <div className="h-px flex-1 bg-slate-200" />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div
                      className="absolute inset-0 grid"
                      style={{
                        gridTemplateColumns: `58px repeat(${timelineBarbers.length}, minmax(180px, 1fr))`,
                      }}
                    >
                      <div className="border-r border-slate-200 bg-white" />

                      {timelineBarbers.map((barber) => (
                        <div
                          key={barber.barberId}
                          className="group/column relative border-r border-slate-200 bg-white/40 transition-colors hover:bg-[#fafbfe] last:border-r-0"
                        >
                          {slotMarks.map((slotStart) => {
                            const slotEnd = slotStart + 30;
                            const top = (slotStart - timelineWindow.start) * pixelsPerMinute;
                            const busy =
                              overlapsRange(
                                barber.appointments,
                                slotStart,
                                slotEnd,
                                (appointment) => timeToMinutes(appointment.startTime),
                                getAppointmentEndMinutes,
                              ) ||
                              overlapsRange(
                                barber.blocks,
                                slotStart,
                                slotEnd,
                                getBlockStartMinutes,
                                getBlockEndMinutes,
                              );

                            if (busy) return null;

                            return (
                              <button
                                key={`${barber.barberId}-${slotStart}`}
                                type="button"
                                onClick={() =>
                                  openComposer({
                                    barberId: barber.barberId,
                                    date: selectedDate,
                                    time: minutesToTime(slotStart),
                                    mode: "appointment",
                                  })
                                }
                                className="absolute left-1.5 right-1.5 flex items-center justify-center rounded-lg border border-dashed border-slate-200/80 bg-white/60 text-slate-300 opacity-20 transition duration-200 group-hover/column:opacity-70 hover:border-[#6d4cad]/20 hover:bg-[#f8fafc] hover:text-[#6d4cad] hover:opacity-100 focus:opacity-100"
                                style={{
                                  top: `${top + 2}px`,
                                  height: `${Math.max(30 * pixelsPerMinute - 4, 28)}px`,
                                }}
                                title={`Agendar as ${minutesToTime(slotStart)}`}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            );
                          })}

                          {barber.blocks.map((block, index) => {
                            const start = getBlockStartMinutes(block);
                            const end = getBlockEndMinutes(block);
                            const key = getBlockKey(block, index);

                            if (start == null || end == null) return null;

                            const top = (start - timelineWindow.start) * pixelsPerMinute;
                            const height = Math.max((end - start) * pixelsPerMinute, 52);

                            return (
                              <div
                                key={key}
                                className="absolute left-1.5 right-1.5 overflow-hidden rounded-xl border border-amber-200 border-l-[4px] border-l-amber-500 bg-amber-50/90 px-2.5 py-2 text-left shadow-[0_8px_16px_rgba(52,60,78,0.08)]"
                                style={{
                                  top: `${top}px`,
                                  minHeight: `${height}px`,
                                }}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-700">
                                      {formatTimeLabel(block.startTime)} - {formatTimeLabel(block.endTime)}
                                    </p>
                                    <p className="mt-1 text-[13px] font-semibold text-slate-900">
                                      {block.title || "Bloqueio"}
                                    </p>
                                    <p className="mt-0.5 text-[11px] leading-4 text-slate-600">
                                      {block.notes || "Horario indisponivel para atendimento"}
                                    </p>
                                  </div>
                                  <div className="flex shrink-0 items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => openComposer({ mode: "block", block })}
                                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-amber-200 bg-white text-amber-600 transition hover:border-[#6d4cad]/20 hover:text-[#6d4cad]"
                                      title="Editar bloqueio"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (!confirmDelete(`o bloqueio "${block.title || "Bloqueio"}"`)) return;
                                        try {
                                          await removeBlock(block.id);
                                        } catch {
                                          return;
                                        }
                                      }}
                                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-amber-200 bg-white text-amber-600 transition hover:border-rose-200 hover:text-rose-500"
                                      title="Remover bloqueio"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {barber.appointments.map((appointment, index) => {
                            const start = timeToMinutes(appointment.startTime);
                            const end = getAppointmentEndMinutes(appointment);
                            const key = getAppointmentKey(appointment, index);

                            if (start == null || end == null) return null;

                            const top = (start - timelineWindow.start) * pixelsPerMinute;
                            const height = Math.max((end - start) * pixelsPerMinute, 58);
                            const statusTone = getStatusTone(appointment.status);
                            const active = selectedAppointmentKey === key;
                            const clientName =
                              appointment.client?.name ||
                              appointment.clientName ||
                              appointment.customerName ||
                              "Cliente nao informado";

                            return (
                              <div
                                key={key}
                                onClick={() => {
                                  handleOpenAppointmentDetails(appointment, key);
                                }}
                                className={`absolute left-1.5 right-1.5 cursor-pointer overflow-hidden rounded-xl border border-slate-200 border-l-[4px] px-2.5 py-2 text-left shadow-[0_8px_16px_rgba(52,60,78,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_20px_rgba(52,60,78,0.12)] ${statusTone} ${active ? "ring-2 ring-[#6d4cad]/20 shadow-[0_14px_28px_rgba(109,76,173,0.14)]" : ""}`}
                                style={{
                                  top: `${top}px`,
                                  minHeight: `${height}px`,
                                }}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                                      {formatTimeLabel(appointment.startTime)}
                                      {end ? ` - ${minutesToTime(end)}` : ""}
                                    </p>
                                    <p className="mt-1 text-[13px] font-semibold text-slate-900">
                                      {clientName}
                                    </p>
                                    <p className="mt-0.5 text-[11px] leading-4 text-slate-600">
                                      {(appointment.services || []).map((service) => service.name).join(" + ") || "Servico"}
                                    </p>
                                  </div>

                                  <div className="flex shrink-0 items-center gap-1">
                                    <span className="rounded-full bg-white/85 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                                      Ver detalhes
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </section>

      <AppointmentDetailsModal
        open={Boolean(selectedAppointment)}
        appointment={selectedAppointment}
        processing={processingId === selectedAppointment?.id}
        onClose={closeAppointmentDetails}
        onEdit={handleEditSelectedAppointment}
        onFinish={handleFinishSelectedAppointment}
        onDelete={handleDeleteSelectedAppointment}
      />

      <AppointmentComposerModal
        open={composerOpen}
        mode={composerMode}
        role={role}
        barbers={isBarber && selectedBarber ? [selectedBarber] : barbers}
        clients={clients}
        clientsLoading={clientsLoading}
        services={normalizedServices}
        composer={composer}
        setComposer={setComposer}
        availableTimes={availableTimes}
        loadingTimes={loadingTimes}
        onClose={() => setComposerOpen(false)}
        onSubmit={handleComposerSubmit}
        onFinishAppointment={handleFinishSelectedAppointment}
        onDeleteAppointment={handleDeleteSelectedAppointment}
        processingId={processingId}
        submitting={submitting || blocksSubmitting}
        error={composerMode === "block" ? blockError : error}
        onNotice={showNotice}
      />
    </div>
  );
}
































