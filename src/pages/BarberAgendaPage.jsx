import {
  CalendarRange,
  CheckCircle2,
  RefreshCcw,
  XCircle,
} from "lucide-react";
import AgendaAvailabilityPanel from "../components/appointments/AgendaAvailabilityPanel.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import PageIntro from "../components/ui/PageIntro.jsx";
import SectionCard from "../components/ui/SectionCard.jsx";
import SkeletonBlock from "../components/ui/SkeletonBlock.jsx";
import StatusBanner from "../components/ui/StatusBanner.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import useAppointments from "../hooks/useAppointments.jsx";
import useBarberAvailability from "../hooks/useBarberAvailability.jsx";
import {
  formatCurrency,
  formatDateLabel,
  formatDuration,
  formatTimeLabel,
} from "../utils/appointments.js";

const statusToneMap = {
  PENDENTE: "border-amber-200 bg-amber-50 text-amber-700",
  CONFIRMADO: "border-sky-200 bg-sky-50 text-sky-700",
  CONCLUIDO: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CANCELADO: "border-rose-200 bg-rose-50 text-rose-700",
};

function getStatusLabel(status) {
  const normalized = String(status || "PENDENTE").toUpperCase();

  if (normalized === "CONFIRMADO") return "Confirmado";
  if (normalized === "CONCLUIDO") return "Concluído";
  if (normalized === "CANCELADO") return "Cancelado";
  return "Pendente";
}

function getStatusTone(status) {
  return statusToneMap[String(status || "PENDENTE").toUpperCase()] ?? statusToneMap.PENDENTE;
}

function getAvailableActions(status) {
  const normalized = String(status || "PENDENTE").toUpperCase();

  if (normalized === "PENDENTE") return ["confirm", "finish", "cancel"];
  if (normalized === "CONFIRMADO") return ["finish", "cancel"];
  return [];
}

export default function BarberAgendaPage() {
  const { user } = useAuth();
  const barberId = user?.id;
  const {
    appointments,
    loading,
    error,
    success,
    processingId,
    refetch,
    confirmAppointment,
    cancelAppointment,
    finishAppointment,
    clearError,
    clearSuccess,
  } = useAppointments({
    scope: "barber",
    targetBarberId: barberId,
  });
  const {
    items: availability,
    loading: loadingAvailability,
    error: availabilityError,
    refetch: refetchAvailability,
  } = useBarberAvailability(barberId);

  const handleRefresh = () => {
    clearError();
    clearSuccess();
    refetch();
    refetchAvailability();
  };

  const handleStatusAction = async (appointmentId, action) => {
    if (action === "confirm") {
      await confirmAppointment(appointmentId);
      return;
    }

    if (action === "finish") {
      await finishAppointment(appointmentId);
      return;
    }

    await cancelAppointment(appointmentId);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        actions={
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#6d4cad]/20 hover:text-[#6d4cad]"
          >
            <RefreshCcw className="h-4 w-4" />
            Atualizar agenda
          </button>
        }
      >
        <PageIntro
          eyebrow="Área do barbeiro"
          title="Agenda do barbeiro."
          description="Veja seus horários, confirme clientes, conclua atendimentos realizados e alimente a receita do dashboard quando o serviço for finalizado."
        />
      </PageHeader>

      {success ? (
        <StatusBanner type="success" title="Agenda atualizada" message={success} />
      ) : null}

      {error ? (
        <StatusBanner
          type="error"
          title="Não foi possível concluir a ação"
          message={error}
        />
      ) : null}

      {loadingAvailability ? (
        <SectionCard>
          <div className="space-y-4">
            <SkeletonBlock className="h-16" />
            <SkeletonBlock className="h-40" />
          </div>
        </SectionCard>
      ) : availabilityError ? (
        <ErrorState
          title="Não foi possível carregar a disponibilidade"
          message={availabilityError}
        />
      ) : (
        <AgendaAvailabilityPanel
          title="Disponibilidade da semana"
          description="A leitura abaixo cruza sua disponibilidade configurada com os atendimentos já reservados, deixando claro o que está livre e o que já foi ocupado."
          availabilities={availability}
          appointments={appointments}
          emptyMessage="Você ainda não configurou blocos de atendimento. Defina sua disponibilidade para refletir isso aqui na agenda."
        />
      )}

      <SectionCard>
        {loading ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-64" lines={4} />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <EmptyState
            eyebrow="Sem atendimentos"
            title="Nenhum atendimento encontrado"
            description="Quando novos clientes confirmarem horários com você, eles aparecerão aqui."
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {appointments.map((appointment, index) => {
              const status = appointment.status || "PENDENTE";
              const actions = getAvailableActions(status);
              const isProcessing = processingId === appointment.id;

              return (
                <article
                  key={appointment.id ?? appointment._id ?? index}
                  className="rounded-[28px] border border-slate-200 bg-[#eef2f7] p-5 shadow-[0_14px_32px_rgba(56,65,84,0.05)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-[#6d4cad]">
                        {formatDateLabel(appointment.appointmentDate)}
                      </p>
                      <h2 className="mt-3 text-xl font-semibold text-slate-900">
                        {appointment.client?.name ||
                          appointment.clientName ||
                          appointment.customerName ||
                          "Cliente"}
                      </h2>
                    </div>
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#6d4cad] shadow-sm">
                      <CalendarRange className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-5 space-y-2 text-sm text-slate-600">
                    <p>
                      <strong className="text-slate-900">Serviços:</strong>{" "}
                      {(appointment.services || [])
                        .map((service) => service.name)
                        .join(" + ") || "Serviço"}
                    </p>
                    <p>
                      <strong className="text-slate-900">Horário:</strong>{" "}
                      {formatTimeLabel(appointment.startTime)}
                      {appointment.endTime
                        ? ` - ${formatTimeLabel(appointment.endTime)}`
                        : ""}
                    </p>
                    <p>
                      <strong className="text-slate-900">Duração:</strong>{" "}
                      {formatDuration(appointment.totalDuration)}
                    </p>
                    <p>
                      <strong className="text-slate-900">Valor:</strong>{" "}
                      {formatCurrency(appointment.totalPrice)}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getStatusTone(status)}`}
                    >
                      {getStatusLabel(status)}
                    </span>

                    {actions.length ? (
                      <div className="flex flex-wrap gap-2">
                        {actions.includes("confirm") ? (
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleStatusAction(appointment.id, "confirm")}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Confirmar
                          </button>
                        ) : null}

                        {actions.includes("finish") ? (
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleStatusAction(appointment.id, "finish")}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Concluir
                          </button>
                        ) : null}

                        {actions.includes("cancel") ? (
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleStatusAction(appointment.id, "cancel")}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <XCircle className="h-4 w-4" />
                            Cancelar
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
