import apiClient from './index';
import { Note, CreateNoteRequest, UpdateNoteRequest, AsyncNoteResponseData } from '@/types/note';
import { ApiResponse } from '@/types/auth';

export const noteApi = {
  getNotes: async (keyword?: string): Promise<Note[]> => {
    const params = keyword ? { keyword } : {};
    const res = await apiClient.get<ApiResponse<Note[]>>('/notes', { params });
    return res.data.data;
  },

  getNoteById: async (id: number): Promise<Note> => {
    const res = await apiClient.get<ApiResponse<Note>>(`/notes/${id}`);
    return res.data.data;
  },

  createNote: async (data: CreateNoteRequest): Promise<Note> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    if (data.tags) formData.append('tags', data.tags);
    if (data.file) formData.append('file', data.file);
    const res = await apiClient.post<ApiResponse<Note>>('/notes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.data;
  },

  createNoteAsync: async (data: CreateNoteRequest): Promise<AsyncNoteResponseData> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    if (data.tags) formData.append('tags', data.tags);
    if (data.file) formData.append('file', data.file);
    const res = await apiClient.post<ApiResponse<AsyncNoteResponseData>>('/notes/async', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.data;
  },

  updateNote: async (id: number, data: UpdateNoteRequest): Promise<Note> => {
    const res = await apiClient.put<ApiResponse<Note>>(`/notes/${id}`, data);
    return res.data.data;
  },

  deleteNote: async (id: number): Promise<void> => {
    await apiClient.delete(`/notes/${id}`);
  }
};
