export interface PomodoroSession {
  id: number;
  userId: string;
  taskId: number | null;
  startTime: string;
  endTime: string | null;
  durationMinutes: number;
  actualMinutes: number | null;
  status: 'running' | 'completed' | 'cancelled';
  sessionType: 'focus' | 'short_break' | 'long_break';
  taskDescription: string | null;
  createdAt: string;
}

export interface PomodoroStats {
  totalSessions: number;
  completedSessions: number;
  totalMinutes: number;
  todaySessions: number;
  todayMinutes: number;
  streakDays: number;
}

export interface CreatePomodoroRequest {
  taskId?: number;
  durationMinutes?: number;
  sessionType?: 'focus' | 'short_break' | 'long_break';
  taskDescription?: string;
}
