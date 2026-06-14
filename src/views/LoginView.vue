<template>
  <div class="login-container">
    <!-- 动态背景元素 -->
    <div class="floating-shapes">
      <div class="shape shape-circle"></div>
      <div class="shape shape-square"></div>
      <div class="shape shape-triangle"></div>
      <div class="shape shape-diamond"></div>
    </div>
    
    <div class="login-form-wrapper">
      <div class="login-card">
        <div class="card-header">
          <div class="logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="logo-icon pulse-animation">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" fill="none"/>
              <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="1.5" fill="none"/>
              <path d="M17 17h-6l-2 3" stroke="currentColor" stroke-width="1.5" fill="none"/>
            </svg>
            <h2 class="title gradient-text">MindPulse</h2>
          </div>
          <p class="subtitle">AI 赋能，高效学习</p>
        </div>
        
        <el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-width="0px" class="login-form">
          <el-form-item prop="username">
            <el-input 
              v-model="loginForm.username" 
              prefix-icon="User" 
              placeholder="用户名或邮箱" 
              size="large"
              autocomplete="username"
              class="animated-input"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input 
              v-model="loginForm.password" 
              prefix-icon="Lock" 
              type="password" 
              placeholder="密码" 
              size="large"
              autocomplete="current-password"
              show-password
              @keyup.enter="handleLogin"
              class="animated-input"
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item class="remember-forgot">
            <el-checkbox v-model="rememberMe" class="custom-checkbox">记住我</el-checkbox>
            <a href="#" class="forgot-password" @click.prevent="handleForgotPassword">忘记密码?</a>
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              size="large" 
              @click="handleLogin" 
              :loading="loading"
              class="login-button gradient-button"
              :disabled="loading"
            >
              <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="button-icon">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
              </template>
              登录
            </el-button>
          </el-form-item>
        </el-form>

        <div class="register-link">
          还没有账号？<router-link to="/register" class="register-link-text">立即注册</router-link>
        </div>
      </div>
      
      <div class="login-illustration">
        <div class="illustration-content">
          <h3 class="illustration-title">AI 驱动的高效学习</h3>
          <p class="illustration-subtitle">通过 AI 智能解析和自动化管理，让你的学习与生活井井有条</p>
          <ul class="features-list">
            <li class="feature-item">
              <div class="feature-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feature-icon">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
              </div>
              自然语言任务解析
            </li>
            <li class="feature-item">
              <div class="feature-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feature-icon">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                  <polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
              </div>
              智能定时提醒
            </li>
            <li class="feature-item">
              <div class="feature-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feature-icon">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2" fill="none"/>
                  <polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="2" fill="none"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              AI 笔记摘要生成
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getErrorMessage } from '@/utils/error';
import { User, Lock } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';
import { authApi } from '@/api/authApi';

const router = useRouter();
const userStore = useUserStore();

const loading = ref(false);
const rememberMe = ref(false);

interface LoginForm {
  username: string;
  password: string;
}

const loginForm = reactive<LoginForm>({
  username: '',
  password: ''
});

const validateUsername = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入用户名或邮箱'));
  } else if (value.length < 3) {
    callback(new Error('长度至少为3个字符'));
  } else if (value.length > 20) {
    callback(new Error('长度不能超过20个字符'));
  } else if (value.includes('@')) {
    // 如果包含@符号，验证是否为有效的邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      callback(new Error('请输入有效的邮箱地址'));
    } else {
      callback();
    }
  } else {
    // 检查用户名格式（字母、数字、下划线、连字符）
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(value)) {
      callback(new Error('用户名只能包含字母、数字、下划线和连字符'));
    } else {
      callback();
    }
  }
};

const validatePassword = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入密码'));
  } else if (value.length < 6) {
    callback(new Error('密码长度不能少于6位'));
  } else {
    callback();
  }
};

const rules = {
  username: [
    { required: true, validator: validateUsername, trigger: 'blur' }
  ],
  password: [
    { validator: validatePassword, trigger: 'blur' }
  ]
};

const loginFormRef = ref();

const handleLogin = async () => {
  if (!loginFormRef.value) return;

  const valid = await loginFormRef.value.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    const data = await authApi.login({
      username: loginForm.username,
      password: loginForm.password
    });

    if (rememberMe.value) {
      localStorage.setItem('rememberMe', 'true');
      localStorage.setItem('savedUsername', loginForm.username);
    } else {
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('savedUsername');
    }

    userStore.setUser(
      { username: data.username, email: data.email, role: data.role },
      data.token
    );
    ElMessage.success('登录成功！');

    // 登录成功后，尝试导航到之前想要访问的页面，或者默认导航到任务页面
    const redirectTo = router.currentRoute.value.query.redirect as string || '/tasks';
    await router.push(redirectTo).catch(err => {
      console.error('路由跳转失败:', err);
      router.push('/tasks').catch(e => {
        console.error('默认路由跳转也失败:', e);
      });
    });
  } catch (error: unknown) {
    console.error('登录失败:', error);
    ElMessage.error(getErrorMessage(error) || '登录失败，请检查用户名和密码');
  } finally {
    loading.value = false;
  }
};

const handleForgotPassword = () => {
  // 重置密码功能的实现
  ElMessageBox.prompt('请输入您的注册邮箱地址，我们将发送重置密码的链接到您的邮箱', '重置密码', {
    confirmButtonText: '发送',
    cancelButtonText: '取消',
    inputPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    inputErrorMessage: '请输入有效的邮箱地址',
    inputPlaceholder: '请输入邮箱地址'
  }).then(async ({ value }) => {
    try {
      // 这里应该调用后端API发送重置密码邮件
      // 由于目前没有对应的API，我们只是模拟操作
      console.log(`重置密码邮件将发送至: ${value}`);
      ElMessage.success('重置密码邮件已发送，请检查您的邮箱');
    } catch (error) {
      console.log('取消操作或发生错误:', error);
    }
  }).catch(() => {
    // 用户取消操作
  });
};

onMounted(() => {
  const saved = localStorage.getItem('rememberMe');
  if (saved === 'true') {
    const savedUsername = localStorage.getItem('savedUsername');
    if (savedUsername) {
      loginForm.username = savedUsername;
      rememberMe.value = true;
    }
  }
});
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, var(--login-gradient-start) 0%, var(--login-gradient-end) 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.login-container::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
  animation: rotate 20s linear infinite;
  z-index: 0;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 动态浮动形状 */
.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.shape {
  position: absolute;
  opacity: 0.3;
  animation: float 8s infinite ease-in-out;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.shape:nth-child(1) {
  top: 20%;
  left: 10%;
  width: 60px;
  height: 60px;
  animation-delay: 0s;
}

.shape:nth-child(2) {
  top: 60%;
  left: 80%;
  width: 40px;
  height: 40px;
  animation-delay: 1s;
}

.shape:nth-child(3) {
  top: 40%;
  left: 50%;
  width: 50px;
  height: 50px;
  animation-delay: 2s;
}

.shape:nth-child(4) {
  top: 70%;
  left: 20%;
  width: 45px;
  height: 45px;
  animation-delay: 3s;
}

.shape-circle {
  border-radius: 50%;
}

.shape-square {
  border-radius: 10%;
}

.shape-triangle {
  width: 0;
  height: 0;
  border-left: 25px solid transparent;
  border-right: 25px solid transparent;
  border-bottom: 45px solid transparent;
  border-radius: 0;
}

.shape-diamond {
  transform: rotate(45deg);
  border-radius: 10%;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0) rotate(0deg);
  }
  25% {
    transform: translateY(-20px) translateX(10px) rotate(10deg);
  }
  50% {
    transform: translateY(10px) translateX(-15px) rotate(-10deg);
  }
  75% {
    transform: translateY(-15px) translateX(20px) rotate(5deg);
  }
}

.login-form-wrapper {
  display: flex;
  width: 900px;
  max-width: 95%;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(12px);
  position: relative;
  z-index: 1;
  min-height: 600px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-form-wrapper:hover {
  transform: translateY(-5px);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
}

.login-card {
  flex: 1;
  padding: 50px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.logo-icon {
  width: 64px;
  height: 64px;
  color: var(--primary-color, #4361ee);
  margin-bottom: 15px;
  transition: transform 0.3s ease;
}

.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(67, 97, 238, 0.7);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(67, 97, 238, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(67, 97, 238, 0);
  }
}

.title {
  margin: 0;
  font-size: 32px;
  font-weight: 800;
  color: #2c3e50;
  background: linear-gradient(135deg, var(--login-gradient-start) 0%, var(--login-gradient-end) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin: 0;
  font-size: 16px;
  color: #7f8c8d;
  font-weight: 400;
}

.login-form {
  width: 100%;
}

.login-form ::v-deep(.el-form-item) {
  margin-bottom: 24px;
}

.animated-input {
  transition: all 0.3s ease;
  border-radius: 12px;
  border: 2px solid rgba(0, 0, 0, 0.08);
}

.animated-input:focus-within {
  box-shadow: 0 0 0 4px rgba(67, 97, 238, 0.2);
  transform: translateY(-2px);
  border-color: var(--primary-color);
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px !important;
}

.custom-checkbox {
  transition: transform 0.2s ease;
}

.custom-checkbox:hover {
  transform: scale(1.05);
}

.forgot-password {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.3s;
}

.forgot-password:hover {
  color: var(--primary-light);
  text-decoration: underline;
}

.login-button {
  width: 100%;
  height: 52px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  border: none;
  border-radius: 14px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  margin-bottom: 25px;
}

.gradient-button {
  background: linear-gradient(135deg, var(--login-gradient-start) 0%, var(--login-gradient-end) 100%);
  color: white;
}

.login-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: 0.5s;
}

.login-button:hover::before {
  left: 100%;
}

.login-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.5);
}

.login-button:active {
  transform: translateY(0);
}

.register-link {
  text-align: center;
  margin-top: 25px;
  font-size: 15px;
  color: #7f8c8d;
}

.register-link-text {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
  position: relative;
}

.register-link-text::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background-color: var(--primary-color);
  transition: width 0.3s ease;
}

.register-link-text:hover {
  color: var(--primary-light);
  text-decoration: none;
}

.register-link-text:hover::after {
  width: 100%;
}

.login-illustration {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: white;
  position: relative;
  overflow: hidden;
}

.login-illustration::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
  animation: rotate 25s linear infinite reverse;
}

.illustration-content {
  max-width: 380px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.illustration-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 18px;
  color: white;
  animation: fadeInUp 0.8s ease;
}

.illustration-subtitle {
  font-size: 16px;
  margin-bottom: 30px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.7;
  animation: fadeInUp 0.8s ease 0.2s both;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 22px;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.95);
  animation: fadeInUp 0.8s ease 0.4s both;
  opacity: 0;
  transform: translateY(20px);
}

.feature-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  margin-right: 15px;
  transition: all 0.3s ease;
}

.feature-icon-wrapper:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.feature-icon {
  width: 20px;
  height: 20px;
  color: white;
}

/* 动画关键帧 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .login-form-wrapper {
    width: 800px;
    min-height: auto;
  }
  
  .login-card {
    padding: 40px 30px;
  }
}

@media (max-width: 992px) {
  .login-form-wrapper {
    flex-direction: column;
  }
  
  .login-illustration {
    padding: 30px 20px;
  }
  
  .illustration-content {
    max-width: 100%;
  }
  
  .login-card {
    padding: 35px 30px;
  }
}

@media (max-width: 768px) {
  .login-container {
    padding: 15px;
  }
  
  .login-form-wrapper {
    width: 100%;
    max-width: 100%;
    flex-direction: column;
    border-radius: 20px;
  }
  
  .login-card {
    padding: 40px 25px;
  }
  
  .login-illustration {
    display: none;
  }
  
  .floating-shapes {
    display: none;
  }
  
  .title {
    font-size: 28px;
  }
  
  .subtitle {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 10px;
  }
  
  .login-card {
    padding: 35px 20px;
  }
  
  .login-button {
    height: 48px;
  }
  
  .social-login-container {
    gap: 10px;
  }
  
  .social-login-button {
    height: 44px;
  }
}
</style>