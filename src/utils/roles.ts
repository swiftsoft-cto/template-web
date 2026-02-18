/**
 * Nomes de função considerados "administrador".
 * O sistema deve manter sempre pelo menos um usuário com uma dessas funções.
 */
export const ADMIN_ROLE_NAMES = ['Administrador', 'Admin', 'administrator'] as const;

function normalizeRoleName(name: string | null | undefined): string {
  return (name ?? '').trim().toLowerCase();
}

/** Verifica se o nome da função corresponde a administrador */
export function isAdminRoleName(roleName: string | null | undefined): boolean {
  const n = normalizeRoleName(roleName);
  return n.length > 0 && ADMIN_ROLE_NAMES.some((a) => normalizeRoleName(a) === n);
}

/** Verifica se o usuário tem função de administrador (por role.name) */
export function isAdminUser(user: { role?: { name?: string | null } | null } | null): boolean {
  return isAdminRoleName(user?.role?.name);
}
