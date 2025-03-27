<template>
  <UModal :title="`Edit Script: ${filename}`">
    <template #body>
      <UFormField class="w-full" label="Content">
        <UTextarea
          v-model="localContent"
          :rows="15"
          class="w-full font-mono text-sm"
        />
      </UFormField>
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
const props = defineProps<{
  filename: string;
  content: string;
}>();

const emit = defineEmits<{
  (e: "close", payload?: { confirm: boolean; content: string }): void;
}>();

const localContent = ref(props.content);

const isDirty = computed(() => localContent.value !== props.content);
</script>
