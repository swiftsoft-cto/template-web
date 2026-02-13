// ==============================|| SCOPES TYPES ||============================== //

export type ScopeStatus = 'created' | 'in_review' | 'finalized';

export type Scope = {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  briefText: string;
  scopeHtml: string;
  version: number;
  status: ScopeStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  project?: {
    id: string;
    projectName: string;
    projectCode: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
};

export type ScopeListParams = {
  projectId?: string;
  name?: string;
  page?: number;
  limit?: number;
  orderBy?: 'createdAt' | 'updatedAt';
  order?: 'asc' | 'desc';
};

export type ScopeListResponse = {
  data: Scope[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export type CreateScopePayload = {
  projectId: string;
  name: string;
  briefText: string;
};

export type UpdateScopePayload = {
  name?: string;
  briefText?: string;
  scopeHtml?: string;
  status?: ScopeStatus;
};
