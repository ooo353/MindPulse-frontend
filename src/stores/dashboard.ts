import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DashboardSummary, Productivity, CategoryDistribution, StudyHeatmap } from '@/types/dashboard'
import { dashboardApi } from '@/api/dashboardApi'

export const useDashboardStore = defineStore('dashboard', () => {
  const summary = ref<DashboardSummary | null>(null)
  const productivity = ref<Productivity | null>(null)
  const categoryDistribution = ref<CategoryDistribution | null>(null)
  const heatmap = ref<StudyHeatmap | null>(null)
  const loadingCount = ref(0)
  const loading = computed(() => loadingCount.value > 0)
  const error = ref<string | null>(null)

  const fetchSummary = async () => {
    try {
      loadingCount.value++
      error.value = null
      summary.value = await dashboardApi.getSummary()
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch dashboard summary'
      throw err instanceof Error ? err : new Error(String(err))
    } finally {
      loadingCount.value--
    }
  }

  const fetchProductivity = async (period: string = 'daily') => {
    try {
      loadingCount.value++
      error.value = null
      productivity.value = await dashboardApi.getProductivity(period)
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch productivity data'
      throw err instanceof Error ? err : new Error(String(err))
    } finally {
      loadingCount.value--
    }
  }

  const fetchCategoryDistribution = async () => {
    try {
      loadingCount.value++
      error.value = null
      categoryDistribution.value = await dashboardApi.getCategoryDistribution()
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch category distribution'
      throw err instanceof Error ? err : new Error(String(err))
    } finally {
      loadingCount.value--
    }
  }

  const fetchStudyHeatmap = async (year?: number) => {
    try {
      loadingCount.value++
      error.value = null
      heatmap.value = await dashboardApi.getStudyHeatmap(year)
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch study heatmap'
      throw err instanceof Error ? err : new Error(String(err))
    } finally {
      loadingCount.value--
    }
  }

  return {
    summary,
    productivity,
    categoryDistribution,
    heatmap,
    loading,
    error,
    fetchSummary,
    fetchProductivity,
    fetchCategoryDistribution,
    fetchStudyHeatmap
  }
})
