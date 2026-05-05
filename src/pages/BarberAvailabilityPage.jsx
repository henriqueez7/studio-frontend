import { Plus, RefreshCcw } from "lucide-react";
import { useState } from "react";
import AvailabilityFormModal from "../components/availability/AvailabilityFormModal.jsx";
import AvailabilityTable from "../components/availability/AvailabilityTable.jsx";
import StoreHourFormModal from "../components/store-hours/StoreHourFormModal.jsx";
import StoreHoursTable from "../components/store-hours/StoreHoursTable.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import SectionCard from "../components/ui/SectionCard.jsx";
import SkeletonBlock from "../components/ui/SkeletonBlock.jsx";
import StatusBanner from "../components/ui/StatusBanner.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import useAvailability from "../hooks/useAvailability.jsx";
import useBarberAvailability from "../hooks/useBarberAvailability.jsx";
import useStoreBusinessHours from "../hooks/useStoreBusinessHours.jsx";
import { ROLE_ADMIN, normalizeRole } from "../utils/auth.js";
import { confirmDelete, confirmEditSave } from "../utils/confirmAction.js";

export default function BarberAvailabilityPage() {
  const { user } = useAuth();
  const isAdmin = normalizeRole(user?.role) === ROLE_ADMIN;
  const [selectedBarberId, setSelectedBarberId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [editingStoreItem, setEditingStoreItem] = useState(null);

  const effectiveBarberId = isAdmin ? selectedBarberId : String(user?.id || "");

  const { barbers, loadingBarbers } = useAvailability();
  const {
    items: storeHours,
    loading: loadingStoreHours,
    submitting: submittingStoreHours,
    error: storeHoursError,
    success: storeHoursSuccess,
    saveItem: saveStoreHour,
    clearError: clearStoreHoursError,
    clearSuccess: clearStoreHoursSuccess,
  } = useStoreBusinessHours();
  const {
    items,
    loading,
    submitting,
    error,
    success,
    refetch,
    saveAvailability,
    removeAvailability,
    clearError,
    clearSuccess,
  } = useBarberAvailability(effectiveBarberId);

  const activeItemsCount = items.filter((item) => item.active).length;
  const inactiveItemsCount = items.length - activeItemsCount;

  const openNewModal = () => {
    setEditingItem(null);
    setModalOpen(true);
    clearError();
    clearSuccess();
  };

  const openStoreEditModal = (item) => {
    setEditingStoreItem(item);
    setStoreModalOpen(true);
    clearStoreHoursError();
    clearStoreHoursSuccess();
  };

  const closeStoreModal = () => {
    setStoreModalOpen(false);
    setEditingStoreItem(null);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setModalOpen(true);
    clearError();
    clearSuccess();
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = async (data) => {
    if (
      editingItem &&
      !confirmEditSave(
        `a disponibilidade de ${editingItem.dayLabel || editingItem.dayOfWeek || "este horario"}`,
      )
    ) {
      return;
    }

    await saveAvailability({
      ...data,
      barberId: Number(effectiveBarberId),
    });
    closeModal();
  };

  const handleDelete = async (item) => {
    if (!confirmDelete(`a disponibilidade de ${item.dayLabel || item.dayOfWeek || "este horario"}`)) {
      return;
    }
    await removeAvailability(item.id);
  };

  const handleSaveStoreHour = async (id, payload) => {
    if (!confirmEditSave("o expediente da loja")) return;
    try {
      await saveStoreHour(id, payload);
      closeStoreModal();
    } catch {
      // O erro já é tratado no hook e exibido no modal.
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        actions={
          <>
            <button
              type="button"
              onClick={refetch}
              disabled={!effectiveBarberId}
              className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#6d4cad]/20 hover:text-[#6d4cad] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw className="h-4 w-4" />
              Atualizar
            </button>
            <button
              type="button"
              onClick={openNewModal}
              disabled={!effectiveBarberId}
              className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#6d4cad] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(109,76,173,0.18)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              Nova disponibilidade
            </button>
          </>
        }
      >
        <div />
      </PageHeader>

      {isAdmin ? (
        <>
          <SectionCard>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Barbeiro
              <select
                value={selectedBarberId}
                onChange={(event) => {
                  setSelectedBarberId(event.target.value);
                  setEditingItem(null);
                  clearError();
                  clearSuccess();
                }}
                className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-[#6d4cad]/30 focus:ring-2 focus:ring-[#6d4cad]/10"
                disabled={loadingBarbers}
              >
                <option value="">
                  {loadingBarbers ? "Carregando barbeiros..." : "Selecione o barbeiro"}
                </option>
                {barbers.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.name}
                  </option>
                ))}
              </select>
            </label>
          </SectionCard>

          <SectionCard>
            {storeHoursSuccess ? <StatusBanner type="success" title="Sucesso" message={storeHoursSuccess} /> : null}
            {storeHoursError ? (
              <StatusBanner type="error" title="Erro ao carregar expediente" message={storeHoursError} />
            ) : null}

            {loadingStoreHours ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <SkeletonBlock
                    key={index}
                    className="h-32 border border-slate-200/90 bg-white"
                    lines={3}
                  />
                ))}
              </div>
            ) : (
              <StoreHoursTable items={storeHours} onEdit={openStoreEditModal} />
            )}
          </SectionCard>
        </>
      ) : null}

      {effectiveBarberId ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-[28px] border border-slate-200/90 bg-[#f3f6fa] p-5 shadow-[0_12px_28px_rgba(77,93,122,0.06)]">
            <p className="text-sm font-medium text-slate-500">Blocos cadastrados</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{items.length}</p>
          </div>
          <div className="rounded-[28px] border border-slate-200/90 bg-[#f3f6fa] p-5 shadow-[0_12px_28px_rgba(77,93,122,0.06)]">
            <p className="text-sm font-medium text-slate-500">Blocos ativos</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{activeItemsCount}</p>
          </div>
          <div className="rounded-[28px] border border-slate-200/90 bg-[#f3f6fa] p-5 shadow-[0_12px_28px_rgba(77,93,122,0.06)]">
            <p className="text-sm font-medium text-slate-500">Blocos inativos</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{inactiveItemsCount}</p>
          </div>
        </div>
      ) : null}

      {success && !modalOpen ? <StatusBanner type="success" title="Sucesso" message={success} /> : null}

      {error && !modalOpen ? (
        <StatusBanner type="error" title="Erro ao carregar disponibilidade" message={error} />
      ) : null}

      <SectionCard>
        {!effectiveBarberId ? (
          <EmptyState
            eyebrow="Sem barbeiro selecionado"
            title="Escolha um barbeiro para continuar"
            description="Selecione um profissional para visualizar e editar a disponibilidade."
          />
        ) : loading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock
                key={index}
                className="h-48 border border-slate-200/90 bg-white"
                lines={3}
              />
            ))}
          </div>
        ) : (
          <AvailabilityTable
            items={items}
            onEdit={openEditModal}
            onDelete={handleDelete}
            deleting={submitting}
          />
        )}
      </SectionCard>

      <AvailabilityFormModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSave}
        barberId={Number(effectiveBarberId || 0)}
        initialData={editingItem}
        submitting={submitting}
        submitError={error}
      />

      <StoreHourFormModal
        open={storeModalOpen}
        onClose={closeStoreModal}
        onSubmit={handleSaveStoreHour}
        initialData={editingStoreItem}
        submitting={submittingStoreHours}
        submitError={storeHoursError}
      />
    </div>
  );
}
