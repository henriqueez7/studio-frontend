import { RefreshCcw } from "lucide-react";
import { useMemo, useState } from "react";
import CommissionGroupCard from "../components/commissions/CommissionGroupCard.jsx";
import CommissionSummaryCard from "../components/commissions/CommissionSummaryCard.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import PageIntro from "../components/ui/PageIntro.jsx";
import SectionCard from "../components/ui/SectionCard.jsx";
import SkeletonBlock from "../components/ui/SkeletonBlock.jsx";
import StatusBanner from "../components/ui/StatusBanner.jsx";
import useBarbers from "../hooks/useBarbers.jsx";
import useCommissions from "../hooks/useCommissions.jsx";

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

export default function CommissionsPage() {
  const [form, setForm] = useState({
    barberId: "",
    periodStart: getMonthStart(),
    periodEnd: getToday(),
    notes: "",
  });
  const {
    groupedByBarber,
    loading,
    error,
    success,
    totalCommissions,
    paidCount,
    pendingCount,
    refetch,
    createPayment,
    markAsPaid,
    payingId,
    submitting,
    canMarkAsPaid,
    clearError,
    clearSuccess,
  } = useCommissions();
  const { barbers, loading: loadingBarbers } = useBarbers();

  const totalGroups = useMemo(() => groupedByBarber.length, [groupedByBarber]);

  const activeBarbers = useMemo(
    () => barbers.filter((barber) => barber.active !== false),
    [barbers],
  );

  const handleChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleRefresh = () => {
    clearError();
    clearSuccess();
    refetch();
  };

  const handleGenerate = async (event) => {
    event.preventDefault();
    await createPayment({
      barberId: Number(form.barberId),
      periodStart: form.periodStart,
      periodEnd: form.periodEnd,
      notes: form.notes.trim(),
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        actions={
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#6d4cad]/20 hover:text-[#6d4cad]"
          >
            <RefreshCcw className="h-4 w-4" />
            Recarregar comissões
          </button>
        }
      >
        <PageIntro
          eyebrow="Comissões"
          title={
            canMarkAsPaid
              ? "Comissões por barbeiro com controle de pagamento."
              : "Suas comissões e períodos apurados."
          }
          description={
            canMarkAsPaid
              ? "Visualize valores, gere períodos de comissão e acompanhe pagamentos em um painel organizado."
              : "Acompanhe os períodos calculados, valores apurados e status dos seus recebimentos."
          }
        />
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CommissionSummaryCard
          title="Total de comissões"
          value={totalCommissions.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
          description="Somatório de todas as comissões listadas."
        />
        <CommissionSummaryCard
          title="Comissões pagas"
          value={paidCount}
          description="Número de comissões já quitadas."
        />
        <CommissionSummaryCard
          title="Comissões pendentes"
          value={pendingCount}
          description="Quantidade de comissões ainda abertas."
        />
        <CommissionSummaryCard
          title="Barbeiros ativos"
          value={totalGroups}
          description="Agrupamentos de comissões por barbeiro."
        />
      </div>

      {error ? (
        <ErrorState
          title="Erro ao carregar comissões"
          message={error}
          onAction={handleRefresh}
        />
      ) : null}

      {success ? (
        <StatusBanner type="success" title="Sucesso" message={success} />
      ) : null}

      {canMarkAsPaid ? (
        <SectionCard>
          <div className="grid gap-6 lg:grid-cols-[1.3fr_2fr] lg:items-start">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.28em] text-[#6d4cad]">
                Gerar comissão
              </p>
              <h3 className="text-2xl font-semibold text-slate-900">
                Lance um novo período para o barbeiro.
              </h3>
              <p className="text-sm leading-6 text-slate-600">
                O sistema usa apenas atendimentos concluídos dentro do intervalo selecionado
                e aplica automaticamente o percentual configurado para o barbeiro.
              </p>
            </div>

            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleGenerate}>
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Barbeiro
                <select
                  value={form.barberId}
                  onChange={handleChange("barberId")}
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10"
                  disabled={loadingBarbers || submitting}
                  required
                >
                  <option value="">
                    {loadingBarbers ? "Carregando barbeiros..." : "Selecione um barbeiro"}
                  </option>
                  {activeBarbers.map((barber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Data inicial
                <input
                  type="date"
                  value={form.periodStart}
                  onChange={handleChange("periodStart")}
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10"
                  disabled={submitting}
                  required
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Data final
                <input
                  type="date"
                  value={form.periodEnd}
                  onChange={handleChange("periodEnd")}
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10"
                  disabled={submitting}
                  required
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
                Observação
                <textarea
                  value={form.notes}
                  onChange={handleChange("notes")}
                  rows={4}
                  className="rounded-[28px] border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10"
                  placeholder="Ex.: comissão da primeira quinzena"
                  disabled={submitting}
                />
              </label>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={submitting || !form.barberId}
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#6d4cad] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Gerando comissão..." : "Gerar comissão"}
                </button>
              </div>
            </form>
          </div>
        </SectionCard>
      ) : null}

      <SectionCard>
        {loading ? (
          <div className="space-y-6">
            <SkeletonBlock className="h-16" />
            <div className="space-y-6">
              {Array.from({ length: 2 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-48" lines={4} />
              ))}
            </div>
          </div>
        ) : groupedByBarber.length === 0 ? (
          <EmptyState
            eyebrow="Sem comissões"
            title="Nenhuma comissão encontrada"
            description="Gere um período para começar a acompanhar os repasses dos barbeiros."
          />
        ) : (
          <div className="space-y-6">
            {groupedByBarber.map((group) => (
              <CommissionGroupCard
                key={group.barber}
                group={group}
                onMarkPaid={(commission) => markAsPaid(commission.id ?? commission._id)}
                payingId={payingId}
                canMarkAsPaid={canMarkAsPaid}
              />
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
