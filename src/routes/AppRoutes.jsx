import { Suspense, lazy } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  ROLE_ADMIN,
  ROLE_BARBER,
  ROLE_CLIENT,
  getPrivatePath,
  normalizeRole,
} from "../utils/auth.js";
import "./AppRoutes.css";

const AppLayout = lazy(() => import("../layouts/AppLayout.jsx"));
const LandingPage = lazy(() => import("../pages/LandingPage.jsx"));
const LoginPage = lazy(() => import("../pages/LoginPage.jsx"));
const RegisterPage = lazy(() => import("../pages/RegisterPage.jsx"));
const GoogleAuthCallbackPage = lazy(() => import("../pages/GoogleAuthCallbackPage.jsx"));
const DashboardPage = lazy(() => import("../pages/DashboardPage.jsx"));
const ProfessionalsPage = lazy(() => import("../pages/ProfessionalsPage.jsx"));
const ClientsPage = lazy(() => import("../pages/ClientsPage.jsx"));
const AppointmentNotificationsPage = lazy(() => import("../pages/AppointmentNotificationsPage.jsx"));
const ServicesPage = lazy(() => import("../pages/ServicesPage.jsx"));
const StockPage = lazy(() => import("../pages/StockPage.jsx"));
const ExpensesPage = lazy(() => import("../pages/ExpensesPage.jsx"));
const AppointmentsPage = lazy(() => import("../pages/AppointmentsPage.jsx"));
const InvestmentsPage = lazy(() => import("../pages/InvestmentsPage.jsx"));
const AgendarPage = lazy(() => import("../pages/AgendarPage.jsx"));
const MyAppointmentsPage = lazy(() => import("../pages/MyAppointmentsPage.jsx"));
const BarberCommissionsPage = lazy(() => import("../pages/BarberCommissionsPage.jsx"));
const BarberAvailabilityPage = lazy(() => import("../pages/BarberAvailabilityPage.jsx"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage.jsx"));

function LoadingRoute({ message }) {
  return (
    <div className="protected-route">
      <div className="protected-route__card">
        <p>{message}</p>
      </div>
    </div>
  );
}

function withSuspense(element, message) {
  return <Suspense fallback={<LoadingRoute message={message} />}>{element}</Suspense>;
}

function PublicRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingRoute message="Verificando sessao..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={getPrivatePath(user?.role)} replace />;
  }

  return children;
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingRoute message="Carregando painel..." />;
  }

  if (!isAuthenticated) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }

  return children;
}

function RoleRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingRoute message="Carregando permissoes..." />;
  }

  const role = normalizeRole(user?.role);

  if (!allowedRoles.includes(role)) {
    return <Navigate to={getPrivatePath(role)} replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            {withSuspense(<LandingPage />, "Carregando pagina inicial...")}
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            {withSuspense(<LoginPage />, "Carregando login...")}
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            {withSuspense(<RegisterPage />, "Carregando cadastro...")}
          </PublicRoute>
        }
      />
      <Route
        path="/auth/google/callback"
        element={withSuspense(<GoogleAuthCallbackPage />, "Concluindo login...")}
      />

      <Route
        element={
          <ProtectedRoute>
            {withSuspense(<AppLayout />, "Carregando painel...")}
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={
            <RoleRoute allowedRoles={[ROLE_ADMIN]}>
              {withSuspense(<DashboardPage />, "Carregando dashboard...")}
            </RoleRoute>
          }
        />
        <Route
          path="/professionals"
          element={
            <RoleRoute allowedRoles={[ROLE_ADMIN]}>
              {withSuspense(<ProfessionalsPage />, "Carregando profissionais...")}
            </RoleRoute>
          }
        />
        <Route
          path="/barbers"
          element={
            <RoleRoute allowedRoles={[ROLE_ADMIN]}>
              <Navigate to="/professionals" replace />
            </RoleRoute>
          }
        />
        <Route
          path="/clients"
          element={
            <RoleRoute allowedRoles={[ROLE_ADMIN]}>
              {withSuspense(<ClientsPage />, "Carregando clientes...")}
            </RoleRoute>
          }
        />
        <Route
          path="/settings/notifications"
          element={
            <RoleRoute allowedRoles={[ROLE_ADMIN]}>
              {withSuspense(<AppointmentNotificationsPage />, "Carregando mensagens automaticas...")}
            </RoleRoute>
          }
        />
        <Route
          path="/services"
          element={
            <RoleRoute allowedRoles={[ROLE_ADMIN]}>
              {withSuspense(<ServicesPage />, "Carregando servicos...")}
            </RoleRoute>
          }
        />
        <Route
          path="/products"
          element={
            <RoleRoute allowedRoles={[ROLE_ADMIN, ROLE_BARBER]}>
              <Navigate to="/stock" replace />
            </RoleRoute>
          }
        />
        <Route
          path="/stock"
          element={
            <RoleRoute allowedRoles={[ROLE_ADMIN, ROLE_BARBER]}>
              {withSuspense(<StockPage />, "Carregando estoque...")}
            </RoleRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <RoleRoute allowedRoles={[ROLE_ADMIN]}>
              {withSuspense(<ExpensesPage />, "Carregando despesas...")}
            </RoleRoute>
          }
        />
        <Route
          path="/commissions"
          element={
            <RoleRoute allowedRoles={[ROLE_ADMIN]}>
              <Navigate to="/professionals?tab=commissions" replace />
            </RoleRoute>
          }
        />
        <Route
          path="/investments"
          element={
            <RoleRoute allowedRoles={[ROLE_ADMIN]}>
              {withSuspense(<InvestmentsPage />, "Carregando investimentos...")}
            </RoleRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <RoleRoute allowedRoles={[ROLE_ADMIN]}>
              {withSuspense(<AppointmentsPage />, "Carregando agenda geral...")}
            </RoleRoute>
          }
        />
        <Route
          path="/admin/disponibilidade"
          element={
            <RoleRoute allowedRoles={[ROLE_ADMIN]}>
              {withSuspense(<BarberAvailabilityPage />, "Carregando disponibilidade...")}
            </RoleRoute>
          }
        />
        <Route
          path="/agendar"
          element={
            <RoleRoute allowedRoles={[ROLE_CLIENT, ROLE_ADMIN]}>
              {withSuspense(<AgendarPage />, "Carregando agendamento...")}
            </RoleRoute>
          }
        />
        <Route
          path="/meus-agendamentos"
          element={
            <RoleRoute allowedRoles={[ROLE_CLIENT, ROLE_ADMIN]}>
              {withSuspense(<MyAppointmentsPage />, "Carregando seus agendamentos...")}
            </RoleRoute>
          }
        />
        <Route
          path="/barbeiro/agenda"
          element={
            <RoleRoute allowedRoles={[ROLE_BARBER, ROLE_ADMIN]}>
              {withSuspense(<AppointmentsPage />, "Carregando agenda...")}
            </RoleRoute>
          }
        />
        <Route
          path="/barbeiro/agendar"
          element={
            <RoleRoute allowedRoles={[ROLE_BARBER, ROLE_ADMIN]}>
              <Navigate to="/barbeiro/agenda" replace />
            </RoleRoute>
          }
        />
        <Route
          path="/barbeiro/comissoes"
          element={
            <RoleRoute allowedRoles={[ROLE_BARBER, ROLE_ADMIN]}>
              {withSuspense(<BarberCommissionsPage />, "Carregando comissoes...")}
            </RoleRoute>
          }
        />
        <Route
          path="/barbeiro/disponibilidade"
          element={
            <RoleRoute allowedRoles={[ROLE_BARBER, ROLE_ADMIN]}>
              {withSuspense(<BarberAvailabilityPage />, "Carregando disponibilidade...")}
            </RoleRoute>
          }
        />
      </Route>

      <Route path="/404" element={withSuspense(<NotFoundPage />, "Carregando pagina...")} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
