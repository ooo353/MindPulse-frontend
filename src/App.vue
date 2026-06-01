<template>
  <div id="app" :data-theme="theme">
    <router-view />
    <!-- 暗色模式切换按钮 -->
    <div class="theme-toggle" @click="toggleTheme">
      <i v-if="theme === 'light'" class="el-icon-moon">🌙</i>
      <i v-else class="el-icon-sunny">☀️</i>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useUserStore } from './stores/user';

const userStore = useUserStore();
const theme = ref(localStorage.getItem('theme') || 'light');

// 应用启动时尝试从本地存储恢复用户信息
onMounted(() => {
  userStore.restoreUserFromStorage();
  document.documentElement.setAttribute('data-theme', theme.value);
});

// 切换主题
const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', theme.value);
  document.documentElement.setAttribute('data-theme', theme.value);
};
</script>

<style>
#app {
  font-family: var(--font-family);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  min-height: 100vh;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.theme-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  transition: all 0.3s ease;
  font-size: 1.2rem;
}

.theme-toggle:hover {
  transform: scale(1.1);
  background: var(--primary-color);
  color: white;
}
</style>