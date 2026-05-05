import { Plus, RefreshCcw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import InvestmentFormModal from "../components/investments/InvestmentFormModal.jsx";
import InvestmentTable from "../components/investments/InvestmentTable.jsx";
import SkeletonBlock from "../components/ui/SkeletonBlock.jsx";
import StatusBanner from "../components/ui/StatusBanner.jsx";
import useInvestments from "../hooks/useInvestments.jsx";
import { confirmDelete, confirmEditSave } from "../utils/confirmAction.js";

export default function InvestmentsPage() {
  const {
    investments,
    loading,
    submitting,
    deleting,
    error,
    success,
    totalInvested,
    recentInvestmentsCount,
    refetch,
    saveInvestment,
    removeInvestment,
    clearError,
    clearSuccess,
  } = useInvestments();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInvestments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return investments.filter((investment) => {
      const description = (investment.description || "").toLowerCase();
      const observation = (
        investment.note ||
        investment.observation ||
        ""
      ).toLowerCase();

      return (
        query === "" ||
        description.includes(query) ||
        observation.includes(query)
      );
    });
  }, [investments, searchQuery]);

  const closeModal = () => {
    setModalOpen(false);
    setEditingInvestment(null);
    clearError();
    clearSuccess();
  };

  const handleSave = async (data) => {
    try {
      if (editingInvestment && !confirmEditSave(`o investimento "${editingInvestment.description}"`)) return;
      await saveInvestment(
        editingInvestment
          ? {
              ...data,
              id: editingInvestment.id ?? editingInvestment._id,
            }
          : data,
      );
      closeModal();
    } catch {
      // Erro tratado no hook.
    }
  };

  const handleDelete = async (investment) => {
    const confirmed = confirmDelete(`o investimento "${investment.description}"`);

    if (!confirmed) return;

    try {
      await removeInvestment(investment.id ?? investment._id);
    } catch {
      // Erro tratado no hook.
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(52,60,78,0.06)]">
        <div className="flex flex-col gap-5 border-b border-slate-200 px-5 py-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6d4cad]">
              Investimentos
            </p>
            
            <p className="hidden">
              Menos blocos soltos, mais visão operacional. O investimento abre em
              drawer lateral e a tabela continua sendo o centro da página.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={refetch}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-[#6d4cad]/20 hover:text-[#6d4cad]"
              aria-label="Atualizar"
              title="Atualizar"
            >
              <RefreshCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingInvestment(null);
                setModalOpen(true);
              }}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#6d4cad] px-4 text-sm font-semibold text-white transition hover:brightness-105"
            >
              <Plus className="h-4 w-4" />
              Novo
            </button>
          </div>
        </div>

        <div className="grid gap-3 border-b border-slate-200 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span className="inline-flex rounded-full bg-[#f4effd] px-3 py-1.5 font-semibold text-[#6d4cad]">
              Total{" "}
              {totalInvested.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
            <span>{recentInvestmentsCount} recente(s) nos últimos 30 dias</span>
            <span>{filteredInvestments.length} item(ns) exibido(s)</span>
          </div>

          <label className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm text-slate-500 lg:w-[360px]">
            <Search className="h-4 w-4 shrink-0" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Pesquisar descrição ou observações"
              className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </label>
        </div>

        {error ? (
          <div className="px-5 pt-5">
            <StatusBanner
              type="error"
              title="Erro ao carregar investimentos"
              message={error}
            />
          </div>
        ) : null}

        {success ? (
          <div className="px-5 pt-5">
            <StatusBanner type="success" title="Sucesso" message={success} />
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-3 px-5 py-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBlock
                key={index}
                className="h-20 rounded-[22px] bg-[#f8fafc]"
                lines={2}
              />
            ))}
          </div>
        ) : (
          <div className="px-5 py-5">
            <InvestmentTable
              investments={filteredInvestments}
              onEdit={(investment) => {
                setEditingInvestment(investment);
                setModalOpen(true);
              }}
              onDelete={handleDelete}
              deleting={deleting}
            />
          </div>
        )}
      </section>

      <InvestmentFormModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSave}
        initialData={editingInvestment}
        submitting={submitting}
      />
    </div>
  );
}
