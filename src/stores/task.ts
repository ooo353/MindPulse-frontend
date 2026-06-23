import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '@/types/task';
import { taskApi } from '@/api/taskApi';

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchTasks = async (status?: string) => {
    try {
      loading.value = true;
      error.value = null;
      tasks.value = await taskApi.getTasks(status);
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : '获取任务失败';
      throw err instanceof Error ? err : new Error(String(err));
    } finally {
      loading.value = false;
    }
  };

  const createTask = async (taskData: CreateTaskRequest) => {
    try {
      loading.value = true;
      error.value = null;
      const newTask = await taskApi.createTask(taskData);
      tasks.value.push(newTask);
      return newTask;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : '创建任务失败';
      throw err instanceof Error ? err : new Error(String(err));
    } finally {
      loading.value = false;
    }
  };

  const updateTask = async (id: number, taskData: UpdateTaskRequest) => {
    try {
      loading.value = true;
      error.value = null;
      const updatedTask = await taskApi.updateTask(id, taskData);

      const index = tasks.value.findIndex(task => task.id === id);
      if (index !== -1) {
        tasks.value[index] = updatedTask;
      }
      return updatedTask;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : '更新任务失败';
      throw err instanceof Error ? err : new Error(String(err));
    } finally {
      loading.value = false;
    }
  };

  const deleteTask = async (id: number) => {
    try {
      loading.value = true;
      error.value = null;
      await taskApi.deleteTask(id);
      tasks.value = tasks.value.filter(task => task.id !== id);
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : '删除任务失败';
      throw err instanceof Error ? err : new Error(String(err));
    } finally {
      loading.value = false;
    }
  };

  const parseTaskWithAI = async (taskDescription: string) => {
    try {
      return await taskApi.parseTaskWithAI({ taskDescription });
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'AI解析任务失败';
      throw err instanceof Error ? err : new Error(String(err));
    }
  };

  const updateTaskStatus = async (id: number, status: string) => {
    try {
      const updatedTask = await taskApi.updateTaskStatus(id, status);
      const index = tasks.value.findIndex(t => t.id === id);
      if (index !== -1) tasks.value[index] = updatedTask;
      return updatedTask;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : '更新任务状态失败';
      throw err instanceof Error ? err : new Error(String(err));
    }
  };

  const fetchCacheStats = async () => {
    try {
      return await taskApi.getCacheStats();
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : '获取缓存统计失败';
      throw err instanceof Error ? err : new Error(String(err));
    }
  };

  const getTasksByStatus = (status: 'pending' | 'completed' | 'archived') => {
    return tasks.value.filter(task => task.status === status);
  };

  const pendingTasks = computed(() => getTasksByStatus('pending'));
  const completedTasks = computed(() => getTasksByStatus('completed'));
  const archivedTasks = computed(() => getTasksByStatus('archived'));

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    parseTaskWithAI,
    updateTaskStatus,
    fetchCacheStats,
    pendingTasks,
    completedTasks,
    archivedTasks
  };
});
