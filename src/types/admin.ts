export interface AuditLog {
  id: number;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: number | null;
  ipAddress: string | null;
  details: string | null;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface AuditLogQuery {
  action?: string;
  resourceType?: string;
  userId?: string;
  page?: number;
  size?: number;
}

export interface AdminStats {
  totalUsers: number;
  totalAuditLogs: number;
  todayActions: number;
}
