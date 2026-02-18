import axios from 'utils/axios';
import type { UserRow, UsersListResponse, UserExtraRule } from 'types/users';

export type UserBasic = {
  id: string;
  name: string;
  email: string;
  role?: { id: string; name: string; description?: string | null } | null;
  avatarFileId?: string | null;
};

type UserListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'email' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
};

/**
 * Lista usuários (escopo da empresa do usuário logado).
 * Aceita busca por nome/email.
 */
export async function searchUsers(params?: { search?: string; page?: number; limit?: number }) {
  const { data } = await axios.get<UsersListResponse>('/users', {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
      search: params?.search || undefined,
      sortBy: 'name',
      sortOrder: 'asc'
    }
  });
  return data;
}

/**
 * Lista usuários com parâmetros completos para ordenação
 */
export async function listUsers(params?: UserListParams) {
  const { data } = await axios.get<UsersListResponse>('/users', {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
      search: params?.search || undefined,
      sortBy: params?.sortBy || 'createdAt',
      sortOrder: params?.sortOrder || 'desc'
    }
  });
  return data;
}

/**
 * Busca um usuário por ID
 */
export async function getUser(id: string): Promise<UserRow> {
  const { data } = await axios.get<{ message: string; data: UserRow }>(`/users/${id}`);
  return data.data;
}

/**
 * Cria um novo usuário
 */
export async function createUser(payload: {
  name: string;
  email: string;
  phone?: string | null;
  cpf?: string | null;
  cnpj?: string | null;
  birthdate?: string | null;
  postalCode?: string | null;
  address?: string | null;
  addressState?: string | null;
  addressCity?: string | null;
  addressNeighborhood?: string | null;
  service?: string | null;
  password: string;
  roleId: string;
}) {
  const { data } = await axios.post<{ message: string; data: any }>('/users', payload);
  return data;
}

/**
 * Atualiza um usuário existente
 */
export async function updateUser(
  id: string,
  payload: {
    name?: string;
    email?: string;
    phone?: string | null;
    cpf?: string | null;
    cnpj?: string | null;
    birthdate?: string | null;
    postalCode?: string | null;
    address?: string | null;
    addressState?: string | null;
    addressCity?: string | null;
    addressNeighborhood?: string | null;
    service?: string | null;
    password?: string;
    roleId?: string | null;
  }
) {
  const { data } = await axios.patch<{ message: string; data: any }>(`/users/${id}`, payload);
  return data;
}

/**
 * Deleta um usuário
 */
export async function deleteUser(id: string) {
  const { data } = await axios.delete<{ message: string }>(`/users/${id}`);
  return data;
}

/**
 * Lista roles (funções/cargos)
 */
export async function listRoles(params?: { page?: number; limit?: number; search?: string }) {
  const { data } = await axios.get<{ message: string; data: any[]; pagination: any }>('/roles', {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
      search: params?.search || undefined
    }
  });
  return data;
}

/**
 * Define ou atualiza a função (role) de um usuário
 */
export async function setUserRole(userId: string, roleId: string) {
  const { data } = await axios.put<{ message: string }>(`/users/${userId}/role`, { roleId });
  return data;
}

/**
 * Lista as regras extras do usuário autenticado.
 * GET /users/me/extra-rules (exige JWT).
 */
export async function getMyExtraRules() {
  const { data } = await axios.get<{ message: string; data: UserExtraRule[] }>('/users/me/extra-rules');
  return data;
}

/**
 * Lista as regras extras de outro usuário.
 * GET /users/:id/extra-rules (exige JWT + users.read).
 */
export async function getUserExtraRules(userId: string) {
  const { data } = await axios.get<{ message: string; data: UserExtraRule[] }>(`/users/${userId}/extra-rules`);
  return data;
}

/**
 * Adiciona uma regra extra ao usuário.
 * POST /users/:userId/extra-rules (exige JWT + users.update).
 */
export async function addUserExtraRule(
  userId: string,
  payload: { ruleId: string; source?: string; expiresAt?: string | null }
) {
  const { data } = await axios.post<{ message: string }>(`/users/${userId}/extra-rules`, {
    ruleId: payload.ruleId,
    source: payload.source ?? 'manual',
    expiresAt: payload.expiresAt ?? null
  });
  return data;
}

/**
 * Revoga (soft) uma regra extra do usuário.
 * DELETE /users/:userId/extra-rules/:ruleId (exige JWT + users.update).
 */
export async function deleteUserExtraRule(userId: string, ruleId: string) {
  const { data } = await axios.delete<{ message: string }>(`/users/${userId}/extra-rules/${ruleId}`);
  return data;
}

/**
 * Ativa as regras de transcrição para o usuário autenticado.
 * Faz upsert das 13 regras no UserRule do usuário.
 */
export async function activateTranscriptionRules() {
  const { data } = await axios.post<{
    message: string;
    data: { activatedCount: number };
  }>('/users/me/activate-transcription-rules');
  return data;
}

/**
 * Atualiza o avatar de um usuário
 */
export async function updateUserAvatar(userId: string, file: File) {
  const formData = new FormData();
  formData.append('avatar', file);
  const { data } = await axios.put<{ message: string; data: any }>(`/users/${userId}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}
