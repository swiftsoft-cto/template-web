// ==============================|| CONTRACTS TYPES ||============================== //

export type ContractTemplate = {
  id: string;
  name: string;
  description?: string | null;
  projectId?: string | null;
  templateHtml: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  project?: {
    id: string;
    projectName: string;
    projectCode: string;
  };
};

export type ContractTemplateListParams = {
  projectId?: string;
  page?: number;
  limit?: number;
  orderBy?: 'createdAt' | 'updatedAt';
  order?: 'asc' | 'desc';
};

export type ContractTemplateListResponse = {
  data: ContractTemplate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export type CreateContractTemplatePayload = {
  name: string;
  description?: string | null;
  projectId?: string | null;
  templateHtml: string;
};

export type UpdateContractTemplatePayload = {
  name?: string;
  description?: string | null;
  templateHtml?: string;
};

export type ContractStatus = 'draft' | 'final' | 'signed' | 'canceled';

export type Contract = {
  id: string;
  projectId?: string | null;
  customerId?: string | null;
  userId?: string | null;
  templateId: string;
  scopeId?: string | null;
  title?: string | null;
  autentiqueDocumentId?: string | null;
  monthlyValue?: number | null;
  monthsCount?: number | null;
  firstPaymentDay?: number | null;
  contractHtml: string;
  unresolvedPlaceholders?: string[];
  status: ContractStatus;
  isLocked: boolean;
  variables?: Record<string, string>;
  templateSnapshot?: string | null;
  scopeSnapshot?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  project?: {
    id: string;
    projectName: string;
    projectCode: string;
  };
  customer?: {
    id: string;
    displayName: string;
    kind?: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
  template?: {
    id: string;
    name: string;
  };
  scope?: {
    id: string;
    briefText?: string | null;
  };
};

export type ContractListParams = {
  projectId?: string;
  customerId?: string;
  templateId?: string;
  status?: ContractStatus;
  page?: number;
  limit?: number;
  orderBy?: 'createdAt' | 'updatedAt';
  order?: 'asc' | 'desc';
};

export type ContractListResponse = {
  data: Contract[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export type PreviewContractPayload = {
  projectId?: string | null;
  customerId?: string | null;
  userId?: string | null;
  templateId: string;
  scopeId?: string | null;
  title?: string | null;
  monthlyValue?: number | null;
  monthsCount?: number | null;
  firstPaymentDay?: number | null;
  variables?: Record<string, string>;
};

export type PreviewContractResponse = {
  contractHtml: string;
  unresolvedPlaceholders: string[];
  variables: Record<string, string>;
  title: string;
};

export type CreateContractPayload = {
  projectId?: string | null;
  customerId?: string | null;
  userId?: string | null;
  templateId: string;
  scopeId?: string | null;
  title?: string | null;
  monthlyValue?: number | null;
  monthsCount?: number | null;
  firstPaymentDay?: number | null;
  variables?: Record<string, string>;
};

export type UpdateContractPayload = {
  userId?: string | null;
  scopeId?: string | null;
  title?: string | null;
  autentiqueDocumentId?: string | null;
  monthlyValue?: number | null;
  monthsCount?: number | null;
  firstPaymentDay?: number | null;
  variables?: Record<string, string>;
  status?: ContractStatus;
  contractHtml?: string;
  isLocked?: boolean;
};
