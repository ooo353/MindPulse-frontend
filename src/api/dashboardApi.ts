import apiClient from './index'
import type { ApiResponse } from '@/types/auth'
import type { DashboardSummary, Productivity, CategoryDistribution, StudyHeatmap } from '@/types/dashboard'

export const dashboardApi = {
  async getSummary(): Promise<DashboardSummary> {
    const res = await apiClient.get<ApiResponse<DashboardSummary>>('/dashboard/summary')
    return res.data.data
  },

  async getProductivity(period: string = 'daily'): Promise<Productivity> {
    const res = await apiClient.get<ApiResponse<Productivity>>('/dashboard/productivity', { params: { period } })
    return res.data.data
  },

  async getCategoryDistribution(): Promise<CategoryDistribution> {
    const res = await apiClient.get<ApiResponse<CategoryDistribution>>('/dashboard/category-distribution')
    return res.data.data
  },

  async getStudyHeatmap(year: number = new Date().getFullYear()): Promise<StudyHeatmap> {
    const res = await apiClient.get<ApiResponse<StudyHeatmap>>('/dashboard/study-heatmap', { params: { year } })
    return res.data.data
  }
}
