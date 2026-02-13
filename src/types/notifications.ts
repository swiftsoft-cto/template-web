// ==============================|| NOTIFICATIONS TYPES ||============================== //

export type NotificationEntity = 'finance' | 'contract' | 'project' | 'user' | 'system' | string;

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  entity: NotificationEntity;
  registerId?: string | null;
  read: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NotificationListParams = {
  page?: number;
  limit?: number;
  search?: string;
  read?: boolean;
  entity?: NotificationEntity;
  sortBy?: 'createdAt' | 'readAt' | 'title';
  sortOrder?: 'asc' | 'desc';
};

export type NotificationListResponse = {
  message: string;
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type NotificationCountResponse = {
  message: string;
  data: {
    count: number;
  };
};

export type CreateNotificationPayload = {
  userId: string;
  title: string;
  message: string;
  entity: NotificationEntity;
  registerId?: string | null;
};

export type MarkReadPayload = {
  read: boolean;
};
