<template>
  <UModal :title="'Confirm Deletion'">
    <template #body>
      <p>
        Are you sure you want to delete
        <span class="font-medium text-red-600">{{ filename }}</span
        >?
      </p>
    </template>

    <template #footer>
      <div class="flex justify-end gap-4">
        <UButton
          color="neutral"
          label="Cancel"
          variant="subtle"
          @click="emit('close', false)"
        />
        <UButton
          color="error"
          icon="eva:trash-outline"
          label="Delete"
          variant="outline"
          @click="emit('close', true)"
        />
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
defineProps<{ filename: string }>();
const emit = defineEmits<{ (e: "close", confirm: boolean): void }>();
</script>
