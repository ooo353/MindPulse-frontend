<template>
  <div class="ai-input-container">
    <el-input
      v-model="inputValue"
      :placeholder="placeholder"
      :disabled="loading"
      @keyup.enter="handleAIProcess"
      size="large"
    >
      <template #append>
        <el-button
          :icon="MagicStick"
          type="primary"
          :loading="loading"
          @click="handleAIProcess"
        >
          {{ t('aiInput.parse') }}
        </el-button>
      </template>
    </el-input>

    <div v-if="suggestions.length > 0" class="suggestions">
      <h4>{{ t('aiInput.suggestions') }}</h4>
      <ul>
        <li v-for="(suggestion, index) in suggestions" :key="index" @click="selectSuggestion(suggestion)">
          {{ suggestion }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { MagicStick } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useTaskStore } from '@/stores/task';

interface AIParsedResult {
  title: string;
  description: string;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
  category?: string;
}

interface Props {
  placeholder?: string;
}

const { t } = useI18n();

const props = withDefaults(defineProps<Props>(), {
  placeholder: ''
});

const placeholder = computed(() => props.placeholder || t('aiInput.placeholder'));

const emit = defineEmits<{
  (e: 'ai-process', result: AIParsedResult): void;
}>();

const taskStore = useTaskStore();
const inputValue = ref('');
const loading = ref(false);

const suggestions = computed(() => [
  t('aiInput.suggestion1'),
  t('aiInput.suggestion2'),
  t('aiInput.suggestion3'),
  t('aiInput.suggestion4')
]);

const handleAIProcess = async () => {
  if (!inputValue.value.trim()) {
    ElMessage.warning(t('aiInput.enterContent'));
    return;
  }

  loading.value = true;

  try {
    const result = await taskStore.parseTaskWithAI(inputValue.value);
    if (result.fromCache) {
      ElMessage.success(t('aiInput.parseSuccessCached', { ms: result.responseTimeMs }));
    } else {
      ElMessage.success(t('aiInput.parseSuccess', { ms: result.responseTimeMs }));
    }
    emit('ai-process', {
      title: result.parsedTask.title,
      description: result.parsedTask.description,
      dueDate: result.parsedTask.due_date,
      priority: result.parsedTask.priority,
      category: result.parsedTask.category
    });
    inputValue.value = '';
  } catch (error) {
    console.error('AI parse failed:', error);

    const mockResult = {
      title: inputValue.value.substring(0, 30) + (inputValue.value.length > 30 ? '...' : ''),
      description: inputValue.value,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: 'medium' as const
    };

    emit('ai-process', mockResult);
    inputValue.value = '';
    ElMessage.warning(t('aiInput.usingMock'));
  } finally {
    loading.value = false;
  }
};

const selectSuggestion = (suggestion: string) => {
  inputValue.value = suggestion;
};
</script>

<style scoped>
.ai-input-container {
  margin-bottom: var(--spacing-lg);
}

.ai-input-container ::v-deep(.el-input__wrapper) {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow) !important;
  transition: box-shadow 0.3s ease;
}

.ai-input-container ::v-deep(.el-input__wrapper):hover {
  box-shadow: var(--shadow-lg) !important;
}

.ai-input-container ::v-deep(.el-input__wrapper):focus-within {
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1) !important;
}

.ai-input-container ::v-deep(.el-button) {
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0 !important;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  border: none;
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
}

.ai-input-container ::v-deep(.el-button:hover) {
  transform: scale(1.05);
}

.suggestions {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--bg-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.suggestions h4 {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.suggestions ul {
  margin: 0;
  padding-left: var(--spacing-md);
}

.suggestions li {
  cursor: pointer;
  margin-bottom: var(--spacing-xs);
  color: var(--primary-color);
  font-size: 0.85rem;
  transition: all 0.2s ease;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
}

.suggestions li:hover {
  background-color: rgba(67, 97, 238, 0.1);
  text-decoration: none;
  transform: translateX(2px);
}
</style>
