<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <h3 class="logo-text">MindPulse</h3>
      </div>
      <el-menu
        :default-active="$route.path"
        class="sidebar-menu"
        router
        background-color="transparent"
        text-color="rgba(255,255,255,0.8)"
        active-text-color="#fff"
      >
        <el-menu-item index="/tasks" route="/tasks">
          <el-icon><Memo /></el-icon>
          <span>任务管理</span>
        </el-menu-item>
        <el-menu-item index="/notes" route="/notes">
          <el-icon><Document /></el-icon>
          <span>笔记管理</span>
        </el-menu-item>
        <el-menu-item index="/reminders" route="/reminders">
          <el-icon><Bell /></el-icon>
          <span>智能提醒</span>
          <el-badge :value="unreadNotificationsCount" v-if="unreadNotificationsCount > 0" />
        </el-menu-item>
      </el-menu>
      <div class="sidebar-footer">
        <div class="user-avatar" :title="user?.username">
          <span class="avatar-text">{{ user?.username?.charAt(0)?.toUpperCase() }}</span>
          <span class="online-dot"></span>
        </div>
        <span class="user-name">{{ user?.username }}</span>
      </div>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-content">
          <h2>{{ getPageTitle }}</h2>
          <div class="user-actions">
            <el-dropdown>
              <el-button type="primary" plain>
                {{ user?.username }} <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>

      <!-- 页面内容 -->
      <el-main class="main-content">
        <!-- 背景浮动光点 -->
        <div class="floating-orbs">
          <div class="orb orb-1"></div>
          <div class="orb orb-2"></div>
          <div class="orb orb-3"></div>
          <div class="orb orb-4"></div>
          <div class="orb orb-5"></div>
        </div>
        <div class="page-content">
          <slot />
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { 
  Memo, 
  Document, 
  Bell, 
  ArrowDown 
} from '@element-plus/icons-vue';
import { useWebSocket } from '@/utils/websocket';

const router = useRouter();
const userStore = useUserStore();

const user = computed(() => userStore.user);

// 计算未读通知数量（这里简化处理，实际应从WebSocket服务获取）
const unreadNotificationsCount = computed(() => {
  // 在实际应用中，这里应该从WebSocket服务或通知store中获取未读通知数
  return 0;
});

// 获取当前页面标题
const getPageTitle = computed(() => {
  const routeName = router.currentRoute.value.name as string;
  const titles: Record<string, string> = {
    Tasks: '任务管理',
    Notes: '笔记管理',
    Reminders: '智能提醒'
  };
  return titles[routeName] || 'MindPulse';
});

// 退出登录
const logout = async () => {
  userStore.logout();
  // 断开WebSocket连接（异步操作，不应阻塞路由跳转）
  try {
    useWebSocket().disconnect();
  } catch (error) {
    console.error('断开WebSocket连接时出错:', error);
  }
  // 确保路由跳转不受WebSocket错误影响
  router.push('/login');
};
</script>

<style scoped>
.layout-container {
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  background: linear-gradient(180deg, var(--primary-color), var(--secondary-color));
  color: white;
  box-shadow: var(--shadow-lg);
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.logo {
  padding: var(--spacing-lg);
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.1);
}

.logo-text {
  margin: 0;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
}

.logo-text::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.sidebar-menu {
  border: none;
  background: transparent !important;
  flex: 1;
}

.sidebar-menu ::v-deep(.el-menu) {
  background: transparent !important;
}

.sidebar-menu ::v-deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.8) !important;
  margin: 2px 8px;
  border-radius: 8px !important;
  transition: all 0.25s ease;
  position: relative;
  padding-left: 20px !important;
}

.sidebar-menu ::v-deep(.el-menu-item::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 60%;
  background: #fff;
  border-radius: 0 3px 3px 0;
  transition: width 0.25s ease;
}

.sidebar-menu ::v-deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  transform: translateX(4px);
}

.sidebar-menu ::v-deep(.el-menu-item:hover .el-icon) {
  animation: pulse-icon 0.6s ease;
}

@keyframes pulse-icon {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.sidebar-menu ::v-deep(.el-menu-item.is-active) {
  background: rgba(255, 255, 255, 0.18) !important;
  color: white !important;
  font-weight: 600;
}

.sidebar-menu ::v-deep(.el-menu-item.is-active::before) {
  width: 3px;
}

/* 菜单项点击波纹效果 */
.sidebar-menu ::v-deep(.el-menu-item) {
  overflow: hidden;
  position: relative;
}

.sidebar-menu ::v-deep(.el-menu-item)::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.3) 10%, transparent 10.01%);
  background-repeat: no-repeat;
  background-position: 50%;
  transform: scale(10, 10);
  opacity: 0;
  transition: transform 0.5s, opacity 0.8s;
}

.sidebar-menu ::v-deep(.el-menu-item):active::after {
  transform: scale(0, 0);
  opacity: 0.3;
  transition: 0s;
}

/* 侧边栏底部 */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.avatar-text {
  font-size: 14px;
  font-weight: 700;
  color: white;
}

.online-dot {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #4cc9f0;
  border: 2px solid var(--primary-color);
}

.user-name {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header {
  background-color: var(--bg-card);
  box-shadow: var(--shadow-sm);
  padding: 0 var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.header-content h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  position: relative;
  padding-bottom: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-shift 3s ease infinite;
  background-size: 200% 200%;
}

@keyframes gradient-shift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.header-content h2::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 32px;
  height: 3px;
  border-radius: 2px;
  background: var(--gradient-brand);
  animation: expand-width 0.8s ease-out;
}

@keyframes expand-width {
  from {
    width: 0;
  }
  to {
    width: 32px;
  }
}

.main-content {
  background: var(--bg-secondary);
  padding: var(--spacing-lg);
  min-height: calc(100vh - 60px);
  position: relative;
  overflow: hidden;
}

/* 浮动光点容器 */
.floating-orbs {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  animation: float-orb 15s ease-in-out infinite;
}

.orb-1 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15));
  top: 10%;
  left: 10%;
  animation-delay: 0s;
  animation-duration: 18s;
}

.orb-2 {
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, rgba(247, 37, 133, 0.1), rgba(76, 201, 240, 0.1));
  top: 60%;
  right: 15%;
  animation-delay: -3s;
  animation-duration: 20s;
}

.orb-3 {
  width: 180px;
  height: 180px;
  background: linear-gradient(135deg, rgba(72, 149, 239, 0.12), rgba(102, 126, 234, 0.12));
  bottom: 20%;
  left: 30%;
  animation-delay: -6s;
  animation-duration: 22s;
}

.orb-4 {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, rgba(248, 150, 30, 0.1), rgba(247, 37, 133, 0.08));
  top: 30%;
  right: 30%;
  animation-delay: -9s;
  animation-duration: 16s;
}

.orb-5 {
  width: 160px;
  height: 160px;
  background: linear-gradient(135deg, rgba(76, 201, 240, 0.1), rgba(5, 150, 105, 0.08));
  bottom: 40%;
  right: 60%;
  animation-delay: -12s;
  animation-duration: 24s;
}

/* 页面内容 */
.page-content {
  position: relative;
  z-index: 1;
  animation: page-enter 0.6s ease-out;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 60px !important;
  }

  .logo-text {
    font-size: 0;
  }

  .logo-text::after {
    display: none;
  }

  .sidebar-menu ::v-deep(.el-menu-item span) {
    display: none;
  }

  .sidebar-footer {
    justify-content: center;
    padding: 12px 8px;
  }

  .sidebar-footer .user-name {
    display: none;
  }

  .header-content {
    flex-direction: column;
    gap: var(--spacing-md);
    padding: var(--spacing-md) 0;
  }

  .main-content {
    padding: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 50px !important;
  }
}
</style>