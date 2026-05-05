import { Plus, RefreshCcw, Scissors, Trash2 } from "lucide-react";
import { useState } from "react";
import BarberFormModal from "../components/barbers/BarberFormModal.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import PageIntro from "../components/ui/PageIntro.jsx";
import SectionCard from "../components/ui/SectionCard.jsx";
import SkeletonBlock from "../components/ui/SkeletonBlock.jsx";
import StatusBanner from "../components/ui/StatusBanner.jsx";
import useBarbers from "../hooks/useBarbers.jsx";

export default function BarbersPage() {
  const {
    barbers,
    loading,
    submitting,
    error,
    success,
    activeCount,
    refetch,
    createItem,
    removeItem,
    clearError,
    clearSuccess,
  } = useBarbers();
  const [modalOpen, setModalOpen] = useState(false);

  const handleCreate = async (data) => {
    await createItem(data);
    setModalOpen(false);
  };

  const closeModal = () => {
    setModalOpen(false);
    clearError();
    clearSuccess();
  };

  return (
    <div className="space-y-8">
      <PageHeader
        actions={
          <>
            <button
              type="button"
              onClick={refetch}
              className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              <RefreshCcw className="h-4 w-4" />
              Atualizar
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#6d4cad] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(109,76,173,0.18)] transition hover:brightness-105"
            >
              <Plus className="h-4 w-4" />
              Novo barbeiro
            </button>
          </>
        }
      >
        <PageIntro
          eyebrow="Barbeiros"
          title="Cadastre e acompanhe os barbeiros do studio."
          description="O admin define quem entra na operação, com dados de acesso e percentual de comissão para manter o sistema organizado desde a origem."
        />
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-[28px] border border-slate-200/90 bg-[#f3f6fa] p-5 shadow-[0_12px_28px_rgba(77,93,122,0.06)]">
          <p className="text-sm font-medium text-slate-500">Barbeiros ativos</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{activeCount}</p>
        </div>
      </div>

      {error ? <StatusBanner type="error" title="Erro ao carregar barbeiros" message={error} /> : null}
      {success ? <StatusBanner type="success" title="Sucesso" message={success} /> : null}

      <SectionCard>
        {loading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock
                key={index}
                className="h-48 border border-slate-200/90 bg-white"
                lines={3}
              />
            ))}
          </div>
        ) : barbers.length === 0 ? (
          <EmptyState
            eyebrow="Sem barbeiros"
            title="Nenhum barbeiro cadastrado"
            description="Quando o admin cadastrar novos barbeiros, eles aparecerão aqui para consulta rápida."
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {barbers.map((barber) => (
              <article
                key={barber.id}
                className="rounded-[28px] border border-slate-200/90 bg-[#f3f6fa] p-6 shadow-[0_12px_28px_rgba(77,93,122,0.06)]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6d4cad] text-white shadow-[0_10px_20px_rgba(109,76,173,0.16)]">
                    <Scissors className="h-5 w-5" />
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      barber.active !== false
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {barber.active !== false ? "Ativo" : "Inativo"}
                  </span>
                </div>

                <h2 className="mt-5 text-xl font-semibold text-slate-900">
                  {barber.name}
                </h2>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p>
                    <strong className="text-slate-900">E-mail:</strong>{" "}
                    {barber.email || "Não informado"}
                  </p>
                  <p>
                    <strong className="text-slate-900">Telefone:</strong>{" "}
                    {barber.phone || "Não informado"}
                  </p>
                  <p>
                    <strong className="text-slate-900">Comissão:</strong>{" "}
                    {barber.commissionPercentage != null
                      ? `${Number(barber.commissionPercentage).toFixed(0)}%`
                      : "Não informada"}
                  </p>
                </div>

                <div className="mt-5 border-t border-slate-200 pt-5">
                  <button
                    type="button"
                    onClick={() => removeItem(barber.id)}
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remover do sistema
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>

      <BarberFormModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleCreate}
        submitting={submitting}
      />
    </div>
  );
}
