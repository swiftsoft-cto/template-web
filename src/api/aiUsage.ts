import axios from 'utils/axios';
import type { AiUsageListParams, AiUsageListResponse, AiUsageSummaryParams, AiUsageSummaryResponse } from 'types/ai-usage';

/**
 * Lista registros de uso de IA com suporte a filtros, ordenação e paginação
 */
export async function listAiUsage(params?: AiUsageListParams): Promise<AiUsageListResponse> {
  const { data } = await axios.get<AiUsageListResponse>('/ai/usage', {
    params: {
      model: params?.model,
      userId: params?.userId,
      kind: params?.kind,
      limit: params?.limit ?? 50,
      offset: params?.offset ?? 0,
      from: params?.from,
      to: params?.to,
      order: params?.order ?? 'desc'
    }
  });
  return data;
}

/**
 * Obtém resumo agregado do uso de IA
 */
export async function getAiUsageSummary(params?: AiUsageSummaryParams): Promise<AiUsageSummaryResponse> {
  const { data } = await axios.get<AiUsageSummaryResponse>('/ai/usage/summary', {
    params: {
      model: params?.model,
      userId: params?.userId,
      kind: params?.kind,
      topModels: params?.topModels ?? 10,
      topUsers: params?.topUsers ?? 10
    }
  });
  return data;
}
