import { defineStore } from 'pinia';
import { ref } from 'vue';

interface UserInfo {
  username: string;
  email: string;
}

export const useUserStore = defineStore('user', () => {
  const user = ref<UserInfo | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const isAuthenticated = ref(!!localStorage.getItem('token'));

  const setUser = (userData: UserInfo, authToken: string) => {
    user.value = userData;
    token.value = authToken;
    isAuthenticated.value = true;
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    user.value = null;
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

  return {
    user,
    isAuthenticated,
    token,
    setUser,
    logout,
    restoreUserFromStorage
  };
});
