import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue')
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('@/views/TasksView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/notes',
    name: 'Notes',
    component: () => import('@/views/NotesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reminders',
    name: 'Reminders',
    component: () => import('@/views/RemindersView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/AdminView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pomodoro',
    name: 'Pomodoro',
    component: () => import('@/views/PomodoroView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  
  // 如果路由需要认证且用户未登录，则重定向到登录页
  const isAuth = userStore.isAuthenticated || !!userStore.token;
  if (to.meta?.requiresAuth && !isAuth) {
    next('/login');
  } else if (to.path === '/login' && userStore.isAuthenticated) {
    // 如果用户已登录但访问登录页，则重定向到任务页
    next('/dashboard');
  } else if (to.path === '/register' && userStore.isAuthenticated) {
    // 如果用户已登录但访问注册页，则重定向到任务页
    next('/dashboard');
  } else {
    next();
  }
});

export default router;