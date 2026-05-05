import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import ServiceFormModal from "../components/services/ServiceFormModal.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import SkeletonBlock from "../components/ui/SkeletonBlock.jsx";
import StatusBanner from "../components/ui/StatusBanner.jsx";
import useServices from "../hooks/useServices.jsx";
import { confirmDelete, confirmEditSave } from "../utils/confirmAction.js";

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value ?? 0));
}

export default function ServicesPage() {
  const {
    services,
    loading,
    submitting,
    error,
    success,
    activeCount,
    refetch,
    createItem,
    updateItem,
    removeItem,
    clearError,
    clearSuccess,
  } = useServices();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const filteredServices = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return services;

    return services.filter((service) =>
      [service.name, service.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [search, services]);

  const closeModal = () => {
    setModalOpen(false);
    setEditingService(null);
    clearError();
    clearSuccess();
  };

  const handleSubmit = async (data) => {
    if (editingService?.id) {
      if (!confirmEditSave(`o serviço "${editingService.name}"`)) return;
      await updateItem(editingService.id, data);
    } else {
      await createItem(data);
    }

    closeModal();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(52,60,78,0.06)]">
        <div className="flex flex-col gap-5 border-b border-slate-200 px-5 py-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6d4cad]">
              Servicos
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
                setEditingService(null);
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
              {activeCount} servico(s)
            </span>
            <span>{filteredServices.length} item(ns) exibido(s)</span>
          </div>

          <label className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm text-slate-500 lg:w-[360px]">
            <Search className="h-4 w-4 shrink-0" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome ou descricao"
              className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </label>
        </div>

        {error ? <div className="px-5 pt-5"><StatusBanner type="error" title="Erro ao carregar servicos" message={error} /></div> : null}
        {success ? <div className="px-5 pt-5"><StatusBanner type="success" title="Sucesso" message={success} /></div> : null}

        {loading ? (
          <div className="space-y-3 px-5 py-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-20 rounded-[22px] bg-[#f8fafc]" lines={2} />
            ))}
          </div>
        ) : error ? (
          <div className="px-5 py-8">
            <ErrorState title="Falha ao carregar servicos" message={error} onAction={refetch} />
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="px-5 py-8">
            <EmptyState
              eyebrow="Sem servicos"
              title="Nenhum servico encontrado"
              description="Cadastre servicos ou ajuste a busca para continuar."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[940px]">
              <div className="grid grid-cols-[2.2fr_0.8fr_0.8fr_0.8fr_1fr] border-b border-slate-200 bg-[#f8fafc] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <span>Servico</span>
                <span>Duracao</span>
                <span>Preco</span>
                <span>Detalhes</span>
                <span className="text-right">Acoes</span>
              </div>

              <div className="divide-y divide-slate-200">
                {filteredServices.map((service) => {
                  const isOpen = expandedId === service.id;

                  return (
                    <div key={service.id ?? service.name}>
                      <div className="grid grid-cols-[2.2fr_0.8fr_0.8fr_0.8fr_1fr] items-center px-5 py-4 text-sm text-slate-600 transition hover:bg-[#fafbfe]">
                        <div>
                          <p className="font-semibold text-slate-900">{service.name}</p>
                        </div>
                        <span>{service.durationInMinutes ?? service.duration ?? 0} min</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(service.price)}</span>
                        <button
                          type="button"
                          onClick={() => setExpandedId((current) => (current === service.id ? null : service.id))}
                          className="inline-flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#6d4cad]/20 hover:text-[#6d4cad]"
                        >
                          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          {isOpen ? "Ocultar" : "Exibir"}
                        </button>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingService(service);
                              setModalOpen(true);
                            }}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[#6d4cad] transition hover:border-[#6d4cad]/20"
                            title="Editar servico"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!confirmDelete(`o serviço "${service.name}"`)) return;
                              await removeItem(service.id);
                            }}
                            disabled={submitting}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-200 bg-white text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                            title="Remover servico"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {isOpen ? (
                        <div className="border-t border-slate-100 bg-[#fcfcfe] px-5 py-4 text-sm text-slate-600">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Descricao
                          </p>
                          <p className="mt-2 leading-6">
                            {service.description || "Sem descricao cadastrada."}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      <ServiceFormModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitting={submitting}
        initialData={editingService}
      />
    </div>
  );
}
