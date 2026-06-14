import apiClient from './index';
import type { ApiResponse } from '@/types/auth';
import type { PomodoroSession, PomodoroStats, CreatePomodoroRequest } from '@/types/pomodoro';

export const pomodoroApi = {
  async startSession(data: CreatePomodoroRequest): Promise<PomodoroSession> {
    const res = await apiClient.post<ApiResponse<PomodoroSession>>('/pomodoro/start', data);
    return res.data.data;
  },

  async completeSession(id: number): Promise<PomodoroSession> {
    const res = await apiClient.put<ApiResponse<PomodoroSession>>(`/pomodoro/${id}/complete`);
    return res.data.data;
  },

  async cancelSession(id: number): Promise<PomodoroSession> {
    const res = await apiClient.put<ApiResponse<PomodoroSession>>(`/pomodoro/${id}/cancel`);
    return res.data.data;
  },

  async getActiveSession(): Promise<PomodoroSession | null> {
    const res = await apiClient.get<ApiResponse<PomodoroSession | null>>('/pomodoro/active');
    return res.data.data;
  },

  async getStats(period: string = 'daily'): Promise<PomodoroStats> {
    const res = await apiClient.get<ApiResponse<PomodoroStats>>('/pomodoro/stats', { params: { period } });
    return res.data.data;
  },

  async getHistory(page: number = 1, size: number = 10): Promise<PomodoroSession[]> {
    const res = await apiClient.get<ApiResponse<PomodoroSession[]>>('/pomodoro/history', { params: { page, size } });
    return res.data.data;
  },

  async deleteSession(id: number): Promise<void> {
    await apiClient.delete(`/pomodoro/${id}`);
  },

  async clearHistory(): Promise<void> {
    await apiClient.delete('/pomodoro/history');
  },

  async getDailySummary(date?: string): Promise<{ sessionType: string; totalMinutes: number }[]> {
    const params = date ? { date } : {};
    const res = await apiClient.get<ApiResponse<{ sessionType: string; totalMinutes: number }[]>>('/pomodoro/daily-summary', { params });
    return res.data.data;
  }
};
