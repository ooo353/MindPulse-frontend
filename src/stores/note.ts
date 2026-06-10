import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Note, CreateNoteRequest, UpdateNoteRequest } from '@/types/note';
import { noteApi } from '@/api/noteApi';

export const useNoteStore = defineStore('notes', () => {
  const notes = ref<Note[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchNotes = async () => {
    try {
      loading.value = true;
      error.value = null;
      notes.value = await noteApi.getNotes();
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : '获取笔记失败';
    } finally {
      loading.value = false;
    }
  };

  const createNote = async (noteData: CreateNoteRequest) => {
    try {
      loading.value = true;
      error.value = null;
      const newNote = await noteApi.createNote(noteData);
      notes.value.push(newNote);
      return newNote;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : '创建笔记失败';
      throw err instanceof Error ? err : new Error(String(err));
    } finally {
      loading.value = false;
    }
  };

  const createNoteAsync = async (noteData: CreateNoteRequest) => {
    try {
      loading.value = true;
      error.value = null;
      const result = await noteApi.createNoteAsync(noteData);
      notes.value.push(result.note);
      return result;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : '异步上传笔记失败';
      throw err instanceof Error ? err : new Error(String(err));
    } finally {
      loading.value = false;
    }
  };

  const updateNote = async (id: number, noteData: UpdateNoteRequest) => {
    try {
      loading.value = true;
      error.value = null;
      const updatedNote = await noteApi.updateNote(id, noteData);

      const index = notes.value.findIndex(note => note.id === id);
      if (index !== -1) {
        notes.value[index] = updatedNote;
      }
      return updatedNote;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : '更新笔记失败';
      throw err instanceof Error ? err : new Error(String(err));
    } finally {
      loading.value = false;
    }
  };

  const deleteNote = async (id: number) => {
    try {
      loading.value = true;
      error.value = null;
      await noteApi.deleteNote(id);
      notes.value = notes.value.filter(note => note.id !== id);
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : '删除笔记失败';
      throw err instanceof Error ? err : new Error(String(err));
    } finally {
      loading.value = false;
    }
  };

  const getNotesByTag = (tag: string) => {
    return notes.value.filter(note => note.tags.split(',').includes(tag));
  };

  const searchNotes = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return notes.value.filter(note =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery) ||
      note.tags.toLowerCase().includes(lowerQuery)
    );
  };

  return {
    notes,
    loading,
    error,
    fetchNotes,
    createNote,
    createNoteAsync,
    updateNote,
    deleteNote,
    getNotesByTag,
    searchNotes
  };
});
