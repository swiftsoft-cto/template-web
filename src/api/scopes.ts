import axios from 'utils/axios';
import { Scope, ScopeListParams, ScopeListResponse, CreateScopePayload, UpdateScopePayload } from '../types/scopes';

/**
 * Lista escopos com paginação, filtros e ordenação
 */
export async function listScopes(params?: ScopeListParams): Promise<ScopeListResponse> {
  const queryParams: any = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
    orderBy: params?.orderBy ?? 'createdAt',
    order: params?.order ?? 'desc'
  };

  if (params?.projectId) {
    queryParams.projectId = params.projectId;
  }

  if (params?.name) {
    queryParams.name = params.name;
  }

  const { data } = await axios.get<ScopeListResponse>('/projects/scopes', { params: queryParams });
  return data;
}

/**
 * Busca um escopo específico por ID
 */
export async function getScope(id: string): Promise<Scope> {
  const { data } = await axios.get<Scope>(`/projects/scopes/${id}`);
  return data;
}

/**
 * Cria um novo escopo de projeto
 */
export async function createScope(payload: CreateScopePayload): Promise<Scope> {
  const { data } = await axios.post<Scope>('/projects/scopes', payload);
  return data;
}

/**
 * Atualiza um escopo existente (PATCH parcial)
 */
export async function updateScope(id: string, payload: UpdateScopePayload): Promise<Scope> {
  const { data } = await axios.patch<Scope>(`/projects/scopes/${id}`, payload);
  return data;
}

/**
 * Deleta um escopo (soft delete)
 */
export async function deleteScope(id: string): Promise<{ message: string }> {
  const { data } = await axios.delete<{ message: string }>(`/projects/scopes/${id}`);
  return data;
}
