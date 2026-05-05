import { Pencil, Plus, RefreshCcw, Scissors, Search, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import BarberFormModal from "../components/barbers/BarberFormModal.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import SkeletonBlock from "../components/ui/SkeletonBlock.jsx";
import StatusBanner from "../components/ui/StatusBanner.jsx";
import useBarbers from "../hooks/useBarbers.jsx";
import useCommissions from "../hooks/useCommissions.jsx";
import { confirmDelete, confirmEditSave } from "../utils/confirmAction.js";

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value ?? 0));
}

function formatPercent(value) {
  return `${Number(value ?? 0).toFixed(0)}%`;
}

const commissionGridTemplate =
  "minmax(0,2.3fr) minmax(120px,1fr) minmax(110px,1fr) minmax(110px,1fr) minmax(180px,1.3fr)";

export default function ProfessionalsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "commissions" ? "commissions" : "professionals";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState(null);
  const [editingCommission, setEditingCommission] = useState(null);
  const commissionFormRef = useRef(null);
  const [form, setForm] = useState({
    barberId: "",
    periodStart: getMonthStart(),
    periodEnd: getToday(),
    notes: "",
  });

  const {
    barbers,
    loading: loadingBarbers,
    submitting: barberSubmitting,
    error: barberError,
    success: barberSuccess,
    activeCount,
    refetch: refetchBarbers,
    createItem,
    updateItem,
    removeItem,
    clearError: clearBarberError,
    clearSuccess: clearBarberSuccess,
  } = useBarbers();

  const {
    groupedByBarber,
    loading: loadingCommissions,
    error: commissionsError,
    success: commissionsSuccess,
    totalCommissions,
    paidCount,
    pendingCount,
    refetch: refetchCommissions,
    createPayment,
    updatePayment,
    removePayment,
    markAsPaid,
    payingId,
    editingId,
    deletingId,
    submitting: commissionsSubmitting,
    canMarkAsPaid,
    clearError: clearCommissionsError,
    clearSuccess: clearCommissionsSuccess,
  } = useCommissions();

  const filteredBarbers = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return barbers;

    return barbers.filter((barber) =>
      [barber.name, barber.email, barber.phone]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [barbers, search]);

  const changeTab = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === "commissions" ? { tab: "commissions" } : {});
  };

  const resetCommissionForm = () => {
    setEditingCommission(null);
    setForm({
      barberId: "",
      periodStart: getMonthStart(),
      periodEnd: getToday(),
      notes: "",
    });
  };

  const handleEditCommission = (commission) => {
    setEditingCommission(commission);
    setForm({
      barberId: String(commission.barberId ?? ""),
      periodStart: commission.periodStart ?? getMonthStart(),
      periodEnd: commission.periodEnd ?? getToday(),
      notes: commission.note ?? "",
    });
    clearCommissionsError();
    clearCommissionsSuccess();

    requestAnimationFrame(() => {
      commissionFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  };

  const handleDeleteCommission = async (commission) => {
    const confirmed = confirmDelete(`a comissão do período ${commission.description}`);

    if (!confirmed) return;

    await removePayment(commission.id ?? commission._id);
    if ((commission.id ?? commission._id) === editingCommission?.id) {
      resetCommissionForm();
    }
  };

  const handleCreateProfessional = async (data) => {
    if (editingProfessional?.id) {
      if (!confirmEditSave(`o profissional "${editingProfessional.name}"`)) return;
      await updateItem(editingProfessional.id, data);
    } else {
      await createItem(data);
    }
    setEditingProfessional(null);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(52,60,78,0.06)]">
        <div className="flex flex-col gap-5 border-b border-slate-200 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6d4cad]">
              {activeTab === "commissions" ? "Comissões" : "Profissionais"}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={() => {
                refetchBarbers();
                refetchCommissions();
              }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-[#6d4cad]/20 hover:text-[#6d4cad]"
              aria-label="Atualizar"
              title="Atualizar"
            >
              <RefreshCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingProfessional(null);
                setModalOpen(true);
              }}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#6d4cad] px-4 text-sm font-semibold text-white transition hover:brightness-105"
            >
              <Plus className="h-4 w-4" />
              Novo
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={() => changeTab("professionals")}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === "professionals"
                ? "bg-[#6d4cad] text-white"
                : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            Profissionais
          </button>
          <button
            type="button"
            onClick={() => changeTab("commissions")}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === "commissions"
                ? "bg-[#6d4cad] text-white"
                : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            Comissões
          </button>
        </div>

        {!modalOpen && barberError ? (
          <div className="px-5 pt-5">
            <StatusBanner type="error" title="Erro em profissionais" message={barberError} />
          </div>
        ) : null}
        {!modalOpen && barberSuccess ? (
          <div className="px-5 pt-5">
            <StatusBanner type="success" title="Profissionais" message={barberSuccess} />
          </div>
        ) : null}
        {commissionsError ? (
          <div className="px-5 pt-5">
            <StatusBanner type="error" title="Erro em comissões" message={commissionsError} />
          </div>
        ) : null}
        {commissionsSuccess ? (
          <div className="px-5 pt-5">
            <StatusBanner type="success" title="Comissões" message={commissionsSuccess} />
          </div>
        ) : null}

        {activeTab === "professionals" ? (
          <>
            <div className="grid gap-3 border-b border-slate-200 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="inline-flex rounded-full bg-[#f4effd] px-3 py-1.5 font-semibold text-[#6d4cad]">
                  {activeCount} ativo(s)
                </span>
                <span>{filteredBarbers.length} profissional(is) exibido(s)</span>
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

            {loadingBarbers ? (
              <div className="space-y-3 px-5 py-5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <SkeletonBlock key={index} className="h-20 rounded-[22px] bg-[#f8fafc]" lines={2} />
                ))}
              </div>
            ) : filteredBarbers.length === 0 ? (
              <div className="px-5 py-8">
                <EmptyState
                  eyebrow="Sem profissionais"
                  title="Nenhum profissional encontrado"
                  description="Cadastre um novo profissional para começar."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[980px]">
                  <div className="grid grid-cols-[2fr_1.4fr_0.8fr_0.8fr_1fr] border-b border-slate-200 bg-[#f8fafc] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <span>Profissional</span>
                    <span>Contato</span>
                    <span>Comissão</span>
                    <span>Status</span>
                    <span className="text-right">Ações</span>
                  </div>

                  <div className="divide-y divide-slate-200">
                    {filteredBarbers.map((barber) => (
                      <div
                        key={barber.id}
                        className="grid grid-cols-[2fr_1.4fr_0.8fr_0.8fr_1fr] items-center px-5 py-4 text-sm text-slate-600 transition hover:bg-[#fafbfe]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f4effd] text-[#6d4cad]">
                            <Scissors className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{barber.name}</p>
                            <p className="mt-0.5 text-xs text-slate-500">Usuário profissional</p>
                          </div>
                        </div>
                        <div>
                          <p>{barber.email || "E-mail não informado"}</p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {barber.phone || "Telefone não informado"}
                          </p>
                        </div>
                        <span className="font-semibold text-slate-900">
                          {formatPercent(barber.commissionPercentage)}
                        </span>
                        <span
                          className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
                            barber.active !== false
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {barber.active !== false ? "Ativo" : "Inativo"}
                        </span>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProfessional(barber);
                              setModalOpen(true);
                            }}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[#6d4cad] transition hover:border-[#6d4cad]/20"
                            title="Editar profissional"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!confirmDelete(`o profissional "${barber.name}"`)) return;
                              await removeItem(barber.id);
                            }}
                            disabled={barberSubmitting}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-200 bg-white text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                            title="Remover profissional"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="grid gap-3 border-b border-slate-200 px-5 py-4 md:grid-cols-4">
              <div className="rounded-2xl bg-[#f8fafc] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Total</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(totalCommissions)}</p>
              </div>
              <div className="rounded-2xl bg-[#f8fafc] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Pagas</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-700">{paidCount}</p>
              </div>
              <div className="rounded-2xl bg-[#f8fafc] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Pendentes</p>
                <p className="mt-2 text-2xl font-semibold text-amber-700">{pendingCount}</p>
              </div>
              <div className="rounded-2xl bg-[#f8fafc] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Grupos</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{groupedByBarber.length}</p>
              </div>
            </div>

            {canMarkAsPaid ? (
              <div
                ref={commissionFormRef}
                className="grid gap-4 border-b border-slate-200 px-5 py-5 lg:grid-cols-[1fr_1fr_1fr]"
              >
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Profissional
                  <select
                    value={form.barberId}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, barberId: event.target.value }))
                    }
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
                  >
                    <option value="">Selecione um profissional</option>
                    {barbers.map((barber) => (
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
                    onChange={(event) =>
                      setForm((current) => ({ ...current, periodStart: event.target.value }))
                    }
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Data final
                  <input
                    type="date"
                    value={form.periodEnd}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, periodEnd: event.target.value }))
                    }
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-slate-700 lg:col-span-2">
                  Observações
                  <input
                    type="text"
                    value={form.notes}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, notes: event.target.value }))
                    }
                    placeholder="Opcional"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
                  />
                </label>

                <div className="flex flex-wrap items-end justify-end gap-3 lg:col-span-1">
                  {editingCommission ? (
                    <button
                      type="button"
                      onClick={resetCommissionForm}
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#6d4cad]/20 hover:text-[#6d4cad]"
                    >
                      Cancelar edição
                    </button>
                  ) : null}

                  <button
                    type="button"
                    disabled={commissionsSubmitting || editingId != null || !form.barberId}
                    onClick={async () => {
                      const payload = {
                        barberId: Number(form.barberId),
                        periodStart: form.periodStart,
                        periodEnd: form.periodEnd,
                        notes: form.notes.trim(),
                      };

                      if (editingCommission?.id) {
                        if (!confirmEditSave(`a comissão do período ${editingCommission.description}`)) return;
                        await updatePayment(editingCommission.id, payload);
                      } else {
                        await createPayment(payload);
                      }

                      resetCommissionForm();
                    }}
                    className="inline-flex items-center justify-center rounded-2xl bg-[#6d4cad] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {editingCommission
                      ? editingId === editingCommission.id
                        ? "Salvando..."
                        : "Salvar alterações"
                      : commissionsSubmitting
                        ? "Gerando..."
                        : "Gerar comissão"}
                  </button>
                </div>
              </div>
            ) : null}

            {loadingCommissions ? (
              <div className="space-y-3 px-5 py-5">
                {Array.from({ length: 4 }).map((_, index) => (
                  <SkeletonBlock key={index} className="h-24 rounded-[22px] bg-[#f8fafc]" lines={3} />
                ))}
              </div>
            ) : groupedByBarber.length === 0 ? (
              <div className="px-5 py-8">
                <EmptyState
                  eyebrow="Sem comissões"
                  title="Nenhuma comissão encontrada"
                  description="Gere um período para começar a acompanhar os repasses."
                />
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {groupedByBarber.map((group) => (
                  <div key={group.barber} className="px-5 py-5">
                    <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{group.barber}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {group.commissions.length} lançamento(s) • {formatCurrency(group.totalValue)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 overflow-x-auto">
                      <div className="min-w-[920px]">
                        <div
                          className="grid border-b border-slate-200 bg-[#f8fafc] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
                          style={{ gridTemplateColumns: commissionGridTemplate }}
                        >
                          <span>Descrição</span>
                          <span>Valor</span>
                          <span>Percentual</span>
                          <span>Status</span>
                          <span className="text-right">Ações</span>
                        </div>

                        <div className="divide-y divide-slate-200">
                          {group.commissions.map((commission) => (
                            <div
                              key={commission.id ?? commission.description}
                              className="grid items-center gap-4 px-4 py-4 text-sm text-slate-600"
                              style={{ gridTemplateColumns: commissionGridTemplate }}
                            >
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900">{commission.description}</p>
                                <p className="mt-0.5 text-xs text-slate-500">
                                  {commission.note || "Sem observações"}
                                </p>
                              </div>

                              <span className="font-semibold text-slate-900">
                                {formatCurrency(commission.amount)}
                              </span>

                              <span>{formatPercent(commission.percentage)}</span>

                              <span
                                className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  commission.status === "PAID"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {commission.status === "PAID" ? "Pago" : "Pendente"}
                              </span>

                              <div className="flex justify-end gap-2">
                                {canMarkAsPaid ? (
                                  <button
                                    type="button"
                                    onClick={() => handleEditCommission(commission)}
                                    disabled={
                                      commissionsSubmitting ||
                                      deletingId === commission.id
                                    }
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[#6d4cad] transition hover:border-[#6d4cad]/20 disabled:cursor-not-allowed disabled:opacity-60"
                                    title="Editar comissão"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                ) : null}

                                {canMarkAsPaid ? (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCommission(commission)}
                                    disabled={
                                      deletingId === commission.id ||
                                      editingId === commission.id
                                    }
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-rose-200 bg-white text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    title="Excluir comissão"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                ) : null}

                                {canMarkAsPaid ? (
                                  <button
                                    type="button"
                                    onClick={() => markAsPaid(commission.id ?? commission._id)}
                                    disabled={
                                      commission.status === "PAID" ||
                                      payingId === commission.id ||
                                      deletingId === commission.id ||
                                      editingId === commission.id
                                    }
                                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#6d4cad]/20 hover:text-[#6d4cad] disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {commission.status === "PAID"
                                      ? "Pago"
                                      : payingId === commission.id
                                        ? "Pagando..."
                                        : "Marcar pago"}
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-400">Somente leitura</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <BarberFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProfessional(null);
          clearBarberError();
          clearBarberSuccess();
        }}
        onSubmit={handleCreateProfessional}
        submitting={barberSubmitting}
        initialData={editingProfessional}
        error={barberError}
        success={barberSuccess}
      />
    </div>
  );
}
