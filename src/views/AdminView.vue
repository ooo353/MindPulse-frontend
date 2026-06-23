<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Layout from '@/components/Layout.vue'
import { useAdminStore } from '@/stores/admin'
import { ElMessage } from 'element-plus'

const { t } = useI18n()
const store = useAdminStore()
const activeTab = ref('logs')
const actionFilter = ref('')
const resourceTypeFilter = ref('')
const page = ref(1)
const pageSize = ref(20)
const roleDialogVisible = ref(false)
const selectedUser = ref<{ id: number; username: string; role: string } | null>(null)
const newRole = ref('ROLE_USER')

onMounted(async () => {
  try {
    await Promise.all([
      store.fetchStats(),
      loadLogs(),
      store.fetchUsers()
    ])
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('403')) {
      ElMessage.error(t('admin.accessRequired'))
    } else {
      ElMessage.error(t('admin.loadFailed'))
    }
  }
})

function onFilterChange() {
  page.value = 1
  loadLogs()
}

async function loadLogs() {
  await store.fetchAuditLogs({
    action: actionFilter.value || undefined,
    resourceType: resourceTypeFilter.value || undefined,
    page: page.value,
    size: pageSize.value
  })
}

function openRoleDialog(user: { id: number; username: string; role: string }) {
  selectedUser.value = user
  newRole.value = user.role
  roleDialogVisible.value = true
}

async function updateRole() {
  if (!selectedUser.value) return
  try {
    await store.updateUserRole(selectedUser.value.id, newRole.value)
    ElMessage.success(t('admin.roleUpdated'))
    roleDialogVisible.value = false
    await store.fetchUsers()
  } catch {
    ElMessage.error(t('admin.roleUpdateFailed'))
  }
}
</script>

<template>
  <Layout>
    <div class="admin-container">
      <el-row :gutter="20" class="stats-row">
        <el-col :span="8">
          <el-card shadow="hover">
            <div class="stat-card">
              <div class="stat-value">{{ store.stats?.totalUsers ?? 0 }}</div>
              <div class="stat-label">{{ t('admin.totalUsers') }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover">
            <div class="stat-card">
              <div class="stat-value">{{ store.stats?.totalAuditLogs ?? 0 }}</div>
              <div class="stat-label">{{ t('admin.totalLogs') }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover">
            <div class="stat-card">
              <div class="stat-value">{{ store.stats?.todayActions ?? 0 }}</div>
              <div class="stat-label">{{ t('admin.todayActions') }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-tabs v-model="activeTab" class="admin-tabs">
        <el-tab-pane :label="t('admin.auditLogs')" name="logs">
          <div class="filter-row">
            <el-select v-model="actionFilter" :placeholder="t('admin.filterByAction')" clearable @change="onFilterChange" style="width: 180px">
              <el-option label="CREATE" value="CREATE" />
              <el-option label="UPDATE" value="UPDATE" />
              <el-option label="DELETE" value="DELETE" />
              <el-option label="LOGIN" value="LOGIN" />
            </el-select>
            <el-select v-model="resourceTypeFilter" :placeholder="t('admin.filterByResource')" clearable @change="onFilterChange" style="width: 180px; margin-left: 10px">
              <el-option label="Task" value="Task" />
              <el-option label="Note" value="Note" />
              <el-option label="Reminder" value="Reminder" />
              <el-option label="User" value="User" />
            </el-select>
          </div>
          <el-table :data="store.auditLogs" v-loading="store.loading" style="width: 100%">
            <el-table-column prop="userId" :label="t('admin.username')" width="120" />
            <el-table-column prop="action" :label="t('admin.action')" width="100">
              <template #default="{ row }">
                <el-tag :type="row.action === 'DELETE' ? 'danger' : row.action === 'CREATE' ? 'success' : 'info'" size="small">{{ row.action }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="resourceType" :label="t('admin.resource')" width="120" />
            <el-table-column prop="resourceId" :label="t('admin.resourceId')" width="100" />
            <el-table-column prop="ipAddress" :label="t('admin.ipAddress')" width="140" />
            <el-table-column prop="createdAt" :label="t('admin.time')" />
          </el-table>
          <el-pagination
            v-model:current-page="page"
            :page-size="pageSize"
            :total="store.totalLogs"
            layout="total, prev, pager, next"
            @current-change="loadLogs"
            style="margin-top: 16px; justify-content: flex-end"
          />
        </el-tab-pane>

        <el-tab-pane :label="t('admin.userManagement')" name="users">
          <el-table :data="store.users" v-loading="store.loading" style="width: 100%">
            <el-table-column prop="username" :label="t('admin.username')" />
            <el-table-column prop="email" :label="t('admin.email')" />
            <el-table-column prop="role" :label="t('admin.role')" width="120">
              <template #default="{ row }">
                <el-tag :type="row.role === 'ROLE_ADMIN' ? 'danger' : 'success'" size="small">{{ row.role === 'ROLE_ADMIN' ? t('admin.adminRole') : t('admin.userRole') }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" :label="t('admin.joined')" />
            <el-table-column :label="t('admin.actions')" width="120">
              <template #default="{ row }">
                <el-button size="small" @click="openRoleDialog(row)">{{ t('admin.editRole') }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <el-dialog v-model="roleDialogVisible" :title="t('admin.changeRole')" width="400px">
        <p>{{ t('admin.changeRoleFor') }} <strong>{{ selectedUser?.username }}</strong></p>
        <el-select v-model="newRole" style="width: 100%; margin-top: 16px">
          <el-option label="USER" value="ROLE_USER" />
          <el-option label="ADMIN" value="ROLE_ADMIN" />
        </el-select>
        <template #footer>
          <el-button @click="roleDialogVisible = false">{{ t('actions.cancel') }}</el-button>
          <el-button type="primary" @click="updateRole">{{ t('actions.confirm') }}</el-button>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<style scoped>
.admin-container { padding: 20px; }
.stats-row { margin-bottom: 20px; }
.stat-card { text-align: center; padding: 10px 0; }
.stat-value { font-size: 32px; font-weight: bold; color: #409eff; }
.stat-label { font-size: 14px; color: #909399; margin-top: 4px; }
.filter-row { margin-bottom: 16px; display: flex; }
.admin-tabs { margin-top: 10px; }
</style>
