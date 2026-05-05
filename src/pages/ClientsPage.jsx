import {
  Lock,
  Pencil,
  RefreshCcw,
  Search,
  ShieldCheck,
  ShieldOff,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import ClientFormModal from "../components/clients/ClientFormModal.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import SkeletonBlock from "../components/ui/SkeletonBlock.jsx";
import StatusBanner from "../components/ui/StatusBanner.jsx";
import useClients from "../hooks/useClients.jsx";
import { confirmEditSave } from "../utils/confirmAction.js";
import { formatDisplayDate } from "../utils/date.js";

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value ?? 0));
}

function getInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) return "--";
  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
}

export default function ClientsPage() {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [search, setSearch] = useState("");
  const [editingClient, setEditingClient] = useState(null);
  const {
    clients,
    loading,
    submitting,
    error,
    success,
    activeCount,
    refetch,
    blockItem,
    unblockItem,
    updateItem,
    clearError,
    clearSuccess,
  } = useClients(month);

  const filteredClients = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return clients;

    return clients.filter((client) => {
      const haystack = [client.name, client.email, client.phone]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [clients, search]);

  const closeModal = () => {
    setEditingClient(null);
    clearError();
    clearSuccess();
  };

  const handleUpdateClient = async (data) => {
    if (!editingClient?.id) return;
    if (!confirmEditSave(`o cliente "${editingClient.name}"`)) return;
    await updateItem(editingClient.id, data);
    closeModal();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(52,60,78,0.06)]">
        <div className="flex flex-col gap-5 border-b border-slate-200 px-5 py-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6d4cad]">
              Clientes
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm text-slate-700">
              <span className="font-medium text-slate-500">Mes</span>
              <input
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                className="min-w-[112px] border-0 bg-transparent text-sm font-semibold text-slate-900 outline-none"
              />
            </label>
            <button
              type="button"
              onClick={refetch}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-[#6d4cad]/20 hover:text-[#6d4cad]"
              aria-label="Atualizar"
              title="Atualizar"
            >
              <RefreshCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid gap-3 border-b border-slate-200 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#f4effd] px-3 py-1.5 font-semibold text-[#6d4cad]">
              <Users className="h-4 w-4" />
              {activeCount} ativos
            </span>
            <span>{filteredClients.length} cliente(s) exibido(s)</span>
          </div>

          <label className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm text-slate-500 lg:w-[360px]">
            <Search className="h-4 w-4 shrink-0" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, e-mail ou telefone"
              className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </label>
        </div>

        {error ? <div className="px-5 pt-5"><StatusBanner type="error" title="Erro ao carregar clientes" message={error} /></div> : null}
        {success ? <div className="px-5 pt-5"><StatusBanner type="success" title="Sucesso" message={success} /></div> : null}

        {loading ? (
          <div className="space-y-3 px-5 py-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-20 rounded-[22px] bg-[#f8fafc]" lines={2} />
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="px-5 py-8">
            <EmptyState
              icon={Users}
              eyebrow="Sem clientes"
              title="Nenhum cliente encontrado"
              description="Ajuste os filtros ou aguarde novos cadastros para a lista aparecer aqui."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[980px]">
              <div className="grid grid-cols-[2.2fr_1.3fr_1fr_1fr_1fr_1fr] border-b border-slate-200 bg-[#f8fafc] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <span>Cliente</span>
                <span>Contato</span>
                <span>Gasto no mes</span>
                <span>Gasto total</span>
                <span>Ultima visita</span>
                <span className="text-right">Acao</span>
              </div>

              <div className="divide-y divide-slate-200">
                {filteredClients.map((client) => {
                  const isActive = client.active !== false;

                  return (
                    <div
                      key={client.id}
                      className="grid grid-cols-[2.2fr_1.3fr_1fr_1fr_1fr_1fr] items-center px-5 py-4 text-sm text-slate-600 transition hover:bg-[#fafbfe]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-base font-semibold text-slate-600">
                          {getInitials(client.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{client.name}</p>
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {client.email || "E-mail nao informado"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p>{client.phone || "Telefone nao informado"}</p>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {isActive ? "Ativo" : "Bloqueado"}
                        </span>
                      </div>

                      <span className="font-semibold text-slate-900">{formatCurrency(client.monthlySpent)}</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(client.totalSpent)}</span>
                      <span>{formatDisplayDate(client.lastAppointmentDate, "Sem historico")}</span>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingClient(client)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[#6d4cad] transition hover:border-[#6d4cad]/20"
                          title="Editar cliente"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => (isActive ? blockItem(client.id) : unblockItem(client.id))}
                          disabled={submitting}
                          className={`inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            isActive
                              ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                              : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {isActive ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                          {isActive ? "Bloquear" : "Desbloquear"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      <ClientFormModal
        open={Boolean(editingClient)}
        onClose={closeModal}
        onSubmit={handleUpdateClient}
        submitting={submitting}
        initialData={editingClient}
      />
    </div>
  );
}
