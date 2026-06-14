// 通用 API 响应封装
export interface ApiResponse<T = unknown> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  timestamp?: string;
}

export interface User {
  username: string;
  email: string;
  nickname?: string;
  avatar?: string;
}

export interface UserProfile {
  id: number
  username: string
  nickname: string | null
  email: string
  avatar: string | null
  role: string
  createdAt: string
}

export interface UpdateProfileRequest {
  nickname?: string
  email?: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
}

export interface LoginResponseData {
  token: string;
  username: string;
  email: string;
  role: string;
}
