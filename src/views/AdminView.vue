<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Layout from '@/components/Layout.vue'
import { useAdminStore } from '@/stores/admin'
import { ElMessage } from 'element-plus'

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
  await Promise.all([
    store.fetchStats(),
    loadLogs(),
    store.fetchUsers()
  ])
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
    ElMessage.success('Role updated successfully')
    roleDialogVisible.value = false
    await store.fetchUsers()
  } catch {
    ElMessage.error('Failed to update role')
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
              <div class="stat-label">Total Users</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover">
            <div class="stat-card">
              <div class="stat-value">{{ store.stats?.totalAuditLogs ?? 0 }}</div>
              <div class="stat-label">Total Logs</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover">
            <div class="stat-card">
              <div class="stat-value">{{ store.stats?.todayActions ?? 0 }}</div>
              <div class="stat-label">Today's Actions</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-tabs v-model="activeTab" class="admin-tabs">
        <el-tab-pane label="Audit Logs" name="logs">
          <div class="filter-row">
            <el-select v-model="actionFilter" placeholder="Filter by action" clearable @change="onFilterChange" style="width: 180px">
              <el-option label="CREATE" value="CREATE" />
              <el-option label="UPDATE" value="UPDATE" />
              <el-option label="DELETE" value="DELETE" />
              <el-option label="LOGIN" value="LOGIN" />
            </el-select>
            <el-select v-model="resourceTypeFilter" placeholder="Filter by resource" clearable @change="onFilterChange" style="width: 180px; margin-left: 10px">
              <el-option label="Task" value="Task" />
              <el-option label="Note" value="Note" />
              <el-option label="Reminder" value="Reminder" />
              <el-option label="User" value="User" />
            </el-select>
          </div>
          <el-table :data="store.auditLogs" v-loading="store.loading" style="width: 100%">
            <el-table-column prop="userId" label="User" width="120" />
            <el-table-column prop="action" label="Action" width="100">
              <template #default="{ row }">
                <el-tag :type="row.action === 'DELETE' ? 'danger' : row.action === 'CREATE' ? 'success' : 'info'" size="small">{{ row.action }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="resourceType" label="Resource" width="120" />
            <el-table-column prop="resourceId" label="Resource ID" width="100" />
            <el-table-column prop="ipAddress" label="IP" width="140" />
            <el-table-column prop="createdAt" label="Time" />
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

        <el-tab-pane label="User Management" name="users">
          <el-table :data="store.users" v-loading="store.loading" style="width: 100%">
            <el-table-column prop="username" label="Username" />
            <el-table-column prop="email" label="Email" />
            <el-table-column prop="role" label="Role" width="120">
              <template #default="{ row }">
                <el-tag :type="row.role === 'ROLE_ADMIN' ? 'danger' : 'success'" size="small">{{ row.role }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="Joined" />
            <el-table-column label="Actions" width="120">
              <template #default="{ row }">
                <el-button size="small" @click="openRoleDialog(row)">Edit Role</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <el-dialog v-model="roleDialogVisible" title="Change User Role" width="400px">
        <p>Change role for <strong>{{ selectedUser?.username }}</strong></p>
        <el-select v-model="newRole" style="width: 100%; margin-top: 16px">
          <el-option label="USER" value="ROLE_USER" />
          <el-option label="ADMIN" value="ROLE_ADMIN" />
        </el-select>
        <template #footer>
          <el-button @click="roleDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="updateRole">Confirm</el-button>
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
