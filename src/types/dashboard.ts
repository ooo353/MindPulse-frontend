export interface DashboardSummary {
  totalTasks: number
  completedTasks: number
  completionRate: number
  avgCompletionHours: number
  activeDays: number
  totalNotes: number
}

export interface Productivity {
  dates: string[]
  completedCounts: number[]
  studyMinutes: number[]
}

export interface CategoryDistribution {
  taskCategories: { name: string; value: number }[]
  noteCategories: { name: string; value: number }[]
}

export interface StudyHeatmap {
  heatmap: Record<string, number>
}
