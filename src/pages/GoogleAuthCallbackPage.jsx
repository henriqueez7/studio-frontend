import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  AUTH_REDIRECT_KEY,
  getPrivatePath,
  isPathAllowedForRole,
} from "../utils/auth.js";

export default function GoogleAuthCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeOAuthLogin } = useAuth();
  const [message, setMessage] = useState("Concluindo login com Google...");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const oauthError = searchParams.get("oauthError");

    if (oauthError) {
      navigate("/login?oauthError=google_login_failed", { replace: true });
      return;
    }

    const payload = {
      token: searchParams.get("token"),
      id: searchParams.get("id"),
      name: searchParams.get("name"),
      email: searchParams.get("email"),
      role: searchParams.get("role"),
    };

    try {
      const result = completeOAuthLogin(payload);
      const next = localStorage.getItem(AUTH_REDIRECT_KEY);
      localStorage.removeItem(AUTH_REDIRECT_KEY);

      const fallbackPath = getPrivatePath(result.user?.role);
      const safeNext = isPathAllowedForRole(next, result.user?.role)
        ? next
        : fallbackPath;

      navigate(safeNext, { replace: true });
    } catch {
      setMessage("Nao foi possivel concluir o login com Google.");
      navigate("/login?oauthError=google_login_failed", { replace: true });
    }
  }, [completeOAuthLogin, location.search, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fbff] px-4">
      <div className="rounded-[28px] border border-slate-200 bg-white px-8 py-10 text-center shadow-[0_20px_50px_rgba(52,60,78,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#6d4cad]">
          Login Google
        </p>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">{message}</h1>
      </div>
    </div>
  );
}
