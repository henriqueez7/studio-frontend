import { LogOut, Menu, UserCircle2 } from "lucide-react";
import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { normalizeRole, ROLE_BARBER, ROLE_CLIENT } from "../../utils/auth.js";

function formatRole(role) {
  switch (normalizeRole(role)) {
    case ROLE_BARBER:
      return "Painel do Barbeiro";
    case ROLE_CLIENT:
      return "Área do Cliente";
    default:
      return "Painel Administrativo";
  }
}

export default function Header({
  onOpenSidebar,
  showMenuButton = false,
}) {
  const { user, logout } = useAuth();
  const currentDateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      }).format(new Date()),
    [],
  );

  return (
    <header className="rounded-[28px] border border-slate-200/90 bg-white/80 px-4 py-4 shadow-[0_14px_30px_rgba(52,60,78,0.05)] backdrop-blur sm:px-5 sm:py-5 lg:flex lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        {showMenuButton ? (
          <button
            type="button"
            onClick={onOpenSidebar}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200/90 bg-white text-slate-700 transition hover:bg-slate-50 lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        ) : null}

        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#6d4cad] sm:text-xs sm:tracking-[0.28em]">
            {formatRole(user?.role)}
          </p>
          <h1 className="mt-1.5 truncate text-xl font-semibold text-slate-900 sm:mt-2 sm:text-2xl">
            Bem-vindo, {user?.name ?? "Usuário"}
          </h1>
          <p className="mt-2 text-sm capitalize text-slate-500">{currentDateLabel}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-0">
        <div className="hidden items-center gap-3 rounded-full border border-slate-200/90 bg-[#f6f8fc] px-4 py-3 sm:flex">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
              Status
            </p>
            <p className="text-sm font-semibold text-slate-900">Operação ativa</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-[22px] border border-slate-200/90 bg-[#f8fafd] px-3 py-3 shadow-[0_10px_24px_rgba(52,60,78,0.04)] sm:rounded-full sm:px-4">
          <UserCircle2 className="hidden h-6 w-6 shrink-0 text-[#6d4cad] sm:block" />
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-semibold text-slate-900">
              {user?.name ?? "Usuário"}
            </p>
            <p className="truncate text-xs text-slate-500">
              {user?.email || "Online agora"}
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ece7f7] text-[#6d4cad] transition hover:bg-[#dfd6f1]"
            aria-label="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
