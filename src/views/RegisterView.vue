<template>
  <div class="register-container">
    <div class="floating-shapes">
      <div class="shape shape-circle"></div>
      <div class="shape shape-square"></div>
      <div class="shape shape-triangle"></div>
      <div class="shape shape-diamond"></div>
    </div>
    <div class="register-form-wrapper">
      <div class="register-card">
        <div class="card-header">
          <div class="logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="logo-icon pulse-animation">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <polyline points="16 11 18 13 22 9"></polyline>
            </svg>
            <h2 class="title">MindPulse</h2>
          </div>
          <p class="subtitle">创建您的账户</p>
        </div>
        
        <el-form :model="registerForm" :rules="rules" ref="registerFormRef" label-width="0px" class="register-form">
          <el-form-item prop="username">
            <el-input 
              v-model="registerForm.username" 
              prefix-icon="User" 
              placeholder="用户名" 
              size="large"
              autocomplete="username"
            />
          </el-form-item>
          
          <el-form-item prop="email">
            <el-input 
              v-model="registerForm.email" 
              prefix-icon="Message" 
              placeholder="邮箱地址" 
              size="large"
              autocomplete="email"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              prefix-icon="Lock"
              type="password"
              placeholder="密码"
              size="large"
              autocomplete="new-password"
            />
            <div class="password-strength" v-if="registerForm.password">
              <div class="strength-bar">
                <div :class="['strength-fill', strengthLevel]"></div>
              </div>
              <span class="strength-text">{{ strengthText }}</span>
            </div>
          </el-form-item>
          
          <el-form-item prop="confirmPassword">
            <el-input 
              v-model="registerForm.confirmPassword" 
              prefix-icon="Lock" 
              type="password" 
              placeholder="确认密码" 
              size="large"
              autocomplete="new-password"
              @keyup.enter="handleRegister"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              size="large" 
              @click="handleRegister" 
              :loading="loading"
              class="register-button glossy-button"
              :disabled="loading"
            >
              <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="button-icon">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </template>
              注册
            </el-button>
          </el-form-item>
          
          <div class="divider">
            <span>需要帮助？</span>
          </div>
          
          <div class="support-info">
            <p class="support-text">如果您在注册过程中遇到问题，请联系客服</p>
          </div>
        </el-form>
        
        <div class="login-link">
          已有账号？<router-link to="/login">立即登录</router-link>
        </div>
      </div>
      
      <div class="register-illustration">
        <div class="illustration-content">
          <h3>加入 MindPulse</h3>
          <p>注册账户，开启 AI 增强型个人生产力体验</p>
          <ul class="features-list">
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feature-icon">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              AI 自然语言任务解析
            </li>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feature-icon">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              笔记摘要自动生成
            </li>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feature-icon">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              多渠道智能提醒
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Message, Lock } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';
import { authApi } from '@/api/authApi';

const router = useRouter();
const userStore = useUserStore();

const loading = ref(false);

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const registerForm = reactive<RegisterForm>({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const validatePass = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入密码'));
  } else if (value.length < 6) {
    callback(new Error('密码长度不能少于6位'));
  } else {
    if (registerForm.confirmPassword !== '') {
      // 对两次输入的密码进行验证
      if (registerForm.confirmPassword !== registerForm.password) {
        callback(new Error('两次输入的密码不一致'));
      }
    }
    callback();
  }
};

const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const validateEmail = (rule: any, value: any, callback: any) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!value) {
    callback(new Error('请输入邮箱'));
  } else if (!emailRegex.test(value)) {
    callback(new Error('请输入有效的邮箱地址'));
  } else {
    callback();
  }
};

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, validator: validateEmail, trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePass, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: 'blur' }
  ]
};

const strengthLevel = computed(() => {
  const pwd = registerForm.password;
  if (pwd.length < 6) return 'weak';
  if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwd)) return 'strong';
  if (/^(?=.*[a-zA-Z])(?=.*\d)/.test(pwd)) return 'medium';
  return 'weak';
});

const strengthText = computed(() => {
  const map: Record<string, string> = { weak: '弱', medium: '中', strong: '强' };
  return map[strengthLevel.value];
});

const registerFormRef = ref();

const handleRegister = async () => {
  if (!registerFormRef.value) return;
  
  registerFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true;
      try {
        const response = await authApi.register({
          username: registerForm.username,
          email: registerForm.email,
          password: registerForm.password
        });
        
        userStore.setUser(response.user, response.token);
        ElMessage.success('注册成功！');
        router.push('/tasks');
      } catch (error: any) {
        console.error('注册失败:', error);
        ElMessage.error(error.message || '注册失败，请稍后重试');
      } finally {
        loading.value = false;
      }
    } else {
      console.log('验证失败!');
      return false;
    }
  });
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, var(--login-gradient-start) 0%, var(--login-gradient-end) 100%);
  position: relative;
  overflow: hidden;
}

.register-container::before {
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

.register-form-wrapper {
  display: flex;
  width: 850px;
  max-width: 90%;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
}

.register-card {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 15px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  color: var(--primary-color, #4361ee);
  margin-bottom: 10px;
  transition: transform 0.3s ease;
}

.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(67, 97, 238, 0.7); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(67, 97, 238, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(67, 97, 238, 0); }
}

.title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  background: linear-gradient(135deg, var(--login-gradient-start) 0%, var(--login-gradient-end) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin: 0;
  font-size: 14px;
  color: #7f8c8d;
  font-weight: 400;
}

.register-form {
  width: 100%;
}

.register-form ::v-deep(.el-form-item) {
  margin-bottom: 20px;
}

.register-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  background: linear-gradient(135deg, var(--login-gradient-start) 0%, var(--login-gradient-end) 100%);
  border: none;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.register-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: 0.5s;
}

.register-button:hover::before {
  left: 100%;
}

.register-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.register-button:active {
  transform: translateY(0);
}

.register-form-wrapper {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.register-form-wrapper:hover {
  transform: translateY(-5px);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
}

/* 浮动形状 */
.floating-shapes {
  position: fixed;
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

.shape:nth-child(1) { top: 20%; left: 10%; width: 60px; height: 60px; animation-delay: 0s; }
.shape:nth-child(2) { top: 60%; left: 80%; width: 40px; height: 40px; animation-delay: 1s; }
.shape:nth-child(3) { top: 40%; left: 50%; width: 50px; height: 50px; animation-delay: 2s; }
.shape:nth-child(4) { top: 70%; left: 20%; width: 45px; height: 45px; animation-delay: 3s; }

.shape-circle { border-radius: 50%; }
.shape-square { border-radius: 10%; }
.shape-triangle {
  width: 0; height: 0;
  border-left: 25px solid transparent;
  border-right: 25px solid transparent;
  border-bottom: 45px solid transparent;
  border-radius: 0;
}
.shape-diamond { transform: rotate(45deg); border-radius: 10%; }

@keyframes float {
  0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
  25% { transform: translateY(-20px) translateX(10px) rotate(10deg); }
  50% { transform: translateY(10px) translateX(-15px) rotate(-10deg); }
  75% { transform: translateY(-15px) translateX(20px) rotate(5deg); }
}

/* 密码强度 */
.password-strength { margin-top: -12px; margin-bottom: 12px; }
.strength-bar {
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}
.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition: width var(--transition-normal), background var(--transition-normal);
}
.strength-fill.weak { width: 33%; background: var(--danger-color); }
.strength-fill.medium { width: 66%; background: var(--warning-color); }
.strength-fill.strong { width: 100%; background: var(--success-color); }
.strength-text { font-size: 12px; color: var(--text-muted); }

.button-icon {
  margin-right: 8px;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 25px 0;
  color: #7f8c8d;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e0e0e0;
}

.divider span {
  padding: 0 15px;
  font-size: 14px;
}

.support-info {
  text-align: center;
  padding: 10px;
}

.support-text {
  margin: 0;
  font-size: 14px;
  color: #7f8c8d;
  font-style: italic;
}



.login-link {
  text-align: center;
  margin-top: 25px;
  font-size: 14px;
  color: #7f8c8d;
}

.login-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}

.login-link a:hover {
  color: #5a6fd8;
  text-decoration: underline;
}

.register-illustration {
  flex: 1;
  background: linear-gradient(135deg, var(--login-gradient-start) 0%, var(--login-gradient-end) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: white;
}

.illustration-content {
  max-width: 350px;
  text-align: center;
}

.illustration-content h3 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 15px;
  color: white;
}

.illustration-content p {
  font-size: 15px;
  margin-bottom: 25px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.features-list li {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.95);
}

.feature-icon {
  margin-right: 10px;
  width: 18px;
  height: 18px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .register-form-wrapper {
    width: 800px;
  }
}

@media (max-width: 992px) {
  .register-form-wrapper {
    width: 100%;
    flex-direction: column;
  }

  .register-illustration {
    padding: 30px 20px;
  }

  .illustration-content {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .register-container {
    padding: 15px;
  }

  .register-form-wrapper {
    width: 100%;
    max-width: 100%;
    flex-direction: column;
    border-radius: 20px;
  }

  .register-card {
    padding: 30px 20px;
  }

  .register-illustration {
    display: none;
  }

  .floating-shapes {
    display: none;
  }
}

@media (max-width: 480px) {
  .register-container {
    padding: 10px;
  }

  .register-card {
    padding: 35px 20px;
  }
}
</style>