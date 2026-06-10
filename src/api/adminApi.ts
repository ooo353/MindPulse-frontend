import apiClient from './index';
import type { ApiResponse } from '@/types/auth';
import type { AuditLog, AdminUser, AuditLogQuery, AdminStats } from '@/types/admin';

export const adminApi = {
  async getAuditLogs(query: AuditLogQuery = {}): Promise<{ records: AuditLog[]; total: number }> {
    const res = await apiClient.get<ApiResponse<{ records: AuditLog[]; total: number }>>('/admin/audit-logs', { params: query });
    return res.data.data;
  },

  async getUsers(): Promise<AdminUser[]> {
    const res = await apiClient.get<ApiResponse<AdminUser[]>>('/admin/users');
    return res.data.data;
  },

  async updateUserRole(id: number, role: string): Promise<void> {
    await apiClient.put<ApiResponse<void>>(`/admin/users/${id}/role`, { role });
  },

  async getStats(): Promise<AdminStats> {
    const res = await apiClient.get<ApiResponse<AdminStats>>('/admin/stats');
    return res.data.data;
  }
};
