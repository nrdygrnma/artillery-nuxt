<template>
  <UBadge
    class="flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-800"
    variant="subtle"
  >
    {{ name }}
    <UButton
      class="-mr-1 cursor-pointer"
      color="neutral"
      icon="i-lucide-x"
      size="xs"
      variant="ghost"
      @click="$emit('remove')"
    />
  </UBadge>
</template>

<script lang="ts" setup>
defineProps<{ name: string }>();
defineEmits<{
  (e: "remove"): void;
}>();
</script>
