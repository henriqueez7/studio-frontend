import {
  Activity,
  CalendarDays,
  Clock3,
  CreditCard,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Scissors,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  ROLE_ADMIN,
  ROLE_BARBER,
  ROLE_CLIENT,
  normalizeRole,
} from "../../utils/auth.js";

const links = [
  { label: "Resumo financeiro", to: "/dashboard", icon: Activity, roles: [ROLE_ADMIN], section: "Visao geral" },
  { label: "Agenda geral", to: "/appointments", icon: CalendarDays, roles: [ROLE_ADMIN], section: "Operacao" },
  { label: "Profissionais e comissoes", to: "/professionals", icon: Users, roles: [ROLE_ADMIN], section: "Cadastros" },
  { label: "Clientes", to: "/clients", icon: Users, roles: [ROLE_ADMIN], section: "Cadastros" },
  { label: "Servicos", to: "/services", icon: Scissors, roles: [ROLE_ADMIN], section: "Cadastros" },
  { label: "Estoque", to: "/stock", icon: Wallet, roles: [ROLE_ADMIN, ROLE_BARBER], section: "Cadastros" },
  { label: "Disponibilidade", to: "/admin/disponibilidade", icon: Clock3, roles: [ROLE_ADMIN], section: "Cadastros" },
  { label: "Despesas", to: "/expenses", icon: CreditCard, roles: [ROLE_ADMIN], section: "Financeiro" },
  { label: "Investimentos", to: "/investments", icon: ShieldCheck, roles: [ROLE_ADMIN], section: "Financeiro" },
  { label: "Mensagens", to: "/settings/notifications", icon: MessageCircle, roles: [ROLE_ADMIN], section: "Relacionamento" },
  { label: "Agendar", to: "/agendar", icon: CalendarDays, roles: [ROLE_CLIENT], section: "Cliente" },
  { label: "Meus agendamentos", to: "/meus-agendamentos", icon: CalendarDays, roles: [ROLE_CLIENT], section: "Cliente" },
  { label: "Agenda", to: "/barbeiro/agenda", icon: CalendarDays, roles: [ROLE_BARBER], section: "Barbeiro" },
  { label: "Comissoes", to: "/barbeiro/comissoes", icon: TrendingUp, roles: [ROLE_BARBER], section: "Barbeiro" },
];

export default function Sidebar({ onNavigate, collapsed = false, onToggleCollapse }) {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const visibleLinks = links.filter((link) => link.roles.includes(role));
  const sectionOrder = Array.from(new Set(visibleLinks.map((link) => link.section)));

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className={`mb-4 flex items-center ${collapsed ? "justify-center" : "justify-between gap-3"}`}>
        {!collapsed ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Navegacao
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              Menu lateral
            </p>
          </div>
        ) : null}

        {onToggleCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200/90 bg-white text-slate-700 shadow-[0_10px_24px_rgba(52,60,78,0.05)] transition hover:border-[#6d4cad]/20 hover:text-[#6d4cad]"
            aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
            title={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </button>
        ) : null}
      </div>

      <div className={`min-h-0 flex-1 overflow-visible pb-6 ${collapsed ? "pr-0" : "pr-1"}`}>
        <nav className="space-y-5">
          {sectionOrder.map((section) => (
            <div key={section}>
              {!collapsed ? (
                <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  {section}
                </p>
              ) : (
                <div className="mb-3 flex justify-center">
                  <span className="h-px w-8 bg-slate-200" />
                </div>
              )}

              <div className="space-y-1.5">
                {visibleLinks
                  .filter((link) => link.section === section)
                  .map((link) => {
                    const IconComponent = link.icon;

                    return (
                      <NavLink
                        key={`${link.to}-${link.label}`}
                        to={link.to}
                        onClick={onNavigate}
                        title={link.label}
                        className={({ isActive }) =>
                          `group flex items-center rounded-[22px] text-sm font-medium transition-all duration-200 ${
                            isActive
                              ? "border border-[#6d4cad]/10 bg-gradient-to-r from-[#6d4cad] to-[#7b57c3] text-white shadow-[0_14px_28px_rgba(109,76,173,0.2)]"
                              : "border border-transparent text-slate-600 hover:border-slate-200/90 hover:bg-white/90 hover:text-slate-900"
                          } ${collapsed ? "justify-center px-2.5 py-2.5" : "gap-3 px-3.5 py-3"}`
                        }
                      >
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-current shadow-[0_8px_18px_rgba(52,60,78,0.05)]">
                          <IconComponent className="h-5 w-5 shrink-0" />
                        </span>
                        {!collapsed ? <span className="truncate">{link.label}</span> : null}
                      </NavLink>
                    );
                  })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
