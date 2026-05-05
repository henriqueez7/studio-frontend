export const ROLE_ADMIN = "ADMIN";
export const ROLE_BARBER = "BARBEIRO";
export const ROLE_CLIENT = "CLIENTE";

export const AUTH_TOKEN_KEY = "studio-token";
export const AUTH_USER_KEY = "studio-user";
export const AUTH_REDIRECT_KEY = "studio-auth-next";

export function normalizeRole(role) {
  if (!role) return null;

  const value = String(role).trim().toUpperCase();

  if (value.includes("ADMIN")) return ROLE_ADMIN;
  if (value.includes("BARBER") || value.includes("BARBEIRO")) {
    return ROLE_BARBER;
  }
  if (value.includes("CLIENT") || value.includes("CLIENTE")) {
    return ROLE_CLIENT;
  }

  return value;
}

export function getPrivatePath(role) {
  switch (normalizeRole(role)) {
    case ROLE_CLIENT:
      return "/agendar";
    case ROLE_BARBER:
      return "/barbeiro/agenda";
    case ROLE_ADMIN:
    default:
      return "/dashboard";
  }
}

export function isPathAllowedForRole(path, role) {
  const normalizedRole = normalizeRole(role);
  const normalizedPath = typeof path === "string" ? path : "";

  if (!normalizedPath.startsWith("/")) {
    return false;
  }

  switch (normalizedRole) {
    case ROLE_CLIENT:
      return normalizedPath.startsWith("/agendar") || normalizedPath.startsWith("/meus-agendamentos");
    case ROLE_BARBER:
      return (
        normalizedPath.startsWith("/barbeiro/agenda") ||
        normalizedPath.startsWith("/barbeiro/agendar") ||
        normalizedPath.startsWith("/barbeiro/comissoes") ||
        normalizedPath.startsWith("/barbeiro/disponibilidade") ||
        normalizedPath.startsWith("/products") ||
        normalizedPath.startsWith("/stock")
      );
    case ROLE_ADMIN:
      return true;
    default:
      return false;
  }
}

export function buildUserFromAuthResponse(data) {
  if (!data) return null;

  const role = normalizeRole(data.role);

  return {
    id: data.id ?? null,
    name: data.name ?? "Usuario",
    email: data.email ?? "",
    role: role ?? ROLE_CLIENT,
  };
}
