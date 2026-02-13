import axios from 'utils/axios';
import type {
  ContractTemplate,
  ContractTemplateListParams,
  ContractTemplateListResponse,
  CreateContractTemplatePayload,
  UpdateContractTemplatePayload
} from 'types/contracts';

/**
 * Lista templates de contrato com paginação e filtros
 */
export async function listContractTemplates(params?: ContractTemplateListParams): Promise<ContractTemplateListResponse> {
  const queryParams: any = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
    orderBy: params?.orderBy ?? 'createdAt',
    order: params?.order ?? 'desc'
  };

  if (params?.projectId) {
    queryParams.projectId = params.projectId;
  }

  const { data } = await axios.get<ContractTemplateListResponse>('/contracts/templates', { params: queryParams });
  return data;
}

/**
 * Busca um template de contrato por ID
 */
export async function getContractTemplate(id: string): Promise<ContractTemplate> {
  const { data } = await axios.get<ContractTemplate>(`/contracts/templates/${id}`);
  return data;
}

/**
 * Cria um novo template de contrato
 */
export async function createContractTemplate(payload: CreateContractTemplatePayload): Promise<ContractTemplate> {
  const { data } = await axios.post<ContractTemplate>('/contracts/templates', payload);
  return data;
}

/**
 * Atualiza um template de contrato existente
 */
export async function updateContractTemplate(id: string, payload: UpdateContractTemplatePayload): Promise<ContractTemplate> {
  const { data } = await axios.patch<ContractTemplate>(`/contracts/templates/${id}`, payload);
  return data;
}

/**
 * Deleta um template de contrato (soft delete)
 */
export async function deleteContractTemplate(id: string): Promise<void> {
  await axios.delete(`/contracts/templates/${id}`);
}
