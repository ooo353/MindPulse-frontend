<template>
  <Layout>
    <div class="reminders-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h2 class="page-title">智能提醒</h2>
        <p class="page-subtitle">设置提醒，我们会在正确的时间通知你</p>
      </div>

      <!-- WebSocket 状态 + 操作栏 -->
      <div class="reminders-toolbar">
        <div :class="['ws-status-card', wsConnected ? 'connected' : 'disconnected']">
          <div class="ws-indicator">
            <span :class="['ws-dot', wsConnected ? 'connected' : 'disconnected']"></span>
          </div>
          <div class="ws-info">
            <span class="ws-title">{{ wsConnected ? '实时连接中' : '连接已断开' }}</span>
            <span class="ws-subtitle">{{ wsConnected ? '提醒将通过浏览器推送通知' : '正在尝试重新连接...' }}</span>
          </div>
        </div>
        <el-button
          type="primary"
          @click="handleCreateReminder"
          class="create-reminder-btn glossy-button"
        >
          <el-icon><Plus /></el-icon>
          新建提醒
        </el-button>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && reminders.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="100" height="100">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="2" fill="none"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
        <h3>还没有提醒</h3>
        <p>创建一个提醒，我们会按时通知你</p>
      </div>

      <!-- 提醒卡片列表 -->
      <div v-if="reminders.length > 0" class="card-list" v-loading="loading">
        <div
          v-for="(reminder, index) in reminders"
          :key="reminder.id"
          :class="['reminder-card', 'card-glow-effect']"
          :style="{ animationDelay: `${index * 0.04}s` }"
          @mousemove="handleCardMouseMove"
        >
          <div :class="['reminder-type-icon', reminder.remindType]">
            <!-- ONCE -->
            <svg v-if="reminder.remindType === 'ONCE'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <!-- DAILY -->
            <svg v-else-if="reminder.remindType === 'DAILY'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
            <!-- WEEKLY -->
            <svg v-else-if="reminder.remindType === 'WEEKLY'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <!-- CUSTOM -->
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          </div>
          <div class="reminder-body">
            <div class="reminder-message">{{ reminder.message }}</div>
            <div class="reminder-meta">
              {{ getRemindTypeText(reminder.remindType) }} · {{ reminder.remindTime }}
              <span v-if="reminder.targetType"> · 关联{{ reminder.targetType === 'TASK' ? '任务' : '笔记' }}#{{ reminder.targetId }}</span>
              · {{ formatDateTime(reminder.createdAt) }}
            </div>
          </div>
          <div class="reminder-actions">
            <el-switch
              v-model="reminder.enabled"
              @change="toggleReminderEnabled(reminder)"
              size="small"
            />
            <el-button size="small" @click="editReminder(reminder)">编辑</el-button>
            <el-popconfirm
              title="确定要删除这个提醒吗？"
              @confirm="deleteReminder(reminder.id)"
            >
              <template #reference>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </div>

      <!-- 通知历史 -->
      <div class="notifications-section">
        <div class="notifications-header">
          <h3>通知历史</h3>
          <el-button size="small" text @click="clearAllNotifications" v-if="notifications.length > 0">清空全部</el-button>
        </div>
        <div class="notification-timeline" v-if="notifications.length > 0">
          <div
            v-for="(item, index) in notifications"
            :key="index"
            :class="['notification-entry', index % 2 === 0 ? 'left' : 'right']"
            :style="{ animationDelay: `${index * 0.08}s` }"
          >
            <div :class="['timeline-dot', item.type]"></div>
            <div class="timeline-card">
              <span class="timeline-title">{{ item.title }}</span>
              <span class="timeline-content">{{ item.content }}</span>
              <span class="timeline-time">{{ formatDateTime(item.timestamp) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="notification-empty">暂无通知</div>
      </div>

      <el-dialog
        v-model="showCreateDialog"
        :title="isEditing ? '编辑提醒' : '新建提醒'"
        width="550px"
      >
        <el-form :model="currentReminder" :rules="reminderRules" ref="reminderFormRef" label-width="100px">
          <el-form-item label="提醒内容" prop="message">
            <el-input v-model="currentReminder.message" placeholder="请输入提醒内容" />
          </el-form-item>

          <el-form-item label="提醒类型" prop="remindType">
            <el-select v-model="currentReminder.remindType" placeholder="请选择提醒类型" style="width: 100%" @change="onRemindTypeChange">
              <el-option label="一次性" value="ONCE" />
              <el-option label="每天" value="DAILY" />
              <el-option label="每周" value="WEEKLY" />
              <el-option label="自定义" value="CUSTOM" />
            </el-select>
          </el-form-item>

          <el-form-item label="提醒时间" prop="remindTime">
            <el-time-picker
              v-model="remindTimePicker"
              format="HH:mm"
              value-format="HH:mm"
              placeholder="选择时间"
              style="width: 100%"
              @update:model-value="currentReminder.remindTime = $event"
            />
          </el-form-item>

          <el-form-item v-if="currentReminder.remindType === 'ONCE'" label="提醒日期">
            <el-date-picker
              v-model="currentReminder.remindDate"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item v-if="currentReminder.remindType === 'WEEKLY'" label="星期几">
            <el-select v-model="currentReminder.dayOfWeek" placeholder="选择星期几" style="width: 100%">
              <el-option label="周一" value="MON" />
              <el-option label="周二" value="TUE" />
              <el-option label="周三" value="WED" />
              <el-option label="周四" value="THU" />
              <el-option label="周五" value="FRI" />
              <el-option label="周六" value="SAT" />
              <el-option label="周日" value="SUN" />
            </el-select>
          </el-form-item>

          <el-form-item v-if="currentReminder.remindType === 'CUSTOM'" label="Cron表达式">
            <el-input v-model="currentReminder.cronExpression" placeholder="如：0 0 9 * * MON-FRI" />
          </el-form-item>

          <el-form-item label="关联类型">
            <el-radio-group v-model="currentReminder.targetType">
              <el-radio value="TASK">任务</el-radio>
              <el-radio value="NOTE">笔记</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="关联ID">
            <el-input-number v-model="currentReminder.targetId" :min="0" placeholder="可选" style="width: 100%" />
          </el-form-item>

          <el-form-item label="是否启用">
            <el-switch v-model="currentReminder.enabled" />
          </el-form-item>
        </el-form>

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showCreateDialog = false">取消</el-button>
            <el-button type="primary" @click="saveReminder">保存</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import Layout from '@/components/Layout.vue';
import { useTaskStore } from '@/stores/task';
import { useWebSocket } from '@/utils/websocket';
import { reminderApi } from '@/api/reminderApi';
import { Reminder, CreateReminderRequest, Notification } from '@/types/reminder';

const taskStore = useTaskStore();

const wsConnected = ref(false);
let statusTimer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  taskStore.fetchTasks();
  const ws = useWebSocket();
  ws.connect();
  wsConnected.value = ws.isConnected();
  statusTimer = setInterval(() => {
    wsConnected.value = ws.isConnected();
  }, 5000);
  fetchReminders();
  listenToNotifications();
});

onUnmounted(() => {
  if (statusTimer) clearInterval(statusTimer);
  useWebSocket().disconnect();
});

// 状态管理
const reminders = ref<Reminder[]>([]);
const notifications = ref<Notification[]>([]);
const loading = ref(false);
const showCreateDialog = ref(false);
const isEditing = ref(false);
const reminderFormRef = ref();
const remindTimePicker = ref('');

const currentReminder = ref<CreateReminderRequest>({
  message: '',
  remindType: 'ONCE',
  remindTime: '09:00',
  enabled: true
});

const reminderRules = {
  message: [
    { required: true, message: '请输入提醒内容', trigger: 'blur' }
  ],
  remindType: [
    { required: true, message: '请选择提醒类型', trigger: 'change' }
  ],
  remindTime: [
    { required: true, message: '请选择提醒时间', trigger: 'change' }
  ]
};

const onRemindTypeChange = (type: string) => {
  currentReminder.value.remindDate = undefined;
  currentReminder.value.dayOfWeek = undefined;
  currentReminder.value.cronExpression = undefined;
};

const getRemindTypeText = (type: string) => {
  const map: Record<string, string> = {
    ONCE: '一次性',
    DAILY: '每天',
    WEEKLY: '每周',
    CUSTOM: '自定义'
  };
  return map[type] || type;
};

const getRemindTypeTag = (type: string) => {
  const map: Record<string, string> = {
    ONCE: 'info',
    DAILY: 'success',
    WEEKLY: 'warning',
    CUSTOM: 'danger'
  };
  return map[type] || 'info';
};

const formatDateTime = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
};

const fetchReminders = async () => {
  try {
    loading.value = true;
    reminders.value = await reminderApi.getReminders();
  } catch (error) {
    console.error('获取提醒失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleCreateReminder = () => {
  resetCurrentReminder();
  showCreateDialog.value = true;
};

const editReminder = (reminder: Reminder) => {
  currentReminder.value = {
    message: reminder.message,
    remindType: reminder.remindType,
    remindTime: reminder.remindTime,
    remindDate: reminder.remindDate,
    dayOfWeek: reminder.dayOfWeek,
    cronExpression: reminder.cronExpression,
    targetId: reminder.targetId,
    targetType: reminder.targetType,
    enabled: reminder.enabled
  };
  remindTimePicker.value = reminder.remindTime;
  isEditing.value = true;
  showCreateDialog.value = true;
};

const toggleReminderEnabled = async (reminder: Reminder) => {
  try {
    await reminderApi.updateReminder(reminder.id, { enabled: reminder.enabled });
    ElMessage.success('提醒状态已更新');
  } catch (error) {
    reminder.enabled = !reminder.enabled;
    ElMessage.error('更新提醒状态失败');
  }
};

const deleteReminder = async (id: number) => {
  try {
    await reminderApi.deleteReminder(id);
    reminders.value = reminders.value.filter(r => r.id !== id);
    ElMessage.success('提醒删除成功');
  } catch (error) {
    ElMessage.error('删除提醒失败');
  }
};

const saveReminder = async () => {
  if (!reminderFormRef.value) return;

  reminderFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (isEditing.value) {
          await reminderApi.updateReminder(
            (currentReminder.value as any).id,
            currentReminder.value
          );
          ElMessage.success('提醒更新成功');
        } else {
          await reminderApi.createReminder(currentReminder.value);
          ElMessage.success('提醒创建成功');
        }

        showCreateDialog.value = false;
        resetCurrentReminder();
        await fetchReminders();
      } catch (error) {
        console.error('保存提醒失败:', error);
        ElMessage.error('保存提醒失败');
      }
    }
  });
};

const resetCurrentReminder = () => {
  currentReminder.value = {
    message: '',
    remindType: 'ONCE',
    remindTime: '09:00',
    enabled: true
  };
  remindTimePicker.value = '';
  isEditing.value = false;
};

const listenToNotifications = () => {
  notifications.value = useWebSocket().getNotifications();
};

const clearAllNotifications = () => {
  useWebSocket().clearNotifications();
  notifications.value = [];
};

// 卡片光晕鼠标跟踪
const handleCardMouseMove = (e: MouseEvent) => {
  const card = e.currentTarget as HTMLElement;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  card.style.setProperty('--mouse-x', `${x}px`);
  card.style.setProperty('--mouse-y', `${y}px`);
};
</script>

<style scoped>
.reminders-container {
  max-width: var(--page-max-width);
  margin: 0 auto;
}

/* 工具栏 */
.reminders-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

/* WebSocket 状态卡片 */
.ws-status-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-radius: var(--radius-xl);
  background: var(--bg-card);
  backdrop-filter: blur(4px);
  box-shadow: var(--shadow-card);
  border: 1px solid rgba(255, 255, 255, 0.6);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.ws-status-card.connected {
  border-color: rgba(76, 201, 240, 0.3);
  box-shadow: 0 0 12px rgba(76, 201, 240, 0.08);
}

.ws-status-card.disconnected {
  border-color: rgba(247, 37, 133, 0.3);
  box-shadow: 0 0 12px rgba(247, 37, 133, 0.08);
}

.ws-indicator {
  display: flex;
  align-items: center;
}

.ws-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  position: relative;
}

.ws-dot.connected {
  background: var(--success-color);
  animation: glow-pulse 2s infinite;
}

.ws-dot.disconnected {
  background: var(--danger-color);
}

.ws-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ws-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.ws-subtitle {
  font-size: 13px;
  color: var(--text-muted);
}

.create-reminder-btn {
  background: var(--gradient-brand);
  border: none;
  color: white;
  font-weight: 600;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.create-reminder-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* 提醒卡片列表入场 */
.card-list .reminder-card {
  animation: stagger-fade-in 0.4s ease both;
}

.reminder-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* 通知区域 */
.notifications-section {
  margin-top: 32px;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.notifications-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

/* 时间轴 */
.notification-timeline {
  position: relative;
  padding-left: 20px;
}

.notification-timeline::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--border-color);
  border-radius: 1px;
}

.notification-entry {
  position: relative;
  padding: 8px 0 8px 24px;
  animation: slide-in-left 0.35s ease both;
}

.timeline-dot {
  position: absolute;
  left: -15px;
  top: 14px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--border-color);
  border: 2px solid var(--bg-secondary);
  z-index: 1;
}

.timeline-dot.warning { background: var(--warning-color); }
.timeline-dot.info { background: var(--info-color); }

.timeline-card {
  background: var(--bg-card);
  backdrop-filter: blur(4px);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.6);
  padding: 12px 16px;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: box-shadow 0.25s ease;
}

.timeline-card:hover {
  box-shadow: var(--shadow);
}

.timeline-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
}

.timeline-content {
  font-size: 13px;
  color: var(--text-secondary);
}

.timeline-time {
  font-size: 12px;
  color: var(--text-muted);
}

.notification-empty {
  text-align: center;
  color: var(--text-muted);
  padding: 30px;
}

.dialog-footer {
  text-align: right;
}

/* 响应式 */
@media (max-width: 768px) {
  .reminders-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .create-reminder-btn {
    width: 100%;
  }

  .reminder-actions {
    width: 100%;
    justify-content: flex-end;
    padding-top: 8px;
    border-top: 1px solid var(--border-color);
  }

  .reminder-card {
    flex-wrap: wrap;
  }
}
</style>
