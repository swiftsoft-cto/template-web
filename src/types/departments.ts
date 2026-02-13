import type { UserBasic } from '../api/users';

export type DepartmentRow = {
  id: string;
  name: string;
  description?: string | null;
  company?: { id: string; name: string } | null;
  signatureUser?: UserBasic | null;
  createdAt?: string;
  updatedAt?: string;
};

export type DepartmentsListResponse = {
  message: string;
  data: DepartmentRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};
