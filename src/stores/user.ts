import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { userApi } from '@/api/userApi';
import type { UserProfile, UpdateProfileRequest, ChangePasswordRequest } from '@/types/auth';

interface UserInfo {
  username: string;
  email: string;
  nickname?: string;
  avatar?: string;
  role?: string;
}

export const useUserStore = defineStore('user', () => {
  const user = ref<UserInfo | null>(null);
  const profile = ref<UserProfile | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const isAuthenticated = ref(!!localStorage.getItem('token'));

  const isAdmin = computed(() => user.value?.role === 'ROLE_ADMIN');

  const setUser = (userData: UserInfo, authToken: string) => {
    user.value = userData;
    token.value = authToken;
    isAuthenticated.value = true;
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    user.value = null;
    profile.value = null;
    token.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const restoreUserFromStorage = () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      token.value = storedToken;
      try {
        user.value = JSON.parse(storedUser);
        isAuthenticated.value = true;
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        token.value = null;
        user.value = null;
        isAuthenticated.value = false;
      }
    }
  };

  const fetchProfile = async () => {
    profile.value = await userApi.getProfile();
  };

  const updateProfile = async (data: UpdateProfileRequest) => {
    await userApi.updateProfile(data);
    if (profile.value) {
      if (data.nickname !== undefined) profile.value.nickname = data.nickname ?? null;
      if (data.email !== undefined) profile.value.email = data.email;
    }
    if (user.value) {
      if (data.nickname !== undefined) user.value.nickname = data.nickname;
      if (data.email !== undefined) user.value.email = data.email;
    }
  };

  const changePassword = async (data: ChangePasswordRequest) => {
    await userApi.changePassword(data);
  };

  const uploadAvatar = async (file: File) => {
    const avatarUrl = await userApi.uploadAvatar(file);
    if (profile.value) {
      profile.value.avatar = avatarUrl;
    }
    if (user.value) {
      user.value.avatar = avatarUrl;
    }
    return avatarUrl;
  };

  return {
    user,
    profile,
    isAuthenticated,
    token,
    isAdmin,
    setUser,
    logout,
    restoreUserFromStorage,
    fetchProfile,
    updateProfile,
    changePassword,
    uploadAvatar
  };
});
