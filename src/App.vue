<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserStore } from './stores/user';
import './styles/theme.css';

const userStore = useUserStore();

// 应用启动时尝试从本地存储恢复用户信息
onMounted(() => {
  userStore.restoreUserFromStorage();
});
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
</style>