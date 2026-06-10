<template>
  <Layout>
    <div class="notes-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h2 class="page-title">笔记管理</h2>
        <p class="page-subtitle">记录你的想法，AI 帮你整理和总结</p>
      </div>

      <!-- 搜索栏 -->
      <div class="notes-toolbar">
        <div class="search-wrapper">
          <el-input
            v-model="searchQuery"
            placeholder="搜索笔记标题或内容..."
            clearable
            @input="searchNotes"
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <el-button
          type="primary"
          @click="showCreateDialog = true"
          class="create-note-btn glossy-button"
        >
          <el-icon><Plus /></el-icon>
          新建笔记
        </el-button>
      </div>

      <!-- 标签快捷筛选 -->
      <div v-if="allTags.length > 0" class="tag-filter">
        <span class="tag-filter-label">标签筛选:</span>
        <el-tag
          :type="activeTag === '' ? '' : 'info'"
          :effect="activeTag === '' ? 'dark' : 'plain'"
          class="filter-tag"
          @click="activeTag = ''"
        >
          全部
        </el-tag>
        <el-tag
          v-for="tag in allTags"
          :key="tag"
          :type="activeTag === tag ? '' : 'info'"
          :effect="activeTag === tag ? 'dark' : 'plain'"
          class="filter-tag"
          @click="activeTag = activeTag === tag ? '' : tag"
        >
          {{ tag }}
        </el-tag>
      </div>

      <!-- 空状态 -->
      <div v-if="!noteStore.loading && displayedNotes.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="100" height="100">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2" fill="none"/>
          <polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="2" fill="none"/>
          <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/>
          <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/>
        </svg>
        <h3>还没有笔记</h3>
        <p>点击"新建笔记"记录你的想法</p>
      </div>

      <!-- 骨架屏加载 -->
      <el-row v-if="noteStore.loading" :gutter="16">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="i in 8" :key="'skeleton-' + i">
          <div class="skeleton-card" :style="{ animationDelay: `${i * 0.08}s` }">
            <div class="skeleton-line" style="width:60%;height:20px;margin-bottom:12px"></div>
            <div class="skeleton-line" style="width:90%;height:14px;margin-bottom:8px"></div>
            <div class="skeleton-line" style="width:80%;height:14px;margin-bottom:8px"></div>
            <div class="skeleton-line" style="width:40%;height:14px"></div>
          </div>
        </el-col>
      </el-row>

      <el-row v-if="displayedNotes.length > 0" :gutter="16">
        <el-col
          :xs="24" :sm="12" :md="8" :lg="6"
          v-for="note in displayedNotes"
          :key="note.id"
          class="note-card-col"
        >
          <div class="note-card card-glow-effect" @click="viewNote(note)" @mousemove="handleCardMouseMove">
            <div class="note-color-bar" :style="{ background: getTagColor(note.tags) }"></div>
            <div class="note-card-inner">
              <div class="card-header">
                <span class="note-title">{{ note.title }}</span>
                <el-tag v-if="note.status === 'processing'" type="warning" size="small" class="status-badge">处理中</el-tag>
              </div>
              <p class="note-preview">{{ truncateText(note.content, 100) }}</p>
              <div class="note-tags" v-if="note.tags">
                <el-tag
                  v-for="tag in note.tags.split(',').slice(0, 3)"
                  :key="tag"
                  size="small"
                  type="info"
                  class="tag"
                >
                  {{ tag }}
                </el-tag>
                <span v-if="note.tags.split(',').length > 3" class="more-tags">+{{ note.tags.split(',').length - 3 }}</span>
              </div>
              <div class="note-footer">
                <span class="note-date">{{ formatDate(note.updatedAt) }}</span>
                <div class="note-actions-inline" @click.stop>
                  <el-button type="primary" size="small" text @click="editNote(note)">编辑</el-button>
                  <el-button
                    type="primary" size="small" text
                    :loading="uploadingNoteId === note.id"
                    @click="uploadNoteAsync(note)"
                  >异步上传</el-button>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-pagination
        v-if="totalNotes > pageSize"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[8, 12, 16, 24]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalNotes"
        class="pagination"
      />

      <el-dialog
        v-model="showCreateDialog"
        :title="isEditing ? '编辑笔记' : '新建笔记'"
        width="60%"
        top="5vh"
      >
        <el-form :model="currentNote" :rules="noteRules" ref="noteFormRef" label-width="80px">
          <el-form-item label="标题" prop="title">
            <el-input v-model="currentNote.title" placeholder="请输入笔记标题" />
          </el-form-item>

          <el-form-item label="内容" prop="content">
            <el-input
              v-model="currentNote.content"
              type="textarea"
              :rows="8"
              placeholder="请输入笔记内容"
            />
          </el-form-item>

          <el-form-item label="标签">
            <el-input v-model="selectedTags" placeholder="多个标签用逗号分隔，如：高数,微积分,考试" />
          </el-form-item>
        </el-form>

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showCreateDialog = false">取消</el-button>
            <el-button type="primary" @click="saveNote" :loading="savingNote">保存</el-button>
          </span>
        </template>
      </el-dialog>

      <el-dialog
        v-model="showNoteDetail"
        :title="currentNoteDetail.title"
        width="70%"
        top="5vh"
      >
        <div class="note-detail-content">
          <div class="note-content-display">{{ currentNoteDetail.content }}</div>

          <div class="note-summary" v-if="currentNoteDetail.summary">
            <h4>AI摘要:</h4>
            <p>{{ currentNoteDetail.summary }}</p>
          </div>

          <div class="note-summary" v-if="currentNoteDetail.category">
            <h4>AI分类: {{ currentNoteDetail.category }}</h4>
          </div>

          <div class="note-tags-section" v-if="currentNoteDetail.tags">
            <h4>标签:</h4>
            <el-tag
              v-for="tag in currentNoteDetail.tags.split(',')"
              :key="tag"
              size="small"
              type="info"
              class="detail-tag"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showNoteDetail = false">关闭</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Plus, Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import Layout from '@/components/Layout.vue';
import { useNoteStore } from '@/stores/note';
import { Note, CreateNoteRequest, UpdateNoteRequest } from '@/types/note';

const noteStore = useNoteStore();

onMounted(() => {
  noteStore.fetchNotes();
  window.addEventListener('note-summary-ready', handleNoteSummaryReady as EventListener);
});

onUnmounted(() => {
  window.removeEventListener('note-summary-ready', handleNoteSummaryReady as EventListener);
});

const handleNoteSummaryReady = (event: CustomEvent) => {
  const data = event.detail;
  ElMessage.success(`笔记「${data.title}」AI摘要已生成`);
  noteStore.fetchNotes();
};

const searchQuery = ref('');
const activeTag = ref('');
const showCreateDialog = ref(false);
const showNoteDetail = ref(false);
const isEditing = ref(false);
const savingNote = ref(false);
const uploadingNoteId = ref<number | null>(null);
const editingNoteId = ref<number | null>(null);
const noteFormRef = ref();

const currentPage = ref(1);
const pageSize = ref(8);
const totalNotes = computed(() => filteredNotes.value.length);

const currentNote = ref<CreateNoteRequest | UpdateNoteRequest>({
  title: '',
  content: '',
  tags: ''
});

const selectedTags = ref('');

const currentNoteDetail = ref<Note>({
  id: 0,
  title: '',
  content: '',
  tags: '',
  createdAt: '',
  updatedAt: ''
});

const noteRules = {
  title: [
    { required: true, message: '请输入笔记标题', trigger: 'blur' },
    { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  content: [
    { max: 5000, message: '内容长度不能超过5000个字符', trigger: 'blur' }
  ]
};

const allTags = computed(() => {
  const tagSet = new Set<string>();
  noteStore.notes.forEach(note => {
    if (note.tags) {
      note.tags.split(',').map(t => t.trim()).filter(Boolean).forEach(t => tagSet.add(t));
    }
  });
  return Array.from(tagSet).sort();
});

const filteredNotes = computed(() => {
  let notes = noteStore.notes;
  if (searchQuery.value) {
    notes = noteStore.searchNotes(searchQuery.value);
  }
  if (activeTag.value) {
    notes = notes.filter(note =>
      note.tags && note.tags.split(',').map(t => t.trim()).includes(activeTag.value)
    );
  }
  return notes;
});

const displayedNotes = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredNotes.value.slice(start, end);
});

const tagColors = ['#667eea', '#764ba2', '#f72585', '#4cc9f0', '#f8961e', '#059669', '#dc2626', '#7c3aed'];

const getTagColor = (tags: string) => {
  if (!tags) return tagColors[0];
  const hash = tags.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return tagColors[hash % tagColors.length];
};

const truncateText = (text: string, length: number) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
};

const editNote = (note: Note) => {
  editingNoteId.value = note.id;
  currentNote.value = {
    title: note.title,
    content: note.content,
    tags: note.tags
  };
  selectedTags.value = note.tags;
  isEditing.value = true;
  showCreateDialog.value = true;
};

const viewNote = (note: Note) => {
  currentNoteDetail.value = { ...note };
  showNoteDetail.value = true;
};

const uploadNoteAsync = async (note: Note) => {
  // Async processing is only available when creating new notes.
  // For existing notes, the summary was already generated during creation.
  ElMessage.info('异步摘要处理仅在新建笔记时可用，当前笔记已有摘要或正在处理中');
};

const saveNote = async () => {
  if (!noteFormRef.value) return;

  noteFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      savingNote.value = true;
      try {
        const finalTags = [currentNote.value.tags, selectedTags.value]
          .filter(Boolean)
          .join(',')
          .split(',')
          .map(t => t.trim())
          .filter(Boolean)
          .join(',');

        if (isEditing.value && editingNoteId.value !== null) {
          await noteStore.updateNote(editingNoteId.value, {
            title: currentNote.value.title,
            content: currentNote.value.content,
            tags: finalTags
          });
          ElMessage.success('笔记更新成功');
        } else {
          await noteStore.createNote({
            title: currentNote.value.title!,
            content: currentNote.value.content!,
            tags: finalTags
          });
          ElMessage.success('笔记创建成功');
        }

        showCreateDialog.value = false;
        resetCurrentNote();
      } catch (error) {
        console.error('保存笔记失败:', error);
        ElMessage.error('保存笔记失败');
      } finally {
        savingNote.value = false;
      }
    }
  });
};

const resetCurrentNote = () => {
  currentNote.value = { title: '', content: '', tags: '' };
  selectedTags.value = '';
  isEditing.value = false;
  editingNoteId.value = null;
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};

const searchNotes = () => {
  currentPage.value = 1;
};

// 卡片光晕鼠标跟踪
const handleCardMouseMove = (e: MouseEvent) => {
  const card = e.currentTarget as HTMLElement;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  card.style.setProperty('--mouse-x', `${x}px`);
  card.style.setProperty('--mouse-y', `${y}px`);
};
</script>

<style scoped>
.notes-container {
  max-width: var(--page-max-width);
  margin: 0 auto;
}

/* 工具栏 */
.notes-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  background: var(--bg-card);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: var(--radius-xl);
  padding: 16px 20px;
  box-shadow: var(--shadow-card);
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.notes-toolbar:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.12);
}

.search-wrapper {
  flex: 1;
  min-width: 0;
}

.search-input {
  border: none;
}

.create-note-btn {
  background: var(--gradient-brand);
  border: none;
  color: white;
  font-weight: 600;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.create-note-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* 标签筛选 */
.tag-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.tag-filter-label {
  font-size: 13px;
  color: var(--text-muted);
  margin-right: 4px;
}

.filter-tag {
  cursor: pointer !important;
  transition: transform 0.2s ease;
}

.filter-tag:hover {
  transform: scale(1.05);
}

/* 笔记卡片 */
.note-card {
  background: var(--bg-card);
  backdrop-filter: blur(4px);
  border-radius: var(--radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.6);
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.note-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-card-hover);
}

.note-color-bar {
  height: 4px;
  width: 100%;
}

.note-card-inner {
  padding: 16px 18px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 10px;
}

.note-title {
  font-weight: 700;
  font-size: 15px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.status-badge {
  flex-shrink: 0;
}

.note-preview {
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 10px;
}

.note-tags {
  margin-bottom: 10px;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.tag {
  margin: 0;
}

.more-tags {
  font-size: 12px;
  color: var(--text-muted);
  align-self: center;
}

.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid var(--border-color);
}

.note-date {
  font-size: 12px;
  color: var(--text-muted);
}

.note-actions-inline {
  display: flex;
  gap: 4px;
}

.pagination {
  margin-top: 24px;
  text-align: center;
}

.note-detail-content {
  max-height: 60vh;
  overflow-y: auto;
}

.note-content-display {
  white-space: pre-wrap;
  line-height: 1.6;
  margin-bottom: 20px;
}

.note-summary {
  margin: 15px 0;
  padding: 12px 16px;
  background: rgba(102, 126, 234, 0.06);
  border-left: 4px solid var(--primary-color);
  border-radius: 0 8px 8px 0;
}

.note-summary h4 {
  margin: 0 0 5px 0;
  color: var(--primary-color);
  font-size: 14px;
}

.note-tags-section {
  margin-top: 15px;
}

.note-tags-section h4 {
  margin: 0 0 10px 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.detail-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

/* 骨架屏卡片 */
.skeleton-card {
  background: var(--bg-card);
  backdrop-filter: blur(4px);
  border-radius: var(--radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.6);
  padding: 20px;
  margin-bottom: 16px;
  height: 180px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-line {
  background: var(--border-color);
  border-radius: 4px;
}

.dialog-footer {
  text-align: right;
}

/* 响应式 */
@media (max-width: 768px) {
  .notes-toolbar {
    flex-direction: column;
    padding: 14px;
  }

  .create-note-btn {
    width: 100%;
  }

  .note-card:hover {
    transform: translateY(-3px);
  }
}
</style>
