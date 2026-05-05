import { CalendarCheck, RefreshCcw } from "lucide-react";
import EmptyState from "../components/ui/EmptyState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import PageIntro from "../components/ui/PageIntro.jsx";
import SectionCard from "../components/ui/SectionCard.jsx";
import SkeletonBlock from "../components/ui/SkeletonBlock.jsx";
import useAppointments from "../hooks/useAppointments.jsx";
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

export default function MyAppointmentsPage() {
  const { appointments, loading, error, refetch } = useAppointments({
    scope: "client",
  });

  return (
    <div className="space-y-8">
      <PageHeader
        actions={
          <button
            type="button"
            onClick={refetch}
            className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#6d4cad]/20 hover:text-[#6d4cad]"
          >
            <RefreshCcw className="h-4 w-4" />
            Atualizar
          </button>
        }
      >
        <PageIntro
          eyebrow="Área do cliente"
          title="Meus agendamentos."
          description="Acompanhe cada atendimento com serviços, horário, duração, valor total e status atualizado."
        />
      </PageHeader>

      <SectionCard>
        {loading ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-64" lines={4} />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="Falha ao carregar seus agendamentos"
            message={error}
            onAction={refetch}
          />
        ) : appointments.length === 0 ? (
          <EmptyState
            eyebrow="Agenda vazia"
            title="Nenhum agendamento encontrado"
            description="Assim que você confirmar um horário no studio, ele aparecerá aqui com serviços, duração e valor total."
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {appointments.map((appointment, index) => (
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
                      {(appointment.services || [])
                        .map((service) => service.name)
                        .join(" + ") || "Serviço"}
                    </h2>
                  </div>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#6d4cad] shadow-sm">
                    <CalendarCheck className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-5 space-y-2 text-sm text-slate-600">
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
                  <p>
                    <strong className="text-slate-900">Observações:</strong>{" "}
                    {appointment.notes || appointment.note || "Sem observações"}
                  </p>
                </div>

                <div className="mt-5 border-t border-slate-200 pt-4">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getStatusTone(appointment.status)}`}
                  >
                    {getStatusLabel(appointment.status)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
