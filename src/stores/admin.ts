import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AuditLog, AdminUser, AdminStats } from '@/types/admin';
import { adminApi } from '@/api/adminApi';

export const useAdminStore = defineStore('admin', () => {
  const auditLogs = ref<AuditLog[]>([]);
  const users = ref<AdminUser[]>([]);
  const stats = ref<AdminStats>({ totalUsers: 0, totalAuditLogs: 0, todayActions: 0 });
  const totalLogs = ref(0);
  const loadingCount = ref(0);
  const loading = computed(() => loadingCount.value > 0);
  const error = ref<string | null>(null);

  const fetchAuditLogs = async (query: { action?: string; resourceType?: string; userId?: string; page?: number; size?: number } = {}) => {
    try {
      loadingCount.value++;
      error.value = null;
      const result = await adminApi.getAuditLogs(query);
      auditLogs.value = result.records;
      totalLogs.value = result.total;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : '获取审计日志失败';
      throw err instanceof Error ? err : new Error(String(err));
    } finally {
      loadingCount.value--;
    }
  };

  const fetchUsers = async () => {
    try {
      loadingCount.value++;
      error.value = null;
      users.value = await adminApi.getUsers();
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : '获取用户列表失败';
      throw err instanceof Error ? err : new Error(String(err));
    } finally {
      loadingCount.value--;
    }
  };

  const fetchStats = async () => {
    try {
      loadingCount.value++;
      error.value = null;
      stats.value = await adminApi.getStats();
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : '获取统计数据失败';
      throw err instanceof Error ? err : new Error(String(err));
    } finally {
      loadingCount.value--;
    }
  };

  const updateUserRole = async (id: number, role: string) => {
    try {
      loadingCount.value++;
      error.value = null;
      await adminApi.updateUserRole(id, role);
      const index = users.value.findIndex(u => u.id === id);
      if (index !== -1) {
        users.value[index] = { ...users.value[index], role };
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '更新用户角色失败';
      error.value = message;
      throw err instanceof Error ? err : new Error(String(err));
    } finally {
      loadingCount.value--;
    }
  };

  return {
    auditLogs,
    users,
    stats,
    totalLogs,
    loading,
    error,
    fetchAuditLogs,
    fetchUsers,
    fetchStats,
    updateUserRole
  };
});
