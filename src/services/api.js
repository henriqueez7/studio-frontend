import axios from "axios";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "../utils/auth.js";

const AUTH_INVALID_EVENT = "studio-auth-invalid";
const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim();
const fallbackBaseUrl = import.meta.env.DEV ? "/api" : "";
const resolvedBaseUrl = configuredBaseUrl || fallbackBaseUrl;

const api = axios.create({
  baseURL: resolvedBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url ?? "";
    const isAuthRequest =
      requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");

    if (status === 401 && !isAuthRequest && typeof window !== "undefined") {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      delete api.defaults.headers.common.Authorization;
      window.dispatchEvent(new CustomEvent(AUTH_INVALID_EVENT));

      const currentPath = `${window.location.pathname}${window.location.search}`;
      const isAlreadyOnLogin = window.location.pathname === "/login";

      if (!isAlreadyOnLogin) {
        const next = encodeURIComponent(currentPath);
        window.location.replace(`/login?next=${next}`);
      }
    }

    return Promise.reject(error);
  },
);

export { AUTH_INVALID_EVENT };
export function getApiBaseUrl() {
  return resolvedBaseUrl;
}

export default api;
