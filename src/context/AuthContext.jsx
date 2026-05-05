import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { AUTH_INVALID_EVENT } from "../services/api.js";
import {
  AUTH_REDIRECT_KEY,
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  buildUserFromAuthResponse,
} from "../utils/auth.js";

const AuthContext = createContext(null);

function loadStoredSession() {
  const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
  const storedUser = localStorage.getItem(AUTH_USER_KEY);

  if (!storedToken || !storedUser) {
    return { token: null, user: null };
  }

  try {
    const parsedUser = JSON.parse(storedUser);
    api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
    return { token: storedToken, user: parsedUser };
  } catch {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    delete api.defaults.headers.common.Authorization;
    return { token: null, user: null };
  }
}

function persistSession(token, user) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

function clearSessionStorage() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  delete api.defaults.headers.common.Authorization;
}

export function AuthProvider({ children }) {
  const storedSession = loadStoredSession();
  const [token, setToken] = useState(storedSession.token);
  const [user, setUser] = useState(storedSession.user);
  const [loading] = useState(false);

  const login = async ({ email, password }) => {
    const response = await api.post("/auth/login", { email, password });
    const data = response.data;

    if (!data?.token) {
      throw new Error("Credenciais inválidas.");
    }

    const userData = buildUserFromAuthResponse(data);

    persistSession(data.token, userData);
    setToken(data.token);
    setUser(userData);

    return { token: data.token, user: userData };
  };

  const register = async ({ name, email, password, phone }) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
      phone,
    });
    const data = response.data;

    if (!data?.token) {
      throw new Error("Não foi possível concluir o cadastro.");
    }

    const userData = buildUserFromAuthResponse(data);

    persistSession(data.token, userData);
    setToken(data.token);
    setUser(userData);

    return { token: data.token, user: userData };
  };

  const completeOAuthLogin = (data) => {
    if (!data?.token) {
      throw new Error("Não foi possível concluir o login com Google.");
    }

    const userData = buildUserFromAuthResponse(data);

    persistSession(data.token, userData);
    setToken(data.token);
    setUser(userData);

    return { token: data.token, user: userData };
  };

  const logout = () => {
    clearSessionStorage();
    localStorage.removeItem(AUTH_REDIRECT_KEY);
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const handleInvalidSession = () => {
      clearSessionStorage();
      setToken(null);
      setUser(null);
    };

    window.addEventListener(AUTH_INVALID_EVENT, handleInvalidSession);

    return () => {
      window.removeEventListener(AUTH_INVALID_EVENT, handleInvalidSession);
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      completeOAuthLogin,
      logout,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
