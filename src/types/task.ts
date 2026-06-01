export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'archived';
  category?: string;
  relatedNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
  status?: 'pending' | 'completed' | 'archived';
  category?: string;
  relatedNotes?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: 'high' | 'medium' | 'low';
  status?: 'pending' | 'completed' | 'archived';
  category?: string;
  relatedNotes?: string;
}

export interface AIParseRequest {
  taskDescription: string;
}

export interface ParsedTask {
  title: string;
  description: string;
  due_date: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

export interface AIParseResponseData {
  parsedTask: ParsedTask;
  createdTask: Task;
  fromCache: boolean;
  responseTimeMs: number;
}

export interface CacheStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  avgResponseTimeMs: number;
  cacheHitAvgMs: number;
  cacheMissAvgMs: number;
}
