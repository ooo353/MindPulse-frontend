<template>
  <Layout>
    <div class="tasks-container">
      <!-- 统计卡片 -->
      <div class="stat-cards">
        <div class="stat-card card-glow-effect" @mousemove="handleCardMouseMove">
          <div class="stat-icon tasks">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </div>
          <div class="stat-info">
            <span class="stat-number animated-number">{{ animatedTotal }}</span>
            <span class="stat-label">{{ t('tasks.totalTasks') }}</span>
          </div>
        </div>
        <div class="stat-card card-glow-effect" @mousemove="handleCardMouseMove">
          <div class="stat-icon pending">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="stat-info">
            <span class="stat-number animated-number">{{ animatedPending }}</span>
            <span class="stat-label">{{ t('tasks.pendingTasks') }}</span>
          </div>
        </div>
        <div class="stat-card card-glow-effect" @mousemove="handleCardMouseMove">
          <div class="stat-icon completed">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="stat-info">
            <span class="stat-number animated-number">{{ animatedCompleted }}</span>
            <span class="stat-label">{{ t('tasks.completedTasks') }}</span>
          </div>
        </div>
        <div class="stat-card card-glow-effect" @mousemove="handleCardMouseMove">
          <div class="stat-icon archived">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
          </div>
          <div class="stat-info">
            <span class="stat-number animated-number">{{ animatedArchived }}</span>
            <span class="stat-label">{{ t('tasks.archivedTasks') }}</span>
          </div>
        </div>
      </div>

      <!-- AI 输入 + 新建按钮 -->
      <div class="ai-input-area">
        <div class="ai-input-wrapper">
          <AIInput
            :placeholder="t('tasks.aiPlaceholder')"
            @ai-process="handleAIParsedTask"
          />
        </div>
        <el-button
          type="primary"
          @click="handleCreateTask"
          class="create-task-btn glossy-button"
        >
          <el-icon><Plus /></el-icon>
          {{ t('tasks.createTask') }}
        </el-button>
      </div>

      <!-- 胶囊 Tab 切换 -->
      <div class="capsule-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['capsule-tab', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 骨架屏加载 -->
      <div v-if="taskStore.loading && filteredTasks.length === 0" class="skeleton-list">
        <div v-for="i in 5" :key="i" class="skeleton-card" :style="{ animationDelay: `${i * 0.1}s` }">
          <div class="skeleton-line" style="width:35%;height:18px;margin-bottom:8px"></div>
          <div class="skeleton-line" style="width:70%;height:14px;margin-bottom:4px"></div>
          <div class="skeleton-line" style="width:25%;height:12px"></div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!taskStore.loading && filteredTasks.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="100" height="100">
          <path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2" fill="none"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
        <h3>{{ t('tasks.noTasks') }}</h3>
        <p>{{ t('tasks.noTasksHint') }}</p>
        <el-button type="primary" @click="handleCreateTask">{{ t('tasks.createFirst') }}</el-button>
      </div>

      <!-- 任务卡片列表 -->
      <div v-if="filteredTasks.length > 0" class="card-list" v-loading="taskStore.loading">
        <div
          v-for="(task, index) in filteredTasks"
          :key="task.id"
          :class="['task-card', 'card-glow-effect', `priority-${task.priority}`, { completed: task.status === 'completed' }]"
          :style="{ animationDelay: `${index * 0.04}s` }"
          @mousemove="handleCardMouseMove"
        >
          <div class="task-card-body" @click="editTask(task)">
            <div class="task-card-title">{{ task.title }}</div>
            <div class="task-card-desc">{{ task.description || t('tasks.noDescription') }}</div>
          </div>
          <div class="task-card-meta">
            <span class="task-card-date">{{ formatDate(task.dueDate) }}</span>
            <el-tag :type="getPriorityType(task.priority)" size="small">{{ getPriorityText(task.priority) }}</el-tag>
            <el-tag :type="getStatusType(task.status)" size="small">{{ getStatusText(task.status) }}</el-tag>
            <el-button size="small" :type="task.status === 'completed' ? 'info' : 'success'" @click.stop="toggleTaskStatus(task)">
              {{ task.status === 'completed' ? t('tasks.restore') : t('tasks.complete') }}
            </el-button>
            <el-popconfirm
              :title="t('tasks.confirmDelete')"
              @confirm="deleteTask(task.id)"
            >
              <template #reference>
                <el-button size="small" type="danger" @click.stop>{{ t('actions.delete') }}</el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </div>

      <!-- 任务创建/编辑对话框 -->
      <el-dialog
        v-model="showCreateDialog"
        :title="isEditing ? t('tasks.editTask') : t('tasks.newTask')"
        width="500px"
      >
        <el-form :model="currentTask" :rules="taskRules" ref="taskFormRef" label-width="80px">
          <el-form-item :label="t('tasks.titleLabel')" prop="title">
            <el-input v-model="currentTask.title" :placeholder="t('tasks.titlePlaceholder')" />
          </el-form-item>

          <el-form-item :label="t('tasks.descLabel')" prop="description">
            <el-input
              v-model="currentTask.description"
              type="textarea"
              :rows="3"
              :placeholder="t('tasks.descPlaceholder')"
            />
          </el-form-item>

          <el-form-item :label="t('tasks.dueDateLabel')" prop="dueDate">
            <el-date-picker
              v-model="currentTask.dueDate"
              type="date"
              :placeholder="t('tasks.dueDatePlaceholder')"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item :label="t('tasks.priorityLabel')" prop="priority">
            <el-select v-model="currentTask.priority" :placeholder="t('tasks.priorityPlaceholder')" style="width: 100%">
              <el-option :label="t('priority.high')" value="high"></el-option>
              <el-option :label="t('priority.medium')" value="medium"></el-option>
              <el-option :label="t('priority.low')" value="low"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item :label="t('tasks.categoryLabel')" prop="category">
            <el-input v-model="currentTask.category" :placeholder="t('tasks.categoryPlaceholder')" />
          </el-form-item>

          <el-form-item :label="t('tasks.relatedNotesLabel')" prop="relatedNotes">
            <el-input v-model="currentTask.relatedNotes" :placeholder="t('tasks.relatedNotesPlaceholder')" />
          </el-form-item>

          <el-form-item :label="t('tasks.statusLabel')" prop="status">
            <el-select v-model="currentTask.status" :placeholder="t('tasks.statusPlaceholder')" style="width: 100%">
              <el-option :label="t('status.pending')" value="pending"></el-option>
              <el-option :label="t('status.completed')" value="completed"></el-option>
              <el-option :label="t('status.archived')" value="archived"></el-option>
            </el-select>
          </el-form-item>
        </el-form>

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showCreateDialog = false">{{ t('actions.cancel') }}</el-button>
            <el-button type="primary" @click="saveTask">{{ t('actions.save') }}</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import Layout from '@/components/Layout.vue';
import { getErrorMessage } from '@/utils/error';
import AIInput from '@/components/AIInput.vue';
import { useTaskStore } from '@/stores/task';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '@/types/task';

const { t } = useI18n();
const taskStore = useTaskStore();

// 动画数字
const animatedTotal = ref(0);
const animatedPending = ref(0);
const animatedCompleted = ref(0);
const animatedArchived = ref(0);

// 数字滚动动画函数
const animateNumber = (target: number, setter: (val: number) => void, duration = 800) => {
  const start = 0;
  const startTime = performance.now();

  const update = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // 缓动函数 (easeOutCubic)
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (target - start) * eased);

    setter(current);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  };

  requestAnimationFrame(update);
};

// 监听任务数据变化，触发数字动画
watch(() => taskStore.tasks.length, (newVal) => {
  animateNumber(newVal, (val) => { animatedTotal.value = val; });
}, { immediate: true });

watch(() => taskStore.pendingTasks.length, (newVal) => {
  animateNumber(newVal, (val) => { animatedPending.value = val; });
}, { immediate: true });

watch(() => taskStore.completedTasks.length, (newVal) => {
  animateNumber(newVal, (val) => { animatedCompleted.value = val; });
}, { immediate: true });

watch(() => taskStore.archivedTasks.length, (newVal) => {
  animateNumber(newVal, (val) => { animatedArchived.value = val; });
}, { immediate: true });

// 卡片光晕鼠标跟踪
const handleCardMouseMove = (e: MouseEvent) => {
  const card = e.currentTarget as HTMLElement;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  card.style.setProperty('--mouse-x', `${x}px`);
  card.style.setProperty('--mouse-y', `${y}px`);
};

// 初始化任务数据
onMounted(() => {
  taskStore.fetchTasks();
});

// 状态管理
const tabs = computed(() => [
  { key: 'all', label: t('tasks.allTasks') },
  { key: 'pending', label: t('tasks.pendingTasks') },
  { key: 'completed', label: t('tasks.completedTasks') },
  { key: 'archived', label: t('tasks.archivedTasks') }
]);
const activeTab = ref('all');
const showCreateDialog = ref(false);
const isEditing = ref(false);
const editingTaskId = ref<number | null>(null);
const taskFormRef = ref();

// 当前编辑的任务
const currentTask = ref<CreateTaskRequest | UpdateTaskRequest>({
  title: '',
  description: '',
  dueDate: undefined,
  priority: 'medium',
  status: 'pending',
  category: '',
  relatedNotes: ''
});

// 任务验证规则
const taskRules = computed(() => ({
  title: [
    { required: true, message: t('tasks.titleRequired'), trigger: 'blur' },
    { min: 1, max: 100, message: t('tasks.titleLength'), trigger: 'blur' }
  ],
  description: [
    { max: 500, message: t('tasks.descLength'), trigger: 'blur' }
  ],
  priority: [
    { required: true, message: t('tasks.priorityRequired'), trigger: 'change' }
  ],
  status: [
    { required: true, message: t('tasks.statusRequired'), trigger: 'change' }
  ]
}));

// 根据活动标签过滤任务
const filteredTasks = computed(() => {
  switch (activeTab.value) {
    case 'pending':
      return taskStore.pendingTasks;
    case 'completed':
      return taskStore.completedTasks;
    case 'archived':
      return taskStore.archivedTasks;
    default:
      return taskStore.tasks;
  }
});

// 优先级显示转换
const getPriorityText = (priority: 'high' | 'medium' | 'low') => {
  return t(`priority.${priority}`);
};

const getPriorityType = (priority: 'high' | 'medium' | 'low') => {
  const map = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  };
  return map[priority];
};

// 状态显示转换
const getStatusText = (status: 'pending' | 'completed' | 'archived') => {
  return t(`status.${status}`);
};

const getStatusType = (status: 'pending' | 'completed' | 'archived') => {
  const map = {
    pending: 'warning',
    completed: 'success',
    archived: 'info'
  };
  return map[status];
};

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return t('tasks.noDueDate');
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
};

// 编辑任务
const editTask = (task: Task) => {
  editingTaskId.value = task.id;
  currentTask.value = { ...task };
  isEditing.value = true;
  showCreateDialog.value = true;
};

// 切换任务状态
const toggleTaskStatus = async (task: Task) => {
  if (!task.id) {
    ElMessage.error(t('tasks.idMissing'));
    return;
  }
  try {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await taskStore.updateTaskStatus(task.id, newStatus);
    ElMessage.success(t('tasks.statusUpdated'));
  } catch (error: unknown) {
    console.error('更新任务状态失败:', error);
    ElMessage.error(getErrorMessage(error) || t('tasks.statusUpdateFailed'));
  }
};

// 删除任务
const deleteTask = async (id: number) => {
  try {
    await taskStore.deleteTask(id);
    ElMessage.success(t('tasks.deleteSuccess'));
  } catch (error: unknown) {
    console.error('删除任务失败:', error);
    ElMessage.error(getErrorMessage(error) || t('tasks.deleteFailed'));
  }
};

// 保存任务（创建或更新）
const saveTask = async () => {
  if (!taskFormRef.value) return;

  taskFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (isEditing.value && editingTaskId.value !== null) {
          // 更新任务
          await taskStore.updateTask(
            editingTaskId.value,
            currentTask.value as UpdateTaskRequest
          );
          ElMessage.success(t('tasks.updateSuccess'));
        } else {
          // 创建任务
          await taskStore.createTask(currentTask.value as CreateTaskRequest);
          ElMessage.success(t('tasks.createSuccess'));
        }

        showCreateDialog.value = false;
        resetCurrentTask();
      } catch (error: unknown) {
        console.error('保存任务失败:', error);
        ElMessage.error(getErrorMessage(error) || t('tasks.saveFailed'));
      }
    } else {
      console.log('验证失败!');
      return false;
    }
  });
};

// AI解析任务回调
const handleAIParsedTask = (parsedTask: any) => {
  currentTask.value = {
    title: parsedTask.title,
    description: parsedTask.description,
    dueDate: parsedTask.dueDate,
    priority: parsedTask.priority,
    category: parsedTask.category || '',
    status: 'pending'
  };
  showCreateDialog.value = true;
  isEditing.value = false;
};

// 重置当前任务对象
const resetCurrentTask = () => {
  currentTask.value = {
    title: '',
    description: '',
    dueDate: undefined,
    priority: 'medium',
    status: 'pending',
    category: '',
    relatedNotes: ''
  };
  isEditing.value = false;
  editingTaskId.value = null;
};

// 新建任务按钮点击
const handleCreateTask = () => {
  resetCurrentTask();
  showCreateDialog.value = true;
  isEditing.value = false;
};
</script>

<style scoped>
.tasks-container {
  max-width: var(--page-max-width);
  margin: 0 auto;
}

/* 动画数字 */
.animated-number {
  display: inline-block;
  min-width: 2ch;
  text-align: center;
  animation: count-up 0.6s ease-out;
}

@keyframes count-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* AI 输入区域 */
.ai-input-area {
  background: var(--bg-card);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: var(--radius-xl);
  padding: 20px 24px;
  margin-bottom: 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  box-shadow: var(--shadow-card);
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.ai-input-area:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.12);
}

.ai-input-wrapper {
  flex: 1;
  min-width: 0;
}

.create-task-btn {
  background: var(--gradient-brand);
  border: none;
  color: white;
  font-weight: 600;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
  flex-shrink: 0;
  height: 40px;
}

.create-task-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* 骨架屏列表 */
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-card {
  background: var(--bg-card);
  backdrop-filter: blur(4px);
  border-radius: var(--radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.6);
  padding: 20px 24px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-line {
  background: var(--border-color);
  border-radius: 4px;
}

/* 卡片列表入场动画 */
.card-list .task-card {
  animation: stagger-fade-in 0.4s ease both;
}

/* Virtual scrolling optimization - skips rendering of off-screen cards */
.card-list .task-card {
  content-visibility: auto;
  contain-intrinsic-size: auto 120px;
}

.dialog-footer {
  text-align: right;
  padding-top: var(--spacing-lg);
}

/* 响应式 */
@media (max-width: 768px) {
  .ai-input-area {
    flex-direction: column;
    padding: 16px;
  }

  .create-task-btn {
    width: 100%;
  }

  .task-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .task-card-meta {
    width: 100%;
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
