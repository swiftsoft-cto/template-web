export type AiUsageRecord = {
  id: string;
  kind: string;
  model: string;
  userId?: string;
  userName?: string;
  requestId?: string;
  callName?: string;
  promptTokens?: number;
  completionTokens?: number;
  cachedTokens?: number;
  totalTokens?: number;
  costUsd?: number;
  createdAt: string;
};

export type AiUsageListParams = {
  model?: string;
  userId?: string;
  kind?: string;
  limit?: number;
  offset?: number;
  from?: string;
  to?: string;
  order?: 'asc' | 'desc';
};

export type AiUsageListResponse = {
  total: number;
  limit: number;
  offset: number;
  order: 'asc' | 'desc';
  totalCostUsd: number;
  calls: number;
  promptTokens: number;
  completionTokens: number;
  cachedTokens: number;
  totalTokens: number;
  costUsd: number;
  items: AiUsageRecord[];
};

export type AiUsageAgg = {
  calls: number;
  promptTokens: number;
  completionTokens: number;
  cachedTokens: number;
  totalTokens: number;
  costUsd?: number;
  updatedAt: string;
};

export type AiUsageSummaryParams = {
  model?: string;
  userId?: string;
  kind?: string;
  topModels?: number;
  topUsers?: number;
};

export type AiUsageSummaryResponse = {
  global: AiUsageAgg;
  byModel?: Array<AiUsageAgg & { model: string }>;
  byUser?: Array<AiUsageAgg & { userId: string }>;
  model?: AiUsageAgg & { key: string };
  user?: AiUsageAgg & { key: string };
  modelUser?: AiUsageAgg & { model: string; userId: string };
};
