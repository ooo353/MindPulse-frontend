import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { PomodoroSession, PomodoroStats, CreatePomodoroRequest } from '@/types/pomodoro';
import { pomodoroApi } from '@/api/pomodoroApi';

export const usePomodoroStore = defineStore('pomodoro', () => {
  const activeSession = ref<PomodoroSession | null>(null);
  const sessions = ref<PomodoroSession[]>([]);
  const total = ref(0);
  const stats = ref<PomodoroStats | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Timer state
  const remainingSeconds = ref(0);
  let timerInterval: ReturnType<typeof setInterval> | null = null;

  const remainingDisplay = computed(() => {
    const mins = Math.floor(remainingSeconds.value / 60);
    const secs = remainingSeconds.value % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  });

  const progress = computed(() => {
    if (!activeSession.value) return 0;
    const totalSeconds = activeSession.value.durationMinutes * 60;
    if (totalSeconds === 0) return 0;
    return 1 - remainingSeconds.value / totalSeconds;
  });

  const startTimer = (durationMinutes: number, startTime: string) => {
    stopTimer();
    const totalSeconds = durationMinutes * 60;
    const startMs = new Date(startTime).getTime();
    const endMs = startMs + totalSeconds * 1000;

    const updateRemaining = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endMs - now) / 1000));
      remainingSeconds.value = remaining;
      if (remaining <= 0) {
        stopTimer();
      }
    };

    updateRemaining();
    timerInterval = setInterval(updateRemaining, 1000);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  };

  const startSession = async (data: CreatePomodoroRequest) => {
    try {
      loading.value = true;
      error.value = null;
      const session = await pomodoroApi.startSession(data);
      activeSession.value = session;
      startTimer(session.durationMinutes, session.startTime);
      return session;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '启动番茄钟失败';
      error.value = message;
      throw err instanceof Error ? err : new Error(String(err));
    } finally {
      loading.value = false;
    }
  };

  const completeSession = async (id: number) => {
    try {
      loading.value = true;
      error.value = null;
      const session = await pomodoroApi.completeSession(id);
      activeSession.value = null;
      stopTimer();
      remainingSeconds.value = 0;
      // Update session in history if present
      const index = sessions.value.findIndex(s => s.id === id);
      if (index !== -1) {
        sessions.value[index] = session;
      }
      return session;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '完成番茄钟失败';
      error.value = message;
      throw err instanceof Error ? err : new Error(String(err));
    } finally {
      loading.value = false;
    }
  };

  const cancelSession = async (id: number) => {
    try {
      loading.value = true;
      error.value = null;
      const session = await pomodoroApi.cancelSession(id);
      activeSession.value = null;
      stopTimer();
      remainingSeconds.value = 0;
      const index = sessions.value.findIndex(s => s.id === id);
      if (index !== -1) {
        sessions.value[index] = session;
      }
      return session;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '取消番茄钟失败';
      error.value = message;
      throw err instanceof Error ? err : new Error(String(err));
    } finally {
      loading.value = false;
    }
  };

  const fetchActiveSession = async () => {
    try {
      loading.value = true;
      error.value = null;
      const session = await pomodoroApi.getActiveSession();
      activeSession.value = session;
      if (session && session.status === 'running') {
        startTimer(session.durationMinutes, session.startTime);
      }
      return session;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '获取活跃番茄钟失败';
      error.value = message;
      throw err instanceof Error ? err : new Error(String(err));
    } finally {
      loading.value = false;
    }
  };

  const fetchStats = async (period: string = 'daily') => {
    try {
      loading.value = true;
      error.value = null;
      stats.value = await pomodoroApi.getStats(period);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '获取统计数据失败';
      error.value = message;
      throw err instanceof Error ? err : new Error(String(err));
    } finally {
      loading.value = false;
    }
  };

  const fetchHistory = async (page: number = 1, size: number = 10) => {
    try {
      loading.value = true;
      error.value = null;
      const result = await pomodoroApi.getHistory(page, size);
      sessions.value = result;
      total.value = result.length;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '获取历史记录失败';
      error.value = message;
      throw err instanceof Error ? err : new Error(String(err));
    } finally {
      loading.value = false;
    }
  };

  return {
    activeSession,
    sessions,
    total,
    stats,
    loading,
    error,
    remainingSeconds,
    remainingDisplay,
    progress,
    startSession,
    completeSession,
    cancelSession,
    fetchActiveSession,
    fetchStats,
    fetchHistory,
    stopTimer
  };
});
