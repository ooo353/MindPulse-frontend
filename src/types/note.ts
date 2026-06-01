export interface Note {
  id: number;
  title: string;
  content: string;
  tags: string;
  summary?: string;
  category?: string;
  status?: 'processing' | 'completed' | 'failed';
  filePath?: string;
  fileType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  tags?: string;
  file?: File;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  tags?: string;
}

export interface AsyncNoteResponseData {
  noteId: number;
  status: string;
  message: string;
  note: Note;
}
