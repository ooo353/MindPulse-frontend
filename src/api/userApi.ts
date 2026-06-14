import apiClient from './index'
import type { ApiResponse } from '@/types/auth'
import type { UserProfile, UpdateProfileRequest, ChangePasswordRequest } from '@/types/auth'

export const userApi = {
  async getProfile(): Promise<UserProfile> {
    const res = await apiClient.get<ApiResponse<UserProfile>>('/users/profile')
    return res.data.data
  },

  async updateProfile(data: UpdateProfileRequest): Promise<void> {
    await apiClient.put<ApiResponse<void>>('/users/profile', data)
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.put<ApiResponse<void>>('/users/password', data)
  },

  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    const res = await apiClient.post<ApiResponse<string>>('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data.data
  }
}
