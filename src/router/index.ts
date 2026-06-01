import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';

const routes = [
  {
    path: '/',
    redirect: '/tasks'
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
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  
  console.log('路由守卫执行:', {
    toPath: to.path,
    requiresAuth: to.meta?.requiresAuth,
    isAuthenticated: userStore.isAuthenticated,
    token: userStore.token
  });
  
  // 如果路由需要认证且用户未登录，则重定向到登录页
  const isAuth = userStore.isAuthenticated || !!userStore.token;
  if (to.meta?.requiresAuth && !isAuth) {
    console.log('路由需要认证但用户未登录，重定向到登录页');
    next('/login');
  } else if (to.path === '/login' && userStore.isAuthenticated) {
    // 如果用户已登录但访问登录页，则重定向到任务页
    console.log('用户已登录但访问登录页，重定向到任务页');
    next('/tasks');
  } else if (to.path === '/register' && userStore.isAuthenticated) {
    // 如果用户已登录但访问注册页，则重定向到任务页
    console.log('用户已登录但访问注册页，重定向到任务页');
    next('/tasks');
  } else {
    console.log('允许路由跳转');
    next();
  }
});

export default router;