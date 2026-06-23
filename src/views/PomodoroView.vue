<template>
  <Layout>
    <div class="pomodoro-container">
      <!-- 统计卡片 -->
      <div class="stat-cards">
        <div class="stat-card card-glow-effect" @mousemove="handleCardMouseMove">
          <div class="stat-icon sessions">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="stat-info">
            <span class="stat-number">{{ store.stats?.todaySessions ?? 0 }}</span>
            <span class="stat-label">{{ t('pomodoro.todaySessions') }}</span>
          </div>
        </div>
        <div class="stat-card card-glow-effect" @mousemove="handleCardMouseMove">
          <div class="stat-icon minutes">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v10l4.5 4.5"/><circle cx="12" cy="12" r="10"/></svg>
          </div>
          <div class="stat-info">
            <span class="stat-number">{{ store.stats?.todayMinutes ?? 0 }}</span>
            <span class="stat-label">{{ t('pomodoro.todayMinutes') }}</span>
          </div>
        </div>
        <div class="stat-card card-glow-effect" @mousemove="handleCardMouseMove">
          <div class="stat-icon streak">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <div class="stat-info">
            <span class="stat-number">{{ store.stats?.streakDays ?? 0 }}</span>
            <span class="stat-label">{{ t('pomodoro.streak') }}</span>
          </div>
        </div>
      </div>

      <!-- Daily pie chart -->
      <div class="daily-pie-chart" v-if="store.dailySummary.length > 0">
        <h4>{{ t('pomodoro.todayDistribution') }}</h4>
        <div class="pie-container">
          <div class="pie-chart" :style="pieChartStyle"></div>
          <div class="pie-legend">
            <div v-for="item in store.dailySummary" :key="item.sessionType" class="legend-item">
              <span class="legend-color" :style="{ backgroundColor: getSessionColor(item.sessionType) }"></span>
              <span class="legend-label">{{ getSessionLabel(item.sessionType) }}</span>
              <span class="legend-value">{{ item.totalMinutes }}{{ t('pomodoro.minute') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 计时器主体 -->
      <div class="timer-section">
        <!-- SVG 环形进度 -->
        <svg width="200" height="200" viewBox="0 0 200 200" class="timer-ring">
          <circle cx="100" cy="100" r="90" fill="none" stroke="#e5e7eb" stroke-width="8" />
          <circle
            cx="100" cy="100" r="90"
            fill="none"
            stroke="#409eff"
            stroke-width="8"
            stroke-linecap="round"
            :stroke-dasharray="565.48"
            :stroke-dashoffset="565.48 * (1 - store.progress)"
            transform="rotate(-90 100 100)"
            class="progress-ring"
          />
          <text x="100" y="105" text-anchor="middle" font-size="36" font-weight="bold" fill="#303133">
            {{ store.activeSession ? store.remainingDisplay : defaultDisplay }}
          </text>
        </svg>

        <!-- Task description input -->
        <el-input
          v-model="taskDescription"
          :placeholder="t('pomodoro.whatDoing')"
          clearable
          style="margin-bottom: 16px; max-width: 400px;"
          :disabled="!!store.activeSession"
        />

        <!-- 会话类型选择 -->
        <div class="type-selector">
          <el-radio-group v-model="selectedType" :disabled="!!store.activeSession">
            <el-radio-button value="focus">{{ t('pomodoro.focus') }} 25min</el-radio-button>
            <el-radio-button value="short_break">{{ t('pomodoro.shortBreak') }} 5min</el-radio-button>
            <el-radio-button value="long_break">{{ t('pomodoro.longBreak') }} 15min</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button
            type="primary"
            size="large"
            :disabled="!!store.activeSession"
            @click="handleStart"
          >
            {{ t('pomodoro.focusStart') }}
          </el-button>
          <el-button
            type="success"
            size="large"
            :disabled="!store.activeSession"
            @click="handleComplete"
          >
            {{ t('pomodoro.complete') }}
          </el-button>
          <el-button
            type="danger"
            size="large"
            :disabled="!store.activeSession"
            @click="handleCancel"
          >
            {{ t('pomodoro.cancel') }}
          </el-button>
        </div>
      </div>

      <!-- 最近记录 -->
      <div class="history-section">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <h3 class="section-title" style="margin: 0;">{{ t('pomodoro.recentRecords') }}</h3>
          <el-button type="danger" size="small" @click="handleClearHistory" :disabled="store.sessions.length === 0">{{ t('pomodoro.clearHistory') }}</el-button>
        </div>
        <el-table
          :data="store.sessions"
          v-loading="store.loading"
          stripe
          style="width: 100%"
          :empty-text="t('pomodoro.noRecords')"
        >
          <el-table-column prop="sessionType" :label="t('pomodoro.type')" width="120">
            <template #default="{ row }">
              <el-tag :type="getSessionTypeTag(row.sessionType)" size="small">
                {{ getSessionTypeText(row.sessionType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="taskDescription" :label="t('pomodoro.taskDesc')" show-overflow-tooltip />
          <el-table-column prop="startTime" :label="t('pomodoro.startTime')" min-width="160">
            <template #default="{ row }">
              {{ formatTime(row.startTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="durationMinutes" :label="t('pomodoro.plannedDuration')" width="100">
            <template #default="{ row }">
              {{ row.durationMinutes }} {{ t('pomodoro.minute') }}
            </template>
          </el-table-column>
          <el-table-column prop="actualMinutes" :label="t('pomodoro.actualDuration')" width="100">
            <template #default="{ row }">
              {{ row.actualMinutes != null ? `${row.actualMinutes} ${t('pomodoro.minute')}` : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="status" :label="t('pomodoro.status')" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusTag(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="t('pomodoro.operation')" width="100">
            <template #default="{ row }">
              <el-button type="danger" size="small" text @click="handleDeleteSession(row.id)">{{ t('actions.delete') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin-top: 16px; text-align: right; font-size: 13px; color: var(--text-muted);">
          {{ t('pomodoro.showRecent') }} {{ store.sessions.length }} {{ t('pomodoro.records') }}
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Layout from '@/components/Layout.vue'
import { usePomodoroStore } from '@/stores/pomodoro'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getErrorMessage } from '@/utils/error'

const { t } = useI18n()

const store = usePomodoroStore()
const selectedType = ref<'focus' | 'short_break' | 'long_break'>('focus')
const taskDescription = ref('')

const DURATION_MAP = { focus: 25, short_break: 5, long_break: 15 }

const defaultDisplay = computed(() => {
  const mins = DURATION_MAP[selectedType.value]
  return `${String(mins).padStart(2, '0')}:00`
})

onUnmounted(() => {
  store.stopTimer()
})

onMounted(async () => {
  try {
    await store.fetchActiveSession()
  } catch {
    // No active session is fine
  }
  try {
    await store.fetchStats()
  } catch {
    // Stats fetch failure is non-critical
  }
  try {
    await store.fetchHistory(1, 10)
  } catch {
    // History fetch failure is non-critical
  }
  try {
    await store.fetchDailySummary()
  } catch {
    // Daily summary fetch failure is non-critical
  }
})

// 卡片光晕鼠标跟踪
const handleCardMouseMove = (e: MouseEvent) => {
  const card = e.currentTarget as HTMLElement
  const rect = card.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  card.style.setProperty('--mouse-x', `${x}px`)
  card.style.setProperty('--mouse-y', `${y}px`)
}

async function handleStart() {
  try {
    await store.startSession({
      sessionType: selectedType.value,
      durationMinutes: DURATION_MAP[selectedType.value],
      taskDescription: taskDescription.value || undefined
    })
    ElMessage.success(t('pomodoro.started'))
  } catch (err: unknown) {
    ElMessage.error(getErrorMessage(err) || t('pomodoro.startFailed'))
  }
}

async function handleDeleteSession(id: number) {
  try {
    await ElMessageBox.confirm(t('pomodoro.confirmDelete'), t('pomodoro.confirmDeleteTitle'), {
      confirmButtonText: t('actions.delete'),
      cancelButtonText: t('actions.cancel'),
      type: 'warning'
    })
    await store.deleteSession(id)
    ElMessage.success(t('pomodoro.deleted'))
  } catch (err: unknown) {
    if (err !== 'cancel') {
      ElMessage.error(getErrorMessage(err) || t('pomodoro.deleteFailed'))
    }
  }
}

async function handleClearHistory() {
  try {
    await ElMessageBox.confirm(t('pomodoro.confirmClear'), t('pomodoro.confirmClearTitle'), {
      confirmButtonText: t('pomodoro.clearBtn'),
      cancelButtonText: t('actions.cancel'),
      type: 'warning'
    })
    await store.clearHistory()
    ElMessage.success(t('pomodoro.cleared'))
  } catch (err: unknown) {
    if (err !== 'cancel') {
      ElMessage.error(getErrorMessage(err) || t('pomodoro.clearFailed'))
    }
  }
}

async function handleComplete() {
  if (!store.activeSession) return
  try {
    await store.completeSession(store.activeSession.id)
    await store.fetchStats()
    await store.fetchHistory(1, 10)
    await store.fetchDailySummary()
    ElMessage.success(t('pomodoro.finished'))
  } catch (err: unknown) {
    ElMessage.error(getErrorMessage(err) || t('pomodoro.finishFailed'))
  }
}

async function handleCancel() {
  if (!store.activeSession) return
  try {
    await store.cancelSession(store.activeSession.id)
    await store.fetchHistory(1, 10)
    ElMessage.info(t('pomodoro.canceled'))
  } catch (err: unknown) {
    ElMessage.error(getErrorMessage(err) || t('pomodoro.cancelFailed'))
  }
}

// 类型显示
function getSessionTypeText(type: string) {
  const map: Record<string, string> = {
    focus: t('pomodoro.focus'),
    short_break: t('pomodoro.shortBreak'),
    long_break: t('pomodoro.longBreak')
  }
  return map[type] || type
}

function getSessionTypeTag(type: string) {
  const map: Record<string, string> = { focus: 'danger', short_break: 'success', long_break: 'warning' }
  return map[type] || 'info'
}

// 状态显示
function getStatusText(status: string) {
  const map: Record<string, string> = {
    running: t('status.running'),
    completed: t('status.completed'),
    cancelled: t('status.cancelled')
  }
  return map[status] || status
}

function getStatusTag(status: string) {
  const map: Record<string, string> = { running: 'warning', completed: 'success', cancelled: 'info' }
  return map[status] || 'info'
}

// Time formatting
function formatTime(dateString: string) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// Pie chart helpers
const getSessionColor = (type: string) => {
  const colors: Record<string, string> = { focus: '#409eff', short_break: '#67c23a', long_break: '#e6a23c' };
  return colors[type] || '#909399';
};

const getSessionLabel = (type: string) => {
  const labels: Record<string, string> = {
    focus: t('pomodoro.focus'),
    short_break: t('pomodoro.shortBreak'),
    long_break: t('pomodoro.longBreak')
  };
  return labels[type] || type;
};

const pieChartStyle = computed(() => {
  const data = store.dailySummary;
  if (!data.length) return {};
  const total = data.reduce((sum, item) => sum + item.totalMinutes, 0);
  if (total === 0) return {};
  const colors: Record<string, string> = { focus: '#409eff', short_break: '#67c23a', long_break: '#e6a23c' };
  let acc = 0;
  const stops: string[] = [];
  data.forEach(item => {
    const pct = (item.totalMinutes / total) * 100;
    const color = colors[item.sessionType] || '#909399';
    stops.push(`${color} ${acc}% ${acc + pct}%`);
    acc += pct;
  });
  return { background: `conic-gradient(${stops.join(', ')})` };
});
</script>

<style scoped>
.pomodoro-container {
  max-width: var(--page-max-width);
  margin: 0 auto;
}

/* 统计卡片 */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--bg-card);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: var(--radius-xl);
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-card);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.sessions {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

.stat-icon.minutes {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.stat-icon.streak {
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
}

/* 计时器区域 */
.timer-section {
  background: var(--bg-card);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: var(--radius-xl);
  padding: 40px 24px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  box-shadow: var(--shadow-card);
}

.timer-ring {
  display: block;
}

.progress-ring {
  transition: stroke-dashoffset 1s linear;
}

.type-selector {
  display: flex;
  justify-content: center;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

/* 历史记录 */
.history-section {
  background: var(--bg-card);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: var(--radius-xl);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

/* Daily pie chart */
.daily-pie-chart {
  margin-top: 20px;
  text-align: center;
}

.daily-pie-chart h4 {
  margin-bottom: 12px;
  color: #303133;
}

.pie-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.pie-chart {
  width: 150px;
  height: 150px;
  border-radius: 50%;
}

.pie-legend {
  text-align: left;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-label {
  font-size: 14px;
  color: #606266;
}

.legend-value {
  font-size: 14px;
  color: #303133;
  font-weight: 600;
  margin-left: auto;
}

/* 响应式 */
@media (max-width: 768px) {
  .stat-cards {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .action-buttons .el-button {
    width: 100%;
  }

  .pie-container {
    flex-direction: column;
  }
}
</style>
