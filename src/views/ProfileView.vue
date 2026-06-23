<template>
  <Layout>
    <div class="profile-container">
      <!-- Avatar Section -->
      <el-card class="profile-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>{{ t('user.avatar') }}</span>
          </div>
        </template>
        <div class="avatar-section">
          <div class="avatar-preview">
            <img
              v-if="userStore.profile?.avatar"
              :src="userStore.profile.avatar"
              class="avatar-img"
              alt="avatar"
            />
            <div v-else class="avatar-placeholder">
              <span>{{ userStore.user?.username?.charAt(0)?.toUpperCase() }}</span>
            </div>
          </div>
          <el-upload
            :show-file-list="false"
            :auto-upload="false"
            :before-upload="beforeAvatarUpload"
            :on-change="handleAvatarChange"
            accept="image/*"
          >
            <el-button type="primary">{{ t('user.uploadAvatar') }}</el-button>
          </el-upload>
        </div>
      </el-card>

      <!-- Profile Section -->
      <el-card class="profile-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>{{ t('user.profile') }}</span>
          </div>
        </template>
        <el-form label-width="100px" class="profile-form">
          <el-form-item :label="t('user.usernameLabel')">
            <el-input :model-value="userStore.user?.username" disabled />
          </el-form-item>
          <el-form-item :label="t('user.roleLabel')">
            <el-tag :type="userStore.isAdmin ? 'danger' : 'success'" size="large">
              {{ userStore.isAdmin ? t('user.adminRole') : t('user.userRole') }}
            </el-tag>
          </el-form-item>
          <el-form-item :label="t('user.nickname')">
            <el-input v-model="nickname" :placeholder="t('user.nickname')" />
          </el-form-item>
          <el-form-item :label="t('auth.email')">
            <el-input v-model="email" :placeholder="t('auth.email')" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="updateProfile" :loading="profileLoading">
              {{ t('actions.save') }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- Password Section -->
      <el-card class="profile-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>{{ t('user.changePassword') }}</span>
          </div>
        </template>
        <el-form label-width="120px" class="profile-form">
          <el-form-item :label="t('user.oldPassword')">
            <el-input v-model="oldPassword" type="password" show-password :placeholder="t('user.oldPassword')" />
          </el-form-item>
          <el-form-item :label="t('user.newPassword')">
            <el-input v-model="newPassword" type="password" show-password :placeholder="t('user.newPassword')" />
          </el-form-item>
          <el-form-item :label="t('user.confirmPassword')">
            <el-input v-model="confirmPassword" type="password" show-password :placeholder="t('user.confirmPassword')" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="changePassword" :loading="passwordLoading">
              {{ t('user.changePassword') }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Layout from '@/components/Layout.vue'
import { useUserStore } from '@/stores/user'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import type { UploadFile } from 'element-plus'

const userStore = useUserStore()
const { t } = useI18n()

const nickname = ref('')
const email = ref('')
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const profileLoading = ref(false)
const passwordLoading = ref(false)

onMounted(async () => {
  try {
    await userStore.fetchProfile()
    if (userStore.profile) {
      nickname.value = userStore.profile.nickname || ''
      email.value = userStore.profile.email
    }
  } catch {
    ElMessage.error(t('common.failed'))
  }
})

async function updateProfile() {
  profileLoading.value = true
  try {
    await userStore.updateProfile({ nickname: nickname.value, email: email.value })
    ElMessage.success(t('user.profileUpdated'))
  } catch {
    ElMessage.error(t('common.failed'))
  } finally {
    profileLoading.value = false
  }
}

async function changePassword() {
  if (newPassword.value !== confirmPassword.value) {
    ElMessage.error(t('user.confirmPassword') + ' ' + t('common.failed'))
    return
  }
  passwordLoading.value = true
  try {
    await userStore.changePassword({ oldPassword: oldPassword.value, newPassword: newPassword.value })
    ElMessage.success(t('user.passwordChanged'))
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch {
    ElMessage.error(t('common.failed'))
  } finally {
    passwordLoading.value = false
  }
}

function beforeAvatarUpload(file: File) {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error(t('user.avatarMustBeImage'))
    return false
  }
  return true
}

async function handleAvatarChange(uploadFile: UploadFile) {
  if (!uploadFile.raw) return
  // Validate file type since auto-upload=false bypasses beforeUpload
  if (!uploadFile.raw.type.startsWith('image/')) {
    ElMessage.error(t('user.avatarMustBeImage'))
    return
  }
  try {
    await userStore.uploadAvatar(uploadFile.raw)
    ElMessage.success(t('user.avatar') + ' ' + t('common.success'))
  } catch {
    ElMessage.error(t('common.failed'))
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-card {
  border-radius: 12px;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #303133);
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.avatar-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background: #ecf5ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: #409eff;
}

.profile-form {
  max-width: 480px;
}
</style>
