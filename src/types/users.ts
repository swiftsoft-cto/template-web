export type RoleLite = {
  id: string;
  name: string;
  description?: string | null;
  companyId: string;
};

export type DepartmentLite = {
  id: string;
  name: string;
  description?: string | null;
};

export type UserRow = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  cpf?: string | null; // pode vir ou não, depende da permissão
  cnpj?: string | null; // pode vir ou não, depende da permissão
  birthdate?: string | null; // ISO
  emailVerifiedAt?: string | null; // ISO timestamp ou null
  postalCode?: string | null;
  address?: string | null;
  addressState?: string | null;
  addressCity?: string | null;
  addressNeighborhood?: string | null;
  service?: string | null;
  createdAt: string;
  updatedAt: string;
  role?: RoleLite | null;
  departments?: DepartmentLite[];
  isBlocked?: boolean; // indica se o usuário está bloqueado
  avatarFileId?: string | null; // ID do arquivo de avatar para cache HTTP
};

export type UsersListResponse = {
  message: string;
  data: UserRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

/** Regra extra do usuário (UserRule) retornada por GET /users/me/extra-rules ou GET /users/:id/extra-rules */
export type UserExtraRule = {
  id: string;
  name: string;
  description: string | null;
  source: string;
  expiresAt: string | null;
};
