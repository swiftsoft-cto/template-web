import axios from 'utils/axios';
import type {
  Contract,
  ContractListParams,
  ContractListResponse,
  PreviewContractPayload,
  PreviewContractResponse,
  CreateContractPayload,
  UpdateContractPayload
} from 'types/contracts';
import { extractFilenameFromContentDisposition } from 'utils/download';

/**
 * Preview de contrato (sem salvar no banco)
 */
export async function previewContract(payload: PreviewContractPayload): Promise<PreviewContractResponse> {
  const { data } = await axios.post<PreviewContractResponse>('/contracts/preview', payload);
  return data;
}

/**
 * Lista contratos com paginação e filtros
 */
export async function listContracts(params?: ContractListParams): Promise<ContractListResponse> {
  const queryParams: any = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
    orderBy: params?.orderBy ?? 'createdAt',
    order: params?.order ?? 'desc'
  };

  if (params?.projectId) {
    queryParams.projectId = params.projectId;
  }
  if (params?.customerId) {
    queryParams.customerId = params.customerId;
  }
  if (params?.templateId) {
    queryParams.templateId = params.templateId;
  }
  if (params?.status) {
    queryParams.status = params.status;
  }

  const { data } = await axios.get<ContractListResponse>('/contracts', { params: queryParams });
  return data;
}

/**
 * Busca um contrato por ID
 */
export async function getContract(id: string): Promise<Contract> {
  const { data } = await axios.get<Contract>(`/contracts/${id}`);
  return data;
}

/**
 * Cria um novo contrato
 */
export async function createContract(payload: CreateContractPayload): Promise<Contract> {
  const { data } = await axios.post<Contract>('/contracts', payload);
  return data;
}

/**
 * Atualiza um contrato existente
 */
export async function updateContract(id: string, payload: UpdateContractPayload): Promise<Contract> {
  const { data } = await axios.patch<Contract>(`/contracts/${id}`, payload);
  return data;
}

/**
 * Deleta um contrato (soft delete)
 */
export async function deleteContract(id: string): Promise<void> {
  await axios.delete(`/contracts/${id}`);
}

/**
 * Exporta um contrato para DOCX (retorna Blob + filename opcional via Content-Disposition)
 */
export async function exportContractToDocx(id: string): Promise<{ blob: Blob; filename?: string }> {
  const res = await axios.get(`/contracts/${id}/docx`, { responseType: 'blob' });
  const cd = (res.headers as any)?.['content-disposition'] as string | undefined;
  const filename = extractFilenameFromContentDisposition(cd) || undefined;
  return { blob: res.data as Blob, filename };
}

/**
 * Exporta um contrato para PDF (retorna Blob + filename opcional via Content-Disposition)
 */
export async function exportContractToPdf(id: string): Promise<{ blob: Blob; filename?: string }> {
  const res = await axios.get(`/contracts/${id}/pdf`, { responseType: 'blob' });
  const cd = (res.headers as any)?.['content-disposition'] as string | undefined;
  const filename = extractFilenameFromContentDisposition(cd) || undefined;
  return { blob: res.data as Blob, filename };
}
