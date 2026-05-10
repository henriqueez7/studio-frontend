import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarPlus,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import AvailableDateSelect from "../components/appointments/AvailableDateSelect.jsx";
import AvailableTimeSelect from "../components/appointments/AvailableTimeSelect.jsx";
import BarberSelect from "../components/appointments/BarberSelect.jsx";
import ServiceMultiSelect from "../components/appointments/ServiceMultiSelect.jsx";
import StatusBanner from "../components/ui/StatusBanner.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import useAppointments from "../hooks/useAppointments.jsx";
import useAvailability from "../hooks/useAvailability.jsx";
import useServices from "../hooks/useServices.jsx";
import { ROLE_ADMIN, ROLE_BARBER, normalizeRole } from "../utils/auth.js";
import {
  formatCurrency,
  formatDateLabel,
  formatDuration,
  formatTimeLabel,
  normalizeServiceItem,
} from "../utils/appointments.js";

const appointmentSchema = z.object({
  clientId: z.string().optional(),
  barberId: z.string().min(1, "Selecione um barbeiro."),
  serviceIds: z.array(z.string()).min(1, "Selecione pelo menos um serviço."),
  appointmentDate: z.string().min(1, "Selecione uma data disponível."),
  startTime: z.string().min(1, "Selecione um horário disponível."),
  notes: z
    .string()
    .max(500, "As observações devem ter no máximo 500 caracteres.")
    .optional(),
});

const sectionClass =
  "overflow-hidden rounded-[26px] border border-slate-200 bg-white text-slate-800 shadow-[0_18px_40px_rgba(15,23,42,0.08)]";

export default function AgendarPage() {
  const [servicesExpanded, setServicesExpanded] = useState(false);
  const [datesExpanded, setDatesExpanded] = useState(false);
  const [timesExpanded, setTimesExpanded] = useState(false);
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const isBarber = role === ROLE_BARBER;
  const isAdmin = role === ROLE_ADMIN;
  const requiresClientId = isBarber || isAdmin;

  const { services, loading: servicesLoading, error: servicesError } = useServices();
  const {
    submitting,
    error,
    success,
    saveAppointment,
    clearError,
    clearSuccess,
  } = useAppointments({
    scope: isBarber ? "barber" : isAdmin ? "admin" : "client",
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    resetField,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    mode: "onChange",
    defaultValues: {
      clientId: "",
      barberId: isBarber ? String(user?.id || "") : "",
      serviceIds: [],
      appointmentDate: "",
      startTime: "",
      notes: "",
    },
  });

  const selectedClientId = watch("clientId");
  const selectedBarberId = watch("barberId");
  const selectedServiceIds = watch("serviceIds");
  const selectedDate = watch("appointmentDate");
  const selectedTime = watch("startTime");
  const effectiveBarberId = isBarber ? String(user?.id || "") : selectedBarberId;
  const canChooseServices = Boolean(effectiveBarberId);
  const canChooseDate = canChooseServices && selectedServiceIds.length > 0;
  const canChooseTime = Boolean(selectedDate);
  const {
    barbers,
    availableDates,
    availableTimes,
    loadingBarbers,
    loadingDates,
    loadingTimes,
    error: availabilityError,
    clearError: clearAvailabilityError,
  } = useAvailability({
    barberId: effectiveBarberId,
    serviceIds: selectedServiceIds,
    date: selectedDate,
  });

  const normalizedServices = useMemo(
    () => services.map(normalizeServiceItem),
    [services],
  );

  const selectedServices = useMemo(
    () =>
      normalizedServices.filter((service) =>
        selectedServiceIds.includes(String(service.id)),
      ),
    [normalizedServices, selectedServiceIds],
  );
  const totalSelectedDuration = useMemo(
    () => selectedServices.reduce((sum, service) => sum + Number(service.duration || 0), 0),
    [selectedServices],
  );
  const totalSelectedPrice = useMemo(
    () => selectedServices.reduce((sum, service) => sum + Number(service.price || 0), 0),
    [selectedServices],
  );

  useEffect(() => {
    if (isBarber && user?.id) {
      setValue("barberId", String(user.id), {
        shouldValidate: true,
        shouldDirty: false,
      });
    }
  }, [isBarber, setValue, user?.id]);

  useEffect(() => {
    resetField("appointmentDate");
    resetField("startTime");
    clearAvailabilityError();
  }, [effectiveBarberId, selectedServiceIds, resetField, clearAvailabilityError]);

  useEffect(() => {
    resetField("startTime");
  }, [selectedDate, resetField]);

  useEffect(() => {
    if (!canChooseServices) {
      setServicesExpanded(false);
      return;
    }

    if (selectedServiceIds.length > 0 || errors.serviceIds?.message) {
      setServicesExpanded(true);
    }
  }, [canChooseServices, selectedServiceIds.length, errors.serviceIds?.message]);

  useEffect(() => {
    if (!canChooseDate) {
      setDatesExpanded(false);
      return;
    }

    if (selectedDate || errors.appointmentDate?.message) {
      setDatesExpanded(true);
    }
  }, [canChooseDate, selectedDate, errors.appointmentDate?.message]);

  useEffect(() => {
    if (!canChooseTime) {
      setTimesExpanded(false);
      return;
    }

    if (selectedTime || errors.startTime?.message) {
      setTimesExpanded(true);
    }
  }, [canChooseTime, selectedTime, errors.startTime?.message]);

  const toggleService = (serviceId) => {
    const current = selectedServiceIds || [];
    const exists = current.includes(serviceId);
    const next = exists
      ? current.filter((item) => item !== serviceId)
      : [...current, serviceId];

    setValue("serviceIds", next, { shouldValidate: true, shouldDirty: true });
    clearError();
    clearSuccess();
  };

  const onSubmit = async (data) => {
    clearError();
    clearSuccess();

    if (requiresClientId && !data.clientId) {
      setError("clientId", {
        type: "manual",
        message: "Informe o ID do cliente para continuar.",
      });
      return;
    }

    await saveAppointment({
      clientId: requiresClientId ? Number(data.clientId) : user?.id,
      barberId: Number(effectiveBarberId),
      serviceIds: data.serviceIds.map((id) => Number(id)),
      appointmentDate: data.appointmentDate,
      startTime: data.startTime,
      notes: data.notes,
    });
  };

  const disableSubmit =
    !isValid ||
    submitting ||
    servicesLoading ||
    loadingBarbers ||
    loadingDates ||
    loadingTimes ||
    !effectiveBarberId ||
    (requiresClientId && !selectedClientId);

  return (
    <div className="space-y-5 lg:space-y-8">
      <section>
        <form onSubmit={handleSubmit(onSubmit)} className={`${sectionClass} p-4 sm:p-8`}>
          <div className="flex items-start gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ede7fb] text-[#6d4cad] sm:h-12 sm:w-12">
              <CalendarPlus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[#6d4cad]">
                Novo agendamento
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900 sm:text-xl">
                {requiresClientId
                  ? "Monte um horário para o cliente"
                  : "Monte seu horário no studio"}
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:mt-8 sm:gap-6">
            {requiresClientId ? (
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                ID do cliente
                <input
                  type="number"
                  min="1"
                  inputMode="numeric"
                  placeholder="Ex.: 5"
                  {...register("clientId")}
                  onChange={(event) => {
                    setValue("clientId", event.target.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                    clearErrors("clientId");
                    clearError();
                    clearSuccess();
                  }}
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-[#6d4cad]/30 focus:ring-2 focus:ring-[#6d4cad]/10"
                />
                {errors.clientId ? (
                  <span className="text-sm text-rose-400">{errors.clientId.message}</span>
                ) : null}
              </label>
            ) : null}

            {!isBarber ? (
              <BarberSelect
                barbers={barbers}
                value={selectedBarberId}
                onChange={(value) => {
                  setValue("barberId", value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                  clearError();
                  clearSuccess();
                }}
                loading={loadingBarbers}
                error={errors.barberId?.message}
              />
            ) : (
              <div className="rounded-[24px] border border-slate-200 bg-[#f8fafc] p-4 sm:p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-[#6d4cad]">
                  Barbeiro responsavel
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-900">
                  {user?.name || "Barbeiro"}
                </p>
              </div>
            )}

            {canChooseServices ? (
            <div className="grid gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-700">Serviços</p>
              </div>
              <button
                type="button"
                onClick={() => setServicesExpanded((current) => !current)}
                className="flex w-full items-center justify-between gap-3 rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-left text-slate-900 shadow-[0_10px_22px_rgba(15,23,42,0.04)] transition hover:border-[#6d4cad]/25 focus:outline-none focus:ring-2 focus:ring-[#6d4cad]/10"
                aria-expanded={servicesExpanded}
                aria-controls="services-panel"
              >
                <span className="text-sm text-slate-500">
                  {selectedServiceIds.length > 0
                    ? `${selectedServiceIds.length} serviço(s) selecionado(s)`
                    : "Selecionar serviços"}
                </span>
                <span className="inline-flex items-center gap-2">
                  {selectedServiceIds.length > 0 ? (
                    <span className="inline-flex min-w-[2rem] items-center justify-center rounded-full bg-[#ede7fb] px-2.5 py-1 text-xs font-semibold text-[#6d4cad]">
                      {selectedServiceIds.length}
                    </span>
                  ) : null}
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f8fafc] text-slate-500">
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${servicesExpanded ? "rotate-180" : ""}`}
                    />
                  </span>
                </span>
              </button>

              {servicesExpanded ? (
                <div id="services-panel" className="rounded-[24px] border border-slate-200 bg-[#f8fafc] p-3 sm:p-4">
                  <ServiceMultiSelect
                    services={normalizedServices}
                    selectedIds={selectedServiceIds}
                    onToggle={toggleService}
                    disabled={servicesLoading}
                    error={errors.serviceIds?.message || servicesError}
                  />
                </div>
              ) : null}

              {selectedServices.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[24px] border border-slate-200 bg-[#f8fafc] px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Tempo total
                    </p>
                    <p className="mt-2 text-base font-semibold text-slate-900">
                      {formatDuration(totalSelectedDuration)}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-slate-200 bg-[#f8fafc] px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Valor total
                    </p>
                    <p className="mt-2 text-base font-semibold text-slate-900">
                      {formatCurrency(totalSelectedPrice)}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!canChooseDate) return;
                    setDatesExpanded((current) => !current);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-[24px] border px-4 py-3 text-left shadow-[0_10px_22px_rgba(15,23,42,0.04)] transition focus:outline-none focus:ring-2 focus:ring-[#6d4cad]/10 ${
                    canChooseDate
                      ? "border-slate-200 bg-white text-slate-900 hover:border-[#6d4cad]/25"
                      : "border-dashed border-slate-200 bg-[#f8fafc] text-slate-500"
                  }`}
                  aria-expanded={datesExpanded}
                  aria-controls="dates-panel"
                  disabled={!canChooseDate}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">Data disponível</p>
                    <p className="mt-1 text-sm">
                      {selectedDate
                        ? formatDateLabel(selectedDate)
                        : canChooseDate
                          ? "Toque para ver as datas livres"
                          : "Escolha os serviços para liberar as datas"}
                    </p>
                  </div>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f8fafc] text-slate-500">
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${datesExpanded ? "rotate-180" : ""}`}
                    />
                  </span>
                </button>

                {datesExpanded ? (
                  <div id="dates-panel" className="rounded-[24px] border border-slate-200 bg-[#f8fafc] p-3 sm:p-4">
                    <AvailableDateSelect
                      dates={availableDates}
                      value={selectedDate}
                      onChange={(value) => {
                        setValue("appointmentDate", value, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        setDatesExpanded(false);
                        setTimesExpanded(true);
                        clearError();
                        clearSuccess();
                      }}
                      loading={loadingDates}
                      disabled={!canChooseDate}
                      error={errors.appointmentDate?.message}
                    />
                  </div>
                ) : null}
              </div>

              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!canChooseTime) return;
                    setTimesExpanded((current) => !current);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-[24px] border px-4 py-3 text-left shadow-[0_10px_22px_rgba(15,23,42,0.04)] transition focus:outline-none focus:ring-2 focus:ring-[#6d4cad]/10 ${
                    canChooseTime
                      ? "border-slate-200 bg-white text-slate-900 hover:border-[#6d4cad]/25"
                      : "border-dashed border-slate-200 bg-[#f8fafc] text-slate-500"
                  }`}
                  aria-expanded={timesExpanded}
                  aria-controls="times-panel"
                  disabled={!canChooseTime}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">Horário disponível</p>
                    <p className="mt-1 text-sm">
                      {selectedTime
                        ? formatTimeLabel(selectedTime)
                        : canChooseTime
                          ? "Toque para ver os horários livres"
                          : "Escolha uma data para liberar os horários"}
                    </p>
                  </div>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f8fafc] text-slate-500">
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${timesExpanded ? "rotate-180" : ""}`}
                    />
                  </span>
                </button>

                {timesExpanded ? (
                  <div id="times-panel" className="rounded-[24px] border border-slate-200 bg-[#f8fafc] p-3 sm:p-4">
                    <AvailableTimeSelect
                      times={availableTimes}
                      value={selectedTime}
                      onChange={(value) => {
                        setValue("startTime", value, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        clearError();
                        clearSuccess();
                      }}
                      loading={loadingTimes}
                      disabled={!canChooseTime}
                      error={errors.startTime?.message}
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Observações
              <textarea
                rows={4}
                placeholder="Se quiser, deixe alguma observação para o atendimento"
                className="rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-[#6d4cad]/30 focus:ring-2 focus:ring-[#6d4cad]/10"
                {...register("notes")}
              />
              {errors.notes ? (
                <span className="text-sm text-rose-400">{errors.notes.message}</span>
              ) : null}
            </label>
          </div>

          {availabilityError ? (
            <StatusBanner
              className="mt-5"
              type="error"
              title="Falha ao consultar disponibilidade"
              message={availabilityError}
            />
          ) : null}

          {error ? (
            <StatusBanner
              className="mt-5"
              type="error"
              title="Não foi possível confirmar o agendamento"
              message={error}
            />
          ) : null}

          {success ? (
            <StatusBanner
              className="mt-5"
              type="success"
              title="Agendamento confirmado"
              message={success}
            />
          ) : null}

          <button
            type="submit"
            disabled={disableSubmit}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#6d4cad] px-5 py-3.5 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? "Confirmando..." : "Confirmar agendamento"}
          </button>
        </form>
      </section>
    </div>
  );
}



