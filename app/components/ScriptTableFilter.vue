<template>
  <UInput
    :model-value="String(filterValue)"
    class="max-w-sm"
    placeholder="Filter by script name..."
    @update:model-value="$emit('update:filter', String($event))"
  >
    <template #trailing>
      <UButton
        v-if="filterValue"
        class="cursor-pointer"
        color="neutral"
        icon="i-lucide-x"
        size="xs"
        variant="ghost"
        @click="$emit('update:filter', '')"
      />
    </template>
  </UInput>
</template>

<script lang="ts" setup>
defineProps<{
  filterValue: string | number;
}>();

defineEmits<{
  (e: "update:filter", value: string): void;
}>();
</script>
