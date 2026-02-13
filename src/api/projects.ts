import axios from 'utils/axios';
import { Project, ProjectListParams, ProjectListResponse, CreateProjectPayload, UpdateProjectPayload } from '../types/projects';

/**
 * Lista projetos com paginação, busca, filtros e ordenação
 */
export async function listProjects(params?: ProjectListParams): Promise<ProjectListResponse> {
  const queryParams: any = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
    orderBy: params?.orderBy ?? 'createdAt',
    order: params?.order ?? 'desc'
  };

  // Suporta tanto 'q' quanto 'search' como parâmetro de busca
  if (params?.q) {
    queryParams.q = params.q;
  } else if (params?.search) {
    queryParams.search = params.search;
  }

  if (params?.customerId) {
    queryParams.customerId = params.customerId;
  }

  const { data } = await axios.get<ProjectListResponse>('/projects', { params: queryParams });
  return data;
}

/**
 * Busca um projeto específico por ID
 */
export async function getProject(id: string): Promise<Project> {
  const { data } = await axios.get<Project>(`/projects/${id}`);
  return data;
}

/**
 * Cria um novo projeto
 */
export async function createProject(payload: CreateProjectPayload): Promise<Project> {
  const { data } = await axios.post<Project>('/projects', payload);
  return data;
}

/**
 * Atualiza um projeto existente (PATCH parcial)
 */
export async function updateProject(id: string, payload: UpdateProjectPayload): Promise<Project> {
  const { data } = await axios.patch<Project>(`/projects/${id}`, payload);
  return data;
}

/**
 * Deleta um projeto (soft delete)
 */
export async function deleteProject(id: string): Promise<{ message: string }> {
  const { data } = await axios.delete<{ message: string }>(`/projects/${id}`);
  return data;
}
