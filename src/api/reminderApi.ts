import apiClient from './index';
import { Reminder, CreateReminderRequest } from '@/types/reminder';
import { ApiResponse } from '@/types/auth';

export const reminderApi = {
  getReminders: async (): Promise<Reminder[]> => {
    const res = await apiClient.get<ApiResponse<Reminder[]>>('/reminders');
    return res.data.data;
  },

  getReminderById: async (id: number): Promise<Reminder> => {
    const res = await apiClient.get<ApiResponse<Reminder>>(`/reminders/${id}`);
    return res.data.data;
  },

  createReminder: async (data: CreateReminderRequest): Promise<Reminder> => {
    const res = await apiClient.post<ApiResponse<Reminder>>('/reminders', data);
    return res.data.data;
  },

  updateReminder: async (id: number, data: Partial<CreateReminderRequest>): Promise<Reminder> => {
    const res = await apiClient.put<ApiResponse<Reminder>>(`/reminders/${id}`, data);
    return res.data.data;
  },

  deleteReminder: async (id: number): Promise<void> => {
    await apiClient.delete(`/reminders/${id}`);
  }
};
