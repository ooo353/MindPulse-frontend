export interface Reminder {
  id: number;
  message: string;
  remindType: 'ONCE' | 'DAILY' | 'WEEKLY' | 'CUSTOM';
  remindTime: string;
  remindDate?: string;
  dayOfWeek?: string;
  cronExpression?: string;
  targetId?: number;
  targetType?: 'TASK' | 'NOTE';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReminderRequest {
  message: string;
  remindType: 'ONCE' | 'DAILY' | 'WEEKLY' | 'CUSTOM';
  remindTime: string;
  remindDate?: string;
  dayOfWeek?: string;
  cronExpression?: string;
  targetId?: number;
  targetType?: 'TASK' | 'NOTE';
  enabled?: boolean;
}

export interface Notification {
  id: number;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
}

export interface WsReminderMessage {
  type: 'TASK_DUE' | 'REMINDER';
  taskId?: number;
  reminderId?: number;
  title?: string;
  message: string;
  dueDate?: string;
  remindTime?: string;
  targetId?: number;
  targetType?: string;
  author?: string;
}

export interface WsNoteSummaryMessage {
  noteId: number;
  title: string;
  summary: string;
  tags: string;
  category: string;
  status: string;
  author: string;
  processingTimeMs: number;
}
