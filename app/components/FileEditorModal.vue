<template>
  <UModal :title="`Edit Script: ${filename}`" fullscreen>
    <template #body>
      <div class="w-full">
        <MonacoEditor
          v-model="localContent"
          :lang="language"
          :options="editorOptions"
          class="w-full h-full"
          >Loading...</MonacoEditor
        >
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-4 w-full">
        <UButton
          color="neutral"
          label="Cancel"
          variant="subtle"
          @click="emit('close')"
        />
        <UButton
          :disabled="!isDirty"
          color="primary"
          icon="eva:edit-outline"
          label="Save changes"
          variant="outline"
          @click="emit('close', { confirm: true, content: localContent })"
        />
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import type * as monaco from "monaco-editor";

const props = defineProps<{
  filename: string;
  content: string;
}>();

const emit = defineEmits<{
  (e: "close", payload?: { confirm: boolean; content: string }): void;
}>();

const localContent = ref(props.content);
const language = "yaml";
const editorOptions: monaco.editor.IEditorConstructionOptions = {
  automaticLayout: true,
  scrollBeyondLastLine: false,
  minimap: {
    enabled: false,
  },
  dimension: {
    height: 500,
    width: 600,
  },
};
const isDirty = computed(
  () => localContent.value.trim() !== props.content.trim(),
);
</script>
