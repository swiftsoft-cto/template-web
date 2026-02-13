// ==============================|| PROJECTS TYPES ||============================== //

export type ProjectType = 'SOFTWARE' | 'AGENTS_AI' | 'CONSULTING' | 'OTHER';

export type Project = {
  id: string;
  projectName: string;
  projectCode: string;
  description?: string | null;
  projectType: ProjectType;
  customerId: string;
  hasSignedContract: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  customer?: {
    id: string;
    displayName: string;
    kind?: string;
  };
};

export type ProjectListParams = {
  q?: string;
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: 'createdAt' | 'updatedAt' | 'projectName' | 'projectCode';
  order?: 'asc' | 'desc';
  customerId?: string;
};

export type ProjectListResponse = {
  data: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export type CreateProjectPayload = {
  projectName: string;
  projectCode: string;
  description?: string | null;
  projectType?: ProjectType;
  customerId: string;
};

export type UpdateProjectPayload = {
  projectName?: string;
  projectCode?: string;
  description?: string | null;
  projectType?: ProjectType;
  customerId?: string;
};
