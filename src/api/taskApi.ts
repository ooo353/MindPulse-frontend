import apiClient from './index';
import {
  Task, CreateTaskRequest, UpdateTaskRequest,
  AIParseRequest, AIParseResponseData, CacheStats
} from '@/types/task';
import { ApiResponse } from '@/types/auth';

export const taskApi = {
  getTasks: async (status?: string): Promise<Task[]> => {
    const params = status ? { status } : {};
    const res = await apiClient.get<ApiResponse<Task[]>>('/tasks', { params });
    return res.data.data;
  },

  getTaskById: async (id: number): Promise<Task> => {
    const res = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`);
    return res.data.data;
  },

  createTask: async (data: CreateTaskRequest): Promise<Task> => {
    const res = await apiClient.post<ApiResponse<Task>>('/tasks', data);
    return res.data.data;
  },

  updateTask: async (id: number, data: UpdateTaskRequest): Promise<Task> => {
    const res = await apiClient.put<ApiResponse<Task>>(`/tasks/${id}`, data);
    return res.data.data;
  },

  deleteTask: async (id: number): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },

  parseTaskWithAI: async (data: AIParseRequest): Promise<AIParseResponseData> => {
    const res = await apiClient.post<ApiResponse<AIParseResponseData>>('/tasks/parse', data);
    return res.data.data;
  },

  getCacheStats: async (): Promise<CacheStats> => {
    const res = await apiClient.get<ApiResponse<CacheStats>>('/tasks/cache-stats');
    return res.data.data;
  },

  updateTaskStatus: async (id: number, status: string): Promise<Task> => {
    const res = await apiClient.put<ApiResponse<{ task: Task; message: string }>>(`/tasks/${id}/status`, null, {
      params: { status }
    });
    return res.data.data.task;
  }
};
