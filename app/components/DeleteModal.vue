<template>
  <UModal :title="'Confirm Deletion'">
    <template #body>
      <p>{{ message }}</p>
    </template>

    <template #footer>
      <div class="flex justify-end gap-4 w-full">
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
defineProps<{ message: string }>();
const emit = defineEmits<{ (e: "close", confirm: boolean): void }>();
</script>
