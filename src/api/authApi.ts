import apiClient from './index';
import { LoginRequest, RegisterRequest, LoginResponseData, ApiResponse } from '@/types/auth';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponseData> => {
    const res = await apiClient.post<ApiResponse<LoginResponseData>>('/auth/login', credentials);
    return res.data.data;
  },

  register: async (userData: RegisterRequest): Promise<ApiResponse<{ username: string; email: string }>> => {
    const res = await apiClient.post<ApiResponse<{ username: string; email: string }>>('/auth/register', userData);
    return res.data;
  }
};
