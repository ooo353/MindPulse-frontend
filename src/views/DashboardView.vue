<template>
  <Layout>
    <div class="dashboard-container" v-loading="dashboardStore.loading">
      <!-- Summary Cards -->
      <div class="stat-cards">
        <div class="stat-card card-glow-effect" @mousemove="handleCardMouseMove">
          <div class="stat-icon tasks">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </div>
          <div class="stat-info">
            <span class="stat-number">{{ summary?.totalTasks ?? 0 }}</span>
            <span class="stat-label">{{ t('dashboard.totalTasks') }}</span>
          </div>
        </div>
        <div class="stat-card card-glow-effect" @mousemove="handleCardMouseMove">
          <div class="stat-icon completed">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="stat-info">
            <span class="stat-number">{{ summary?.completedTasks ?? 0 }}</span>
            <span class="stat-label">{{ t('dashboard.completedTasks') }}</span>
          </div>
        </div>
        <div class="stat-card card-glow-effect" @mousemove="handleCardMouseMove">
          <div class="stat-icon rate">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <div class="stat-info">
            <span class="stat-number">{{ summary?.completionRate ?? 0 }}%</span>
            <span class="stat-label">{{ t('dashboard.completionRate') }}</span>
            <el-progress
              :percentage="summary?.completionRate ?? 0"
              :stroke-width="6"
              :show-text="false"
              class="completion-progress"
            />
          </div>
        </div>
        <div class="stat-card card-glow-effect" @mousemove="handleCardMouseMove">
          <div class="stat-icon active">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div class="stat-info">
            <span class="stat-number">{{ summary?.activeDays ?? 0 }}</span>
            <span class="stat-label">{{ t('dashboard.activeDays') }}</span>
          </div>
        </div>
        <div class="stat-card card-glow-effect" @mousemove="handleCardMouseMove">
          <div class="stat-icon notes">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <div class="stat-info">
            <span class="stat-number">{{ summary?.totalNotes ?? 0 }}</span>
            <span class="stat-label">{{ t('dashboard.totalNotes') }}</span>
          </div>
        </div>
      </div>

      <!-- Productivity Section -->
      <div class="section-card">
        <div class="section-header">
          <h3>{{ t('dashboard.productivity') }}</h3>
          <div class="period-tabs">
            <button
              v-for="p in periods"
              :key="p.key"
              :class="['capsule-tab', { active: activePeriod === p.key }]"
              @click="changePeriod(p.key)"
            >{{ p.label }}</button>
          </div>
        </div>
        <div class="bar-chart" v-if="productivity && productivity.dates.length > 0">
          <div class="bar-chart-row">
            <div class="bar-chart-label">{{ t('dashboard.completedTask') }}</div>
            <div class="bar-chart-bars">
              <div
                v-for="(val, i) in productivity.completedCounts"
                :key="'t-' + i"
                class="bar-wrapper"
                :title="`${productivity.dates[i]}: ${val} ${t('dashboard.count')}`"
              >
                <div
                  class="bar bar-task"
                  :style="{ height: getBarHeight(val, maxCompleted) + 'px' }"
                />
                <span class="bar-date" v-if="showDateLabel(i)">{{ formatShortDate(productivity.dates[i]) }}</span>
              </div>
            </div>
          </div>
          <div class="bar-chart-row">
            <div class="bar-chart-label">{{ t('dashboard.studyMinutes') }}</div>
            <div class="bar-chart-bars">
              <div
                v-for="(val, i) in productivity.studyMinutes"
                :key="'m-' + i"
                class="bar-wrapper"
                :title="`${productivity.dates[i]}: ${val} ${t('pomodoro.minute')}`"
              >
                <div
                  class="bar bar-study"
                  :style="{ height: getBarHeight(val, maxMinutes) + 'px' }"
                />
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-hint">{{ t('dashboard.noProductivityData') }}</div>
      </div>

      <!-- Category Distribution -->
      <div class="section-row">
        <div class="section-card half">
          <h3>{{ t('dashboard.taskCategories') }}</h3>
          <div v-if="categoryDistribution && categoryDistribution.taskCategories.length > 0" class="category-list">
            <div v-for="cat in categoryDistribution.taskCategories" :key="cat.name" class="category-item">
              <span class="category-name">{{ cat.name }}</span>
              <el-progress
                :percentage="getCategoryPercent(cat.value, taskCategoryTotal)"
                :stroke-width="14"
                :format="() => cat.value + ' ' + t('dashboard.count')"
              />
            </div>
          </div>
          <div v-else class="empty-hint">{{ t('dashboard.noTaskCategoryData') }}</div>
        </div>
        <div class="section-card half">
          <h3>{{ t('dashboard.noteCategories') }}</h3>
          <div v-if="categoryDistribution && categoryDistribution.noteCategories.length > 0" class="category-list">
            <div v-for="cat in categoryDistribution.noteCategories" :key="cat.name" class="category-item">
              <span class="category-name">{{ cat.name }}</span>
              <el-progress
                :percentage="getCategoryPercent(cat.value, noteCategoryTotal)"
                :stroke-width="14"
                :format="() => cat.value + ' ' + t('dashboard.articles')"
              />
            </div>
          </div>
          <div v-else class="empty-hint">{{ t('dashboard.noNoteCategoryData') }}</div>
        </div>
      </div>

      <!-- Study Heatmap -->
      <div class="section-card">
        <h3>{{ t('dashboard.heatmap') }} ({{ currentYear }})</h3>
        <div class="heatmap-container" v-if="heatmapWeeks.length > 0">
          <div class="heatmap-legend">
            <span>{{ t('dashboard.less') }}</span>
            <div class="heatmap-cell" style="background: #ebedf0" />
            <div class="heatmap-cell" style="background: #9be9a8" />
            <div class="heatmap-cell" style="background: #40c463" />
            <div class="heatmap-cell" style="background: #30a14e" />
            <div class="heatmap-cell" style="background: #216e39" />
            <span>{{ t('dashboard.more') }}</span>
          </div>
          <div class="heatmap">
            <div v-for="(week, wi) in heatmapWeeks" :key="wi" class="heatmap-week">
              <div
                v-for="(day, di) in week"
                :key="di"
                class="heatmap-cell"
                :style="{ backgroundColor: getHeatmapColor(day.minutes) }"
                :title="`${day.date}: ${day.minutes} ${t('pomodoro.minute')}`"
              />
            </div>
          </div>
        </div>
        <div v-else class="empty-hint">{{ t('dashboard.noStudyData') }}</div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Layout from '@/components/Layout.vue'
import { useDashboardStore } from '@/stores/dashboard'
import { ElMessage } from 'element-plus'

const { t } = useI18n()
const dashboardStore = useDashboardStore()
const currentYear = new Date().getFullYear()

const summary = computed(() => dashboardStore.summary)
const productivity = computed(() => dashboardStore.productivity)
const categoryDistribution = computed(() => dashboardStore.categoryDistribution)

const activePeriod = ref('daily')
const periods = computed(() => [
  { key: 'daily', label: t('dashboard.last30Days') },
  { key: 'weekly', label: t('dashboard.last12Weeks') },
  { key: 'monthly', label: t('dashboard.last12Months') }
])

const maxCompleted = computed(() => {
  if (!productivity.value) return 1
  return Math.max(...productivity.value.completedCounts, 1)
})

const maxMinutes = computed(() => {
  if (!productivity.value) return 1
  return Math.max(...productivity.value.studyMinutes, 1)
})

const taskCategoryTotal = computed(() => {
  if (!categoryDistribution.value) return 0
  return categoryDistribution.value.taskCategories.reduce((s, c) => s + c.value, 0)
})

const noteCategoryTotal = computed(() => {
  if (!categoryDistribution.value) return 0
  return categoryDistribution.value.noteCategories.reduce((s, c) => s + c.value, 0)
})

// Heatmap computation
const heatmapWeeks = computed(() => {
  const data = dashboardStore.heatmap?.heatmap ?? {}
  const startDate = new Date(currentYear, 0, 1)
  // Align to Sunday
  const dayOfWeek = startDate.getDay()
  startDate.setDate(startDate.getDate() - dayOfWeek)

  const endDate = new Date(currentYear, 11, 31)
  const weeks: { date: string; minutes: number }[][] = []
  let currentWeek: { date: string; minutes: number }[] = []

  const cursor = new Date(startDate)
  while (cursor <= endDate) {
    const dateStr = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`
    currentWeek.push({ date: dateStr, minutes: data[dateStr] ?? 0 })
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }
  return weeks
})

const getHeatmapColor = (minutes: number): string => {
  if (minutes <= 0) return '#ebedf0'
  if (minutes <= 30) return '#9be9a8'
  if (minutes <= 60) return '#40c463'
  if (minutes <= 120) return '#30a14e'
  return '#216e39'
}

const getBarHeight = (value: number, max: number): number => {
  if (max === 0) return 0
  return Math.max(2, Math.round((value / max) * 100))
}

const getCategoryPercent = (value: number, total: number): number => {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

const showDateLabel = (index: number): boolean => {
  if (!productivity.value) return false
  const len = productivity.value.dates.length
  if (len <= 10) return true
  const step = Math.ceil(len / 8)
  return index % step === 0 || index === len - 1
}

const formatShortDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length < 3) return dateStr
  return `${parts[1]}/${parts[2]}`
}

const changePeriod = async (period: string) => {
  activePeriod.value = period
  await dashboardStore.fetchProductivity(period)
}

// Card glow effect
const handleCardMouseMove = (e: MouseEvent) => {
  const card = e.currentTarget as HTMLElement
  const rect = card.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  card.style.setProperty('--mouse-x', `${x}px`)
  card.style.setProperty('--mouse-y', `${y}px`)
}

onMounted(async () => {
  const results = await Promise.allSettled([
    dashboardStore.fetchSummary(),
    dashboardStore.fetchProductivity('daily'),
    dashboardStore.fetchCategoryDistribution(),
    dashboardStore.fetchStudyHeatmap(currentYear)
  ])
  const hasFailure = results.some(r => r.status === 'rejected')
  if (hasFailure) {
    ElMessage.warning(t('dashboard.loadFailed'))
  }
})
</script>

<style scoped>
.dashboard-container {
  max-width: var(--page-max-width);
  margin: 0 auto;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
  gap: 14px;
  box-shadow: var(--shadow-card);
  transition: all 0.3s ease;
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

.stat-icon.tasks { background: rgba(102, 126, 234, 0.12); color: #667eea; }
.stat-icon.completed { background: rgba(16, 185, 129, 0.12); color: #10b981; }
.stat-icon.rate { background: rgba(245, 158, 11, 0.12); color: #f59e0b; }
.stat-icon.active { background: rgba(139, 92, 246, 0.12); color: #8b5cf6; }
.stat-icon.notes { background: rgba(59, 130, 246, 0.12); color: #3b82f6; }

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.stat-number {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.completion-progress {
  margin-top: 4px;
  max-width: 120px;
}

/* Section cards */
.section-card {
  background: var(--bg-card);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: var(--radius-xl);
  padding: 20px 24px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-card);
}

.section-card h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
}

.period-tabs {
  display: flex;
  gap: 4px;
}

.capsule-tab {
  padding: 4px 12px;
  border-radius: 14px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.capsule-tab.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* Bar chart */
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.bar-chart-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.bar-chart-label {
  width: 80px;
  font-size: 12px;
  color: var(--text-secondary);
  flex-shrink: 0;
  text-align: right;
}

.bar-chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  flex: 1;
  height: 120px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 20px;
  position: relative;
}

.bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 0;
  position: relative;
}

.bar {
  width: 100%;
  max-width: 20px;
  border-radius: 3px 3px 0 0;
  transition: height 0.4s ease;
  min-height: 2px;
}

.bar-task { background: linear-gradient(180deg, #667eea, #764ba2); }
.bar-study { background: linear-gradient(180deg, #10b981, #059669); }

.bar-date {
  position: absolute;
  bottom: -18px;
  font-size: 10px;
  color: var(--text-secondary);
  white-space: nowrap;
}

/* Category distribution */
.section-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.section-card.half {
  margin-bottom: 0;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-name {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
}

/* Heatmap */
.heatmap-container {
  overflow-x: auto;
}

.heatmap-legend {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-bottom: 8px;
  font-size: 11px;
  color: var(--text-secondary);
}

.heatmap-legend .heatmap-cell {
  cursor: default;
}

.heatmap {
  display: flex;
  gap: 2px;
}

.heatmap-week {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.heatmap-cell {
  width: 14px;
  height: 14px;
  border-radius: 2px;
  background: #ebedf0;
  transition: transform 0.15s;
}

.heatmap-cell:hover {
  transform: scale(1.3);
}

.empty-hint {
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
  padding: 32px 0;
}

/* Responsive */
@media (max-width: 768px) {
  .stat-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .section-row {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .stat-cards {
    grid-template-columns: 1fr;
  }
}
</style>
